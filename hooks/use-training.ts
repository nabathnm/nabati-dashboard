import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingService } from "@/services/training.service";
import type { TrainingFilters, CreateTrainingInput, UpdateTrainingInput } from "@/types/training";
import { toast } from "sonner";

export const trainingKeys = {
  all: ["trainings"] as const,
  list: (filters: TrainingFilters) => ["trainings", "list", filters] as const,
};

export function useTrainings(filters?: TrainingFilters) {
  return useQuery({
    queryKey: trainingKeys.list(filters || {}),
    queryFn: () => trainingService.getTrainings(filters),
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTrainingInput) => trainingService.createTraining(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      toast.success("Training log created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create training log");
      console.error(error);
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainingService.deleteTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      toast.success("Training log deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete training log");
      console.error(error);
    },
  });
}

