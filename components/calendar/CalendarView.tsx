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
          <Button variant="outline" size="sm" onClick={goToToday} className="h-9">
            Today
          </Button>
          <div className="flex items-center rounded-lg border border-input bg-transparent overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-r border-input"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
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