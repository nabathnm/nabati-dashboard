"use client";

import type { ComponentProps } from "react";
import TaskTable from "@/components/tasks/TaskTable";

// Props mengikuti TaskTable otomatis (onTogglePin, onDeleteTask, dst.)
type TaskListViewProps = ComponentProps<typeof TaskTable>;

export default function TaskListView(props: TaskListViewProps) {
  return <TaskTable {...props} />;
}
