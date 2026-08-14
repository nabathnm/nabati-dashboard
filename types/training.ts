export type TargetMuscle = "Chest" | "Back" | "Biceps" | "Triceps" | "Shoulders" | "Legs" | "Core" | "Forearms" | "Calves";

export interface TrainingLog {
  id: string;
  user_id: string;
  exercise_name: string;
  target_muscles: TargetMuscle[];
  sets: number;
  reps: number;
  activity_date: string;
  created_at: string;
}

export type CreateTrainingInput = Omit<TrainingLog, "id" | "user_id" | "created_at">;
export type UpdateTrainingInput = Partial<CreateTrainingInput> & { id: string };

export interface TrainingFilters {
  startDate?: string;
  endDate?: string;
  exercise_name?: string;
}
