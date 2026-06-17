"use client";

import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CheckSquare, Star, BookOpen, Users, Award, ClipboardList } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";

const categoryConfigs = {
  kuliah: { icon: BookOpen, bg: "bg-blue-500/10 text-blue-500", label: "Kuliah" },
  organisasi: { icon: Users, bg: "bg-amber-500/10 text-amber-500", label: "Organisasi" },
  praktikum: { icon: Award, bg: "bg-rose-500/10 text-rose-500", label: "Praktikum" },
  lainnya: { icon: Star, bg: "bg-purple-500/10 text-purple-500", label: "Lainnya" },
};

export default function UpcomingTask() {
  const { data: tasks, isLoading } = useTasks();

  // Filter out done tasks, sort by due date, take top 3
  const activeTasks = (tasks ?? [])
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[260px] transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Upcoming tasks
        </h3>
        <Link href="/tasks">
          <button className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full transition-all">
            View All
          </button>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-200/40 animate-pulse rounded-2xl" />
          ))
        ) : activeTasks.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">You&apos;re all caught up!</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                No upcoming tasks — enjoy your free time
              </p>
            </div>
            <Link href="/tasks">
              <button className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold px-4 py-2 rounded-full transition-all mt-1">
                Create Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {activeTasks.map((task) => {
                  const config = categoryConfigs[task.category as keyof typeof categoryConfigs] || categoryConfigs.lainnya;
                  const IconComponent = config.icon;
                  
                  // Format due date badge
                  const isTaskToday = task.due_date && isToday(new Date(task.due_date));
                  const formattedDate = task.due_date
                    ? isTaskToday
                      ? "Today"
                      : format(new Date(task.due_date), "MMM d")
                    : "No date";

                  const categoryLabel = config.label;
                  const subLabel = task.description || "—";
                  const progressValue = task.progress !== undefined ? `${task.progress}% Done` : "Pending";

                  return (
                    <tr
                      key={task.id}
                      className="group border-b border-slate-100/50 last:border-none hover:bg-white/40 transition-colors"
                    >
                      <td className="py-3 pr-4 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className={cn("h-9.5 w-9.5 rounded-xl flex items-center justify-center shadow-sm shrink-0", config.bg)}>
                            <IconComponent className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 max-w-[140px]">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </p>
                            <p className="text-[9px] font-semibold text-muted-foreground/80 mt-0.5 truncate">
                              {subLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 align-middle hidden sm:table-cell">
                        <p className="text-[10px] font-bold text-slate-700">{categoryLabel}</p>
                      </td>
                      <td className="py-3 px-2 align-middle">
                        <span
                          className={cn(
                            "text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap",
                            isTaskToday
                              ? "bg-blue-500 text-white shadow-sm shadow-blue-500/10"
                              : "bg-slate-200/50 text-slate-600"
                          )}
                        >
                          {formattedDate}
                        </span>
                      </td>
                      <td className="py-3 pl-2 align-middle text-right">
                        <p className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                          {progressValue}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
