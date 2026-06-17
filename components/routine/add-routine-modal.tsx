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
import { Label } from "@/components/ui/label";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Manual Routine</DialogTitle>
          <DialogDescription>
            Add a specific activity to your daily routine for {dateStr}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read a book"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Read chapter 4-5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as RoutineCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="personal_growth">Personal Growth</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="0">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
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
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isPending ? "Adding..." : "Add Routine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
