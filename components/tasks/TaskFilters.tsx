"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskFilters, TaskCategory, TaskStatus, TaskSortBy } from "@/types/task";

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function TaskFiltersBar({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
}: TaskFiltersBarProps) {
  return (
    <div className="bg-white shadow-sm border border-slate-100 px-4 py-3 rounded-xl">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter icon label */}
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-xs font-medium text-slate-500 hidden sm:block">
            Filter
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-300 transition-colors"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <Select
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              status: v === "all" || !v ? undefined : (v as TaskStatus),
            })
          }
        >
          <SelectTrigger className="w-[130px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              category: v === "all" || !v ? undefined : (v as TaskCategory),
            })
          }
        >
          <SelectTrigger className="w-[130px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Kuliah">Kuliah</SelectItem>
            <SelectItem value="Organisasi">Organisasi</SelectItem>
            <SelectItem value="Praktikum">Praktikum</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          onValueChange={(v) =>
            onFiltersChange({ ...filters, sort_by: v as TaskSortBy })
          }
        >
          <SelectTrigger className="w-[120px] h-9 text-sm bg-slate-50 border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 transition-colors">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="due_date">Deadline</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}