"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  );
}
