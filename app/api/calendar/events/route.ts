// app/api/calendar/events/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

/**
 * Mengambil access token Google menggunakan refresh token dari server environment.
 */
async function getServerAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

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
    return data.access_token || null;
  } catch {
    return null;
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
    const serverToken = await getServerAccessToken();

    if (serverToken) {
      const res = await fetch(
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

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data.error?.message || "Gagal membuat event di Google Calendar",
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        eventId: data.id,
        htmlLink: data.htmlLink,
      });
    }

    // Mock response jika kredensial belum dimasukkan
    const mockId = `gcal_evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cookieStore = await cookies();
    cookieStore.set("google_last_synced", new Date().toISOString(), { path: "/" });

    return NextResponse.json({
      success: true,
      eventId: mockId,
      htmlLink: `https://calendar.google.com/calendar/event?eid=${mockId}`,
      simulated: true,
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
    const serverToken = await getServerAccessToken();

    if (serverToken) {
      const res = await fetch(
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

      const data = await res.json();
      return NextResponse.json({
        success: res.ok,
        eventId: data.id || eventId,
        htmlLink: data.htmlLink,
      });
    }

    return NextResponse.json({
      success: true,
      eventId,
      simulated: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/calendar/events: Hapus event di Google Calendar
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId diperlukan" },
        { status: 400 }
      );
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const serverToken = await getServerAccessToken();

    if (serverToken) {
      const res = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${serverToken}`,
          },
        }
      );

      return NextResponse.json({ success: res.ok || res.status === 404 });
    }

    return NextResponse.json({ success: true, simulated: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
