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
// Total Tugas: Aurora Yellow (#EBCB8B, nord13)
// Sedang Berjalan: Frost Blue (#88C0D0, nord8)
// Selesai: Aurora Green (#A3BE8C, nord14)
// Terlewat: Aurora Red (#BF616A, nord11)
// Tingkat Selesai: Aurora Purple (#B48EAD, nord15)
export const taskStatStyles: TaskStatConfig[] = [
  {
    label: "Total Tugas",
    subLabel: "Semua agenda tercatat",
    icon: ListTodo,
    iconBg: "bg-[#EBCB8B]/15 text-[#D08770] dark:text-[#EBCB8B] border-[#EBCB8B]/30",
    iconColor: "text-[#D08770] dark:text-[#EBCB8B]",
    cardAccent: "hover:border-[#EBCB8B]/40",
    circleAccent: "bg-[#EBCB8B]/10 dark:bg-[#EBCB8B]/5",
  },
  {
    label: "Sedang Berjalan",
    subLabel: "Tugas aktif belum selesai",
    icon: Clock,
    iconBg: "bg-[#88C0D0]/15 text-[#5E81AC] dark:text-[#88C0D0] border-[#88C0D0]/30",
    iconColor: "text-[#5E81AC] dark:text-[#88C0D0]",
    cardAccent: "hover:border-[#88C0D0]/40",
    circleAccent: "bg-[#88C0D0]/10 dark:bg-[#88C0D0]/5",
  },
  {
    label: "Selesai",
    subLabel: "Tercapai tepat waktu",
    icon: CheckCircle2,
    iconBg: "bg-[#A3BE8C]/15 text-[#A3BE8C] border-[#A3BE8C]/30",
    iconColor: "text-[#A3BE8C]",
    cardAccent: "hover:border-[#A3BE8C]/40",
    circleAccent: "bg-[#A3BE8C]/10 dark:bg-[#A3BE8C]/5",
  },
  {
    label: "Terlewat",
    subLabel: "Melewati batas tenggat",
    icon: AlertTriangle,
    iconBg: "bg-[#BF616A]/15 text-[#BF616A] border-[#BF616A]/30",
    iconColor: "text-[#BF616A]",
    cardAccent: "hover:border-[#BF616A]/40",
    circleAccent: "bg-[#BF616A]/10 dark:bg-[#BF616A]/5",
  },
  {
    label: "Tingkat Selesai",
    subLabel: "Persentase penyelesaian",
    icon: TrendingUp,
    iconBg: "bg-[#B48EAD]/15 text-[#B48EAD] border-[#B48EAD]/30",
    iconColor: "text-[#B48EAD]",
    cardAccent: "hover:border-[#B48EAD]/40",
    circleAccent: "bg-[#B48EAD]/10 dark:bg-[#B48EAD]/5",
  },
];
