import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routinesService } from "@/services/routines.service";
import { routineProfileService } from "@/services/routine-profile.service";
import type {
  CreateRoutineDTO,
  UpsertRoutineProfileDTO,
  AIRoutineItem,
} from "@/types/routine";
import { toast } from "sonner";

// ─── Query Keys ──────────────────────────────────────────────

export const routineKeys = {
  all: ["routines"] as const,
  byDate: (date: string) => ["routines", "date", date] as const,
  stats: (start: string, end: string) =>
    ["routines", "stats", start, end] as const,
  todayStats: ["routines", "todayStats"] as const,
  profile: ["routine-profile"] as const,
};

// ─── Routine Queries ─────────────────────────────────────────

export function useRoutinesByDate(date: string) {
  return useQuery({
    queryKey: routineKeys.byDate(date),
    queryFn: () => routinesService.getByDate(date),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useRoutineStats(startDate: string, endDate: string) {
  return useQuery({
    queryKey: routineKeys.stats(startDate, endDate),
    queryFn: () => routinesService.getCompletionStats(startDate, endDate),
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}

export function useTodayRoutineStats() {
  return useQuery({
    queryKey: routineKeys.todayStats,
    queryFn: () => routinesService.getTodayStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// ─── Routine Mutations ───────────────────────────────────────

export function useToggleRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => routinesService.toggleComplete(id, completed),
    onMutate: async ({ id, completed }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: routineKeys.all });

      const previousData = queryClient.getQueriesData({
        queryKey: routineKeys.all,
      });

      queryClient.setQueriesData(
        { queryKey: routineKeys.all },
        (old: any) => {
          if (!Array.isArray(old)) return old;
          return old.map((r: any) =>
            r.id === id
              ? {
                ...r,
                is_completed: completed,
                completed_at: completed
                  ? new Date().toISOString()
                  : null,
              }
              : r
          );
        }
      );

      return { previousData };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update routine");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({
        queryKey: routineKeys.todayStats,
      });

    },
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoutineDTO) => routinesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({
        queryKey: routineKeys.todayStats,
      });
      toast.success("Routine item added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add routine");
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routinesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({
        queryKey: routineKeys.todayStats,
      });
      toast.success("Routine item removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete routine");
    },
  });
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      profile,
      existingTasks,
      previousCompletionRate,
    }: {
      date: string;
      profile: any;
      existingTasks: any[];
      previousCompletionRate: number;
    }) => {
      // 1. Hapus data yang sudah ada di database terlebih dahulu
      await routinesService.deleteByDate(date);

      // Update UI seketika agar terlihat kosong
      queryClient.setQueryData(routineKeys.byDate(date), []);

      // 2. Panggil API AI untuk membuat routine baru
      const res = await fetch("/api/routine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          profile,
          existingTasks,
          previousCompletionRate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || "Failed to generate routine from AI"
        );
      }

      const { routines } = (await res.json()) as {
        routines: AIRoutineItem[];
      };

      // 3. Masukkan data baru secara massal
      const items: CreateRoutineDTO[] = routines.map((r) => ({
        title: r.title,
        description: r.description,
        category: r.category,
        scheduled_time: r.scheduled_time,
        estimated_duration: r.estimated_duration,
        routine_date: date,
        ai_generated: true,
        priority: r.priority,
      }));

      return routinesService.bulkInsert(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.invalidateQueries({
        queryKey: routineKeys.todayStats,
      });
      toast.success("Daily routine generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate routine");
    },
  });
}

// ─── Profile Queries ─────────────────────────────────────────

export function useRoutineProfile() {
  return useQuery({
    queryKey: routineKeys.profile,
    queryFn: () => routineProfileService.get(),
  });
}

export function useUpsertRoutineProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertRoutineProfileDTO) =>
      routineProfileService.upsert(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routineKeys.profile,
      });
      toast.success("Profile saved successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save profile");
    },
  });
}
