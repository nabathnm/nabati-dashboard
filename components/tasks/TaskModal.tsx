"use client";

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
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_CATEGORY_OPTIONS } from "@/constants/tasks/task-category";
import { getErrorMessage } from "@/hooks/use-task";
import { createTask, deleteTask, updateTask } from "@/lib/services/task-service";
import type { CreateTaskInput, Task, TaskCategory } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, FileText, ListTodo, Tag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  description: z.string(),
  category: z.enum(["Kuliah", "Organisasi", "Praktikum", "Personal", "Lainnya"]),
  due_date: z.string(), // format yyyy-MM-dd dari <input type="date">
});

type TaskFormValues = z.infer<typeof taskSchema>;

const EMPTY_VALUES: TaskFormValues = {
  title: "",
  description: "",
  category: "Kuliah",
  due_date: "",
};

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  /** Tanggal awal (yyyy-MM-dd) untuk tugas baru, mis. saat sel kalender diklik */
  defaultDueDate?: string | null;
  /** Dipanggil setelah tugas berhasil dibuat/diubah/dihapus, mis. () => refresh({ silent: true }) */
  onSuccess?: () => void | Promise<void>;
}

export default function TaskModal({
  open,
  onOpenChange,
  task,
  defaultDueDate,
  onSuccess,
}: TaskModalProps) {
  const isEditing = !!task;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as Resolver<TaskFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  const watchCategory = watch("category");

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);

    if (task) {
      reset({
        title: task.title,
        description:
          task.description?.replace(/\n*<!--gcal:[^>]+-->/g, "").trim() || "",
        category: task.category,
        due_date: task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "",
      });
    } else {
      reset({ ...EMPTY_VALUES, due_date: defaultDueDate ?? "" });
    }
  }, [task, open, defaultDueDate, reset]);

  const onSubmit = useCallback(
    async (values: TaskFormValues) => {
      setSubmitError(null);

      const payload: CreateTaskInput = {
        title: values.title,
        description: values.description,
        category: values.category,
        due_date: values.due_date || null,
        sync_to_calendar: true,
      };

      try {
        let savedTask: Task;
        if (isEditing && task) {
          savedTask = await updateTask(task.id, payload);
        } else {
          savedTask = await createTask(payload);
        }
        await onSuccess?.();
        onOpenChange(false);

        if (payload.due_date) {
          if (savedTask.google_event_id) {
            toast.success("Tugas berhasil disimpan & dipost ke Google Calendar!");
          } else if (savedTask._gcal_error) {
            toast.warning(
              `Tugas disimpan, tapi gagal sinkron ke kalender: ${savedTask._gcal_error}`
            );
          } else {
            toast.info(
              "Tugas disimpan di Nabatu. Untuk memposting ke Google Calendar, pastikan akun Google sudah terhubung di Pengaturan."
            );
          }
        } else {
          toast.success(
            isEditing ? "Tugas berhasil diperbarui!" : "Tugas baru berhasil dibuat!"
          );
        }
      } catch (err) {
        setSubmitError(getErrorMessage(err));
      }
    },
    [isEditing, task, onSuccess, onOpenChange]
  );

  const handleDelete = useCallback(async () => {
    if (!task) return;
    setIsDeleting(true);
    setSubmitError(null);

    try {
      await deleteTask(task.id);
      setDeleteDialogOpen(false);
      await onSuccess?.();
      onOpenChange(false);
      toast.success("Tugas berhasil dihapus.");
    } catch (err) {
      setDeleteDialogOpen(false);
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }, [task, onSuccess, onOpenChange]);

  const isPending = isSubmitting || isDeleting;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="text-xl font-bold">
              {isEditing ? "Update Activity" : "Add Activity"}
            </div>
          </DialogHeader>

          <DialogBody>
            <form onSubmit={handleSubmit(onSubmit)} className="gap-6 flex flex-col">
              {/* Title */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-medium text-primary">
                  <ListTodo className="h-4 w-4 text-foreground" />
                  Title
                </Label>

                <Input
                  placeholder="Apa yang perlu dikerjakan?"
                  className="h-11 rounded-xl bg-muted/30 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
                  {...register("title")}
                />

                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-medium text-primary">
                  <FileText className="h-4 w-4 text-foreground" />
                  Description
                </Label>

                <Textarea
                  placeholder="Tambahkan detail atau catatan tugas..."
                  rows={3}
                  className="min-h-24 resize-none rounded-xl bg-muted/30 h-11 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
                  {...register("description")}
                />
              </div>

              {/* Category & Due date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-medium text-primary">
                    <CalendarDays className="h-4 w-4 text-foreground" />
                    Date
                  </Label>

                  <Input
                    type="date"
                    className="h-11 rounded-xl bg-muted/30 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
                    {...register("due_date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-medium text-primary">
                    <Tag className="h-4 w-4 text-foreground" />
                    Category
                  </Label>

                  <Select
                    value={watchCategory}
                    onValueChange={value =>
                      setValue("category", value as TaskCategory, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>

                    <SelectContent>
                      {TASK_CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${option.dotColor}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Google Calendar Sync Indicator */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#88C0D0]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      Sinkronkan ke Google Calendar
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Event dibuat di Google Calendar saat tanggal tenggat diisi
                    </span>
                  </div>
                </div>
                <span className="rounded-full border border-[#A3BE8C]/30 bg-[#A3BE8C]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A3BE8C]">
                  Otomatis
                </span>
              </div>

              {/* Server error */}
              {submitError && (
                <p role="alert" className="text-sm text-destructive">
                  {submitError}
                </p>
              )}

              {/* Footer */}
              <DialogFooter>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus tugas
                  </Button>
                )}

                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => onOpenChange(false)}
                    className="rounded-full py-3 px-3 text-base"
                  >
                    Batal
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full py-3 px-3 text-base"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : isEditing
                        ? "Simpan perubahan"
                        : "Buat tugas"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-0 overflow-hidden bg-background">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
            <AlertDialogTitle className="text-xl font-bold">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Are you sure you want to delete &quot;{task?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/10">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={e => {
                e.preventDefault(); // tahan dialog tetap terbuka sampai proses hapus selesai
                handleDelete();
              }}
              className="bg-rose-500 hover:bg-rose-600 border-0"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
