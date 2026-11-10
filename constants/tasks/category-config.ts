import type { TaskCategory } from "@/types/task";

export type TaskCategoryConfig = {
  color: string;
  bg: string;
  dot: string;
  label: string;
};

// Konfigurasi Kategori Highlighted
// Kuliah: Biru
// Organisasi: Kuning (Amber)
// Praktikum: Merah (Rose)
// Personal / Lainnya: Ungu (Purple)
export const CATEGORY_CONFIG: Record<TaskCategory, TaskCategoryConfig> = {
  Kuliah: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
    dot: "bg-blue-500",
    label: "Kuliah",
  },
  Organisasi: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
    dot: "bg-amber-500",
    label: "Organisasi",
  },
  Praktikum: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
    dot: "bg-rose-500",
    label: "Praktikum",
  },
  Personal: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
    dot: "bg-purple-500",
    label: "Personal",
  },
  Lainnya: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
    dot: "bg-purple-500",
    label: "Lainnya",
  },
};
