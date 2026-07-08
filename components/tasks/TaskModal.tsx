"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ListTodo, FileText, Tag, CalendarDays, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/lib/schemas/task";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import type { Task, TaskCategory } from "@/types/task";
import { format } from "date-fns";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

const categoryOptions: {
  value: TaskCategory;
  label: string;
  activeClass: string;
  dotColor: string;
}[] = [
    {
      value: "Kuliah",
      label: "Kuliah",
      activeClass: "bg-blue-50 border-blue-300 text-blue-600",
      dotColor: "bg-blue-400",
    },
    {
      value: "Organisasi",
      label: "Organisasi",
      activeClass: "bg-amber-50 border-amber-300 text-amber-600",
      dotColor: "bg-amber-400",
    },
    {
      value: "Praktikum",
      label: "Praktikum",
      activeClass: "bg-rose-50 border-rose-300 text-rose-600",
      dotColor: "bg-rose-400",
    },
    {
      value: "Lainnya",
      label: "Lainnya",
      activeClass: "bg-purple-50 border-purple-300 text-purple-600",
      dotColor: "bg-purple-400",
    },
  ];

export default function TaskModal({ open, onOpenChange, task }: TaskModalProps) {
  const isEditing = !!task;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "Lainnya",
      progress: 0,
      due_date: "",
    },
  });

  const watchCategory = watch("category");
  const watchProgress = watch("progress");

  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title,
        description: task.description || "",
        category: task.category,
        progress: task.progress,
        due_date: task.due_date
          ? format(new Date(task.due_date), "yyyy-MM-dd")
          : "",
      });
    } else if (!task && open) {
      reset({ title: "", description: "", category: "Lainnya", progress: 0, due_date: "" });
    }
  }, [task, open, reset]);

  const onSubmit = useCallback(
    async (values: CreateTaskFormValues) => {
      const payload = {
        ...values,
        due_date: values.due_date || null,
        description: values.description || "",
      };
      if (isEditing && task) {
        await updateMutation.mutateAsync({ id: task.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    },
    [isEditing, task, createMutation, updateMutation, onOpenChange]
  );

  const handleDelete = useCallback(async () => {
    if (task) {
      await deleteMutation.mutateAsync(task.id);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    }
  }, [task, deleteMutation, onOpenChange]);

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const progressValue = Number(watchProgress) || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              <ListTodo className="h-3.5 w-3.5" />
              {isEditing ? "Edit Task" : "New Task"}
            </div>
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "Update Activity" : "Add Activity"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" /> Title
              </Label>
              <Input
                placeholder="What needs to be done?"
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Detail
              </Label>
              <Textarea
                placeholder="Add details, notes, or context..."
                rows={3}
                className="min-h-[90px] resize-none rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                {...register("description")}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select value={watchCategory} onValueChange={(val) => setValue("category", val as TaskCategory)}>
                <SelectTrigger className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Progress</span>
                  <span className={`font-bold ${progressValue >= 100
                    ? "text-emerald-500"
                    : progressValue >= 60
                      ? "text-blue-500"
                      : "text-slate-500"
                    }`}>
                    {progressValue}%
                  </span>
                </Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    {...register("progress", { valueAsNumber: true })}
                  />
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressValue >= 100
                        ? "bg-emerald-400"
                        : progressValue >= 60
                          ? "bg-blue-400"
                          : "bg-amber-400"
                        }`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Deadline
                </Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 text-sm"
                  {...register("due_date")}
                />
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="flex-row justify-between sm:justify-between gap-2 px-6 pb-6 pt-4 border-t border-border/50 bg-muted/10">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-rose-400 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
              <div className={`flex gap-2 ${!isEditing ? "ml-auto" : ""}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-background">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
            <AlertDialogTitle className="text-xl font-bold">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{task?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/10">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}