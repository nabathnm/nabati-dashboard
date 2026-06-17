import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamificationService } from "@/services/gamification.service";
import type { AddXPResult } from "@/types/database";
import { toast } from "sonner";

// ─── Query Keys ──────────────────────────────────────────────

export const gamificationKeys = {
  all: ["gamification"] as const,
  profile: ["gamification", "profile"] as const,
  badges: ["gamification", "badges"] as const,
  synergy: ["gamification", "synergy"] as const,
};

// ─── Queries ─────────────────────────────────────────────────

export function useGamificationProfile() {
  return useQuery({
    queryKey: gamificationKeys.profile,
    queryFn: () => gamificationService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: gamificationKeys.badges,
    queryFn: () => gamificationService.getAllBadges(),
    staleTime: 1000 * 60 * 30, // 30 minutes cache (badges rarely change)
  });
}

export function useWeeklySynergy() {
  return useQuery({
    queryKey: gamificationKeys.synergy,
    queryFn: () => gamificationService.getWeeklySynergyData(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// ─── Mutations ───────────────────────────────────────────────

export function useAddXP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => gamificationService.addXP(amount),
    onSuccess: (result: AddXPResult) => {
      // Invalidate gamification queries
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });

      // Show level-up toast if applicable
      if (result.leveledUp) {
        toast.success(`🎉 Level Up! Anda sekarang Level ${result.newLevel}!`, {
          description: `Total XP: ${result.newXP}`,
          duration: 5000,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to add XP:", error.message);
    },
  });
}
