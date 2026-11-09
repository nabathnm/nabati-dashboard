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
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
    color: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Praktikum: {
    label: "Praktikum",
    bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
    color: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  Personal: {
    label: "Personal",
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
    color: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  Lainnya: {
    label: "Lainnya",
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
    color: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
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
