"use client";

import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categoryStyles = {
  Kuliah: { bg: "bg-blue-500/10 text-blue-500", border: "border-blue-500/20" },
  Organisasi: { bg: "bg-yellow-500/10 text-yellow-500", border: "border-yellow-500/20" },
  Praktikum: { bg: "bg-rose-500/10 text-rose-500", border: "border-rose-500/20" },
  Lainnya: { bg: "bg-purple-500/10 text-purple-500", border: "border-purple-500/20" },
};

export default function PendingTasksWidget() {
  const { tasks, loading } = useAppSelector((state) => state.tasks);

  const pendingTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      // Sort by due date (closest first), then by creation date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 4); // Show top 4 pending tasks

  return (
    <Card className="bg-card shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-600" />
            Pending Tasks
          </CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
          <Link href="/tasks">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-4 rounded-full bg-muted animate-pulse mt-1" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingTasks.length > 0 ? (
          <div className="space-y-4">
            {pendingTasks.map((task) => {
              const catStyle = categoryStyles[task.category] || categoryStyles.lainnya;
              
              return (
                <div key={task.id} className="flex items-start gap-3 group">
                  <Circle className="h-4 w-4 mt-0.5 text-muted-foreground/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", catStyle.bg, catStyle.border)}>
                        {task.category}
                      </span>
                      {task.due_date && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Due: {format(new Date(task.due_date), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-6">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No pending tasks for now.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
