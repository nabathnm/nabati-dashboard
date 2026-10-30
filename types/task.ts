import type { LucideIcon } from "lucide-react";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  progress: number;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
};

export type TaskCategory = "Kuliah" | "Organisasi" | "Praktikum" | "Personal" | "Lainnya";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  category?: TaskCategory;
  progress?: number;
  is_completed?: boolean;
  due_date?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type TaskFilters = {
  search?: string;
  category?: TaskCategory | "all";
  is_completed?: boolean;
  due_date?: string | null;
  sort_by?: TaskSortBy;
};

export type TaskStats = {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

export type TaskSortBy =
  "deadline" | "newest" | "oldest" | "category" | "progress" | "title";

export interface TaskStatStyle {
  label: string;
  value: number | string;
  icon: LucideIcon;
  border: string;
  iconBg: string;
  iconColor: string;
}
