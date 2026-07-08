"use client";

import { format } from "date-fns";
import { CalendarDays, FileText, Tag, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TaskCategory } from "@/types/task";
import { cn } from "@/lib/utils";

interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date | null;
    title: string;
    onTitleChange: (title: string) => void;
    description: string;
    onDescriptionChange: (description: string) => void;
    category: TaskCategory | "";
    onCategoryChange: (category: TaskCategory | "") => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

const categoryOptions: { value: TaskCategory; label: string }[] = [
    { value: "Kuliah", label: "Kuliah" },
    { value: "Organisasi", label: "Organisasi" },
    { value: "Praktikum", label: "Praktikum" },
    { value: "Lainnya", label: "Lainnya" },
];

// Style dasar yang dipakai bersama oleh input, textarea, dan select
// agar tinggi, radius, border, dan focus ring-nya konsisten satu sama lain.
const fieldClass =
    "flex w-full items-center rounded-xl border border-input bg-muted/40 px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function AddTaskDialog({
    open,
    onOpenChange,
    selectedDate,
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    category,
    onCategoryChange,
    onSubmit,
    isSubmitting,
}: AddTaskDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                    </div>
                    <DialogTitle>Add Activity</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 px-6 py-5">
                    <div className="space-y-2">
                        <Label>
                            <ListTodo className="h-3.5 w-3.5" /> Title
                        </Label>
                        <Input
                            placeholder="Nama kegiatan"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            autoFocus
                            className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            <FileText className="h-3.5 w-3.5" /> Detail
                        </Label>
                        <Textarea
                            className="min-h-[90px] resize-none rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                            placeholder="Tambahkan detail atau deskripsi kegiatan..."
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            <Tag className="h-3.5 w-3.5" /> Category
                        </Label>
                        <Select value={category} onValueChange={(val) => onCategoryChange(val as TaskCategory)}>
                            <SelectTrigger className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {categoryOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="px-6 pb-6 pt-4 gap-2 border-t border-border/50 bg-muted/10">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!title.trim() || !category || isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Activity"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}