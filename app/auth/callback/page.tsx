"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const navigateTo = (url: string) => {
      if (typeof window !== "undefined") {
        window.location.replace(url);
      } else {
        router.replace(url);
      }
    };

    const handleCallback = async () => {
      // Mencegah eksekusi ganda pada React 19 / StrictMode
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        // 1. Cek error dari query params atau hash fragments (Implicit flow)
        let error = searchParams.get("error");
        let errorDescription = searchParams.get("error_description");

        if (!error && typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.startsWith("#")
              ? window.location.hash.substring(1)
              : window.location.hash
          );
          error = hashParams.get("error");
          errorDescription = hashParams.get("error_description");
        }

        if (error || errorDescription) {
          const msg =
            errorDescription || error || "Autentikasi gagal atau dibatalkan.";
          if (isMounted) setErrorMessage(msg);
          timeoutId = setTimeout(() => {
            if (isMounted)
              router.replace(`/login?error=${encodeURIComponent(msg)}`);
          }, 2500);
          return;
        }

        // Tentukan target redirect setelah login
        let rawNext = searchParams.get("next");
        if (!rawNext && typeof window !== "undefined") {
          rawNext = sessionStorage.getItem("auth_redirect_next");
          sessionStorage.removeItem("auth_redirect_next");
        }
        if (!rawNext) {
          rawNext = "/dashboard";
        }

        const next =
          rawNext.startsWith("/") && !rawNext.startsWith("//")
            ? rawNext
            : "/dashboard";

        // 2. Cek apakah sesi SUDAH aktif terlebih dahulu
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          if (isMounted) navigateTo(next);
          return;
        }

        // 3. Jika terdapat PKCE authorization code
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (data?.session) {
            if (isMounted) navigateTo(next);
            return;
          }

          if (exchangeError) {
            console.warn("Exchange code warning:", exchangeError.message);
            // Cek lagi apakah sesi sebenarnya sudah aktif (misal ditangani oleh auto-detect Supabase)
            const {
              data: { session: recheckSession },
            } = await supabase.auth.getSession();

            if (recheckSession) {
              if (isMounted) navigateTo(next);
              return;
            }

            // Jika benar-benar gagal
            if (isMounted) setErrorMessage(exchangeError.message);
            timeoutId = setTimeout(() => {
              if (isMounted) {
                router.replace(
                  `/login?error=${encodeURIComponent(exchangeError.message)}`
                );
              }
            }, 3000);
            return;
          }
        }

        // 4. Dengarkan event onAuthStateChange (untuk implicit flow atau sesi asinkron)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          if (currentSession && isMounted) {
            if (authSubscription) authSubscription.unsubscribe();
            navigateTo(next);
          }
        });
        authSubscription = subscription;

        // 5. Timeout fallback jika tidak ada sesi dalam 5 detik
        timeoutId = setTimeout(async () => {
          if (authSubscription) authSubscription.unsubscribe();

          const {
            data: { session: finalCheckSession },
          } = await supabase.auth.getSession();

          if (finalCheckSession && isMounted) {
            navigateTo(next);
            return;
          }

          if (isMounted) {
            setErrorMessage(
              "Sesi autentikasi tidak ditemukan atau telah kedaluwarsa."
            );
            setTimeout(() => {
              if (isMounted) router.replace("/login?error=SessionNotFound");
            }, 2500);
          }
        }, 5000);
      } catch (err: unknown) {
        console.error("Auth callback exception:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses login Google.";
        if (isMounted) setErrorMessage(msg);
        timeoutId = setTimeout(() => {
          if (isMounted)
            router.replace(`/login?error=${encodeURIComponent(msg)}`);
        }, 2500);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-600/10 blur-[140px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/8 blur-[100px]" />

      <div className="glass-card relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-border/50 p-8 text-center shadow-2xl max-w-sm w-full">
        {errorMessage ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Gagal Memproses Login
            </h2>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              render={<Link href="/login" />}
            >
              Kembali ke Halaman Login
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="size-9 animate-spin text-primary" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Menyelesaikan Autentikasi...
              </h2>
              <p className="text-xs text-muted-foreground">
                Mohon tunggu sejenak, kami sedang menyiapkan sesi akun Anda.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
