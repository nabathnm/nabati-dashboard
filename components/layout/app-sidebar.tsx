"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Command,
  Cpu,
  FileText,
  Layers,
  LayoutGrid,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ==============================================================================
// NAVIGATION DATA
// ==============================================================================
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Wallet2,
  },
];

const portfolioItems = [
  {
    title: "Projects",
    url: "/projects",
    icon: Layers,
  },
  {
    title: "Tools & Tech",
    url: "/tools",
    icon: Cpu,
  },
  {
    title: "Experiences",
    url: "/experiences",
    icon: Sparkles,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch {
        // Abaikan jika auth gagal atau offline
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300"
    >
      {/* ==================================================================== */}
      {/* HEADER: CLEAN MINIMALIST BRAND & TOGGLE                              */}
      {/* ==================================================================== */}
      <SidebarHeader className="border-b border-sidebar-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-hidden"
          >
            {/* Clean Monochromatic Brand Emblem */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-transform duration-200 group-hover:scale-105">
              <Command className="size-3.5" />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                Nabatu
              </span>
            </div>
          </Link>

          {/* Minimalist Sidebar Toggle */}
          <SidebarTrigger className="size-7 rounded-md text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors" />
        </div>
      </SidebarHeader>

      {/* ==================================================================== */}
      {/* CONTENT: CLEAN NAVIGATION LISTS                                      */}
      {/* ==================================================================== */}
      <SidebarContent className="px-2 py-3 space-y-4 overflow-y-auto">
        {/* GROUP 1: WORKSPACE / CORE MENU */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2 py-1 select-none">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                        isActive
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-sidebar-foreground" : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GROUP 2: PORTFOLIO / ABOUT */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2 py-1 select-none">
            Portfolio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {portfolioItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                        isActive
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-sidebar-foreground" : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ==================================================================== */}
      {/* FOOTER: CLEAN USER INFO, SETTINGS & LOGOUT                           */}
      {/* ==================================================================== */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-2 space-y-1">
        {/* Simple User Badge */}
        {userEmail && (
          <div className="group-data-[collapsible=icon]:hidden px-2.5 py-1.5 flex items-center gap-2 rounded-lg">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[11px] text-muted-foreground">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                {userEmail}
              </span>
            </div>
          </div>
        )}

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings" />}
                  isActive={pathname === "/settings"}
                  tooltip="Pengaturan"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                    pathname === "/settings"
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">Pengaturan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Keluar"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut className="size-4 shrink-0 text-muted-foreground group-hover:text-destructive" />
                  <span className="truncate">Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
