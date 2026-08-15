import { format, isSameMonth, isSameDay, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { TrainingLog } from "@/types/training";
import { Dumbbell } from "lucide-react";
import { GenericCalendarGrid } from "@/components/ui/generic-calendar-grid";

interface TrainingCalendarGridProps {
  currentDate: Date;
  trainings: TrainingLog[];
  onDateClick: (date: Date) => void;
  onTrainingClick: (training: TrainingLog) => void;
}

export default function TrainingCalendarGrid({ currentDate, trainings, onDateClick, onTrainingClick }: TrainingCalendarGridProps) {
  const getTrainingsForDay = (date: Date) => {
    return trainings.filter(t => t.activity_date === format(date, "yyyy-MM-dd"));
  };

  const renderDay = (day: Date) => {
    const dayTrainings = getTrainingsForDay(day);

    return (
      <div
        onClick={() => onDateClick(day)}
        className={cn(
          "min-h-[120px] p-2 border-r border-b border-border/50 relative cursor-pointer hover:bg-muted/50 transition-colors h-full",
          !isSameMonth(day, startOfMonth(currentDate)) ? "bg-muted/10 text-muted-foreground/50" : "bg-background",
          isSameDay(day, new Date()) && "bg-blue-50/50"
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm font-medium",
            isSameDay(day, new Date()) ? "h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center" : ""
          )}>
            {format(day, "d")}
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          {dayTrainings.map((training) => (
            <div
              key={training.id}
              onClick={(e) => {
                e.stopPropagation();
                onTrainingClick(training);
              }}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md border flex items-center gap-1.5 font-medium truncate bg-slate-100 text-slate-700 border-slate-200"
              )}
            >
              <Dumbbell className="w-3 h-3 shrink-0" />
              <span className="truncate">{training.exercise_name}</span>
              <span className="ml-auto shrink-0 opacity-70 text-[10px] bg-white px-1 rounded shadow-sm border">
                {training.sets}x{training.reps}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <GenericCalendarGrid
      currentMonth={currentDate}
      renderDay={renderDay}
      weekStartsOn={1}
    />
  );
}
