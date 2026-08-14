import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { TrainingLog } from "@/types/training";
import { Dumbbell } from "lucide-react";

interface TrainingCalendarGridProps {
  currentDate: Date;
  trainings: TrainingLog[];
  onDateClick: (date: Date) => void;
  onTrainingClick: (training: TrainingLog) => void;
}

export default function TrainingCalendarGrid({ currentDate, trainings, onDateClick, onTrainingClick }: TrainingCalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const getTrainingsForDay = (date: Date) => {
    return trainings.filter(t => t.activity_date === format(date, "yyyy-MM-dd"));
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dayTrainings = getTrainingsForDay(day);

      days.push(
        <div
          key={day.toString()}
          onClick={() => onDateClick(cloneDay)}
          className={cn(
            "min-h-[120px] p-2 border-r border-b border-border/50 relative cursor-pointer hover:bg-muted/50 transition-colors",
            !isSameMonth(day, monthStart) ? "bg-muted/10 text-muted-foreground/50" : "bg-background",
            isSameDay(day, new Date()) && "bg-blue-50/50"
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm font-medium",
              isSameDay(day, new Date()) ? "h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center" : ""
            )}>
              {formattedDate}
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
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-background shadow-sm">
      <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground border-r border-border/50 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="flex flex-col">{rows}</div>
    </div>
  );
}
