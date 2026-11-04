// lib/services/google-calendar-service.ts
import { supabase } from "@/lib/supabase";
import type {
  GoogleCalendarEvent,
  GoogleCalendarPullSummary,
  GoogleCalendarSyncResult,
  GoogleCalendarSyncSummary,
  Task,
  TaskCategory,
} from "@/types/task";

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const DEFAULT_CALENDAR_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID ||
  process.env.GOOGLE_CALENDAR_ID ||
  "primary";

/**
 * Mapping warna kategori tugas ke colorId Google Calendar (1 - 11):
 * 1: Lavender, 2: Sage (Hijau), 3: Grape, 4: Flamingo, 5: Banana,
 * 6: Tangerine (Oranye), 7: Peacock, 8: Graphite (Abu-abu), 9: Blueberry (Biru), 10: Basil, 11: Tomato
 */
const CATEGORY_COLOR_MAP: Record<TaskCategory, string> = {
  Kuliah: "9", // Blueberry (Biru)
  Organisasi: "2", // Sage (Hijau)
  Praktikum: "6", // Tangerine (Oranye)
  Personal: "11", // Tomato (Merah)
  Lainnya: "8", // Graphite (Abu-abu)
};

/**
 * Mengambil token autentikasi Google.
 * Prioritas 1: Sesi Supabase `provider_token` pengguna saat ini.
 * Prioritas 2: Endpoint API internal `/api/calendar/events` (via cookie OAuth).
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.provider_token;
    if (token) return token;
  } catch {
    // Sesi gagal dibaca atau belum terhubung
  }
  return null;
}

/**
 * Format tanggal batas waktu tugas ke format event Google Calendar (RFC3339).
 * Penting: Untuk all-day event di Google Calendar API v3, `end.date` bersifat eksklusif
 * (harus tepat hari berikutnya / start.date + 1 hari) agar tidak error HTTP 400.
 */
export function formatEventDates(dueDate: string) {
  let yyyyMmDd = "";

  if (dueDate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    yyyyMmDd = dueDate;
  } else {
    // Format YYYY-MM-DD dalam timezone lokal WIB (Asia/Jakarta)
    const d = new Date(dueDate);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    yyyyMmDd = formatter.format(d);
  }

  // Hitung hari berikutnya untuk `end.date` (Google Calendar v3 all-day events are exclusive)
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  const nextYyyyMmDd = nextDate.toISOString().slice(0, 10);

  return {
    start: { date: yyyyMmDd },
    end: { date: nextYyyyMmDd },
  };
}

/**
 * Menyusun payload event Google Calendar dari data tugas.
 */
export function buildCalendarEventPayload(task: Task) {
  if (!task.due_date) {
    throw new Error("Tugas tidak memiliki batas waktu (due_date).");
  }

  const dates = formatEventDates(task.due_date);
  const statusPrefix = task.is_completed ? "✅ [Selesai] " : "";
  const progressText = `Progress: ${task.progress}%`;

  return {
    summary: `${statusPrefix}${task.title}`,
    description: [
      `Kategori: ${task.category}`,
      progressText,
      task.description ? `\nCatatan:\n${task.description}` : "",
      "\n--\nDisinkronkan otomatis dari Nabatu Dashboard",
    ]
      .filter(Boolean)
      .join("\n"),
    colorId: CATEGORY_COLOR_MAP[task.category] || "8",
    start: dates.start,
    end: dates.end,
    reminders: {
      useDefault: true,
    },
    ...(task.id
      ? {
          extendedProperties: {
            private: {
              nabatu_task_id: String(task.id),
              nabatu_category: String(task.category || "Lainnya"),
            },
          },
        }
      : {}),
  };
}

/**
 * Membuat event baru di Google Calendar untuk sebuah tugas.
 */
