"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { categoryOptions } from "@/constants/tasks/category-style";
import type { TaskCategory, TaskFilters } from "@/types/task";

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

type StatusValue = "All" | "todo" | "done";

function getStatusValue(isCompleted: boolean | undefined): StatusValue {
  if (isCompleted === undefined) return "All";
  return isCompleted ? "done" : "todo";
}

export default function TaskFiltersComponent({
  filters,
  onFiltersChange,
}: TaskFiltersProps) {
  return (
    <>
      <Select
        value={getStatusValue(filters.is_completed)}
        onValueChange={(value: string | null) =>
          onFiltersChange({
            ...filters,
            is_completed: value === "done" ? true : value === "todo" ? false : undefined,
          })
        }
      >
        <SelectTrigger className="h-9 w-full xl:w-32 rounded-xl text-xs bg-muted/30 border-border/70">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent className="rounded-xl">
          <SelectItem value="All">Semua Status</SelectItem>
          <SelectItem value="todo">Belum Selesai</SelectItem>
          <SelectItem value="done">Selesai</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category && filters.category !== "all" ? filters.category : "all"}
        onValueChange={(value: string | null) =>
          onFiltersChange({
            ...filters,
            category: !value || value === "all" ? undefined : (value as TaskCategory),
          })
        }
      >
        <SelectTrigger className="h-9 w-full xl:w-36 rounded-xl text-xs bg-muted/30 border-border/70">
          <SelectValue placeholder="Kategori" />
        </SelectTrigger>

        <SelectContent className="rounded-xl">
          <SelectItem value="all">Semua Kategori</SelectItem>

          {categoryOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${option.dotColor}`} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
