import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_token, provider_refresh_token, email } = body;

    if (!provider_token) {
      return NextResponse.json(
        { success: false, error: "No provider token provided" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    const thirtyDays = 60 * 60 * 24 * 30;

    const cookieDefaults = {
      path: "/",
      maxAge: thirtyDays,
      sameSite: "lax" as const,
      secure: isProd,
    };

    cookieStore.set("google_connected", "true", cookieDefaults);
    if (email) {
      cookieStore.set("google_email", email, cookieDefaults);
    }
    cookieStore.set(
      "google_last_synced",
      new Date().toISOString(),
      cookieDefaults
    );
    cookieStore.set("google_calendar_sync", "true", cookieDefaults);

    cookieStore.set("google_access_token", provider_token, {
      ...cookieDefaults,
      httpOnly: true,
      maxAge: 3600,
    });

    if (provider_refresh_token) {
      cookieStore.set("google_refresh_token", provider_refresh_token, {
        ...cookieDefaults,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 60,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save tokens";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

