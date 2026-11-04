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
    <div className="flex items-center gap-x-2.5 overflow-hidden rounded-full border bg-card p-3">
      <TaskViewToggle
        view={view}
        onViewChange={onViewChange}
        onBeforeChange={prepareAnimation}
      />

      <TaskSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchRef={searchRef}
        className={view === "list" ? "flex-[2_1_0%]" : "flex-[1_1_0%]"}
      />
      {view === "list" ? (
        <>
          <TaskFiltersComponent filters={filters} onFiltersChange={onFiltersChange} />

          <Button
            type="button"
            onClick={onCreateTask}
            className="h-9 shrink-0 rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add task
          </Button>

          {onSyncGoogle && (
            <Button
              type="button"
              variant="outline"
              onClick={onSyncGoogle}
              disabled={isSyncingGoogle}
              className="h-9 shrink-0 rounded-full border-border/80 text-foreground hover:bg-muted/30"
              title="Tarik & sinkronkan event dari Google Calendar"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5 text-[#88C0D0]", isSyncingGoogle && "animate-spin")}
              />
              <span className="hidden sm:inline ml-1.5 text-xs font-medium">Sync Google</span>
            </Button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <TaskCalendarNavigation
            currentMonth={currentMonth}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onToday={onToday}
          />
          {onSyncGoogle && (
            <Button
              type="button"
              variant="outline"
              onClick={onSyncGoogle}
              disabled={isSyncingGoogle}
              className="h-9 shrink-0 rounded-full border-border/80 text-foreground hover:bg-muted/30 px-3"
              title="Tarik & sinkronkan event dari Google Calendar"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5 text-[#88C0D0]", isSyncingGoogle && "animate-spin")}
              />
              <span className="hidden md:inline ml-1.5 text-xs font-medium">Sync Google</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
