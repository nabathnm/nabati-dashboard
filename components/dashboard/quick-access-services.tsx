"use client";

import Link from "next/link";
import {
  CheckSquare,
  CalendarDays,
  BookOpen,
  Sunrise,
  Activity,
  ArrowLeftRight,
  Wallet,
  Gamepad2,
  BarChart3,
  Brain,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Tasks",
    description: "Manage your to-do list",
    href: "/tasks",
    icon: CheckSquare,
    gradient: "from-blue-500 to-cyan-400",
    bgHover: "group-hover:bg-blue-50",
  },
  {
    title: "Calendar",
    description: "Monthly activity planner",
    href: "/calendar",
    icon: CalendarDays,
    gradient: "from-sky-500 to-blue-400",
    bgHover: "group-hover:bg-sky-50",
  },
  {
    title: "Schedule",
    description: "Weekly class timetable",
    href: "/schedule",
    icon: BookOpen,
    gradient: "from-indigo-500 to-violet-400",
    bgHover: "group-hover:bg-indigo-50",
  },
  {
    title: "Daily Plan",
    description: "AI-powered daily routine",
    href: "/daily",
    icon: Sunrise,
    gradient: "from-amber-500 to-orange-400",
    bgHover: "group-hover:bg-amber-50",
  },
  {
    title: "GitHub",
    description: "Track your contributions",
    href: "/github",
    icon: Activity,
    gradient: "from-emerald-500 to-green-400",
    bgHover: "group-hover:bg-emerald-50",
  },
  {
    title: "Transactions",
    description: "Income & expense tracker",
    href: "/transactions",
    icon: ArrowLeftRight,
    gradient: "from-rose-500 to-pink-400",
    bgHover: "group-hover:bg-rose-50",
  },
  {
    title: "Balance",
    description: "Account balances",
    href: "/balance",
    icon: Wallet,
    gradient: "from-violet-500 to-purple-400",
    bgHover: "group-hover:bg-violet-50",
  },
  {
    title: "Life RPG",
    description: "Gamified productivity",
    href: "/rpg",
    icon: Gamepad2,
    gradient: "from-fuchsia-500 to-pink-400",
    bgHover: "group-hover:bg-fuchsia-50",
  },
  {
    title: "Analytics",
    description: "Financial insights",
    href: "/analytics",
    icon: BarChart3,
    gradient: "from-teal-500 to-cyan-400",
    bgHover: "group-hover:bg-teal-50",
  },
  {
    title: "AI Evaluation",
    description: "Smart performance review",
    href: "/ai-evaluation",
    icon: Brain,
    gradient: "from-purple-500 to-indigo-400",
    bgHover: "group-hover:bg-purple-50",
  },
];

export default function QuickAccessServices() {
  return (
    <div className="glass-card rounded-3xl p-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Quick Access</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Jump to any service</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {services.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className={cn(
              "group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl",
              "border border-border/50 bg-card/50",
              "hover:border-border hover:shadow-md",
              "transition-all duration-300 ease-out",
              service.bgHover
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br shadow-sm",
                service.gradient
              )}
            >
              <service.icon className="w-5 h-5 text-white" />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-xs font-bold text-foreground leading-tight">
                {service.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">
                {service.description}
              </p>
            </div>

            {/* Hover arrow indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