export async function createCalendarEvent(task: Task): Promise<GoogleCalendarSyncResult> {
  if (!task.due_date) {
    return {
      success: false,
      message: "Tugas tidak memiliki tenggat waktu (due_date).",
    };
  }

  const payload = buildCalendarEventPayload(task);

  try {
    const token = await getGoogleAccessToken();

    // 1. Jika token Google tersedia langsung dari sesi Supabase
    if (token) {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          DEFAULT_CALENDAR_ID
        )}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || "Gagal membuat event di Google Calendar"
        );
      }

      const data = await response.json();
      return {
        success: true,
        eventId: data.id,
        htmlLink: data.htmlLink,
        message: "Tugas berhasil dibuat di Google Calendar.",
      };
    }

    // 2. Melalui endpoint API internal `/api/calendar/events`
    const apiRes = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ task, payload }),
    });

    const result = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && result.success) {
      return {
        success: true,
        eventId: result.eventId,
        htmlLink: result.htmlLink,
        message: "Tugas berhasil dibuat di Google Calendar.",
      };
    }

    return {
      success: false,
      error: result.error || "Gagal membuat event di Google Calendar",
      message: result.error || "Gagal membuat event di Google Calendar",
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal sinkronisasi ke kalender.";
    return {
      success: false,
      error: errorMsg,
      message: errorMsg,
    };
  }
}

/**
 * Memperbarui event yang sudah ada di Google Calendar.
 */
export async function updateCalendarEvent(
  task: Task,
  eventId: string
): Promise<GoogleCalendarSyncResult> {
  if (!eventId) {
    return createCalendarEvent(task);
  }

  if (!task.due_date) {
    // Jika deadline dihapus, hapus event dari kalender
    return deleteCalendarEvent(eventId);
  }

  const payload = buildCalendarEventPayload(task);

  try {
    const token = await getGoogleAccessToken();

    if (token) {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          DEFAULT_CALENDAR_ID
        )}/events/${encodeURIComponent(eventId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        // Jika event lama tidak ditemukan di Google Calendar (404), buat event baru
        if (response.status === 404) {
          return createCalendarEvent(task);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Gagal memperbarui event kalender");
      }

      const data = await response.json();
      return {
        success: true,
        eventId: data.id,
        htmlLink: data.htmlLink,
        message: "Event Google Calendar berhasil diperbarui.",
      };
    }

    // Fallback ke API internal
    const apiRes = await fetch("/api/calendar/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId, task, payload }),
    });

    const result = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && result.success) {
      return {
        success: true,
        eventId: result.eventId || eventId,
        htmlLink: result.htmlLink,
        message: "Event Google Calendar berhasil diperbarui.",
      };
    }

    return {
      success: false,
      error: result.error || "Gagal memperbarui kalender",
      message: result.error || "Gagal memperbarui kalender",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui kalender.";
    return {
      success: false,
      error: errorMsg,
      message: errorMsg,
    };
  }
}

/**
 * Menghapus event dari Google Calendar.
 * Mendukung penghapusan langsung dengan eventId atau taskId (metadata Nabatu).
 */
