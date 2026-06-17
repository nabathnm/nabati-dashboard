import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { githubService } from "@/services/github.service";
import { aiGithubService } from "@/services/ai-github.service";
import { toast } from "sonner";

export const githubKeys = {
  all: ["github"] as const,
  credentials: ["github", "credentials"] as const,
  profile: (username: string) => ["github", "profile", username] as const,
  stats: (username: string) => ["github", "stats", username] as const,
  evaluation: (username: string) => ["github", "evaluation", username] as const,
};

export function useGithubCredentials() {
  return useQuery({
    queryKey: githubKeys.credentials,
    queryFn: () => githubService.getCredentials(),
  });
}

export function useGithubProfile(username?: string, token?: string | null) {
  return useQuery({
    queryKey: githubKeys.profile(username || ""),
    queryFn: () => githubService.fetchUserProfile(username!, token),
    enabled: !!username,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useGithubStats(username?: string, token?: string | null) {
  return useQuery({
    queryKey: githubKeys.stats(username || ""),
    queryFn: () => githubService.getAggregatedStats(username!, token),
    enabled: !!username,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useGithubEvaluation(username?: string) {
  return useQuery({
    queryKey: githubKeys.evaluation(username || ""),
    queryFn: () => aiGithubService.getLatest(),
    enabled: !!username,
  });
}

export function useConnectGithub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, token }: { username: string; token?: string }) => {
      // Test fetch
      const testProfile = await githubService.fetchUserProfile(username, token || null);
      if (!testProfile || !testProfile.login) throw new Error("Invalid Username or Token");
      
      return githubService.connectGithub(username, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
    },
  });
}

export function useDisconnectGithub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => githubService.disconnectGithub(),
    onSuccess: () => {
      // Clear all github related cache
      queryClient.removeQueries({ queryKey: githubKeys.all });
    },
  });
}

export function useGenerateGithubEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, token }: { username: string; token?: string | null }) => 
      aiGithubService.generateAndSave(username, token),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(githubKeys.evaluation(variables.username), data);
      toast.success("AI Report generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate AI Report");
    }
  });
}
