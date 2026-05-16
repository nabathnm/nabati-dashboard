// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskTag = "design" | "dev" | "review" | "bug" | "docs";

export interface Task {
  id: number;
  text: string;
  tag: TaskTag;
  done: boolean;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

export type StatAccent = "amber" | "teal" | "purple";

export interface StatCardData {
  label: string;
  value: number | string;
  meta: string;
  icon: string; // Tabler icon name e.g. "briefcase"
  accent: StatAccent;
}

// ─── Quick Link ──────────────────────────────────────────────────────────────

export type LinkVariant = "notion" | "github" | "figma" | "linear" | "default";

export interface QuickLink {
  id: number;
  name: string;
  description: string;
  href: string;
  icon: string; // Tabler icon name
  variant: LinkVariant;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  day: number; // day of month
  label?: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

/** 0 = no activity, 1–4 = intensity levels */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;