export async function deleteCalendarEvent(
  eventId?: string | null,
  taskId?: string | null
): Promise<GoogleCalendarSyncResult> {
  if (!eventId && !taskId) {
    return { success: true, message: "Tidak ada event kalender terkait." };
  }

  try {
    const params = new URLSearchParams();
    if (eventId) params.set("eventId", eventId);
    if (taskId) params.set("taskId", taskId);

    // Panggil endpoint backend untuk menghapus event
    const apiRes = await fetch(`/api/calendar/events?${params.toString()}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && result.success) {
      return {
        success: true,
        message: "Event kalender berhasil dihapus.",
      };
    }

    return {
      success: false,
      error: result.error || "Koneksi kalender tidak tersedia.",
      message: result.error || "Koneksi kalender tidak tersedia.",
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal menghapus event kalender.";
    return {
      success: false,
      error: errorMsg,
      message: errorMsg,
    };
  }
}

/**
 * Menyinkronkan daftar semua tugas yang memiliki due_date ke Google Calendar sekaligus.
 */
export async function syncAllTasksToGoogleCalendar(
  tasks: Task[]
): Promise<GoogleCalendarSyncSummary> {
  const tasksWithDueDate = tasks.filter(t => Boolean(t.due_date));
  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const task of tasksWithDueDate) {
    try {
      const res = task.google_event_id
        ? await updateCalendarEvent(task, task.google_event_id)
        : await createCalendarEvent(task);

      if (res.success) {
        synced++;
      } else {
        failed++;
        if (res.error) errors.push(`${task.title}: ${res.error}`);
      }
    } catch (e: unknown) {
      failed++;
      errors.push(`${task.title}: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  return {
    total: tasksWithDueDate.length,
    synced,
    failed,
    errors,
  };
}

/**
 * Memprediksi kategori tugas dari judul dan deskripsi event Google Calendar.
 */
export function inferCategory(summary?: string, description?: string): TaskCategory {
  const text = `${summary || ""} ${description || ""}`.toLowerCase();
  if (/kuliah|kelas|dosen|tugas|matkul|ujian|uts|uas|skripsi|kkn|kampus|seminar/.test(text)) {
    return "Kuliah";
  }
  if (/organisasi|rapat|bph|divisi|himpunan|bem|kepanitiaan|proker|meeting/.test(text)) {
    return "Organisasi";
  }
  if (/praktikum|lab|modul|laporan|asisten/.test(text)) {
    return "Praktikum";
  }
  if (/pribadi|personal|belanja|olahraga|gym|workout|jalan|liburan|bayar|dokter/.test(text)) {
    return "Personal";
  }
  return "Lainnya";
}

/**
 * Mengekstrak format tanggal batas waktu (ISO / YYYY-MM-DD) dari event Google Calendar.
 */
export function extractDueDateFromGoogleEvent(event: GoogleCalendarEvent): string | null {
  if (event.start?.dateTime) {
    return event.start.dateTime;
  }
  if (event.start?.date) {
    return event.start.date;
  }
  if (event.end?.dateTime) {
    return event.end.dateTime;
  }
  if (event.end?.date) {
    return event.end.date;
  }
  return null;
}

/**
 * Menghitung rentang tanggal sinkronisasi 3 bulan:
 * Awal bulan lalu (tanggal 1, 00:00:00) sampai akhir bulan depan (tanggal terakhir, 23:59:59).
 * Ditambahkan buffer tanggal aman agar perbedaan offset timezone (WIB/UTC)
 * dan sifat eksklusif timeMax pada Google Calendar API tidak memotong event bulan depan.
 */
export function getThreeMonthRange(referenceDate: Date = new Date()) {
  const ref =
    referenceDate instanceof Date && !isNaN(referenceDate.getTime())
      ? referenceDate
      : new Date();

  // Awal bulan lalu dengan buffer 1 hari sebelumnya (hari terakhir 2 bulan lalu, 00:00:00)
  const startOfLastMonth = new Date(
    ref.getFullYear(),
    ref.getMonth() - 1,
    0,
    0,
    0,
    0,
    0
  );

  // Akhir bulan depan dengan buffer ke tanggal 2 bulan berikutnya jam 00:00:00
  // Memastikan semua event hingga detik terakhir bulan depan 100% masuk dalam filter timeMax
  const endOfNextMonth = new Date(
    ref.getFullYear(),
    ref.getMonth() + 2,
    2,
    0,
    0,
    0,
    0
  );

  return {
    timeMin: startOfLastMonth.toISOString(),
    timeMax: endOfNextMonth.toISOString(),
  };
}

/**
 * Mengambil daftar event dari Google Calendar pengguna (default rentang: bulan lalu, bulan ini, bulan depan).
 */
export async function listGoogleCalendarEvents(options?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  referenceDate?: Date;
}): Promise<{ success: boolean; items: GoogleCalendarEvent[]; error?: string }> {
  try {
    const range = getThreeMonthRange(options?.referenceDate);
    const timeMin = options?.timeMin || range.timeMin;
    const timeMax = options?.timeMax || range.timeMax;

    const params = new URLSearchParams({
      list: "true",
      timeMin,
      timeMax,
    });
    if (options?.maxResults) params.set("maxResults", String(options.maxResults));

    const res = await fetch(`/api/calendar/events?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        items: [],
        error: data.error || "Gagal mengambil event dari Google Calendar",
      };
    }

    return {
      success: true,
      items: (data.items || []) as GoogleCalendarEvent[],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghubungi API Kalender";
    return {
      success: false,
      items: [],
      error: message,
    };
  }
}

export const googleCalendarService = {
  getGoogleAccessToken,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  syncAllTasksToGoogleCalendar,
  listGoogleCalendarEvents,
  inferCategory,
  extractDueDateFromGoogleEvent,
  getThreeMonthRange,
};

export default googleCalendarService;
