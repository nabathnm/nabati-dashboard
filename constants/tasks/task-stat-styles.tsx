import { ListTodo, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import React from "react";

export interface TaskStatConfig {
  label: string;
  subLabel: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  cardAccent: string;
  circleAccent: string;
}

// Nord Theme Task Stat Cards (Sections 4.B, 4.C, 4.D, 4.E in nord-style)
// High contrast light mode styling with soft Nord dark mode
// Total Tugas: Aurora Yellow (#EBCB8B, nord13) / Amber
// Sedang Berjalan: Frost Blue (#88C0D0, nord8 / #5E81AC, nord10)
// Selesai: Aurora Green (#A3BE8C, nord14 / Emerald)
// Terlewat: Aurora Red (#BF616A, nord11 / Rose)
// Tingkat Selesai: Aurora Purple (#B48EAD, nord15 / Purple)
export const taskStatStyles: TaskStatConfig[] = [
  {
    label: "Total Tugas",
    subLabel: "Semua agenda tercatat",
    icon: ListTodo,
    iconBg: "bg-amber-500/10 dark:bg-[#EBCB8B]/15 text-amber-800 dark:text-[#EBCB8B] border-amber-500/30 dark:border-[#EBCB8B]/30",
    iconColor: "text-amber-800 dark:text-[#EBCB8B]",
    cardAccent: "hover:border-amber-500/40 dark:hover:border-[#EBCB8B]/40",
    circleAccent: "bg-amber-500/10 dark:bg-[#EBCB8B]/5",
  },
  {
    label: "Sedang Berjalan",
    subLabel: "Tugas aktif belum selesai",
    icon: Clock,
    iconBg: "bg-blue-500/10 dark:bg-[#88C0D0]/15 text-blue-700 dark:text-[#88C0D0] border-blue-500/30 dark:border-[#88C0D0]/30",
    iconColor: "text-blue-700 dark:text-[#88C0D0]",
    cardAccent: "hover:border-blue-500/40 dark:hover:border-[#88C0D0]/40",
    circleAccent: "bg-blue-500/10 dark:bg-[#88C0D0]/5",
  },
  {
    label: "Selesai",
    subLabel: "Tercapai tepat waktu",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/10 dark:bg-[#A3BE8C]/15 text-emerald-700 dark:text-[#A3BE8C] border-emerald-500/30 dark:border-[#A3BE8C]/30",
    iconColor: "text-emerald-700 dark:text-[#A3BE8C]",
    cardAccent: "hover:border-emerald-500/40 dark:hover:border-[#A3BE8C]/40",
    circleAccent: "bg-emerald-500/10 dark:bg-[#A3BE8C]/5",
  },
  {
    label: "Terlewat",
    subLabel: "Melewati batas tenggat",
    icon: AlertTriangle,
    iconBg: "bg-rose-500/10 dark:bg-[#BF616A]/15 text-rose-700 dark:text-[#BF616A] border-rose-500/30 dark:border-[#BF616A]/30",
    iconColor: "text-rose-700 dark:text-[#BF616A]",
    cardAccent: "hover:border-rose-500/40 dark:hover:border-[#BF616A]/40",
    circleAccent: "bg-rose-500/10 dark:bg-[#BF616A]/5",
  },
  {
    label: "Tingkat Selesai",
    subLabel: "Persentase penyelesaian",
    icon: TrendingUp,
    iconBg: "bg-purple-500/10 dark:bg-[#B48EAD]/15 text-purple-700 dark:text-[#B48EAD] border-purple-500/30 dark:border-[#B48EAD]/30",
    iconColor: "text-purple-700 dark:text-[#B48EAD]",
    cardAccent: "hover:border-purple-500/40 dark:hover:border-[#B48EAD]/40",
    circleAccent: "bg-purple-500/10 dark:bg-[#B48EAD]/5",
  },
];
