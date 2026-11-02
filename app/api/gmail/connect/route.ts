import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/settings";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${origin}/api/google/callback`;

  // If real Google Client ID is configured in env, redirect to Google OAuth with Calendar & Gmail scopes
  if (clientId) {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/gmail.readonly",
    ].join(" ");

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(
      scopes
    )}&access_type=offline&prompt=consent&state=${encodeURIComponent(returnTo)}`;

    return NextResponse.redirect(googleAuthUrl);
  }

  // Fallback demo/mock connection if Google Client ID is not yet provided in .env.local
  const cookieStore = await cookies();
  cookieStore.set("google_connected", "true", { path: "/", maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set("google_email", "user@gmail.com", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set("google_last_synced", new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set("google_calendar_sync", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const targetUrl = new URL(returnTo, origin);
  targetUrl.searchParams.set("google", "connected");
  targetUrl.searchParams.set("gmail", "connected");

  return NextResponse.redirect(targetUrl.toString());
}
