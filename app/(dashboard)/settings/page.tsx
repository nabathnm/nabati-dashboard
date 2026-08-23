"use client";

import { useAppSelector } from "@/redux/hooks";
import { useTheme } from "next-themes";
import { User, Bell, Shield, Paintbrush, Moon, Sun, Monitor, Mail, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import React from "react";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userInitials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "GM";

  const themeOptions = [
    {
      id: "light",
      label: "Light Mode",
      description: "Clean lavender-blue with crisp contrast",
      icon: Sun,
      iconColor: "text-amber-500",
      previewBg: "bg-linear-to-br from-[#f8fbff] to-[#e2ecf9] border-slate-200",
      barBg: "bg-[#47b4f5]",
    },
    {
      id: "dark",
      label: "Nord Dark Theme",
      description: "Arctic Polar Night (#2E3440) & Frost Cyan (#88C0D0)",
      icon: Moon,
      iconColor: "text-[#88c0d0]",
      previewBg: "bg-linear-to-br from-[#2e3440] to-[#3b4252] border-[#434c5e]",
      barBg: "bg-[#88c0d0]",
    },
    {
      id: "system",
      label: "System Theme",
      description: "Automatically matches your operating system preference",
      icon: Monitor,
      iconColor: "text-slate-400",
      previewBg: "bg-linear-to-r from-[#f8fbff] via-slate-200 to-[#2e3440] border-slate-300 dark:border-[#434c5e]",
      barBg: "bg-gradient-to-r from-[#47b4f5] to-[#88c0d0]",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and customize your theme"
      />

      <div className="grid gap-6">
        {/* Appearance / Theme Selection */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Paintbrush className="h-5 w-5 text-[#88c0d0] dark:text-[#88c0d0]" /> Appearance & Theme
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the web app with the official Nord palette
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = mounted && theme === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "group relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden",
                      isSelected
                        ? "border-[#47b4f5] dark:border-[#88c0d0] bg-[#47b4f5]/5 dark:bg-[#88c0d0]/10 shadow-md"
                        : "border-border/60 hover:border-border hover:bg-muted/40"
                    )}
                  >
                    {/* Visual Mini Preview */}
                    <div className={cn("w-full h-16 rounded-xl mb-3.5 p-2 flex flex-col justify-between border", opt.previewBg)}>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2.5 w-2.5 rounded-full", opt.barBg)} />
                        <div className="h-2 w-12 rounded bg-white/40 dark:bg-white/20" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-3/4 rounded bg-white/30 dark:bg-white/15" />
                        <div className="h-1.5 w-1/2 rounded bg-white/20 dark:bg-white/10" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", opt.iconColor)} />
                        <span className="font-bold text-sm text-foreground">
                          {opt.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-[#47b4f5] dark:bg-[#88c0d0] text-white dark:text-[#2e3440] flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="rounded-xl p-3 bg-muted/40 border border-border/50 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#88c0d0] animate-pulse shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Mode aktif: <strong className="text-foreground capitalize">{mounted ? theme : "loading..."}</strong>. Perubahan langsung disimpan ke preferensi browser Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-violet-400" /> Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl text-white font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
                <p className="text-[10px] text-muted-foreground">Contact support to change your email</p>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input defaultValue={user?.email?.split('@')[0] || ""} placeholder="Your name" />
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-amber-400" /> Notifications
            </CardTitle>
            <CardDescription>Control how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Get a summary of your financial activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Unusual Spending</Label>
                <p className="text-sm text-muted-foreground">Alerts for anomalies in your expenses</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Gmail Sync Integration */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-red-400" /> Gmail Sync Integration
            </CardTitle>
            <CardDescription>Membaca email bukti transfer/pembayaran secara otomatis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Untuk mengaktifkan sinkronisasi otomatis dari akun Gmail pribadi Anda, ikuti langkah-langkah berikut:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Buka halaman <strong>Keamanan Akun Google</strong> Anda di <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Account Security</a>.</li>
              <li>Pastikan <strong>Verifikasi 2 Langkah (2-Step Verification)</strong> sudah aktif.</li>
              <li>Masuk ke menu <strong>Sandi Aplikasi (App Passwords)</strong> di bagian bawah halaman keamanan.</li>
              <li>Pilih aplikasi <strong>Lainnya (Nama Kustom)</strong>, beri nama, lalu klik <strong>Buat (Generate)</strong>.</li>
              <li>Salin sandi 16 karakter yang muncul.</li>
              <li>Buka file <code>.env</code> di direktori root project Anda, lalu tambahkan konfigurasi berikut:</li>
            </ol>
            <pre className="bg-muted p-3 rounded-lg text-xs font-mono text-foreground select-all border border-border">
              {`IMAP_USER=email-anda@gmail.com
IMAP_PASSWORD="sandi 16 karakter tanpa spasi"
IMAP_HOST=imap.gmail.com
IMAP_PORT=993`}
            </pre>
            <p className="text-xs text-amber-500 font-medium">⚠️ Catatan: Jangan membagikan file .env Anda atau mengunggahnya ke repositori publik seperti GitHub demi keamanan akun Anda.</p>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-emerald-400" /> Security
            </CardTitle>
            <CardDescription>Keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
            <Button variant="outline" className="w-full sm:w-auto ml-0 sm:ml-2">Enable 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
