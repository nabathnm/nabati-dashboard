import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("google_connected");
  cookieStore.delete("google_email");
  cookieStore.delete("google_last_synced");
  cookieStore.delete("google_calendar_sync");
  cookieStore.delete("google_access_token");
  cookieStore.delete("google_refresh_token");

  return NextResponse.json({
    success: true,
    message: "Koneksi Google berhasil diputus.",
  });
}
