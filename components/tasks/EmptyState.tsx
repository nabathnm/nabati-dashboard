"use client";

import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateTask: () => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10">
          <ClipboardList className="h-10 w-10 text-violet-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
          <Plus className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      <h3 className="text-lg font-semibold tracking-tight mb-1">
        No tasks yet
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Start organizing your work by creating your first task. Drag and drop
        between columns to track progress.
      </p>

      <Button
        onClick={onCreateTask}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-violet-500/20"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create First Task
      </Button>
    </div>
  );
}
