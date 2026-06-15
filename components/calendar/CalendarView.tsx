"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { useUpdateTask, useCreateTask, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useAppSelector } from "@/redux/hooks";
import { TaskCategory } from "@/types/task";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import AddTaskDialog from "./AddTaskDialog";


export default function CalendarView() {
  const { tasks } = useAppSelector((state) => state.tasks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>("kuliah");

  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const createTask = useCreateTask();

  const handleDateClick = (date: Date) => {
    setSelectedDateForAdd(date);
    setNewTaskTitle("");
    setNewTaskCategory("kuliah");
    setIsAddDialogOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedDateForAdd) return;
    createTask.mutate(
      {
        title: newTaskTitle,
        category: newTaskCategory,
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

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-4">
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onToday={goToToday}
      />

      <CalendarGrid
        currentMonth={currentMonth}
        tasks={tasks}
        onDateClick={handleDateClick}
        onTaskDateChange={handleTaskDateChange}
        onTaskStatusChange={handleTaskStatusChange}
      />

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        selectedDate={selectedDateForAdd}
        title={newTaskTitle}
        onTitleChange={setNewTaskTitle}
        category={newTaskCategory}
        onCategoryChange={setNewTaskCategory}
        onSubmit={handleAddTask}
        isSubmitting={createTask.isPending}
      />
    </div>
  );
}