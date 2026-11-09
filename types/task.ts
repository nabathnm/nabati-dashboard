import type React from "react";

export type LucideIcon = React.ComponentType<{
  className?: string;
  size?: number | string;
  [key: string]: any;
}>;

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
  google_event_id?: string | null;
  _gcal_error?: string | null;
  _gcal_link?: string | null;
};

export type TaskCategory = "Kuliah" | "Organisasi" | "Praktikum" | "Personal" | "Lainnya";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  category?: TaskCategory;
  progress?: number;
  is_completed?: boolean;
  due_date?: string | null;
  google_event_id?: string | null;
  sync_to_calendar?: boolean;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type GoogleCalendarSyncResult = {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
  message?: string;
};

export type GoogleCalendarSyncSummary = {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
};

export type GoogleCalendarPullSummary = {
  totalGoogleEvents: number;
  imported: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: string[];
  importedTasks?: { id: string; title: string; due_date: string | null }[];
};

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  status?: string;
  colorId?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: {
    private?: {
      nabatu_task_id?: string;
      nabatu_category?: string;
    };
  };
};

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
