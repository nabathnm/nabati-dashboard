import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const googleConnected = cookieStore.get("google_connected")?.value === "true";
  const googleEmail = cookieStore.get("google_email")?.value || null;
  const lastSyncedAt = cookieStore.get("google_last_synced")?.value || null;
  const calendarSyncEnabled = cookieStore.get("google_calendar_sync")?.value !== "false";

  return NextResponse.json({
    connected: googleConnected,
    email: googleEmail,
    lastSyncedAt,
    calendarSyncEnabled,
  });
}

