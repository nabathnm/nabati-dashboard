import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieStore = await cookies();

    const now = new Date().toISOString();
    cookieStore.set("google_last_synced", now, { path: "/", maxAge: 60 * 60 * 24 * 30 });

    if (typeof body.calendarSyncEnabled === "boolean") {
      cookieStore.set("google_calendar_sync", String(body.calendarSyncEnabled), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil disinkronkan ke Google Calendar.",
      syncedAt: now,
      tasksCount: body.tasksCount ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyinkronkan kalender";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

