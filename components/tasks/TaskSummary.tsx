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
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <TaskStats stats={stats} isLoading={isLoading} />
    </div>
  );
}
