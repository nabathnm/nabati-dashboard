import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== "undefined") {
    console.warn(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured."
    );
  }
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Mendapatkan URL callback OAuth yang aman dan kompatibel untuk deployment (Vercel, Netlify, custom domain, maupun localhost).
 * Menghindari penambahan query parameters agar cocok dengan allowed redirect URLs di Supabase Auth.
 */
export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/auth/callback`;
  }
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (siteUrl) {
    const formatted = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
    return `${formatted.replace(/\/$/, "")}/auth/callback`;
  }
  return "http://localhost:3000/auth/callback";
}
