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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";
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
        <DialogContent className="sm:max-w-xl border border-border/80 bg-card shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="bg-card text-white border-b border-border/60 px-6 py-5 pr-14 shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10 shadow-sm">
                <ListTodo className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {isEditing ? "Ubah Tugas" : "Tambah Tugas Baru"}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  {isEditing
                    ? "Perbarui rincian, tenggat waktu, atau kategori tugas ini."
                    : "Atur agenda baru agar terjadwal dan terpantau dengan rapi."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="bg-card px-6 py-5 sm:px-7 sm:py-6 border-none">
            <form onSubmit={handleSubmit(onSubmit)} className="gap-5 flex flex-col">
              {/* Title */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ListTodo className="h-4 w-4 text-zinc-300" />
                  <span>Judul Tugas</span>
                  <span className="text-rose-400 text-xs">*</span>
                </Label>

                <Input
                  placeholder="Contoh: Menyelesaikan laporan praktikum atau tugas akhir..."
                  className="h-11 rounded-xl bg-background/70 border-border/80 text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/30 text-sm transition-all"
                  {...register("title")}
                />

                {errors.title && (
                  <p className="text-xs text-rose-400 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="h-4 w-4 text-zinc-300" />
                  <span>Deskripsi</span>
                  <span className="text-xs font-normal text-zinc-400">(Opsional)</span>
                </Label>

                <Textarea
                  placeholder="Tambahkan detail, catatan, atau checklist tugas di sini..."
                  rows={3}
                  className="min-h-24 resize-none rounded-xl bg-background/70 border-border/80 text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/30 text-sm transition-all"
                  {...register("description")}
                />
              </div>

              {/* Category & Due date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CalendarDays className="h-4 w-4 text-zinc-300" />
                    <span>Tenggat Waktu</span>
                  </Label>

                  <Input
                    type="date"
                    className="h-11 rounded-xl bg-background/70 border-border/80 text-white [color-scheme:dark] focus-visible:outline-none focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/30 text-sm transition-all"
                    {...register("due_date")}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Tag className="h-4 w-4 text-zinc-300" />
                    <span>Kategori</span>
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
                    <SelectTrigger className="h-11 rounded-xl bg-background/70 border-border/80 text-white focus-visible:outline-none focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/30 text-sm w-full transition-all">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>

                    <SelectContent className="bg-popover border-border/80 text-white shadow-2xl rounded-xl p-1.5">
                      {TASK_CATEGORY_OPTIONS.map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer py-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cn("size-2 rounded-full shrink-0", option.dotColor)} />
                            <span className="font-medium text-white">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Google Calendar Sync Indicator */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <CalendarDays className="size-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      Sinkronkan ke Google Calendar
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Event otomatis dibuat di Google Calendar saat tanggal tenggat diisi
                    </span>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Otomatis
                </span>
              </div>

              {/* Server error */}
              {submitError && (
                <p role="alert" className="text-sm text-rose-400 font-medium">
                  {submitError}
                </p>
              )}

              {/* Footer */}
              <DialogFooter className="pt-3 border-t border-border/40 mt-1 flex sm:flex-row items-center justify-between gap-3">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl h-10 px-3.5 text-xs font-medium cursor-pointer"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Hapus tugas
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => onOpenChange(false)}
                    className="flex-1 sm:flex-initial rounded-xl h-10 px-4 text-sm font-medium border-border/80 text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    Batal
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-initial rounded-xl h-10 px-6 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : isEditing
                        ? "Simpan Perubahan"
                        : "Buat Tugas"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-border/80 p-0 overflow-hidden bg-card text-card-foreground shadow-2xl">
          <AlertDialogHeader className="px-6 py-5 border-b border-border/50 bg-card">
            <AlertDialogTitle className="text-xl font-bold text-white">Hapus Tugas</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-300 text-sm mt-1">
              Apakah Anda yakin ingin menghapus tugas &quot;{task?.title}&quot;? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-muted/20 flex gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl border-border/80 text-zinc-300 hover:text-white hover:bg-white/10"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={e => {
                e.preventDefault(); // tahan dialog tetap terbuka sampai proses hapus selesai
                handleDelete();
              }}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium border-0"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
