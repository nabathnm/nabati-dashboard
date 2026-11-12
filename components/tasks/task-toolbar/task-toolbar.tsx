"use client";

import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskFilters } from "@/types/task";

import TaskCalendarNavigation from "./task-calendar-navigation";
import TaskFiltersComponent from "./task-filters";
import TaskSearch from "./task-search";
import TaskViewToggle from "./task-view-toggle";
import { useSearchWidthAnimation } from "./use-search-width-animation";

export type TaskView = "list" | "calendar";

export interface TaskToolbarProps {
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateTask: () => void;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSyncGoogle?: () => void;
  isSyncingGoogle?: boolean;
}

export default function TaskToolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
  onCreateTask,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSyncGoogle,
  isSyncingGoogle = false,
}: TaskToolbarProps) {
  const { searchRef, prepareAnimation } = useSearchWidthAnimation(view);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 rounded-2xl border border-border/80 bg-card p-2.5 shadow-xs">
      {/* Left controls: View toggle & Search/Navigation */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <TaskViewToggle
          view={view}
          onViewChange={onViewChange}
          onBeforeChange={prepareAnimation}
        />

        {view === "list" ? (
          <>
            <TaskSearch
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              searchRef={searchRef}
              className="flex-1 min-w-[180px]"
            />
            <TaskFiltersComponent filters={filters} onFiltersChange={onFiltersChange} />
          </>
        ) : (
          <TaskCalendarNavigation
            currentMonth={currentMonth}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onToday={onToday}
          />
        )}
      </div>

      {/* Right controls: Actions (Sync Google & Add Task) */}
      <div className="flex items-center gap-2 shrink-0 justify-end">
        {onSyncGoogle && (
          <Button
            type="button"
            variant="outline"
            onClick={onSyncGoogle}
            disabled={isSyncingGoogle}
            className="h-9 rounded-xl border-border text-foreground hover:bg-muted/60 px-3 cursor-pointer text-xs font-semibold"
            title="Tarik & sinkronkan event dari Google Calendar"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 text-foreground", isSyncingGoogle && "animate-spin")}
            />
            <span className="hidden sm:inline ml-1.5">Sinkron Google</span>
          </Button>
        )}

        <Button
          type="button"
          onClick={onCreateTask}
          className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          <span>Tambah Tugas</span>
        </Button>
      </div>
    </div>
  );
}
