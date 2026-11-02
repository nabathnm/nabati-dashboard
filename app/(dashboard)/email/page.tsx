"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Mail,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EmailStatus = {
  connected: boolean;
  email: string | null;
  lastSyncedAt: string | null;
};

export default function EmailSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<EmailStatus>({
    connected: false,
    email: null,
    lastSyncedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState("");

  async function loadStatus() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gmail/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal memuat status koneksi email.");
      }

      const data = await response.json();
      setStatus({
        connected: Boolean(data.connected),
        email: data.email ?? null,
        lastSyncedAt: data.lastSyncedAt ?? null,
      });
    } catch {
      setError("Status email belum dapat dimuat. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const response = await fetch("/api/gmail/status", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat status koneksi email.");
        }

        const data = await response.json();
        if (!ignore) {
          setStatus({
            connected: Boolean(data.connected),
            email: data.email ?? null,
            lastSyncedAt: data.lastSyncedAt ?? null,
          });
        }
      } catch {
        if (!ignore) {
          setError("Status email belum dapat dimuat. Coba lagi.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void init();

    const params = new URLSearchParams(window.location.search);
    const result = params.get("gmail");

    if (result === "connected") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => {
      ignore = true;
    };
  }, []);

  function connectEmail() {
    router.push("/api/gmail/connect?returnTo=/email");
  }

  async function disconnectEmail() {
    const confirmed = window.confirm("Putuskan koneksi Gmail dari aplikasi ini?");

    if (!confirmed) return;

    setDisconnecting(true);
    setError("");

    try {
      const response = await fetch("/api/gmail/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Gagal memutuskan koneksi email.");
      }

      await loadStatus();
    } catch {
      setError("Koneksi gagal diputus. Silakan coba lagi.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#2E3440] px-4 py-8 text-[#ECEFF4] sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#D8DEE9] transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke dashboard
        </Link>

        <header className="space-y-2">
          <p className="text-sm font-medium text-[#88C0D0]">PENGATURAN INTEGRASI</p>
          <h1 className="text-3xl font-semibold tracking-tight">Setup Email</h1>
          <p className="max-w-xl text-sm leading-6 text-[#D8DEE9]">
            Hubungkan Gmail untuk membantu mendeteksi notifikasi transaksi dan mencatat
            pemasukan atau pengeluaran secara otomatis.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#BF616A]/40 bg-[#BF616A]/10 p-4 text-sm text-[#ECEFF4]"
          >
            <AlertCircle className="mt-0.5 shrink-0 text-[#BF616A]" size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="rounded-2xl border border-[#4C566A] bg-[#3B4252] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#434C5E] p-3">
              <Mail className="text-[#88C0D0]" size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Akun Gmail</h2>

                {!loading && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      status.connected
                        ? "bg-[#A3BE8C]/15 text-[#A3BE8C]"
                        : "bg-[#4C566A] text-[#D8DEE9]"
                    }`}
                  >
                    {status.connected ? "Terhubung" : "Belum terhubung"}
                  </span>
                )}
              </div>

              <p className="mt-1 break-all text-sm text-[#D8DEE9]">
                {loading
                  ? "Memeriksa status koneksi..."
                  : (status.email ?? "Belum ada akun Gmail yang terhubung")}
              </p>

              {status.connected && status.lastSyncedAt && (
                <p className="mt-2 text-xs text-[#D8DEE9]">
                  Sinkronisasi terakhir:{" "}
                  {new Date(status.lastSyncedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>

          <div className="my-5 border-t border-[#4C566A]" />

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-[#D8DEE9]">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#A3BE8C]" />
              <p>Mendeteksi notifikasi transaksi dari email yang relevan.</p>
            </div>

            <div className="flex items-start gap-3 text-sm text-[#D8DEE9]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#88C0D0]" />
              <p>
                Akses Gmail diberikan melalui halaman persetujuan resmi Google, bukan
                dengan membagikan password.
              </p>
            </div>

            <div className="flex items-start gap-3 text-sm text-[#D8DEE9]">
              <RefreshCw size={18} className="mt-0.5 shrink-0 text-[#88C0D0]" />
              <p>
                Proses pembacaan dan sinkronisasi email perlu diaktifkan melalui backend
                aplikasi.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={connectEmail}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#88C0D0] px-4 py-3 text-sm font-semibold text-[#2E3440] transition hover:bg-[#8FBCBB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail size={17} />
              {status.connected ? "Hubungkan ulang Gmail" : "Hubungkan Gmail"}
            </button>

            <button
              type="button"
              onClick={() => void loadStatus()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#4C566A] px-4 py-3 text-sm font-medium transition hover:bg-[#434C5E] disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Periksa status
            </button>

            {status.connected && (
              <button
                type="button"
                onClick={() => void disconnectEmail()}
                disabled={disconnecting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#BF616A]/50 px-4 py-3 text-sm font-medium text-[#D08770] transition hover:bg-[#BF616A]/10 disabled:opacity-50"
              >
                <Unplug size={16} />
                {disconnecting ? "Memutuskan..." : "Putuskan koneksi"}
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#4C566A] bg-[#3B4252] p-5">
          <h2 className="font-semibold">Cara kerja integrasi</h2>

          <ol className="mt-4 space-y-4">
            {[
              ["1", "Hubungkan akun", "Berikan izin akses Gmail melalui Google."],
              [
                "2",
                "Deteksi transaksi",
                "Backend membaca email yang relevan dan mengekstrak detail transaksi.",
              ],
              [
                "3",
                "Periksa hasil",
                "Tinjau data hasil ekstraksi sebelum menyimpannya sebagai transaksi.",
              ],
            ].map(([number, title, description]) => (
              <li key={number} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#434C5E] text-sm font-semibold text-[#88C0D0]">
                  {number}
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-sm leading-5 text-[#D8DEE9]">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-xs leading-5 text-[#D8DEE9]">
          Integrasi memerlukan konfigurasi Google Cloud dan endpoint backend.
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-1 text-[#88C0D0] hover:underline"
          >
            Buka Google Cloud Console <ExternalLink size={12} />
          </a>
        </p>
      </div>
    </main>
  );
}
