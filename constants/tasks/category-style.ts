// components/tasks/TaskCategory.ts
import type { TaskCategory } from "@/types/task";

export interface CategoryStyle {
  /** Teks yang ditampilkan di badge */
  label: string;
  /** Latar + warna border untuk badge/chip */
  bg: string;
  /** Warna teks */
  color: string;
  /** Warna titik kecil penanda kategori */
  dot: string;
}

// Class Tailwind harus ditulis utuh (bukan dirangkai dari string)
// agar terdeteksi saat build.
export const categoryStyles: Record<TaskCategory, CategoryStyle> = {
  Kuliah: {
    label: "Kuliah",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
    color: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Organisasi: {
    label: "Organisasi",
    bg: "bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900",
    color: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  Praktikum: {
    label: "Praktikum",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
    color: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Personal: {
    label: "Personal",
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
    color: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Lainnya: {
    label: "Lainnya",
    bg: "bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800",
    color: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

/** Opsi untuk dropdown kategori (mis. di TaskModal). */
export const categoryOptions = (
  Object.entries(categoryStyles) as [TaskCategory, CategoryStyle][]
).map(([value, style]) => ({
  value,
  label: style.label,
  dotColor: style.dot,
}));
