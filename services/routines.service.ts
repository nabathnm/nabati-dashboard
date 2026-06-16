import { createClient } from "@/lib/supabase/client";
import type {
  DailyRoutine,
  CreateRoutineDTO,
  RoutineStats,
  RoutineWeeklyStats,
} from "@/types/routine";

const supabase = createClient();

export const routinesService = {
  /**
   * Fetch all routines for a specific date.
   */
  async getByDate(date: string): Promise<DailyRoutine[]> {
    const { data, error } = await supabase
      .from("daily_routines")
      .select("*")
      .eq("routine_date", date)
      .order("scheduled_time", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Toggle a routine item's completion status.
   */
  async toggleComplete(
    id: string,
    completed: boolean
  ): Promise<DailyRoutine> {
    const { data, error } = await supabase
      .from("daily_routines")
      .update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a single custom routine item.
   */
  async create(dto: CreateRoutineDTO): Promise<DailyRoutine> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("daily_routines")
      .insert({
        ...dto,
        user_id: userData.user?.id,
        ai_generated: dto.ai_generated ?? false,
        priority: dto.priority ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Bulk insert AI-generated routine items for a day.
   */
  async bulkInsert(
    items: CreateRoutineDTO[]
  ): Promise<DailyRoutine[]> {
    const { data: userData } = await supabase.auth.getUser();

    const rows = items.map((item) => ({
      ...item,
      user_id: userData.user?.id,
      ai_generated: item.ai_generated ?? true,
      priority: item.priority ?? 0,
    }));

    const { data, error } = await supabase
      .from("daily_routines")
      .insert(rows)
      .select();

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Delete a routine item.
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("daily_routines")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Delete all routines for a specific date (used before regeneration).
   */
  async deleteByDate(date: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("daily_routines")
      .delete()
      .eq("user_id", userData.user?.id)
      .eq("routine_date", date);

    if (error) throw error;
  },

  /**
   * Get completion stats for a date range.
   */
  async getCompletionStats(
    startDate: string,
    endDate: string
  ): Promise<RoutineWeeklyStats[]> {
    const { data, error } = await supabase
      .from("daily_routines")
      .select("routine_date, is_completed")
      .gte("routine_date", startDate)
      .lte("routine_date", endDate)
      .order("routine_date", { ascending: true });

    if (error) throw error;

    // Aggregate by date
    const dateMap = new Map<
      string,
      { total: number; completed: number }
    >();

    (data ?? []).forEach((r) => {
      const existing = dateMap.get(r.routine_date) || {
        total: 0,
        completed: 0,
      };
      existing.total += 1;
      if (r.is_completed) existing.completed += 1;
      dateMap.set(r.routine_date, existing);
    });

    return Array.from(dateMap.entries()).map(
      ([date, stats]) => ({
        date,
        total: stats.total,
        completed: stats.completed,
        completionRate:
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0,
      })
    );
  },

  /**
   * Get completion stats for today only.
   */
  async getTodayStats(): Promise<RoutineStats> {
    const today = new Date().toISOString().split("T")[0];
    const routines = await this.getByDate(today);

    const total = routines.length;
    const completed = routines.filter((r) => r.is_completed).length;

    return {
      total,
      completed,
      completionRate:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
};
