import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export const analyticsKeys = {
  summary: (year: number, month: number) =>
    ["analytics", "summary", year, month] as const,
  categorySpending: (year: number, month: number) =>
    ["analytics", "categorySpending", year, month] as const,
  monthlyTrend: (year: number) => ["analytics", "monthlyTrend", year] as const,
};

export function useMonthlyFinancialSummary(year: number, month: number) {
  return useQuery({
    queryKey: analyticsKeys.summary(year, month),
    queryFn: () => analyticsService.getMonthlyFinancialSummary(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useCategorySpending(year: number, month: number) {
  return useQuery({
    queryKey: analyticsKeys.categorySpending(year, month),
    queryFn: () => analyticsService.getSpendingByCategory(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: analyticsKeys.monthlyTrend(year),
    queryFn: () => analyticsService.getMonthlyTrend(year),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
