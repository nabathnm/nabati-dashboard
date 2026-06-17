"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Tag, BookOpen, CalendarDays } from "lucide-react";
import type { CollegeClass } from "@/types/routine";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ClassModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (day: string, cls: CollegeClass) => void;
  onDelete?: (day: string, classId: string) => void;
  initialData?: { day: string; cls: CollegeClass } | null;
  defaultDay?: string;
  defaultStartHour?: number;
}

const CATEGORIES = [
  { value: "class", label: "Class", icon: "📚" },
  { value: "practical", label: "Practical", icon: "🔬" },
];

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export default function ClassModal({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultDay = "monday",
  defaultStartHour = 8,
}: ClassModalProps) {
  const [day, setDay] = useState(defaultDay);
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState(`${defaultStartHour.toString().padStart(2, "0")}:00`);
  const [endTime, setEndTime] = useState(`${(defaultStartHour + 2).toString().padStart(2, "0")}:00`);
  const [room, setRoom] = useState("");
  const [category, setCategory] = useState<"class" | "practical">("class");

  // Reset form when opened with initial data
  useEffect(() => {
    if (open) {
      if (initialData) {
        setDay(initialData.day);
        setSubject(initialData.cls.subject);
        setStartTime(initialData.cls.start_time);
        setEndTime(initialData.cls.end_time);
        setRoom(initialData.cls.room || "");
        setCategory((initialData.cls.category as "class" | "practical") || "class");
      } else {
        setDay(defaultDay);
        setSubject("");
        setStartTime(`${defaultStartHour.toString().padStart(2, "0")}:00`);
        setEndTime(`${(defaultStartHour + 2).toString().padStart(2, "0")}:00`);
        setRoom("");
        setCategory("class");
      }
    }
  }, [open, initialData, defaultDay, defaultStartHour]);

  const handleSave = () => {
    if (!subject.trim() || !startTime || !endTime) return;
    
    const cls: CollegeClass = {
      id: initialData?.cls.id || crypto.randomUUID(),
      subject: subject.trim(),
      start_time: startTime,
      end_time: endTime,
      room: room.trim() || undefined,
      category,
    };
    
    onSave(day, cls);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="rounded-3xl border-none p-0 overflow-hidden sm:max-w-md">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            Class Schedule
          </div>
          <DialogTitle className="text-xl font-bold">
            {initialData ? "Edit Class" : "Add Class"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Day
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DAYS.map((d) => (
                    <SelectItem key={d.value} value={d.value} className="rounded-lg">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val as "class" | "practical")}>
                <SelectTrigger className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="rounded-lg">
                      <span className="flex items-center gap-2">
                        {c.icon} {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Subject Name
            </Label>
            <Input
              placeholder="e.g. Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoFocus
              className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Start Time
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> End Time
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Room (Optional)
            </Label>
            <Input
              placeholder="e.g. Lab B, Room 101"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="h-11 rounded-xl border-input bg-muted/40 shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40"
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2 flex flex-col sm:flex-row justify-between sm:justify-between items-center w-full">
          {initialData && onDelete ? (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(initialData.day, initialData.cls.id);
                onClose();
              }}
              className="rounded-xl h-10 shadow-sm bg-rose-100 text-rose-700 hover:bg-rose-200 w-full sm:w-auto"
            >
              Delete
            </Button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-10 flex-1 sm:flex-none shadow-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!subject.trim() || !startTime || !endTime}
              className="rounded-xl h-10 flex-1 sm:flex-none shadow-sm"
            >
              Save Class
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
