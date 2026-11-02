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
  syncTaskToGoogleCalendar as syncTaskGcalService,
  syncAllTasksToGoogleCalendar as syncAllTasksGcalService,
  removeTaskFromGoogleCalendar as removeTaskGcalService,
} from "@/lib/services/task-service";
import type {
  CreateTaskInput,
  GoogleCalendarSyncResult,
  GoogleCalendarSyncSummary,
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
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Untuk mengabaikan respons lama (race condition) dan update setelah unmount
  const requestIdRef = useRef(0);

  // Key string agar objek filter baru dengan isi sama tidak memicu fetch ulang
  const filtersKey = JSON.stringify(filters);

  const fetchData = useCallback(async (currentFilters: TaskFilters, reqId: number) => {
    try {
      const list = await getTasks(currentFilters);
      if (reqId !== requestIdRef.current) return;
      setTasks(list);
      setError(null);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (reqId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const currentFilters: TaskFilters = JSON.parse(filtersKey);
      const requestId = ++requestIdRef.current;
      if (!options.silent) setIsLoading(true);
      return fetchData(currentFilters, requestId);
    },
    [fetchData, filtersKey]
  );

  useEffect(() => {
    const currentFilters: TaskFilters = JSON.parse(filtersKey);
    const reqIdRef = requestIdRef;
    const requestId = ++reqIdRef.current;
    void fetchData(currentFilters, requestId);

    return () => {
      reqIdRef.current++;
    };
  }, [fetchData, filtersKey]);

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

  const syncTaskToCalendar = useCallback(
    async (task: Task): Promise<GoogleCalendarSyncResult> => {
      setIsSyncingCalendar(true);
      try {
        const result = await syncTaskGcalService(task);
        await refresh({ silent: true });
        return result;
      } finally {
        setIsSyncingCalendar(false);
      }
    },
    [refresh]
  );

  const syncAllToCalendar = useCallback(async (): Promise<GoogleCalendarSyncSummary> => {
    setIsSyncingCalendar(true);
    try {
      const summary = await syncAllTasksGcalService();
      await refresh({ silent: true });
      return summary;
    } finally {
      setIsSyncingCalendar(false);
    }
  }, [refresh]);

  const removeFromCalendar = useCallback(
    async (eventId: string): Promise<GoogleCalendarSyncResult> => {
      return removeTaskGcalService(eventId);
    },
    []
  );

  return {
    // data
    tasks,
    // status
    isLoading,
    isMutating,
    isSyncingCalendar,
    error,
    // aksi (melempar error agar bisa ditangkap form/toast di komponen)
    refresh,
    createTask,
    updateTask,
    updateProgress,
    toggleComplete,
    setPinned,
    deleteTask,
    // Google Calendar
    syncTaskToCalendar,
    syncAllToCalendar,
    removeFromCalendar,
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

  const fetchTask = useCallback(
    async (taskId: string | null | undefined, reqId: number) => {
      if (!taskId) {
        setTask(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getTaskById(taskId);
        if (reqId !== requestIdRef.current) return;
        setTask(data);
        setError(data ? null : "Tugas tidak ditemukan.");
      } catch (err) {
        if (reqId !== requestIdRef.current) return;
        setError(getErrorMessage(err));
      } finally {
        if (reqId === requestIdRef.current) setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    if (id) setIsLoading(true);
    return fetchTask(id, reqId);
  }, [fetchTask, id]);

  useEffect(() => {
    const reqIdRef = requestIdRef;
    const reqId = ++reqIdRef.current;
    void fetchTask(id, reqId);
    return () => {
      reqIdRef.current++;
    };
  }, [fetchTask, id]);

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

  const fetchStats = useCallback(async (reqId: number) => {
    try {
      const data = await getTaskStats();
      if (reqId !== requestIdRef.current) return;
      setStats(data);
      setError(null);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (reqId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const reqId = ++requestIdRef.current;
      if (!options.silent) setIsLoading(true);
      return fetchStats(reqId);
    },
    [fetchStats]
  );

  useEffect(() => {
    const reqIdRef = requestIdRef;
    const reqId = ++reqIdRef.current;
    void fetchStats(reqId);

    // Muat ulang otomatis setiap kali ada tugas dibuat/diubah/dihapus di mana pun
    const unsubscribe = subscribeToTaskChanges(() => {
      const subReqId = ++reqIdRef.current;
      void fetchStats(subReqId);
    });

    return () => {
      unsubscribe();
      reqIdRef.current++;
    };
  }, [fetchStats]);

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

  const fetchPinned = useCallback(async (reqId: number) => {
    try {
      const data = await getPinnedTasks();
      if (reqId !== requestIdRef.current) return;
      setTasks(data);
      setError(null);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (reqId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const reqId = ++requestIdRef.current;
      if (!options.silent) setIsLoading(true);
      return fetchPinned(reqId);
    },
    [fetchPinned]
  );

  useEffect(() => {
    const reqIdRef = requestIdRef;
    const reqId = ++reqIdRef.current;
    void fetchPinned(reqId);

    // Muat ulang otomatis saat tugas disematkan/diubah/dihapus di mana pun
    const unsubscribe = subscribeToTaskChanges(() => {
      const subReqId = ++reqIdRef.current;
      void fetchPinned(subReqId);
    });

    return () => {
      unsubscribe();
      reqIdRef.current++;
    };
  }, [fetchPinned]);

  // Aksi melempar error; daftar dimuat ulang otomatis lewat langganan di atas
  const unpin = useCallback((id: string) => setTaskPinnedService(id, false), []);

  const toggleComplete = useCallback(
    (id: string, isCompleted: boolean) => toggleCompleteService(id, isCompleted),
    []
  );

  return { tasks, isLoading, error, refresh, unpin, toggleComplete };
}

/* -------------------------------------------------------------------------- */
/*  useGoogleCalendarSync: sinkronisasi tugas khusus dengan Google Calendar   */
/* -------------------------------------------------------------------------- */

export function useGoogleCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncTask = useCallback(async (task: Task): Promise<GoogleCalendarSyncResult> => {
    setIsSyncing(true);
    try {
      const result = await syncTaskGcalService(task);
      if (!result.success && result.error) {
        setError(result.error);
      } else {
        setError(null);
      }
      setLastSynced(new Date().toISOString());
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncAll = useCallback(async (): Promise<GoogleCalendarSyncSummary> => {
    setIsSyncing(true);
    try {
      const summary = await syncAllTasksGcalService();
      setLastSynced(new Date().toISOString());
      if (summary.errors.length > 0) {
        setError(summary.errors[0]);
      } else {
        setError(null);
      }
      return summary;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const removeEvent = useCallback(
    async (eventId: string): Promise<GoogleCalendarSyncResult> => {
      return removeTaskGcalService(eventId);
    },
    []
  );

  return {
    isSyncing,
    lastSynced,
    error,
    syncTask,
    syncAll,
    removeEvent,
  };
}
