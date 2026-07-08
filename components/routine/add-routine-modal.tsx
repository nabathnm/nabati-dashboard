"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ListTodo, FileText, Clock, Hourglass, Tag, Target, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRoutine } from "@/hooks/use-routines";
import type { RoutineCategory } from "@/types/routine";

interface AddRoutineModalProps {
  open: boolean;
  onClose: () => void;
  dateStr: string; // The selected date string "yyyy-MM-dd"
}

export default function AddRoutineModal({
  open,
  onClose,
  dateStr,
}: AddRoutineModalProps) {
  const { mutate: createRoutine, isPending } = useCreateRoutine();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [category, setCategory] = useState<RoutineCategory>("productivity");
  const [priority, setPriority] = useState("1"); // 0=Low, 1=Medium, 2=High

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledTime) return;

    createRoutine(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_time: scheduledTime,
        estimated_duration: parseInt(estimatedDuration, 10),
        category,
        priority: parseInt(priority, 10),
        routine_date: dateStr,
        ai_generated: false,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setScheduledTime("09:00");
          setEstimatedDuration("30");
          setCategory("productivity");
          setPriority("1");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {dateStr ? format(new Date(dateStr), "MMMM d, yyyy") : ""}
          </div>
          <DialogTitle className="text-xl font-bold">Add Manual Routine</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ListTodo className="h-3.5 w-3.5" /> Activity Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read a book"
              className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Read chapter 4-5"
              className="min-h-[80px] resize-none rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledTime" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Time
              </Label>
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Hourglass className="h-3.5 w-3.5" /> Duration (mins)
              </Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select value={category} onValueChange={(val) => val && setCategory(val as RoutineCategory)}>
                <SelectTrigger id="category" className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="productivity" className="rounded-lg">Productivity</SelectItem>
                  <SelectItem value="health" className="rounded-lg">Health</SelectItem>
                  <SelectItem value="nutrition" className="rounded-lg">Nutrition</SelectItem>
                  <SelectItem value="personal_growth" className="rounded-lg">Personal Growth</SelectItem>
                  <SelectItem value="custom" className="rounded-lg">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Priority
              </Label>
              <Select value={priority} onValueChange={(val) => val && setPriority(val)}>
                <SelectTrigger id="priority" className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="2" className="rounded-lg">High</SelectItem>
                  <SelectItem value="1" className="rounded-lg">Medium</SelectItem>
                  <SelectItem value="0" className="rounded-lg">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t border-border/50 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
            >
              {isPending ? "Adding..." : "Add Routine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
