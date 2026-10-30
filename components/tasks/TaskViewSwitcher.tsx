"use client";

import { addMonths, format, subMonths } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

import CalendarGrid from "@/components/tasks/calendar/CalendarGrid";
import TaskListView from "@/components/tasks/list/TaskListView";
import { TaskToolbar, type TaskView } from "@/components/tasks/task-toolbar";
import TaskModal from "@/components/tasks/TaskModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getErrorMessage, useTasks } from "@/hooks/use-task";
import type { Task, TaskFilters } from "@/types/task";

/* =========================================================
   HELPER
========================================================= */

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* =========================================================
   TASK VIEW SWITCHER
========================================================= */

export default function TaskViewSwitcher() {
  // Tampilan, filter, dan pencarian (dikendalikan toolbar)
  const [view, setView] = useState<TaskView>("calendar");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Bulan yang ditampilkan di kalender
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Modal tambah/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDueDate, setDefaultDueDate] = useState<string | null>(null);

  // Konfirmasi hapus
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error dari aksi
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  // Gabungkan filter dan pencarian (sort_by ikut di dalam filters)
  const activeFilters = useMemo<TaskFilters>(
    () => ({
      ...filters,
      search: debouncedSearch || undefined,
    }),
    [filters, debouncedSearch]
  );

  const {
    tasks,
    isLoading,
    error,
    refresh,
    updateTask,
    toggleComplete,
    setPinned,
    deleteTask,
  } = useTasks(activeFilters);

  /* ---------- Navigasi bulan ---------- */

  const handlePrevMonth = useCallback(() => setCurrentMonth(m => subMonths(m, 1)), []);

  const handleNextMonth = useCallback(() => setCurrentMonth(m => addMonths(m, 1)), []);

  const handleToday = useCallback(() => setCurrentMonth(new Date()), []);

  /* ---------- Aksi ---------- */

  const runAction = useCallback(async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }, []);

  const handleTaskCompleteChange = useCallback(
    (taskId: string, isCompleted: boolean) =>
      runAction(() => toggleComplete(taskId, isCompleted)),
    [runAction, toggleComplete]
  );

  const handleToggleComplete = useCallback(
    (task: Task) => handleTaskCompleteChange(task.id, !task.is_completed),
    [handleTaskCompleteChange]
  );

  // Sematkan / lepas sematan tugas
  const handleTogglePin = useCallback(
    (task: Task) => runAction(() => setPinned(task.id, !task.is_pinned)),
    [runAction, setPinned]
  );

  // Hapus tugas setelah dikonfirmasi lewat dialog
  const handleConfirmDelete = useCallback(async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    await runAction(() => deleteTask(taskToDelete.id)); // error tampil di banner
    setIsDeleting(false);
    setTaskToDelete(null);
  }, [taskToDelete, runAction, deleteTask]);

  const handleTaskDateChange = useCallback(
    (taskId: string, newDate: string) =>
      runAction(() => updateTask(taskId, { due_date: newDate })),
    [runAction, updateTask]
  );

  const handleTaskDescriptionChange = useCallback(
    (taskId: string, newDescription: string) =>
      runAction(() => updateTask(taskId, { description: newDescription })),
    [runAction, updateTask]
  );

  /* ---------- Modal ---------- */

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setDefaultDueDate(null);
    setModalOpen(true);
  }, []);

  // Klik tanggal di kalender: buat tugas baru dengan tenggat tanggal itu
  const handleDateClick = useCallback((date: Date) => {
    setEditingTask(null);
    setDefaultDueDate(format(date, "yyyy-MM-dd"));
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultDueDate(null);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingTask(null);
      setDefaultDueDate(null);
    }
  }, []);

  const handleModalSuccess = useCallback(() => refresh({ silent: true }), [refresh]);

  const errorMessage = error ?? actionError;

  return (
    <div className="space-y-4">
      <TaskToolbar
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onCreateTask={handleCreateTask}
      />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div>
        {view === "list" && (
          <TaskListView
            tasks={tasks}
            isLoading={isLoading}
            onToggleComplete={handleToggleComplete}
            onTogglePin={handleTogglePin}
            onDeleteTask={setTaskToDelete}
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
          />
        )}

        {view === "calendar" && (
          <CalendarGrid
            currentMonth={currentMonth}
            tasks={tasks}
            onDateClick={handleDateClick}
            onTaskDateChange={handleTaskDateChange}
            onTaskCompleteChange={handleTaskCompleteChange}
            onTaskDescriptionChange={handleTaskDescriptionChange}
          />
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        task={editingTask}
        defaultDueDate={defaultDueDate}
        onSuccess={handleModalSuccess}
      />

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={open => {
          if (!open && !isDeleting) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={e => {
                e.preventDefault(); // tahan dialog sampai proses hapus selesai
                handleConfirmDelete();
              }}
              className="bg-rose-500 hover:bg-rose-600 border-0"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
