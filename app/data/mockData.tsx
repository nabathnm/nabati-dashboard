import type {
  Task,
  StatCardData,
  QuickLink,
  CalendarEvent,
  ActivityLevel,
} from "../types/dashboard";

// ─── Stats ───────────────────────────────────────────────────────────────────

export const STAT_CARDS: StatCardData[] = [
  {
    label: "Total Projects",
    value: 12,
    meta: "3 active this month",
    icon: "briefcase",
    accent: "amber",
  },
  {
    label: "Total Commits",
    value: 348,
    meta: "27 this week",
    icon: "git-merge",
    accent: "teal",
  },
  {
    label: "Total Tasks",
    value: 41,
    meta: "8 completed today",
    icon: "check-list",
    accent: "purple",
  },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const INITIAL_TASKS: Task[] = [
  { id: 1, text: "Finalize landing page redesign", tag: "design", done: true },
  { id: 2, text: "Fix auth bug on login flow", tag: "bug", done: false },
  { id: 3, text: "Write unit tests for API module", tag: "dev", done: false },
  { id: 4, text: "Code review: checkout PR #48", tag: "review", done: false },
  { id: 5, text: "Update project documentation", tag: "docs", done: false },
  { id: 6, text: "Push hotfix to production", tag: "dev", done: true },
];

// ─── Quick Links ─────────────────────────────────────────────────────────────

export const QUICK_LINKS: QuickLink[] = [
  {
    id: 1,
    name: "Notion — Work Space",
    description: "Project docs & notes",
    href: "https://notion.so",
    icon: "file-text",
    variant: "notion",
  },
  {
    id: 2,
    name: "Notion — Personal Wiki",
    description: "Ideas, journal & research",
    href: "https://notion.so",
    icon: "notebook",
    variant: "notion",
  },
  {
    id: 3,
    name: "GitHub",
    description: "Repositories & pull requests",
    href: "https://github.com",
    icon: "brand-github",
    variant: "github",
  },
  {
    id: 4,
    name: "Figma",
    description: "UI designs & prototypes",
    href: "https://figma.com",
    icon: "brand-figma",
    variant: "figma",
  },
];

// ─── Calendar ────────────────────────────────────────────────────────────────

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { day: 5, label: "Sprint planning" },
  { day: 10, label: "Design review" },
  { day: 16, label: "Today" },
  { day: 22, label: "Demo day" },
  { day: 28, label: "Retrospective" },
];

// ─── Activity Grid ────────────────────────────────────────────────────────────

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  0, 0, 1, 0, 2, 3, 0, 1, 0, 0, 2, 4, 3, 1, 0, 0, 2, 1, 3, 4, 2, 0, 0, 1, 2,
  3, 1, 0, 0, 2, 3, 4, 2, 1, 0, 0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 0, 0, 1, 2,
  3,
];