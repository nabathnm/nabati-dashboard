"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error || errorDescription) {
          const msg = errorDescription || error || "Autentikasi gagal atau dibatalkan.";
          if (isMounted) setErrorMessage(msg);
          setTimeout(() => {
            if (isMounted) router.replace(`/login?error=${encodeURIComponent(msg)}`);
          }, 2500);
          return;
        }

        const rawNext = searchParams.get("next") || "/dashboard";
        const next =
          rawNext.startsWith("/") && !rawNext.startsWith("//")
            ? rawNext
            : "/dashboard";

        const code = searchParams.get("code");

        // 1. Jika terdapat PKCE authorization code
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Exchange code error:", exchangeError);
            if (isMounted) setErrorMessage(exchangeError.message);
            setTimeout(() => {
              if (isMounted) {
                router.replace(
                  `/login?error=${encodeURIComponent(exchangeError.message)}`
                );
              }
            }, 2500);
            return;
          }
        }

        // 2. Cek apakah sesi sudah aktif (mendukung PKCE maupun Implicit flow via hash)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          if (isMounted) router.replace(next);
          return;
        }

        // 3. Fallback: mendengarkan event onAuthStateChange jika sesi sedang diproses
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (currentSession && isMounted) {
            subscription.unsubscribe();
            router.replace(next);
          }
        });

        // Timeout fallback jika tidak ada sesi dalam 4 detik
        const timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          if (isMounted) {
            router.replace("/login?error=SessionNotFound");
          }
        }, 4000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeoutId);
        };
      } catch (err: unknown) {
        console.error("Auth callback exception:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses login Google.";
        if (isMounted) setErrorMessage(msg);
        setTimeout(() => {
          if (isMounted) router.replace(`/login?error=${encodeURIComponent(msg)}`);
        }, 2500);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
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
