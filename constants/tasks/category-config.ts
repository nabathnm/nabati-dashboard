import type { TaskCategory } from "@/types/task";

export type TaskCategoryConfig = {
  color: string;
  bg: string;
  dot: string;
  label: string;
};

export const CATEGORY_CONFIG: Record<TaskCategory, TaskCategoryConfig> = {
  Kuliah: {
    color: "text-blue-600",
    bg: "bg-blue-200 border-blue-100",
    dot: "bg-blue-400",
    label: "Kuliah",
  },
  Organisasi: {
    color: "text-amber-600",
    bg: "bg-amber-200 border-amber-100",
    dot: "bg-amber-400",
    label: "Organisasi",
  },
  Praktikum: {
    color: "text-rose-600",
    bg: "bg-rose-200 border-rose-100",
    dot: "bg-rose-400",
    label: "Praktikum",
  },
  Personal: {
    color: "text-purple-600",
    bg: "bg-purple-200 border-purple-100",
    dot: "bg-purple-400",
    label: "Lainnya",
  },
  Lainnya: {
    color: "text-purple-600",
    bg: "bg-purple-200 border-purple-100",
    dot: "bg-purple-400",
    label: "Lainnya",
  },
};
