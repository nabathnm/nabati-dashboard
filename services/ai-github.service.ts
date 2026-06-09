import { createClient } from "@/lib/supabase/client";
import { githubService } from "./github.service";
import type { AIGithubEvaluation } from "@/types/database";

export const aiGithubService = {
  /**
   * Generates a new evaluation by calling the API and saves it to the database.
   */
  async generateAndSave(username: string, token?: string | null): Promise<AIGithubEvaluation> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Fetch fresh stats from GitHub
    const [userProfile, stats] = await Promise.all([
      githubService.fetchUserProfile(username, token),
      githubService.getAggregatedStats(username, token),
    ]);

    // Send to our Next.js API route to evaluate using Gemini
    const res = await fetch("/api/github/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userProfile, stats }),
    });

    if (!res.ok) {
      throw new Error("Failed to generate AI evaluation");
    }

    const evaluationData = await res.json();

    // Insert into Supabase
    const { data, error } = await supabase
      .from("ai_github_evaluations")
      .insert({
        user_id: userData.user.id,
        developer_score: evaluationData.developer_score,
        career_readiness: evaluationData.career_readiness,
        habit_analysis: evaluationData.habit_analysis,
        portfolio_review: evaluationData.portfolio_review,
        learning_insights: evaluationData.learning_insights,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Retrieves the latest stored evaluation
   */
  async getLatest(): Promise<AIGithubEvaluation | null> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from("ai_github_evaluations")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
};
