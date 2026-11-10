import type { TaskCategory } from "@/types/task";

export type TaskCategoryOption = {
  value: TaskCategory;
  label: string;
  activeClass: string;
  dotColor: string;
};

// Pilihan Kategori dengan Highlight
export const TASK_CATEGORY_OPTIONS: TaskCategoryOption[] = [
  {
    value: "Kuliah",
    label: "Kuliah",
    activeClass:
      "bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  {
    value: "Organisasi",
    label: "Organisasi",
    activeClass:
      "bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300",
    dotColor: "bg-amber-500",
  },
  {
    value: "Praktikum",
    label: "Praktikum",
    activeClass:
      "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300",
    dotColor: "bg-rose-500",
  },
  {
    value: "Lainnya",
    label: "Lainnya",
    activeClass:
      "bg-purple-50 border-purple-300 text-purple-600 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
];
