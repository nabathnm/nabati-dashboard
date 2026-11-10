"use client";

import { CalendarDays, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskView } from "./task-toolbar";

interface TaskViewToggleProps {
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  onBeforeChange?: () => void;
}

export default function TaskViewToggle({
  view,
  onViewChange,
  onBeforeChange,
}: TaskViewToggleProps) {
  const handleSelect = (newView: TaskView) => {
    if (newView === view) return;
    onBeforeChange?.();

    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => {
        onViewChange(newView);
      });
    } else {
      onViewChange(newView);
    }
  };

  return (
    <div className="inline-flex items-center rounded-xl border border-border/70 bg-muted/40 p-1 shrink-0">
      <button
        type="button"
        onClick={() => handleSelect("calendar")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
          view === "calendar"
            ? "bg-card text-[#5E81AC] dark:text-[#88C0D0] font-semibold shadow-xs border border-border/80 dark:border-[#88C0D0]/30"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarDays className="size-3.5" />
        <span>Kalender</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("list")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
          view === "list"
            ? "bg-card text-[#5E81AC] dark:text-[#88C0D0] font-semibold shadow-xs border border-border/80 dark:border-[#88C0D0]/30"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutList className="size-3.5" />
        <span>Daftar</span>
      </button>
    </div>
  );
}
