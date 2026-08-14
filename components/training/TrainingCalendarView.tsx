import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useTrainings } from "@/hooks/use-training";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import TrainingCalendarGrid from "./TrainingCalendarGrid";
import AddTrainingDialog from "./AddTrainingDialog";
import { TrainingLog } from "@/types/training";

export default function TrainingCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingLog | null>(null);

  // Fetch trainings for the current month
  const { data: trainings = [], isLoading } = useTrainings({
    startDate: format(startOfMonth(currentDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(currentDate), "yyyy-MM-dd"),
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTraining(null);
    setIsDialogOpen(true);
  };

  const handleTrainingClick = (training: TrainingLog) => {
    setSelectedDate(new Date(training.activity_date));
    setSelectedTraining(training);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Training Tracker"
          description="Log and track your sports and workouts."
        />

        <div className="flex items-center gap-4 bg-background p-1.5 rounded-xl shadow-sm border border-border/50">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-32 text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-150 flex items-center justify-center border border-border/50 rounded-xl bg-muted/10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TrainingCalendarGrid
          currentDate={currentDate}
          trainings={trainings}
          onDateClick={handleDateClick}
          onTrainingClick={handleTrainingClick}
        />
      )}

      <AddTrainingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
        existingTraining={selectedTraining}
      />
    </div>
  );
}
