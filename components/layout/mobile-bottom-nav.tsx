"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, FileText, LayoutGrid, Menu, Wallet2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Tugas",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Catatan",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Keuangan",
    url: "/transactions",
    icon: Wallet2,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 inset-x-0 z-40 block md:hidden border-t border-border/80 bg-background/95 backdrop-blur-lg shadow-lg pb-[max(env(safe-area-inset-bottom),0.35rem)]"
    >
      <div className="flex h-15 items-center justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/dashboard" && pathname.startsWith(item.url));
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer relative",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-colors",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <Icon className={cn("size-4.5 transition-transform", isActive && "scale-105")} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.title}
              </span>

              {/* Indicator Pill */}
              {isActive && (
                <span className="absolute top-1 size-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Tombol Menu untuk Membuka Drawer Sidebar Lengkap */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={openMobile}
          aria-label="Buka seluruh menu navigasi"
          className={cn(
            "flex flex-1 flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer",
            openMobile
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-colors",
              openMobile && "bg-primary/10 text-primary"
            )}
          >
            <Menu className="size-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
