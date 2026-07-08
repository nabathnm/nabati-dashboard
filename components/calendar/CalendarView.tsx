"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { useUpdateTask, useCreateTask, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useAppSelector } from "@/redux/hooks";
import { TaskCategory } from "@/types/task";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import CalendarGrid from "./CalendarGrid";
import AddTaskDialog from "./AddTaskDialog";


export default function CalendarView() {
  const { tasks } = useAppSelector((state) => state.tasks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory | "">("");

  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const createTask = useCreateTask();

  const handleDateClick = (date: Date) => {
    setSelectedDateForAdd(date);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskCategory("");
    setIsAddDialogOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedDateForAdd || !newTaskCategory) return;
    createTask.mutate(
      {
        title: newTaskTitle,
        description: newTaskDescription,
        category: newTaskCategory as TaskCategory,
        due_date: format(selectedDateForAdd, "yyyy-MM-dd"),
      },
      {
        onSuccess: () => setIsAddDialogOpen(false),
      }
    );
  };

  const handleTaskDateChange = (taskId: string, newDate: string) => {
    updateTask.mutate({ id: taskId, data: { due_date: newDate } });
  };

  const handleTaskStatusChange = (taskId: string, status: "todo" | "done") => {
    updateTaskStatus.mutate({ id: taskId, status });
  };

  const handleTaskDescriptionChange = (taskId: string, description: string) => {
    updateTask.mutate({ id: taskId, data: { description } });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Calendar — ${format(currentMonth, "MMMM yyyy")}`}
        description="View your tasks and deadlines across the month"
      >
        <div className="flex items-center gap-2">
          <Button onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon"
              onClick={prevMonth}
              title="Previous Month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-11 w-11"
              onClick={nextMonth}
              title="Next Month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </PageHeader>

      <CalendarGrid
        currentMonth={currentMonth}
        tasks={tasks}
        onDateClick={handleDateClick}
        onTaskDateChange={handleTaskDateChange}
        onTaskStatusChange={handleTaskStatusChange}
        onTaskDescriptionChange={handleTaskDescriptionChange}
      />

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        selectedDate={selectedDateForAdd}
        title={newTaskTitle}
        onTitleChange={setNewTaskTitle}
        description={newTaskDescription}
        onDescriptionChange={setNewTaskDescription}
        category={newTaskCategory}
        onCategoryChange={setNewTaskCategory}
        onSubmit={handleAddTask}
        isSubmitting={createTask.isPending}
      />
    </div>
  );
}