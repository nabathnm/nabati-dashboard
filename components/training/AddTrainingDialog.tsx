import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useCreateTraining, useDeleteTraining } from "@/hooks/use-training";
import { TrainingLog, TargetMuscle } from "@/types/training";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";

const EXERCISE_MUSCLE_MAP: Record<string, TargetMuscle[]> = {
  "Bench Press": ["Chest", "Triceps", "Shoulders"],
  "Incline Bench Press": ["Chest", "Triceps", "Shoulders"],
  "Dumbbell Press": ["Chest", "Triceps", "Shoulders"],
  "Push Up": ["Chest", "Triceps", "Core"],
  "Chest Fly": ["Chest"],
  "Deadlift": ["Back", "Legs", "Core", "Forearms"],
  "Pull Up": ["Back", "Biceps", "Forearms"],
  "Lat Pulldown": ["Back", "Biceps"],
  "Barbell Row": ["Back", "Biceps", "Core"],
  "Seated Cable Row": ["Back", "Biceps"],
  "Squat": ["Legs", "Core"],
  "Leg Press": ["Legs"],
  "Leg Extension": ["Legs"],
  "Leg Curl": ["Legs"],
  "Calf Raise": ["Calves"],
  "Overhead Press": ["Shoulders", "Triceps", "Core"],
  "Lateral Raise": ["Shoulders"],
  "Front Raise": ["Shoulders"],
  "Face Pull": ["Shoulders", "Back"],
  "Bicep Curl": ["Biceps", "Forearms"],
  "Hammer Curl": ["Biceps", "Forearms"],
  "Concentration Curl": ["Biceps"],
  "Tricep Extension": ["Triceps"],
  "Tricep Pushdown": ["Triceps"],
  "Crunch": ["Core"],
  "Plank": ["Core", "Shoulders"],
  "Russian Twist": ["Core"],
  "Leg Raise": ["Core"]
};

const EXERCISES = Object.keys(EXERCISE_MUSCLE_MAP).sort();

const MUSCLES: TargetMuscle[] = [
  "Chest", "Back", "Biceps", "Triceps", "Shoulders", "Legs", "Core", "Forearms", "Calves"
];

interface AddTrainingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  existingTraining: TrainingLog | null;
}

export default function AddTrainingDialog({ isOpen, onOpenChange, selectedDate, existingTraining }: AddTrainingDialogProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [targetMuscles, setTargetMuscles] = useState<TargetMuscle[]>([]);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");

  const createTraining = useCreateTraining();
  const deleteTraining = useDeleteTraining();

  useEffect(() => {
    if (existingTraining) {
      setExerciseName(existingTraining.exercise_name);
      setTargetMuscles(existingTraining.target_muscles || []);
      setSets(existingTraining.sets.toString());
      setReps(existingTraining.reps.toString());
    } else {
      setExerciseName("");
      setTargetMuscles([]);
      setSets("3");
      setReps("10");
    }
  }, [existingTraining, isOpen]);

  const handleExerciseChange = (val: string) => {
    setExerciseName(val);
    if (EXERCISE_MUSCLE_MAP[val]) {
      setTargetMuscles(EXERCISE_MUSCLE_MAP[val]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !exerciseName || !sets || !reps) return;

    createTraining.mutate(
      {
        exercise_name: exerciseName,
        target_muscles: targetMuscles,
        activity_date: format(selectedDate, "yyyy-MM-dd"),
        sets: parseInt(sets, 10),
        reps: parseInt(reps, 10),
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  const handleDelete = () => {
    if (!existingTraining) return;
    deleteTraining.mutate(existingTraining.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const toggleMuscle = (muscle: TargetMuscle) => {
    setTargetMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {existingTraining ? "Training Details" : "Record Training"}
            {selectedDate && " on " + format(selectedDate, "MMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Exercise Name</Label>
            <Select value={exerciseName} onValueChange={handleExerciseChange} disabled={!!existingTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Select exercise..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {EXERCISES.map(ex => (
                  <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Target Muscles</Label>
            <div className="grid grid-cols-3 gap-3">
              {MUSCLES.map((muscle) => (
                <div key={muscle} className="flex items-center space-x-2">
                  <Checkbox 
                    id={"muscle-$muscle"} 
                    checked={targetMuscles.includes(muscle)}
                    onCheckedChange={() => toggleMuscle(muscle)}
                    disabled={!!existingTraining}
                  />
                  <label 
                    htmlFor={"muscle-$muscle"} 
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {muscle}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sets</Label>
              <Input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="3"
                required
                min="1"
                disabled={!!existingTraining}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Reps</Label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                required
                min="1"
                disabled={!!existingTraining}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            {!existingTraining ? (
              <Button type="submit" className="w-full" disabled={createTraining.isPending}>
                {createTraining.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Training"}
              </Button>
            ) : (
              <Button type="button" variant="destructive" className="w-full" onClick={handleDelete} disabled={deleteTraining.isPending}>
                {deleteTraining.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete Training
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
