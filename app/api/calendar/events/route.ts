// app/api/calendar/events/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

/**
 * Meminta access token baru dari Google menggunakan refresh token.
 */
async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken =
    cookieStore.get("google_refresh_token")?.value || process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      // Perbarui access token baru di cookie jika didukung (abaikan error pada konteks GET)
      try {
        cookieStore.set("google_access_token", data.access_token, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: data.expires_in || 3600,
        });
      } catch {
        // Abaikan jika cookieStore tidak dapat di-set pada konteks GET
      }
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Mengambil access token Google menggunakan:
 * 1. Authorization header (Bearer token dari client / sesi Supabase)
 * 2. Token yang tersimpan di cookie pengguna
 * 3. Refresh token dari cookie atau server environment (.env / Vercel env).
 */
async function getServerAccessToken(request?: Request): Promise<string | null> {
  // 1. Cek header Authorization jika dikirim dari client
  if (request) {
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token && token !== "undefined" && token !== "null") {
        return token;
      }
    }
  }

  const cookieStore = await cookies();

  // 2. Cek access token yang tersimpan di cookie pengguna
  const cookieAccessToken = cookieStore.get("google_access_token")?.value;
  if (cookieAccessToken) {
    return cookieAccessToken;
  }

  // 3. Jika tidak ada di cookie, coba dapatkan dengan refresh token
  return refreshAccessToken();
}

/**
 * Format error dari Google Calendar API menjadi pesan yang informatif dan ramah pengguna.
 */
function formatGoogleError(data: unknown, status: number): string {
  const errObj = (data && typeof data === "object" ? data : {}) as {
    error?: { message?: string };
    message?: string;
  };
  const rawMsg = errObj.error?.message || errObj.message || "Gagal menghubungi Google Calendar API";

  if (status === 403 && (rawMsg.includes("has not been used") || rawMsg.includes("disabled"))) {
    return "Google Calendar API belum diaktifkan di Google Cloud Console. Silakan buka Google Cloud Console > APIs & Services > Library > cari 'Google Calendar API' lalu klik 'ENABLE'.";
  }
  if (status === 403 && (rawMsg.includes("Insufficient Permission") || rawMsg.includes("insufficient authentication scopes"))) {
    return "Izin Google Calendar belum dicentang/diberikan saat login Google. Silakan buka Pengaturan, putuskan koneksi, lalu hubungkan kembali dan pastikan mencentang semua izin akses kalender.";
  }
  if (status === 401) {
    return "Sesi autentikasi Google telah berakhir. Silakan hubungkan ulang akun Google di menu Pengaturan.";
  }
  return rawMsg;
}

