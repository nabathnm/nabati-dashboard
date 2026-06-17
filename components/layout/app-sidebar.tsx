"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Users,
  BarChart3,
  Brain,
  LogOut,
  CheckSquare,
  CalendarDays,
  Sunrise,
  BookOpen,
  Activity,
  Gamepad2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/redux/hooks";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: BookOpen,
  },
  {
    title: "Daily Plan",
    href: "/daily",
    icon: Sunrise,
  },
  {
    title: "GitHub",
    href: "/github",
    icon: Activity,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Balance",
    href: "/balance",
    icon: Wallet,
  },
  {
    title: "Life RPG",
    href: "/rpg",
    icon: Gamepad2,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Evaluation",
    href: "/ai-evaluation",
    icon: Brain,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const userName = (user as any)?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userId = user?.id ? user.id.slice(0, 8).toUpperCase() : "—";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar
      collapsible="icon"
      className="border-none rounded-r-[1.7rem] bg-gradient-to-b from-[#47b4f5] via-[#3a9de8] to-[#2d7ad6] text-white [&_[data-slot=sidebar-rail]]:hidden overflow-visible pt-6"
    >
      {/* Profile */}
      <div className="flex flex-col items-center gap-2.5 px-4 pt-4 pb-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-3">
        <Avatar className="h-[72px] w-[72px] ring-[3px] ring-white/50 shadow-lg shadow-blue-700/20 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:ring-2">
          {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} /> */}
          <AvatarFallback className="bg-white/25 text-white text-lg font-bold group-data-[collapsible=icon]:text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-0.5 group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-bold tracking-wide text-white">{userName}</span>
          <span className="text-[11px] text-white/60 font-medium">ID:{userId}</span>
        </div>
      </div>

      <SidebarContent className="bg-transparent px-0 overflow-visible group-data-[collapsible=icon]:px-1">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-12 transition-all duration-200 pl-6",
                    "group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:mx-1",
                    isActive
                      ? "!bg-background font-bold !text-[#3a9de8] rounded-none rounded-l-full ml-4 w-[calc(100%-1rem)]"
                      : "text-white hover:bg-white/10 hover:text-white font-medium rounded-full mx-4"
                  )}
                  render={<Link href={item.href} />}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#3a9de8]" : "text-white")} />
                  <span className="group-data-[collapsible=icon]:hidden text-[13px] tracking-wide uppercase ml-1">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-transparent px-4 pb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="h-11 px-4 text-white/80 hover:bg-white/10 hover:text-white rounded-full font-medium"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden text-[13px] uppercase tracking-wide">
                Logout
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}