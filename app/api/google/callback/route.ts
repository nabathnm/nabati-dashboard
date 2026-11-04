import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function handleGoogleOAuthCallback(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/settings";
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = error || "Tidak ada kode otorisasi yang diberikan oleh Google";
    return NextResponse.redirect(
      `${origin}/settings?google_error=${encodeURIComponent(errorMsg)}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/settings?google_error=${encodeURIComponent(
        "Google Client ID atau Client Secret belum dikonfigurasi di server (.env.local)"
      )}`
    );
  }

  try {
    // 1. Tukar authorization code dengan access token & refresh token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      const reason =
        errData.error_description || errData.error || "Gagal menukar token dengan Google";
      return NextResponse.redirect(
        `${origin}/settings?google_error=${encodeURIComponent(reason)}`
      );
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Simpan refresh_token ke .env.local jika tersedia untuk akses server-side
    if (refresh_token) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, "utf-8");
          if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
            envContent = envContent.replace(
              /GOOGLE_REFRESH_TOKEN=.*/,
              `GOOGLE_REFRESH_TOKEN=${refresh_token}`
            );
            fs.writeFileSync(envPath, envContent, "utf-8");
          }
        }
      } catch {
        // Abaikan jika tidak dapat menulis ke file .env.local
      }
    }

    // 2. Ambil informasi email user
    let userEmail = "connected@gmail.com";
    if (access_token) {
      try {
        const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          userEmail = userInfo.email || userEmail;
        }
      } catch {
        // Abaikan jika info user gagal diambil
      }
    }

    // 3. Simpan status dan token ke cookies
    const targetUrl = new URL(state, origin);
    targetUrl.searchParams.set("google", "connected");
    targetUrl.searchParams.set("calendar", "synced");

    const response = NextResponse.redirect(targetUrl.toString());

    const isProd = process.env.NODE_ENV === "production";
    const thirtyDays = 60 * 60 * 24 * 30;

    const cookieDefaults = {
      path: "/",
      maxAge: thirtyDays,
      sameSite: "lax" as const,
      secure: isProd,
    };

    // Pasang cookie langsung pada redirect response
    response.cookies.set("google_connected", "true", cookieDefaults);
    response.cookies.set("google_email", userEmail, cookieDefaults);
    response.cookies.set("google_last_synced", new Date().toISOString(), cookieDefaults);
    response.cookies.set("google_calendar_sync", "true", cookieDefaults);

    if (access_token) {
      response.cookies.set("google_access_token", access_token, {
        ...cookieDefaults,
        httpOnly: true,
        maxAge: expires_in || 3600,
      });
    }

    if (refresh_token) {
      response.cookies.set("google_refresh_token", refresh_token, {
        ...cookieDefaults,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 60, // 60 hari
      });
    }

    // Fallback: simpan juga via cookieStore jika didukung
    try {
      const cookieStore = await cookies();
      cookieStore.set("google_connected", "true", cookieDefaults);
      cookieStore.set("google_email", userEmail, cookieDefaults);
      cookieStore.set("google_last_synced", new Date().toISOString(), cookieDefaults);
      cookieStore.set("google_calendar_sync", "true", cookieDefaults);

      if (access_token) {
        cookieStore.set("google_access_token", access_token, {
          ...cookieDefaults,
          httpOnly: true,
          maxAge: expires_in || 3600,
        });
      }

      if (refresh_token) {
        cookieStore.set("google_refresh_token", refresh_token, {
          ...cookieDefaults,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 60,
        });
      }
    } catch {
      // Abaikan jika cookieStore tidak mendukung mutasi di konteks redirect
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return NextResponse.redirect(
      `${origin}/settings?google_error=${encodeURIComponent(message)}`
    );
  }
}

export async function GET(request: Request) {
  return handleGoogleOAuthCallback(request);
}
