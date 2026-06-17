"use client";

import { useAppSelector } from "@/redux/hooks";
import { User, Bell, Shield, Paintbrush, Moon, Sun, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);

  const userInitials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "GM";

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and settings"
      />

      <div className="grid gap-6">
        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-violet-400" /> Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
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
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-blue-400" /> Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Always use the dark theme (recommended)</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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

        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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
            <pre className="bg-muted p-3 rounded-lg text-xs font-mono text-foreground select-all">
              {`IMAP_USER=email-anda@gmail.com
IMAP_PASSWORD="sandi 16 karakter tanpa spasi"
IMAP_HOST=imap.gmail.com
IMAP_PORT=993`}
            </pre>
            <p className="text-xs text-amber-500 font-medium">⚠️ Catatan: Jangan membagikan file .env Anda atau mengunggahnya ke repositori publik seperti GitHub demi keamanan akun Anda.</p>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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
