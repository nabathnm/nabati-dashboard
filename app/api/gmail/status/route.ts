import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const googleConnected = cookieStore.get("google_connected")?.value === "true";
  const hasAccessToken = Boolean(cookieStore.get("google_access_token")?.value);
  const hasRefreshToken = Boolean(
    cookieStore.get("google_refresh_token")?.value || process.env.GOOGLE_REFRESH_TOKEN
  );

  // Status dianggap terhubung jika flag connected ada dan terdapat access_token atau refresh_token
  const isConnected = Boolean(googleConnected && (hasAccessToken || hasRefreshToken));
  const googleEmail = cookieStore.get("google_email")?.value || null;
  const lastSyncedAt = cookieStore.get("google_last_synced")?.value || null;
  const calendarSyncEnabled = cookieStore.get("google_calendar_sync")?.value !== "false";

  return NextResponse.json({
    connected: isConnected,
    email: isConnected ? googleEmail : null,
    lastSyncedAt: isConnected ? lastSyncedAt : null,
    calendarSyncEnabled,
  });
}

