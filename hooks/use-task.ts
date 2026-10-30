// hooks/use-task.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TaskServiceError,
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  getPinnedTasks,
  getTaskById,
  getTaskStats,
  getTasks,
  setTaskPinned as setTaskPinnedService,
  subscribeToTaskChanges,
  toggleComplete as toggleCompleteService,
  updateProgress as updateProgressService,
  updateTask as updateTaskService,
} from "@/lib/services/task-service";
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskStats,
  UpdateTaskInput,
} from "@/types/task";

const EMPTY_STATS: TaskStats = {
  total: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0,
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof TaskServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

/* -------------------------------------------------------------------------- */
/*  useTasks: daftar tugas + aksi CRUD                                        */
/* -------------------------------------------------------------------------- */

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Untuk mengabaikan respons lama (race condition) dan update setelah unmount
  const requestIdRef = useRef(0);

  // Key string agar objek filter baru dengan isi sama tidak memicu fetch ulang
  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const currentFilters: TaskFilters = JSON.parse(filtersKey);
      const requestId = ++requestIdRef.current;

      if (!options.silent) setIsLoading(true);

      try {
        const list = await getTasks(currentFilters);
        if (requestId !== requestIdRef.current) return;
        setTasks(list);
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getErrorMessage(err));
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [filtersKey]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      requestIdRef.current++;
    };
  }, []);

  /** Jalankan mutasi, lalu muat ulang data tanpa menampilkan loading penuh. */
  const mutate = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      setIsMutating(true);
      try {
        const result = await action();
        await refresh({ silent: true });
        return result;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh]
  );

  const createTask = useCallback(
    (input: CreateTaskInput) => mutate(() => createTaskService(input)),
    [mutate]
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput) => mutate(() => updateTaskService(id, input)),
    [mutate]
  );

  const updateProgress = useCallback(
    (id: string, progress: number) => mutate(() => updateProgressService(id, progress)),
    [mutate]
  );

  const toggleComplete = useCallback(
    (id: string, isCompleted: boolean) =>
      mutate(() => toggleCompleteService(id, isCompleted)),
    [mutate]
  );

  const setPinned = useCallback(
    (id: string, isPinned: boolean) => mutate(() => setTaskPinnedService(id, isPinned)),
    [mutate]
  );

  const deleteTask = useCallback(
    (id: string) => mutate(() => deleteTaskService(id)),
    [mutate]
  );

  return {
    // data
    tasks,
    // status
    isLoading,
    isMutating,
    error,
    // aksi (melempar error agar bisa ditangkap form/toast di komponen)
    refresh,
    createTask,
    updateTask,
    updateProgress,
    toggleComplete,
    setPinned,
    deleteTask,
  };
}

/* -------------------------------------------------------------------------- */
/*  useTask: satu tugas berdasarkan id (halaman detail)                       */
/* -------------------------------------------------------------------------- */

export function useTask(id: string | null | undefined) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!id) {
      setTask(null);
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const data = await getTaskById(id);
      if (requestId !== requestIdRef.current) return;
      setTask(data);
      setError(data ? null : "Tugas tidak ditemukan.");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
    return () => {
      requestIdRef.current++;
    };
  }, [refresh]);

  return { task, isLoading, error, refresh };
}

/* -------------------------------------------------------------------------- */
/*  useTaskStats: statistik semua tugas (terpisah dari daftar & filter)       */
/* -------------------------------------------------------------------------- */

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (options: { silent?: boolean } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!options.silent) setIsLoading(true);

    try {
      const data = await getTaskStats();
      if (requestId !== requestIdRef.current) return;
      setStats(data);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Muat ulang otomatis setiap kali ada tugas dibuat/diubah/dihapus di mana pun
    const unsubscribe = subscribeToTaskChanges(() => {
      refresh({ silent: true });
    });

    return () => {
      unsubscribe();
      requestIdRef.current++;
    };
  }, [refresh]);

  return { stats, isLoading, error, refresh };
}

/* -------------------------------------------------------------------------- */
/*  usePinnedTasks: tugas yang disematkan (terpisah dari daftar & filter)     */
/* -------------------------------------------------------------------------- */

export function usePinnedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (options: { silent?: boolean } = {}) => {
    const requestId = ++requestIdRef.current;
    if (!options.silent) setIsLoading(true);

    try {
      const data = await getPinnedTasks();
      if (requestId !== requestIdRef.current) return;
      setTasks(data);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Muat ulang otomatis saat tugas disematkan/diubah/dihapus di mana pun
    const unsubscribe = subscribeToTaskChanges(() => {
      refresh({ silent: true });
    });

    return () => {
      unsubscribe();
      requestIdRef.current++;
    };
  }, [refresh]);

  // Aksi melempar error; daftar dimuat ulang otomatis lewat langganan di atas
  const unpin = useCallback((id: string) => setTaskPinnedService(id, false), []);

  const toggleComplete = useCallback(
    (id: string, isCompleted: boolean) => toggleCompleteService(id, isCompleted),
    []
  );

  return { tasks, isLoading, error, refresh, unpin, toggleComplete };
}
