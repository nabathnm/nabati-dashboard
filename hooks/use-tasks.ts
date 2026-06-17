import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks.service";
import { gamificationService } from "@/services/gamification.service";
import { gamificationKeys } from "@/hooks/use-gamification";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStatus,
  ReorderTaskInput,
} from "@/types/task";
import { toast } from "sonner";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
  stats: () => ["tasks", "stats"] as const,
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksService.getAll(filters),
    staleTime: 1000 * 60 * 1, // 1 minute cache
  });
}


export function useTaskById(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      tasksService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot previous data
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

      // Optimistically update any matching queries
      queryClient.setQueriesData(
        { queryKey: taskKeys.all },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === id ? { ...task, ...data } : task
          );
        }
      );

      return { previousTasks };
    },
    onError: (error: Error, _vars, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || "Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onSuccess: () => {
      toast.success("Task updated successfully");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

      // Optimistically update status
      queryClient.setQueriesData(
        { queryKey: taskKeys.all },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === id ? { ...task, status } : task
          );
        }
      );

      return { previousTasks };
    },
    onError: (_error: Error, _vars, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update task status");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });

      // Award XP when task is marked as done
      if (variables.status === "done") {
        gamificationService.addXP(15).then((result) => {
          queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
          if (result.leveledUp) {
            toast.success(`🎉 Level Up! Anda sekarang Level ${result.newLevel}!`, {
              description: `+15 XP dari menyelesaikan task`,
              duration: 5000,
            });
          } else {
            toast(`⚡ +15 XP`, { description: "Task selesai!", duration: 2000 });
          }
        }).catch(console.error);
      }
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ReorderTaskInput[]) => tasksService.reorder(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.all });

      // Optimistically update positions
      queryClient.setQueriesData(
        { queryKey: taskKeys.all },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map((task) => {
            const update = updates.find((u) => u.id === task.id);
            return update
              ? { ...task, status: update.status, position: update.position }
              : task;
          });
        }
      );

      return { previousTasks };
    },
    onError: (_error: Error, _vars, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to reorder tasks");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
