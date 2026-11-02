// lib/services/google-calendar-service.ts
import { supabase } from "@/lib/supabase";
import type {
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
 * Prioritas 2: Endpoint API internal `/api/calendar/events`.
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
 */
function formatEventDates(dueDate: string) {
  const due = new Date(dueDate);
  // Default durasi event 1 jam jika jam ditentukan, atau 1 hari penuh
  const isAllDay =
    dueDate.length === 10 ||
    dueDate.endsWith("T00:00:00.000Z") ||
    dueDate.endsWith("T23:59:59+07:00");

  if (isAllDay) {
    const yyyyMmDd = due.toISOString().slice(0, 10);
    return {
      start: { date: yyyyMmDd },
      end: { date: yyyyMmDd },
    };
  }

  const startTime = new Date(due.getTime() - 60 * 60 * 1000); // 1 jam sebelum deadline
  return {
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    end: {
      dateTime: due.toISOString(),
      timeZone: "Asia/Jakarta",
    },
  };
}

/**
 * Menyusun payload event Google Calendar dari data tugas.
 */
function buildCalendarEventPayload(task: Task) {
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
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 60 }, // 1 jam sebelum
        { method: "email", minutes: 1440 }, // 1 hari sebelum
      ],
    },
    extendedProperties: {
      private: {
        nabatu_task_id: task.id,
        nabatu_category: task.category,
      },
    },
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

    // 2. Fallback melalui endpoint API backend `/api/calendar/events`
    const apiRes = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, payload }),
    });

    if (apiRes.ok) {
      const result = await apiRes.json();
      return {
        success: true,
        eventId: result.eventId,
        htmlLink: result.htmlLink,
        message: "Tugas berhasil dibuat di Google Calendar.",
      };
    }

    return {
      success: false,
      message: "Koneksi Google Calendar belum dikonfigurasi.",
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
      body: JSON.stringify({ eventId, task, payload }),
    });

    if (apiRes.ok) {
      const result = await apiRes.json();
      return {
        success: true,
        eventId: result.eventId || eventId,
        htmlLink: result.htmlLink,
        message: "Event Google Calendar berhasil diperbarui.",
      };
    }

    return {
      success: false,
      message: "Koneksi Google Calendar belum aktif.",
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
 */
export async function deleteCalendarEvent(
  eventId: string
): Promise<GoogleCalendarSyncResult> {
  if (!eventId) {
    return { success: true, message: "Tidak ada event kalender terkait." };
  }

  try {
    const token = await getGoogleAccessToken();

    if (token) {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(
          DEFAULT_CALENDAR_ID
        )}/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 404 atau 410 dianggap sudah terhapus
      if (!response.ok && response.status !== 404 && response.status !== 410) {
        throw new Error("Gagal menghapus event dari Google Calendar.");
      }

      return {
        success: true,
        message: "Event berhasil dihapus dari Google Calendar.",
      };
    }

    // Fallback ke endpoint backend
    const apiRes = await fetch(
      `/api/calendar/events?eventId=${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
      }
    );

    if (apiRes.ok) {
      return {
        success: true,
        message: "Event kalender berhasil dihapus.",
      };
    }

    return {
      success: false,
      message: "Koneksi kalender tidak tersedia.",
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

export const googleCalendarService = {
  getGoogleAccessToken,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  syncAllTasksToGoogleCalendar,
};

export default googleCalendarService;
