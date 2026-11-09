"use client";

import TaskStats from "@/components/tasks/TaskStats";
import { useTaskStats } from "@/hooks/use-task";

/**
 * Ringkasan tugas di luar komponen view.
 * Mengambil statistik sendiri dan otomatis diperbarui saat ada tugas
 * yang dibuat/diubah/dihapus dari komponen mana pun.
 */
export default function TaskSummary() {
  const { stats, isLoading, error } = useTaskStats();

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-500 dark:text-rose-400"
        >
          {error}
        </div>
      )}

      <TaskStats stats={stats} isLoading={isLoading} />
    </div>
  );
}
