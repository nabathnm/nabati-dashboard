import type { TaskCategory } from "@/types/task";

export type TaskCategoryOption = {
  value: TaskCategory;
  label: string;
  activeClass: string;
  dotColor: string;
};

export const TASK_CATEGORY_OPTIONS: TaskCategoryOption[] = [
  {
    value: "Kuliah",
    label: "Kuliah",
    activeClass: "bg-blue-50 border-blue-300 text-blue-600",
    dotColor: "bg-blue-400",
  },
  {
    value: "Organisasi",
    label: "Organisasi",
    activeClass: "bg-amber-50 border-amber-300 text-amber-600",
    dotColor: "bg-amber-400",
  },
  {
    value: "Praktikum",
    label: "Praktikum",
    activeClass: "bg-rose-50 border-rose-300 text-rose-600",
    dotColor: "bg-rose-400",
  },
  {
    value: "Lainnya",
    label: "Lainnya",
    activeClass: "bg-purple-50 border-purple-300 text-purple-600",
    dotColor: "bg-purple-400",
  },
];
