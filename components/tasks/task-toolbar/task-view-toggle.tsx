"use client";

import { CalendarDays, LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TaskView } from "./task-toolbar";

interface TaskViewToggleProps {
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  onBeforeChange?: () => void;
}

export default function TaskViewToggle({
  view,
  onViewChange,
  onBeforeChange,
}: TaskViewToggleProps) {
  const nextView: TaskView = view === "list" ? "calendar" : "list";

  const NextViewIcon = nextView === "list" ? LayoutList : CalendarDays;

  const nextViewLabel = nextView === "list" ? "List" : "Calendar";

  const handleViewChange = () => {
    onBeforeChange?.();

    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => {
        onViewChange(nextView);
      });
    } else {
      onViewChange(nextView);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleViewChange}
      aria-label={`Switch to ${nextViewLabel} view`}
      title={`Switch to ${nextViewLabel} view`}
      className="h-9 w-9 shrink-0 rounded-full"
    >
      <NextViewIcon className="h-4 w-4" />
    </Button>
  );
}
