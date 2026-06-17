"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFiltersBar from "@/components/tasks/TaskFilters";
import TaskStats from "@/components/tasks/TaskStats";
import TaskModal from "@/components/tasks/TaskModal";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, TaskFilters } from "@/types/task";
import { PageHeader } from "@/components/layout/page-header";

function TasksContent() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeFilters = useMemo(
    () => ({ ...filters, search: searchTerm || undefined }),
    [filters, searchTerm]
  );

  const { data: allTasks, isLoading: statsLoading } = useTasks({});

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingTask(null);
  }, []);

  return (
    <div className="">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Task Manager"
          description="Organize, prioritize, and track your work"
        >
          <Button
            onClick={handleCreateTask}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-200 border-0 rounded-xl px-5 h-10 font-medium transition-all duration-200"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </PageHeader>

        {/* Statistics */}
        <TaskStats tasks={allTasks} isLoading={statsLoading} />

        {/* Filters */}
        <TaskFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Table */}
        <TaskTable
          filters={activeFilters}
          onEditTask={handleEditTask}
          onCreateTask={handleCreateTask}
        />
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        task={editingTask}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8 space-y-6">
          <Skeleton className="h-10 w-48 rounded-md" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}