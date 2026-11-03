// lib/services/task-service.ts
import { supabase } from "@/lib/supabase";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  syncAllTasksToGoogleCalendar as syncAllTasksGcal,
  listGoogleCalendarEvents,
  inferCategory,
  extractDueDateFromGoogleEvent,
  getThreeMonthRange,
} from "@/lib/services/google-calendar-service";
import type {
  CreateTaskInput,
  GoogleCalendarPullSummary,
  GoogleCalendarSyncResult,
  GoogleCalendarSyncSummary,
  Task,
  TaskCategory,
  TaskFilters,
  TaskStats,
  UpdateTaskInput,
} from "@/types/task";

const TABLE = "tasks";
const TZ_OFFSET = "+07:00"; // WIB
const REOPEN_PROGRESS = 0; // progress saat tugas selesai dibuka kembali

export const TASK_CATEGORIES: readonly TaskCategory[] = [
  "Kuliah",
  "Organisasi",
  "Praktikum",
  "Personal",
  "Lainnya",
];

/* -------------------------------------------------------------------------- */
/*  Notifikasi perubahan                                                      */
/* -------------------------------------------------------------------------- */

type TaskChangeListener = () => void;
const changeListeners = new Set<TaskChangeListener>();

/**
 * Berlangganan perubahan data tugas (create/update/delete).
 * Berguna agar komponen terpisah (mis. TaskSummary) ikut diperbarui.
 * Mengembalikan fungsi untuk berhenti berlangganan.
 */
export function subscribeToTaskChanges(listener: TaskChangeListener): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

function notifyTasksChanged(): void {
  changeListeners.forEach(listener => listener());
}

/* -------------------------------------------------------------------------- */
/*  Error                                                                     */
/* -------------------------------------------------------------------------- */

export class TaskServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string = "UNKNOWN",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "TaskServiceError";
  }
}

function fail(error: { code?: string; message?: string }, fallback: string): never {
  // 23514 = check_violation, 23503 = foreign_key_violation
  if (error.code === "23514") {
    throw new TaskServiceError("Data tugas tidak valid.", error.code, error);
  }
  if (error.code === "23503") {
    throw new TaskServiceError("Profil pengguna tidak ditemukan.", error.code, error);
  }
  throw new TaskServiceError(fallback, error.code ?? "UNKNOWN", error);
}

/* -------------------------------------------------------------------------- */
/*  Validasi & normalisasi                                                    */
/* -------------------------------------------------------------------------- */

function validateTitle(title: string): string {
  const trimmed = title?.trim();
  if (!trimmed) {
    throw new TaskServiceError("Judul tugas tidak boleh kosong.", "VALIDATION");
  }
  return trimmed;
}

function validateProgress(progress: number): number {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new TaskServiceError("Progress harus berupa angka bulat 0-100.", "VALIDATION");
  }
  return progress;
}

function validateCategory(category: TaskCategory): TaskCategory {
  if (!TASK_CATEGORIES.includes(category)) {
    throw new TaskServiceError("Kategori tidak valid.", "VALIDATION");
  }
  return category;
}

function normalizeDescription(description: string | null | undefined): string | null {
  const trimmed = description?.trim();
  return trimmed ? trimmed : null;
}

/** "YYYY-MM-DD" dianggap akhir hari (23:59:59 WIB). String ISO lain dipakai apa adanya. */
function normalizeDueDate(dueDate: string | null | undefined): string | null {
  if (dueDate == null || dueDate === "") return null;
  const value = /^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ? `${dueDate}T23:59:59${TZ_OFFSET}`
    : dueDate;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TaskServiceError("Format tanggal tenggat tidak valid.", "VALIDATION");
  }
  return date.toISOString();
}

