import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { handleGoogleOAuthCallback } from "@/app/api/google/callback/route";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const next = searchParams.get("next") ?? "/dashboard";

  // 1. Jika callback berasal dari koneksi Google Calendar/Gmail Settings
  if (state?.includes("settings") || next.includes("settings")) {
    return handleGoogleOAuthCallback(request);
  }

  // 2. Jalankan alur Supabase Auth standar
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // 3. Jika bukan Supabase auth PKCE, coba tangani sebagai Google OAuth direct
    try {
      return await handleGoogleOAuthCallback(request);
    } catch {
      // lanjut ke fallback error
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
