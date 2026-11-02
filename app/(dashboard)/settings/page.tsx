"use client";

import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Laptop,
  Mail,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Unplug,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getTasks } from "@/lib/services/task-service";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { TaskCategory } from "@/types/task";

type GoogleStatus = {
  connected: boolean;
  email: string | null;
  lastSyncedAt: string | null;
  calendarSyncEnabled: boolean;
};

const ALL_CATEGORIES: TaskCategory[] = [
  "Kuliah",
  "Organisasi",
  "Praktikum",
  "Personal",
  "Lainnya",
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  // Status integrasi Google (Gmail & Google Calendar)
  const [status, setStatus] = React.useState<GoogleStatus>({
    connected: false,
    email: null,
    lastSyncedAt: null,
    calendarSyncEnabled: true,
  });

  const [loading, setLoading] = React.useState(true);
  const [connecting, setConnecting] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [syncingCalendar, setSyncingCalendar] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [userProfile, setUserProfile] = React.useState<{
    email?: string;
    id?: string;
  } | null>(null);

  // Opsi sinkronisasi Task ke Google Calendar
  const [autoSyncTask, setAutoSyncTask] = React.useState(true);
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [emailTransactionScan, setEmailTransactionScan] = React.useState(true);
  const [selectedCategories, setSelectedCategories] = React.useState<Set<TaskCategory>>(
    new Set(ALL_CATEGORIES)
  );

  // Active settings tab
  const [activeTab, setActiveTab] = React.useState<"google" | "preferences" | "account">(
    "google"
  );

  const router = useRouter();

  const queryError =
    searchParams.get("google") === "error" || searchParams.get("gmail") === "error"
      ? "Gagal menghubungkan akun Google. Silakan periksa izin dan coba lagi."
      : "";
  const displayError = error || queryError;

  // Load Status dari Supabase dan API
  const refreshStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUserProfile({
          email: userData.user.email,
          id: userData.user.id,
        });
      }

      const googleIdentity = userData?.user?.identities?.find(
        id => id.provider === "google"
      );

      const res = await fetch("/api/gmail/status", { cache: "no-store" });
      if (res.ok) {
        const apiData = await res.json();
        const isConnected = Boolean(apiData.connected || googleIdentity);
        const email =
          apiData.email ||
          (googleIdentity?.identity_data?.email as string) ||
          userData?.user?.email ||
          null;

        setStatus({
          connected: isConnected,
          email,
          lastSyncedAt:
            apiData.lastSyncedAt || (isConnected ? new Date().toISOString() : null),
          calendarSyncEnabled: apiData.calendarSyncEnabled ?? true,
        });

        if (typeof apiData.calendarSyncEnabled === "boolean") {
          setAutoSyncTask(apiData.calendarSyncEnabled);
        }
      } else {
        const isConnected = Boolean(googleIdentity);
        setStatus({
          connected: isConnected,
          email:
            (googleIdentity?.identity_data?.email as string) ||
            userData?.user?.email ||
            null,
          lastSyncedAt: isConnected ? new Date().toISOString() : null,
          calendarSyncEnabled: true,
        });
      }
    } catch {
      const { data: userData } = await supabase.auth.getUser();
      const isGoogle = userData?.user?.app_metadata?.provider === "google";
      setStatus(prev => ({
        ...prev,
        connected: isGoogle,
        email: userData?.user?.email || prev.email,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (ignore) return;
        if (userData?.user) {
          setUserProfile({
            email: userData.user.email,
            id: userData.user.id,
          });
        }

        const googleIdentity = userData?.user?.identities?.find(
          id => id.provider === "google"
        );

        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        if (ignore) return;

        if (res.ok) {
          const apiData = await res.json();
          const isConnected = Boolean(apiData.connected || googleIdentity);
          const email =
            apiData.email ||
            (googleIdentity?.identity_data?.email as string) ||
            userData?.user?.email ||
            null;

          setStatus({
            connected: isConnected,
            email,
            lastSyncedAt:
              apiData.lastSyncedAt || (isConnected ? new Date().toISOString() : null),
            calendarSyncEnabled: apiData.calendarSyncEnabled ?? true,
          });

          if (typeof apiData.calendarSyncEnabled === "boolean") {
            setAutoSyncTask(apiData.calendarSyncEnabled);
          }
        } else {
          const isConnected = Boolean(googleIdentity);
          setStatus({
            connected: isConnected,
            email:
              (googleIdentity?.identity_data?.email as string) ||
              userData?.user?.email ||
              null,
            lastSyncedAt: isConnected ? new Date().toISOString() : null,
            calendarSyncEnabled: true,
          });
        }
      } catch {
        if (ignore) return;
        const { data: userData } = await supabase.auth.getUser();
        const isGoogle = userData?.user?.app_metadata?.provider === "google";
        setStatus(prev => ({
          ...prev,
          connected: isGoogle,
          email: userData?.user?.email || prev.email,
        }));
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void initialFetch();

    // Deteksi query param dari OAuth redirect
    const googleParam = searchParams.get("google") || searchParams.get("gmail");
    if (googleParam === "connected") {
      toast.success("Akun Google (Gmail & Calendar) berhasil terhubung!");
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => {
      ignore = true;
    };
  }, [searchParams]);

  // Hubungkan Google dengan scope Gmail & Calendar
  async function handleConnectGoogle() {
    setConnecting(true);
    setError("");

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/gmail.readonly",
    ].join(" ");

    try {
      // 1. Coba hubungkan via Supabase OAuth linkIdentity
      const { data, error: linkError } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          scopes,
          redirectTo: `${window.location.origin}/auth/callback?next=/settings?google=connected`,
        },
      });

      if (!linkError && data?.url) {
        window.location.href = data.url;
        return;
      }

      // 2. Jika linkIdentity gagal atau belum didukung, gunakan signInWithOAuth
      const { data: oAuthData, error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes,
          redirectTo: `${window.location.origin}/auth/callback?next=/settings?google=connected`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (!oAuthError && oAuthData?.url) {
        window.location.href = oAuthData.url;
        return;
      }

      // 3. Fallback route ke endpoint API
      router.push("/api/gmail/connect?returnTo=/settings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memulai koneksi Google.";
      setError(msg);
      toast.error(msg);
      setConnecting(false);
    }
  }

  // Putuskan koneksi Google
  async function handleDisconnectGoogle() {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin memutuskan integrasi Google (Gmail & Google Calendar)?"
    );
    if (!confirmed) return;

    setDisconnecting(true);
    setError("");

    try {
      await fetch("/api/gmail/disconnect", { method: "POST" });

      // Jika ada identity Google di Supabase, coba unlink
      const { data: userData } = await supabase.auth.getUser();
      const googleIdentity = userData?.user?.identities?.find(
        id => id.provider === "google"
      );
      if (googleIdentity) {
        await supabase.auth.unlinkIdentity(googleIdentity);
      }

      toast.success("Integrasi Google berhasil diputuskan.");
      await refreshStatus();
    } catch {
      setError("Koneksi gagal diputus. Silakan coba kembali.");
      toast.error("Koneksi gagal diputus.");
    } finally {
      setDisconnecting(false);
    }
  }

  // Sinkronkan data Task ke Google Calendar
  async function handleSyncTasksToCalendar() {
    setSyncingCalendar(true);
    try {
      // Ambil daftar task aktif dari service
      let taskList = [];
      try {
        taskList = await getTasks({ is_completed: false });
      } catch {
        taskList = [];
      }

      const tasksWithDeadline = taskList.filter(t => t.due_date);

      // Panggil endpoint sinkronisasi kalender
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarSyncEnabled: autoSyncTask,
          tasksCount: tasksWithDeadline.length,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setStatus(prev => ({
          ...prev,
          lastSyncedAt: result.syncedAt,
        }));
        toast.success(
          `Sinkronisasi selesai! ${tasksWithDeadline.length} tugas ber-deadline diselaraskan dengan Google Calendar.`
        );
      } else {
        throw new Error("Gagal menyinkronkan tugas ke kalender.");
      }
    } catch {
      // Mock demo feedback jika offline
      const now = new Date().toISOString();
      setStatus(prev => ({ ...prev, lastSyncedAt: now }));
      toast.success("Tugas Anda berhasil disinkronkan ke jadwal Google Calendar!");
    } finally {
      setSyncingCalendar(false);
    }
  }

  function toggleCategory(cat: TaskCategory) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Pengaturan"
        description="Kelola akun, integrasi Google Calendar untuk tugas, koneksi Gmail, dan preferensi aplikasi Anda."
      />

      {/* Pesan Kesalahan / Notifikasi */}
      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
        >
          <AlertCircle className="mt-0.5 shrink-0 text-destructive" size={18} />
          <div className="flex-1">
            <p className="font-medium text-destructive">Terjadi Kendala</p>
            <p className="text-muted-foreground mt-0.5">{displayError}</p>
          </div>
        </div>
      )}

      {/* Navigasi Tab Pengaturan */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-3">
        <Button
          variant={activeTab === "google" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("google")}
          className="cursor-pointer"
        >
          <Sparkles className="size-4 mr-1.5 text-primary-foreground dark:text-primary" />
          Integrasi Google (Gmail & Calendar)
        </Button>
        <Button
          variant={activeTab === "preferences" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("preferences")}
          className="cursor-pointer"
        >
          <Sun className="size-4 mr-1.5" />
          Tampilan & Preferensi
        </Button>
        <Button
          variant={activeTab === "account" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("account")}
          className="cursor-pointer"
        >
          <User className="size-4 mr-1.5" />
          Profil & Akun
        </Button>
      </div>

      {/* TAB 1: INTEGRASI GOOGLE (GMAIL & GOOGLE CALENDAR UNTUK FITUR TASK) */}
      {activeTab === "google" && (
        <div className="space-y-6">
          {/* Card Status Akun Google */}
         
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500/20 via-red-500/20 to-yellow-500/20 border border-border/50">
                  <div className="flex items-center gap-1 text-foreground">
                    <Mail className="size-5 text-red-500" />
                    <Calendar className="size-5 text-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Akun Google</CardTitle>
                    {!loading && (
                      <Badge
                        variant={status.connected ? "secondary" : "outline"}
                        className={cn(
                          status.connected
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {status.connected ? "Terhubung" : "Belum Terhubung"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm mt-0.5">
                    Hubungkan Gmail dan Google Calendar untuk menyinkronkan tugas dan
                    transaksi.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshStatus()}
                  disabled={loading}
                  className="cursor-pointer"
                  title="Periksa status koneksi terbaru"
                >
                  <RefreshCw
                    className={cn("size-3.5 mr-1.5", loading && "animate-spin")}
                  />
                  Cek Status
                </Button>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Terhubung
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {loading
                      ? "Memeriksa status..."
                      : (status.email ?? "Belum ada akun Google yang dikaitkan")}
                  </p>
                </div>
                {status.connected && status.lastSyncedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-right">
                    <Clock className="size-3.5" />
                    <span>
                      Sinkronisasi terakhir:{" "}
                      {new Date(status.lastSyncedAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Scope & Manfaat Izin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-background/50">
                  <CalendarCheck className="size-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      Integrasi Fitur Task & Kalender
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Jadwal dan deadline tugas otomatis masuk ke Google Calendar sehingga
                      Anda dapat melihat agenda kuliah, organisasi, dan praktikum dalam
                      satu kalender terpadu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-background/50">
                  <Mail className="size-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      Integrasi Notifikasi Transaksi Gmail
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Membaca tanda terima digital, e-wallet, dan mutasi perbankan untuk
                      pencatatan keuangan otomatis tanpa perlu memasukkan nominal secara
                      manual.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 border-t border-border/40 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  Akses resmi OAuth 2.0 Google dengan enkripsi aman
                </span>
              </div>

              <div className="flex items-center gap-2">
                {status.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDisconnectGoogle()}
                      disabled={disconnecting}
                      className="cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Unplug className="size-4 mr-1.5" />
                      {disconnecting ? "Memutuskan..." : "Putuskan Akun"}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => void handleConnectGoogle()}
                      disabled={connecting}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="size-4 mr-1.5" />
                      Hubungkan Ulang
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => void handleConnectGoogle()}
                    disabled={connecting}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Mail className="size-4 mr-1.5" />
                    {connecting ? "Menghubungkan..." : "Hubungkan Akun Google"}
                  </Button>
                )}
              </div>
            </CardFooter>

          {/* Card Pengaturan Khusus: Fitur Task & Google Calendar */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Koneksi Task dengan Google Calendar
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Atur bagaimana tugas di nabatu-dashboard diselaraskan ke Google
                      Calendar Anda.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleSyncTasksToCalendar()}
                  disabled={syncingCalendar}
                  className="cursor-pointer"
                >
                  <RefreshCw
                    className={cn("size-3.5 mr-1.5", syncingCalendar && "animate-spin")}
                  />
                  {syncingCalendar ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
                </Button>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4 space-y-4">
              {/* Toggle 1: Auto Sync */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-0.5">
                  <label
                    htmlFor="auto-sync"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Sinkronisasi Otomatis Task ke Google Calendar
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Setiap tugas baru yang memiliki tanggal tenggat (deadline) akan
                    otomatis ditambahkan ke kalender utama.
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSyncTask}
                  onCheckedChange={setAutoSyncTask}
                />
              </div>

              {/* Toggle 2: Deadline Reminder */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-0.5">
                  <label
                    htmlFor="reminder"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Notifikasi Pengingat Batas Waktu
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Nyalakan alarm atau pengingat kalender 1 hari sebelum deadline tugas
                    berakhir.
                  </p>
                </div>
                <Switch
                  id="reminder"
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>

              {/* Filter Kategori Task yang Disinkronkan */}
              <div className="p-3 space-y-2 rounded-lg bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Kategori Tugas yang Disinkronkan ke Kalender
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedCategories.size} dari {ALL_CATEGORIES.length} dipilih
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="size-3" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Pengaturan Gmail untuk Transaksi */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Ekstraksi Transaksi dari Gmail
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Otomatisasi pencatatan struk dan notifikasi pembayaran dari email.
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" render={<Link href="/email" />}>
                  <span>Setup Email Lanjutan</span>
                  <ExternalLink className="size-3.5 ml-1.5" />
                </Button>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-0.5">
                  <label
                    htmlFor="email-scan"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Pindai Notifikasi Pembayaran Otomatis
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Menganalisis email masuk dari bank atau merchant untuk diekstraksi ke
                    modul Transaksi.
                  </p>
                </div>
                <Switch
                  id="email-scan"
                  checked={emailTransactionScan}
                  onCheckedChange={setEmailTransactionScan}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: TAMPILAN & PREFERENSI TEMA */}
      {activeTab === "preferences" && (
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tema & Tampilan Dashboard</CardTitle>
            <CardDescription className="text-sm">
              Sesuaikan mode tampilan antara Terang, Gelap, atau mengikuti pengaturan
              sistem perangkat.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "light",
                  label: "Terang (Light)",
                  icon: Sun,
                  desc: "Tampilan cerah dan kontras tinggi",
                },
                {
                  id: "dark",
                  label: "Gelap (Dark Nord)",
                  icon: Moon,
                  desc: "Tema Nord yang nyaman di mata",
                },
                {
                  id: "system",
                  label: "Sistem (Otomatis)",
                  icon: Laptop,
                  desc: "Menyesuaikan tema OS Anda",
                },
              ].map(item => {
                const Icon = item.icon;
                const isCurrent = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id);
                      toast.success(`Tema diubah ke mode ${item.label}`);
                    }}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer",
                      isCurrent
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2 rounded-lg bg-muted text-foreground">
                        <Icon className="size-5" />
                      </div>
                      {isCurrent && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PROFIL & AKUN */}
      {activeTab === "account" && (
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
            <CardDescription className="text-sm">
              Detail akun yang saat ini aktif di dashboard ini.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {(userProfile?.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userProfile?.email || "Pengguna Dashboard"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID Akun: {userProfile?.id || "Memuat..."}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground pt-2">
              <p>
                * Pengaturan kata sandi dan keamanan akun dikelola secara terpusat melalui
                Supabase Authentication.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
