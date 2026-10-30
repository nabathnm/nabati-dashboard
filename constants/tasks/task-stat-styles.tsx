import { ListTodo, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

import type { TaskStatStyle } from "@/types/task";

export const taskStatStyles: Omit<TaskStatStyle, "value">[] = [
  {
    label: "Total Tasks",
    icon: ListTodo,
    border: "border-t-slate-400",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    label: "In Progress",
    icon: Clock,
    border: "border-t-blue-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Completed",
    icon: CheckCircle2,
    border: "border-t-emerald-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    label: "Overdue",
    icon: AlertTriangle,
    border: "border-t-rose-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    label: "Completion",
    icon: TrendingUp,
    border: "border-t-amber-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];
