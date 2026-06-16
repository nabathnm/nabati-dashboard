import { createClient } from "@/lib/supabase/client";
import type {
  RoutineUserProfile,
  UpsertRoutineProfileDTO,
} from "@/types/routine";

const supabase = createClient();

export const routineProfileService = {
  /**
   * Fetch the current user's routine profile.
   */
  async get(): Promise<RoutineUserProfile | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("routine_user_profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  /**
   * Create or update the user's routine profile.
   */
  async upsert(
    dto: UpsertRoutineProfileDTO
  ): Promise<RoutineUserProfile> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("routine_user_profiles")
      .upsert(
        {
          user_id: userData.user.id,
          goals: dto.goals,
          college_schedule: dto.college_schedule ?? null,
          sleep_start: dto.sleep_start ?? "23:00",
          sleep_end: dto.sleep_end ?? "06:00",
          organization_schedule: dto.organization_schedule ?? null,
          energy_preference: dto.energy_preference ?? "morning",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
