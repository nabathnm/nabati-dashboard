"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Menu, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/tasks")) return "Tugas & Jadwal";
  if (pathname.startsWith("/notes")) return "Catatan";
  if (pathname.startsWith("/transactions")) return "Keuangan";
  if (pathname.startsWith("/projects")) return "Proyek";
  if (pathname.startsWith("/tools")) return "Tools & Tech";
  if (pathname.startsWith("/experiences")) return "Pengalaman";
  if (pathname.startsWith("/email")) return "Integrasi Email";
  if (pathname.startsWith("/settings")) return "Pengaturan";
  return "Workspace";
}

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur-md sm:px-6">
      {/* Sisi Kiri: Mobile Hamburger + Brand / Desktop Sidebar Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Tombol Hamburger Khusus Layar Mobile */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-10 rounded-xl text-foreground hover:bg-muted md:hidden cursor-pointer shrink-0"
          aria-label="Buka navigasi menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* Desktop Sidebar Toggle */}
        <SidebarTrigger className="hidden md:flex size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0" />

        {/* Brand Emblem & Judul pada Mobile */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 overflow-hidden md:hidden group"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105">
            <Command className="size-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground truncate">
            Nabatu
          </span>
          <span className="text-xs text-muted-foreground/60 hidden xs:inline">•</span>
          <span className="text-xs font-medium text-muted-foreground truncate hidden xs:inline">
            {pageTitle}
          </span>
        </Link>

        {/* Breadcrumb pada Layar Desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
          <span className="text-muted-foreground">Nabatu</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground truncate">{pageTitle}</span>
        </div>
      </div>

      {/* Sisi Kanan: Theme Toggle & Shortcut Pengaturan */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          render={<Link href="/settings" />}
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          aria-label="Pengaturan"
          title="Pengaturan"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  );
}