/**
 * Menghitung rentang waktu sinkronisasi 3 bulan:
 * Awal bulan lalu (tanggal 1, 00:00:00) hingga akhir bulan depan (tanggal terakhir, 23:59:59).
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
 * GET /api/calendar/events: Cek status koneksi Google Calendar API
 * atau ambil daftar event dari Google Calendar (jika list=true).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const list = searchParams.get("list");
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    let serverToken = await getServerAccessToken(request);
    const cookieStore = await cookies();

    // 1. Jika list=true, tarik daftar event dari Google Calendar
    if (list === "true") {
      if (!serverToken) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Akun Google belum terhubung atau sesi telah berakhir. Silakan hubungkan akun Google di Pengaturan.",
            connected: false,
            items: [],
          },
          { status: 401 }
        );
      }

      // Rentang waktu sinkronisasi: hanya bulan lalu, bulan ini, dan bulan depan
      const defaultRange = getThreeMonthRange();

      const timeMin = searchParams.get("timeMin") || defaultRange.timeMin;
      const timeMax = searchParams.get("timeMax") || defaultRange.timeMax;
      const maxResults = searchParams.get("maxResults") || "250";

      const queryParams = new URLSearchParams({
        singleEvents: "true",
        showDeleted: "true",
        maxResults,
        timeMin,
      });
      if (timeMax) queryParams.set("timeMax", timeMax);

      console.log(
        `[GCAL LIST API] Fetching events from Google Calendar: calendarId=${calendarId}, timeMin=${timeMin}, timeMax=${timeMax}`
      );

      let res = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${serverToken}`,
          },
        }
      );

      // Coba refresh token jika 401
      if (res.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          serverToken = refreshedToken;
          res = await fetch(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${queryParams.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${serverToken}`,
              },
            }
          );
        }
      }

      const rawText = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { raw: rawText };
      }

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: formatGoogleError(data, res.status),
            details: data,
            items: [],
          },
          { status: res.status }
        );
      }

      const rawItems = (Array.isArray(data.items) ? data.items : []) as Array<Record<string, unknown>>;

      console.log(
        `[GCAL LIST API] Google API responded ${res.status}. Total items returned: ${rawItems.length}`
      );
      for (const item of rawItems) {
        console.log(
          `[GCAL LIST API ITEM] id=${item.id}, status=${item.status}, summary="${item.summary}", start=${JSON.stringify(item.start)}, end=${JSON.stringify(item.end)}`
        );
      }

      // Urutkan event berdasarkan waktu mulai
      rawItems.sort((a, b) => {
        const startA =
          (a.start as { dateTime?: string; date?: string })?.dateTime ||
          (a.start as { dateTime?: string; date?: string })?.date ||
          "";
        const startB =
          (b.start as { dateTime?: string; date?: string })?.dateTime ||
          (b.start as { dateTime?: string; date?: string })?.date ||
          "";
        return startA.localeCompare(startB);
      });

      cookieStore.set("google_last_synced", new Date().toISOString(), { path: "/" });

      return NextResponse.json({
        success: true,
        items: rawItems,
        total: rawItems.length,
        timeMin,
        timeMax,
      });
    }

    // 2. Default: Status check endpoint
    const isConnected = cookieStore.get("google_connected")?.value === "true";
    const email = cookieStore.get("google_email")?.value || null;
    const lastSynced = cookieStore.get("google_last_synced")?.value || null;

    return NextResponse.json({
      status: "ok",
      connected: isConnected || Boolean(serverToken),
      hasToken: Boolean(serverToken),
      mode: serverToken ? "live" : "not_connected",
      email,
      calendarId,
      lastSynced,
      hasEnvClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      hasEnvClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      hasEnvRefreshToken: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}

/**
 * POST /api/calendar/events: Buat event baru di Google Calendar
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload } = body;

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    let serverToken = await getServerAccessToken(request);
    const cookieStore = await cookies();

    if (!serverToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akun Google belum terhubung atau sesi telah berakhir. Silakan hubungkan akun Google di Pengaturan.",
          connected: false,
        },
        { status: 401 }
      );
    }

    console.log("[GCAL API POST] Sending payload to Google:", JSON.stringify(payload));

    let res = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serverToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // Jika token kedaluwarsa (401), coba refresh token dan ulangi 1 kali
    if (res.status === 401) {
      console.warn("[GCAL API POST] Token returned 401, attempting token refresh...");
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        serverToken = refreshedToken;
        res = await fetch(
          `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serverToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }
    }

    const rawText = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (!res.ok) {
      console.error(
        `[Google Calendar API Error] HTTP ${res.status} ${res.statusText}:`,
        rawText
      );
      return NextResponse.json(
        {
          success: false,
          error: formatGoogleError(data, res.status),
          details: data,
        },
        { status: res.status }
      );
    }

    cookieStore.set("google_last_synced", new Date().toISOString(), { path: "/" });

    return NextResponse.json({
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
      mode: "live",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/calendar/events: Perbarui event di Google Calendar
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { eventId, payload } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId diperlukan" },
        { status: 400 }
      );
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    let serverToken = await getServerAccessToken(request);
    const cookieStore = await cookies();

    if (!serverToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Akun Google belum terhubung atau sesi telah berakhir.",
          connected: false,
        },
        { status: 401 }
      );
    }

    let res = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${serverToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.status === 401) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        serverToken = refreshedToken;
        res = await fetch(
          `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${serverToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: formatGoogleError(data, res.status),
        },
        { status: res.status }
      );
    }

    cookieStore.set("google_last_synced", new Date().toISOString(), { path: "/" });

    return NextResponse.json({
      success: true,
      eventId: data.id || eventId,
      htmlLink: data.htmlLink,
      mode: "live",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/calendar/events: Hapus event di Google Calendar
 * Mendukung penghapusan langsung dengan eventId atau pencarian via taskId (extendedProperties).
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const taskId = searchParams.get("taskId");

    if (!eventId && !taskId) {
      return NextResponse.json(
        { success: false, error: "eventId atau taskId diperlukan" },
        { status: 400 }
      );
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    let serverToken = await getServerAccessToken(request);
    const cookieStore = await cookies();

    if (!serverToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Akun Google belum terhubung atau sesi telah berakhir.",
          connected: false,
        },
        { status: 401 }
      );
    }

    let isDeleted = false;

    // 1. Coba hapus langsung dengan eventId jika tersedia
    if (eventId) {
      let res = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${serverToken}`,
          },
        }
      );

      if (res.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          serverToken = refreshedToken;
          res = await fetch(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${serverToken}`,
              },
            }
          );
        }
      }

      if (res.ok || res.status === 404 || res.status === 410) {
        isDeleted = true;
      }
    }

    // 2. Jika belum terhapus dan taskId ada, cari event dengan extendedProperties nabatu_task_id
    if (!isDeleted && taskId) {
      const searchRes = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=nabatu_task_id%3D${encodeURIComponent(taskId)}`,
        {
          headers: {
            Authorization: `Bearer ${serverToken}`,
          },
        }
      );

      if (searchRes.ok) {
        const searchData = (await searchRes.json().catch(() => ({}))) as {
          items?: Array<{ id: string }>;
        };
        const foundItems = searchData.items || [];
        for (const item of foundItems) {
          await fetch(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(item.id)}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${serverToken}`,
              },
            }
          );
          isDeleted = true;
        }
      }
    }

    cookieStore.set("google_last_synced", new Date().toISOString(), { path: "/" });

    return NextResponse.json({
      success: true,
      mode: "live",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
