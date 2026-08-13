"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Brain,
  LogOut,
  CheckSquare,
  CalendarDays,
  Sunrise,
  BookOpen,
  Activity,
  Gamepad2,
  ExternalLink,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Schedule", href: "/schedule", icon: BookOpen },
  { title: "Daily Plan", href: "/daily", icon: Sunrise },
  { title: "GitHub", href: "/github", icon: Activity },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Balance", href: "/balance", icon: Wallet },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "AI Evaluation", href: "/ai-evaluation", icon: Brain },
];

const BREAKPOINT_SM = 640;
const BREAKPOINT_LG = 1024;

interface AppSidebarProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FlexibleSidebar({
  isExpanded,
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const supabase = createClient();
  const authLoading = false;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINT_LG) {
        setIsExpanded(true);
        setIsMobileOpen(false);
      } else if (width >= BREAKPOINT_SM) {
        setIsExpanded(false);
        setIsMobileOpen(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsExpanded, setIsMobileOpen]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsMobileOpen(false);
      setIsProfileOpen(false);
    });
  }, [pathname, setIsMobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    router.push("/login");
  };

  const isWide = isExpanded || isMobileOpen;
  const userName = (user as any)?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userId = user?.id ? user.id.slice(0, 8).toUpperCase() : "—";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showProfile = !!user;

  return (
    <>
      {/* Mobile Header */}
      <div className="sm:hidden fixed top-0 left-0 w-full h-16 bg-linear-to-r from-[#47b4f5] to-[#2d7ad6] z-50 flex items-center px-6 border-b border-white/10 shadow-md">
        <button onClick={() => setIsMobileOpen(true)} className="text-white">
          <Menu size={28} />
        </button>
        <div className="ml-4 font-bold text-lg text-white">
          GrowthMe
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-linear-to-b from-[#47b4f5] via-[#3a9de8] to-[#2d7ad6] shadow-2xl flex flex-col transition-all duration-300 ease-in-out font-sans",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full sm:translate-x-0",
          isExpanded ? "sm:w-72 rounded-r-[1.7rem]" : "sm:w-20 rounded-r-[1.7rem]",
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="sm:hidden absolute right-4 top-6 text-white z-50"
        >
          <X size={24} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="hidden sm:flex lg:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-6 w-6 items-center justify-center rounded-full bg-white text-[#3a9de8] shadow-md hover:scale-110 transition-transform"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo / Brand Area */}
        <div className="relative h-24 flex items-center justify-center px-4 shrink-0 mx-4">
          <div
            className={cn(
              "font-extrabold text-white transition-all duration-300 tracking-wider",
              isWide ? "text-2xl" : "text-xl",
            )}
          >
            {isWide ? "GROWTHME" : "GM"}
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          className={cn(
            "flex-1 flex flex-col gap-2 w-full transition-all duration-300 overflow-y-auto overflow-x-hidden scrollbar-hide py-2",
            isWide ? "px-4" : "items-center px-2",
          )}
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <div key={item.title} className="relative w-full group">
                <Link
                  href={item.href}
                  className={cn(
                    "relative z-10 flex items-center h-12 transition-all duration-200 w-full font-medium text-[15px]",
                    isActive
                      ? "bg-white text-[#3a9de8] shadow-sm"
                      : "text-white hover:bg-white/10 hover:text-white",
                    isWide
                      ? "rounded-full justify-start px-5"
                      : "rounded-full justify-center",
                  )}
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <Icon
                      size={20}
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-[#3a9de8]" : "text-white group-hover:text-white",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "transition-all duration-300 whitespace-nowrap overflow-hidden",
                      isWide
                        ? "opacity-100 w-auto translate-x-0 ml-4"
                        : "opacity-0 w-0 -translate-x-10 absolute pointer-events-none",
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Profile Section */}
        {showProfile && (
          <div className="shrink-0 p-4 pb-6 mt-auto">
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={cn(
                  "flex items-center w-full transition-all duration-200 hover:bg-white/10 group rounded-full",
                  isWide ? "gap-3 px-3 py-2" : "justify-center py-2",
                )}
              >
                <Avatar className="shrink-0 h-10 w-10 ring-2 ring-white/50 shadow-lg shadow-blue-700/20 group-hover:ring-white transition-colors duration-200">
                  <AvatarFallback className="bg-white/25 text-white font-bold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "flex-1 text-left min-w-0 transition-all duration-300",
                    isWide
                      ? "opacity-100 w-auto"
                      : "opacity-0 w-0 absolute pointer-events-none overflow-hidden",
                  )}
                >
                  <p className="text-white text-[13px] font-bold truncate tracking-wide">
                    {userName}
                  </p>
                  <p className="text-white/70 text-[11px] font-medium mt-0.5">
                    ID:{userId}
                  </p>
                </div>
              </button>

              {/* Dropdown — opens upward */}
              <div
                className={cn(
                  "absolute left-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100",
                  "transition-all duration-200 ease-in-out transform origin-bottom-left z-50",
                  isWide ? "w-56" : "w-48",
                  isProfileOpen
                    ? "scale-100 opacity-100 visible translate-y-0"
                    : "scale-95 opacity-0 invisible translate-y-1",
                )}
              >
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-slate-800 text-sm font-bold truncate">
                    {userName}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1 border-b border-slate-50">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200 font-medium"
                  >
                    <ExternalLink size={16} className="text-slate-400" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors duration-200 font-medium"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
