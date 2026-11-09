import { ListTodo, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import React from "react";

export interface TaskStatConfig {
  label: string;
  subLabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export const taskStatStyles: TaskStatConfig[] = [
  {
    label: "Total Tugas",
    subLabel: "Semua agenda tercatat",
    icon: ListTodo,
    iconBg: "bg-muted text-foreground border-border/50",
    iconColor: "text-foreground",
  },
  {
    label: "Sedang Berjalan",
    subLabel: "Tugas aktif belum selesai",
    icon: Clock,
    iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    label: "Selesai",
    subLabel: "Tercapai tepat waktu",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    label: "Terlewat",
    subLabel: "Melewati batas tenggat",
    icon: AlertTriangle,
    iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
  {
    label: "Tingkat Selesai",
    subLabel: "Persentase penyelesaian",
    icon: TrendingUp,
    iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
];
