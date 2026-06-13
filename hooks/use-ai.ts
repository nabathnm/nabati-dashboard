import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiEvaluationService } from "@/services/ai-evaluation.service";
import { toast } from "sonner";

export const aiKeys = {
  all: ["ai-evaluations"] as const,
  latest: (year: number, month: number) => ["ai-evaluations", "latest", year, month] as const,
};

export function useAIEvaluation(year: number, month: number) {
  return useQuery({
    queryKey: aiKeys.latest(year, month),
    queryFn: () => aiEvaluationService.getLatest(year, month),
  });
}

export function useGenerateAIEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      aiEvaluationService.generate(year, month),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.latest(variables.year, variables.month),
      });
      toast.success("AI Evaluation updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate AI evaluation");
    },
  });
}