/** Rentang satu hari (WIB) untuk filter due_date. */
function dayRange(dateStr: string): { start: string; end: string } {
  const day = dateStr.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new TaskServiceError("Format filter tanggal harus YYYY-MM-DD.", "VALIDATION");
  }
  const start = new Date(`${day}T00:00:00${TZ_OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Buang karakter yang bisa merusak sintaks filter .or() PostgREST. */
function sanitizeSearch(search: string): string {
  return search
    .replace(/[%,()"\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Menjaga constraint tasks_completion_progress_check:
 * - selesai       => progress = 100
 * - progress 100  => selesai
 * - belum selesai => progress < 100
 */
function resolveCompletionForCreate(input: CreateTaskInput) {
  const progress = validateProgress(input.progress ?? 0);
  if (input.is_completed === true || progress === 100) {
    return { progress: 100, is_completed: true };
  }
  return { progress, is_completed: false };
}

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Mengambil user id dari sesi lokal (client-side). Tidak ada request jaringan;
 * keamanan data tetap dijamin oleh RLS di database.
 */
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (error || !userId) {
    throw new TaskServiceError("Anda belum login.", "UNAUTHENTICATED", error);
  }
  return userId;
}

/* -------------------------------------------------------------------------- */
/*  Read                                                                      */
/* -------------------------------------------------------------------------- */

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const userId = await requireUserId();

  let query = supabase.from(TABLE).select("*").eq("user_id", userId);

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.is_completed !== undefined) {
    query = query.eq("is_completed", filters.is_completed);
  }

  // undefined = tanpa filter, null = tanpa tenggat, string = tenggat pada hari itu
  if (filters.due_date === null) {
    query = query.is("due_date", null);
  } else if (typeof filters.due_date === "string") {
    const { start, end } = dayRange(filters.due_date);
    query = query.gte("due_date", start).lt("due_date", end);
  }

  if (filters.search) {
    const term = sanitizeSearch(filters.search);
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  switch (filters.sort_by) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "title":
      query = query.order("title", { ascending: true });
      break;
    case "category":
      query = query
        .order("category", { ascending: true })
        .order("created_at", { ascending: false });
      break;
    case "progress":
      query = query
        .order("progress", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    default:
      // Tanpa sort_by: tenggat terdekat dulu, tanpa tenggat di akhir
      query = query
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) fail(error, "Gagal mengambil daftar tugas.");
  return (data ?? []) as Task[];
}

/** Semua tugas yang disematkan (tidak terpengaruh filter), yang terbaru disematkan di atas. */
export async function getPinnedTasks(): Promise<Task[]> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("is_pinned", true)
    .order("pinned_at", { ascending: false });

  if (error) fail(error, "Gagal mengambil tugas yang disematkan.");
  return (data ?? []) as Task[];
}

export async function getTaskById(id: string): Promise<Task | null> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) fail(error, "Gagal mengambil tugas.");
  return (data as Task) ?? null;
}

export async function getTaskStats(): Promise<TaskStats> {
  const userId = await requireUserId();
  const nowIso = new Date().toISOString();

  const base = () =>
    supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

  const [total, inProgress, completed, overdue] = await Promise.all([
    base(),
    base().eq("is_completed", false).gt("progress", 0), // sedang dikerjakan
    base().eq("is_completed", true),
    base().eq("is_completed", false).lt("due_date", nowIso), // lewat tenggat
  ]);

  for (const res of [total, inProgress, completed, overdue]) {
    if (res.error) fail(res.error, "Gagal mengambil statistik tugas.");
  }

  return {
    total: total.count ?? 0,
    inProgress: inProgress.count ?? 0,
    completed: completed.count ?? 0,
    overdue: overdue.count ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/*  Write                                                                     */
/* -------------------------------------------------------------------------- */

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const userId = await requireUserId();

  const payload = {
    user_id: userId,
    title: validateTitle(input.title),
    description: normalizeDescription(input.description),
    category: validateCategory(input.category ?? "Lainnya"),
    due_date: normalizeDueDate(input.due_date),
    ...resolveCompletionForCreate(input),
  };

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  if (error) fail(error, "Gagal membuat tugas.");
  const created = data as Task;
  notifyTasksChanged();

  // Jika input sudah memiliki google_event_id (misal dari Google Calendar pull), coba simpan ke Supabase
  if (input.google_event_id) {
    try {
      await supabase
        .from(TABLE)
        .update({ google_event_id: input.google_event_id })
        .eq("id", created.id);
      created.google_event_id = input.google_event_id;
    } catch {
      // Abaikan jika kolom google_event_id belum dimigrasi di tabel Supabase
    }
  }

  // Integrasi Google Calendar: Jika due_date ada dan sync diaktifkan
  if (input.sync_to_calendar !== false && created.due_date) {
    try {
      const gcal = await createCalendarEvent(created);
      if (gcal.success && gcal.eventId) {
        created.google_event_id = gcal.eventId;
        created._gcal_link = gcal.htmlLink || null;
        try {
          await supabase
            .from(TABLE)
            .update({ google_event_id: gcal.eventId })
            .eq("id", created.id);
        } catch {
          // Abaikan jika kolom google_event_id belum dimigrasi di tabel Supabase
        }
      } else if (!gcal.success) {
        created._gcal_error = gcal.error || gcal.message || "Gagal sinkronisasi kalender";
      }
    } catch (err: unknown) {
      created._gcal_error = err instanceof Error ? err.message : "Gagal sinkronisasi kalender";
    }
  }

  return created;
}

async function resolveCompletionForUpdate(id: string, input: UpdateTaskInput) {
  // Selesai eksplisit selalu menang
  if (input.is_completed === true) {
    return { progress: 100, is_completed: true };
  }

  if (input.progress !== undefined) {
    const progress = validateProgress(input.progress);
    return progress === 100
      ? { progress: 100, is_completed: true }
      : { progress, is_completed: false };
  }

  // Hanya is_completed = false: buka kembali tugas
  const current = await getTaskById(id);
  if (!current) {
    throw new TaskServiceError("Tugas tidak ditemukan.", "NOT_FOUND");
  }
  return {
    progress: current.progress >= 100 ? REOPEN_PROGRESS : current.progress,
    is_completed: false,
  };
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const userId = await requireUserId();
  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) patch.title = validateTitle(input.title);
  if (input.description !== undefined) {
    patch.description = normalizeDescription(input.description);
  }
  if (input.category !== undefined) {
    patch.category = validateCategory(input.category);
  }
  if (input.due_date !== undefined) {
    patch.due_date = normalizeDueDate(input.due_date);
  }

  if (input.progress !== undefined || input.is_completed !== undefined) {
    Object.assign(patch, await resolveCompletionForUpdate(id, input));
  }

  if (Object.keys(patch).length === 0) {
    const existing = await getTaskById(id);
    if (!existing) {
      throw new TaskServiceError("Tugas tidak ditemukan.", "NOT_FOUND");
    }
    return existing;
  }

  // Tabel tidak punya trigger updated_at, jadi diisi manual
  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) fail(error, "Gagal memperbarui tugas.");
  if (!data) throw new TaskServiceError("Tugas tidak ditemukan.", "NOT_FOUND");
  const updated = data as Task;
  notifyTasksChanged();

  // Integrasi Google Calendar: perbarui event kalender jika sync diaktifkan
  if (input.sync_to_calendar !== false) {
    try {
      if (updated.due_date) {
        const gcal = await updateCalendarEvent(updated, updated.google_event_id || id);
        if (gcal.success && gcal.eventId) {
          updated.google_event_id = gcal.eventId;
          updated._gcal_link = gcal.htmlLink || null;
        } else if (!gcal.success) {
          updated._gcal_error = gcal.error || gcal.message;
        }
      }
    } catch (err: unknown) {
      updated._gcal_error = err instanceof Error ? err.message : "Gagal sinkronisasi kalender";
    }
  }

  return updated;
}

export function updateProgress(id: string, progress: number): Promise<Task> {
  return updateTask(id, { progress });
}

export function toggleComplete(id: string, isCompleted: boolean): Promise<Task> {
  return updateTask(id, { is_completed: isCompleted });
}

/** Sematkan (pin) atau lepas sematan tugas. */
export async function setTaskPinned(id: string, isPinned: boolean): Promise<Task> {
  const userId = await requireUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      is_pinned: isPinned,
      pinned_at: isPinned ? now : null,
      updated_at: now,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) fail(error, "Gagal mengubah sematan tugas.");
  if (!data) throw new TaskServiceError("Tugas tidak ditemukan.", "NOT_FOUND");
  notifyTasksChanged();
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await requireUserId();

  // Simpan data task sementara untuk menghapus event Google Calendar
  const existing = await getTaskById(id).catch(() => null);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) fail(error, "Gagal menghapus tugas.");
  notifyTasksChanged();

  // Integrasi Google Calendar: hapus event dari kalender jika ada
  try {
    let eventIdToDelete = existing?.google_event_id || null;
    if (!eventIdToDelete && existing?.description) {
      const match = existing.description.match(/<!--gcal:([^>]+)-->/);
      if (match) {
        eventIdToDelete = match[1];
      }
    }

    // Panggil deleteCalendarEvent dengan eventId (jika ada) dan id task sebagai fallback
    await deleteCalendarEvent(eventIdToDelete, id);
  } catch {
    // Abaikan jika kalender belum terhubung
  }
}

/* -------------------------------------------------------------------------- */
/*  Integrasi Google Calendar Khusus Task                                     */
/* -------------------------------------------------------------------------- */

/**
 * Menyinkronkan satu tugas secara eksplisit ke Google Calendar.
 */
export async function syncTaskToGoogleCalendar(
  task: Task
): Promise<GoogleCalendarSyncResult> {
  return task.google_event_id
    ? updateCalendarEvent(task, task.google_event_id)
    : createCalendarEvent(task);
}

/**
 * Menyinkronkan semua tugas yang memiliki tenggat (due_date) ke Google Calendar.
 */
export async function syncAllTasksToGoogleCalendar(): Promise<GoogleCalendarSyncSummary> {
  const tasks = await getTasks();
  return syncAllTasksGcal(tasks);
}

/**
 * Menghapus event tugas dari Google Calendar secara manual.
 */
export async function removeTaskFromGoogleCalendar(
  eventId: string
): Promise<GoogleCalendarSyncResult> {
  return deleteCalendarEvent(eventId);
}

/**
 * Menarik event dari Google Calendar pengguna dan menyinkronkannya ke daftar tugas Nabatu.
 * Default rentang waktu: hanya bulan lalu, bulan ini, dan bulan depan.
 * - Event yang sudah terhubung akan diperbarui.
 * - Event baru dari Google Calendar akan dibuatkan task di Nabatu.
 * - Event yang dihapus di Google Calendar akan dihapus dari daftar tugas Nabatu.
 */
export async function pullTasksFromGoogleCalendar(options?: {
  timeMin?: string;
  timeMax?: string;
  referenceDate?: Date;
}): Promise<GoogleCalendarPullSummary> {
  const range = getThreeMonthRange(options?.referenceDate);
  const timeMin = options?.timeMin || range.timeMin;
  const timeMax = options?.timeMax || range.timeMax;

  console.log(
    `[GCAL PULL] Starting sync: timeMin=${timeMin}, timeMax=${timeMax}`
  );

  const gcalRes = await listGoogleCalendarEvents({
    timeMin,
    timeMax,
    referenceDate: options?.referenceDate,
  });

  if (!gcalRes.success) {
    throw new TaskServiceError(
      gcalRes.error || "Gagal mengambil event dari Google Calendar.",
      "GCAL_FETCH_FAILED"
    );
  }

  const gEvents = gcalRes.items;
  const existingTasks = await getTasks();

  console.log(
    `[GCAL PULL] Fetched ${gEvents.length} events from Google Calendar. Local tasks count: ${existingTasks.length}`
  );

  let imported = 0;
  let updated = 0;
  let deleted = 0;
  let skipped = 0;
  const errors: string[] = [];
  const importedTasks: { id: string; title: string; due_date: string | null }[] = [];

  for (const event of gEvents) {
    try {
      if (!event.id) {
        skipped++;
        continue;
      }

      const gcalTag = `<!--gcal:${event.id}-->`;

      // 1. Cari tugas di Nabatu yang sudah terhubung dengan event ini
      const matchedTask = existingTasks.find(t => {
        if (t.google_event_id && t.google_event_id === event.id) return true;
        if (
          event.extendedProperties?.private?.nabatu_task_id &&
          t.id === event.extendedProperties.private.nabatu_task_id
        ) {
          return true;
        }
        if (t.description?.includes(gcalTag)) return true;
        return false;
      });

      // 2. Jika event di Google Calendar berstatus 'cancelled' (dihapus), hapus juga tugas di Nabatu
      if (event.status === "cancelled") {
        if (matchedTask) {
          const { error: delError } = await supabase
            .from(TABLE)
            .delete()
            .eq("id", matchedTask.id);
          if (!delError) {
            deleted++;
            console.log(
              `[GCAL PULL] Deleted local task "${matchedTask.title}" (${matchedTask.id}) because Google event was cancelled.`
            );
          }
        }
        continue;
      }

      const rawSummary = event.summary?.trim() || "Event Google Calendar";
      const isCompleted =
        rawSummary.startsWith("✅") || rawSummary.toLowerCase().startsWith("[selesai]");
      const cleanTitle =
        rawSummary
          .replace(/^✅\s*(\[Selesai\]\s*)?/i, "")
          .replace(/^\[Selesai\]\s*/i, "")
          .trim() || rawSummary;

      const rawDueDate = extractDueDateFromGoogleEvent(event);
      let cleanDescription = event.description || "";
      cleanDescription = cleanDescription
        .replace(/\n*--\s*\nDisinkronkan otomatis dari Nabatu Dashboard/g, "")
        .trim();

      const descWithTag = cleanDescription.includes(gcalTag)
        ? cleanDescription
        : cleanDescription
          ? `${cleanDescription}\n${gcalTag}`
          : gcalTag;

      const category =
        (event.extendedProperties?.private?.nabatu_category as TaskCategory) ||
        inferCategory(cleanTitle, cleanDescription);

      if (matchedTask) {
        // Update tugas yang sudah ada jika ada perubahan
        await updateTask(matchedTask.id, {
          title: cleanTitle,
          description: descWithTag,
          due_date: rawDueDate,
          category,
          is_completed: isCompleted,
          progress: isCompleted ? 100 : matchedTask.progress,
          sync_to_calendar: false, // Jangan kirim balik ke Google Calendar
        });
        updated++;
        console.log(`[GCAL PULL] Updated local task "${cleanTitle}" (${matchedTask.id})`);
      } else {
        // Buat tugas baru dari event Google Calendar
        const newTask = await createTask({
          title: cleanTitle,
          description: descWithTag,
          category,
          due_date: rawDueDate,
          is_completed: isCompleted,
          progress: isCompleted ? 100 : 0,
          google_event_id: event.id,
          sync_to_calendar: false, // Jangan kirim balik ke Google Calendar
        });
        imported++;
        importedTasks.push({
          id: newTask.id,
          title: newTask.title,
          due_date: newTask.due_date,
        });
        console.log(
          `[GCAL PULL] Created new local task "${cleanTitle}" (${newTask.id}), due: ${newTask.due_date}`
        );
      }
    } catch (err: unknown) {
      const errMsg = `${event.summary || event.id}: ${err instanceof Error ? err.message : "Gagal memproses"}`;
      console.error(`[GCAL PULL ERROR] ${errMsg}`, err);
      errors.push(errMsg);
    }
  }

  // 3. Deteksi tugas Nabatu yang event Google Calendar-nya sudah tidak ada dalam rentang bulan lalu s.d. bulan depan
  const activeGoogleIds = new Set(
    gEvents.filter(e => e.status !== "cancelled").map(e => e.id)
  );

  const timeMinMs = new Date(timeMin).getTime();
  const timeMaxMs = new Date(timeMax).getTime();

  for (const task of existingTasks) {
    if (!task.due_date) continue;
    const taskDueMs = new Date(task.due_date).getTime();
    if (taskDueMs < timeMinMs || taskDueMs > timeMaxMs) continue;

    let linkedGcalId = task.google_event_id;
    if (!linkedGcalId && task.description) {
      const match = task.description.match(/<!--gcal:([^>]+)-->/);
      if (match) linkedGcalId = match[1];
    }

    // Jika task terhubung ke Google Calendar tetapi event-nya sudah tidak ada di Google Calendar aktif
    if (linkedGcalId && !activeGoogleIds.has(linkedGcalId)) {
      try {
        const { error: delErr } = await supabase.from(TABLE).delete().eq("id", task.id);
        if (!delErr) {
          deleted++;
          console.log(
            `[GCAL PULL] Deleted local task "${task.title}" (${task.id}) because event no longer exists in Google Calendar.`
          );
        }
      } catch (err: unknown) {
        errors.push(
          `Hapus tugas ${task.title}: ${err instanceof Error ? err.message : "Gagal"}`
        );
      }
    }
  }

  notifyTasksChanged();

  return {
    totalGoogleEvents: gEvents.length,
    imported,
    updated,
    deleted,
    skipped,
    errors,
    importedTasks,
  };
}

/* -------------------------------------------------------------------------- */
/*  Opsional: akses lewat satu objek (taskService.getTasks(), dst.)           */
/* -------------------------------------------------------------------------- */

export const taskService = {
  getTasks,
  getPinnedTasks,
  getTaskById,
  getTaskStats,
  createTask,
  updateTask,
  updateProgress,
  toggleComplete,
  setTaskPinned,
  deleteTask,
  syncTaskToGoogleCalendar,
  syncAllTasksToGoogleCalendar,
  removeTaskFromGoogleCalendar,
  pullTasksFromGoogleCalendar,
};
