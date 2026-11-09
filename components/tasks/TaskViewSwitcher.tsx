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
import { pullTasksFromGoogleCalendar } from "@/lib/services/task-service";
import type { Task, TaskCategory, TaskFilters } from "@/types/task";
import { toast } from "sonner";

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

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
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

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

  const handleTaskTitleChange = useCallback(
    (taskId: string, newTitle: string) =>
      runAction(() => updateTask(taskId, { title: newTitle })),
    [runAction, updateTask]
  );

  const handleTaskCategoryChange = useCallback(
    (taskId: string, newCategory: TaskCategory) =>
      runAction(() => updateTask(taskId, { category: newCategory })),
    [runAction, updateTask]
  );

  const handleTaskProgressChange = useCallback(
    (taskId: string, newProgress: number) =>
      runAction(() => updateTask(taskId, { progress: newProgress })),
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

  const handleSyncGoogleCalendar = useCallback(async () => {
    setIsSyncingGoogle(true);
    try {
      const summary = await pullTasksFromGoogleCalendar({ referenceDate: currentMonth });
      await refresh();

      if (summary.errors && summary.errors.length > 0) {
        toast.error(`Peringatan sinkronisasi: ${summary.errors.join(", ")}`);
      }

      if (summary.imported > 0 || summary.updated > 0 || summary.deleted > 0) {
        const parts: string[] = [];
        if (summary.imported > 0) parts.push(`${summary.imported} event baru diimpor`);
        if (summary.updated > 0) parts.push(`${summary.updated} diperbarui`);
        if (summary.deleted > 0) parts.push(`${summary.deleted} dihapus`);

        // Cek apakah ada tugas yang diimpor di luar bulan yang sedang ditampilkan pada kalender
        const currentMonthKey = format(currentMonth, "yyyy-MM");
        const otherMonthTasks = (summary.importedTasks || []).filter(t => {
          if (!t.due_date) return false;
          return !t.due_date.startsWith(currentMonthKey);
        });

        if (otherMonthTasks.length > 0 && view === "calendar") {
          const firstTask = otherMonthTasks[0];
          const taskDate = new Date(firstTask.due_date!);
          const targetMonthName = format(taskDate, "MMMM yyyy");

          toast.success(
            `Sinkronisasi selesai! ${parts.join(", ")}. Ada event pada ${targetMonthName}.`,
            {
              action: {
                label: `Lihat ${format(taskDate, "MMM yyyy")}`,
                onClick: () => setCurrentMonth(taskDate),
              },
              duration: 8000,
            }
          );
        } else {
          toast.success(`Sinkronisasi selesai! ${parts.join(", ")}.`);
        }
      } else {
        toast.info(
          summary.totalGoogleEvents > 0
            ? `Sinkronisasi selesai. Semua ${summary.totalGoogleEvents} event di Google Calendar sudah cocok dengan tugas Anda.`
            : `Sinkronisasi selesai. Tidak ada event ditemukan di Google Calendar untuk rentang 3 bulan. Pastikan event dibuat sebagai "Acara" (Event) di Google Calendar.`
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSyncingGoogle(false);
    }
  }, [refresh, currentMonth, view]);

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
        onSyncGoogle={handleSyncGoogleCalendar}
        isSyncingGoogle={isSyncingGoogle}
      />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-500 dark:text-rose-400"
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
            onTaskTitleChange={handleTaskTitleChange}
            onTaskCategoryChange={handleTaskCategoryChange}
            onTaskProgressChange={handleTaskProgressChange}
            onEditTask={handleEditTask}
            onDeleteTask={setTaskToDelete}
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
        <AlertDialogContent className="rounded-2xl border border-border/80 bg-card p-0 overflow-hidden text-card-foreground shadow-2xl">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-card">
            <AlertDialogTitle className="text-xl font-bold text-foreground">Hapus Tugas</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm mt-1">
              Apakah Anda yakin ingin menghapus tugas &quot;{taskToDelete?.title}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/20 flex gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl border-border/80 cursor-pointer"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={e => {
                e.preventDefault(); // tahan dialog sampai proses hapus selesai
                handleConfirmDelete();
              }}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium border-0 cursor-pointer"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
