import { createClient } from "@/lib/supabase/client";
import type { TrainingLog, CreateTrainingInput, UpdateTrainingInput, TrainingFilters } from "@/types/training";

export const trainingService = {
  async getTrainings(filters?: TrainingFilters): Promise<TrainingLog[]> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    let query = supabase
      .from("trainings")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("activity_date", { ascending: true });

    if (filters?.startDate) {
      query = query.gte("activity_date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("activity_date", filters.endDate);
    }
    if (filters?.exercise_name) {
      query = query.eq("exercise_name", filters.exercise_name);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTraining(input: CreateTrainingInput): Promise<TrainingLog> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("trainings")
      .insert([{ ...input, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTraining({ id, ...input }: UpdateTrainingInput): Promise<TrainingLog> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("trainings")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTraining(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) throw error;
  },
};
