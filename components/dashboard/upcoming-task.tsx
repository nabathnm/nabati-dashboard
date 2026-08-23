"use client";

import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Star, BookOpen, Users, Award, ClipboardList } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

const categoryConfigs = {
  kuliah: { icon: BookOpen, bg: "bg-blue-500/10 dark:bg-[#88c0d0]/20 text-blue-500 dark:text-[#88c0d0]", label: "Kuliah" },
  organisasi: { icon: Users, bg: "bg-amber-500/10 dark:bg-[#ebcb8b]/20 text-amber-500 dark:text-[#ebcb8b]", label: "Organisasi" },
  praktikum: { icon: Award, bg: "bg-rose-500/10 dark:bg-[#bf616a]/20 text-rose-500 dark:text-[#bf616a]", label: "Praktikum" },
  lainnya: { icon: Star, bg: "bg-purple-500/10 dark:bg-[#b48ead]/20 text-purple-500 dark:text-[#b48ead]", label: "Lainnya" },
};

export default function UpcomingTask() {
  const { data: tasks, isLoading } = useTasks();

  // Filter out done tasks, sort by due date, take top 3
  const activeTasks = (tasks ?? [])
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (a.activity_date && b.activity_date) {
        return new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime();
      }
      if (a.activity_date) return -1;
      if (b.activity_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[260px] transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-[#eceff4] uppercase tracking-wider">
          Upcoming tasks
        </h3>
        <Link href="/tasks">
          <button className="bg-slate-900 hover:bg-slate-800 dark:bg-[#88c0d0] dark:hover:bg-[#81a1c1] text-white dark:text-[#2e3440] text-[9px] font-bold px-3 py-1.5 rounded-full transition-all">
            View All
          </button>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-200/40 dark:bg-[#434c5e]/40 animate-pulse rounded-2xl" />
          ))
        ) : activeTasks.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#a3be8c]/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400 dark:text-[#a3be8c]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-[#eceff4]">You&apos;re all caught up!</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                No upcoming tasks — enjoy your free time
              </p>
            </div>
            <Link href="/tasks">
              <button className="bg-slate-900 hover:bg-slate-800 dark:bg-[#88c0d0] dark:hover:bg-[#81a1c1] text-white dark:text-[#2e3440] text-[9px] font-bold px-4 py-2 rounded-full transition-all mt-1">
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
                  const isTaskToday = task.activity_date && isToday(new Date(task.activity_date));
                  const formattedDate = task.activity_date
                    ? isTaskToday
                      ? "Today"
                      : format(new Date(task.activity_date), "MMM d")
                    : "No date";

                  const categoryLabel = config.label;
                  const subLabel = task.description || "—";
                  const progressValue = task.progress !== undefined ? `${task.progress}% Done` : "Pending";

                  return (
                    <tr
                      key={task.id}
                      className="group border-b border-slate-100/50 dark:border-[#434c5e]/40 last:border-none hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 pr-4 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className={cn("h-9.5 w-9.5 rounded-xl flex items-center justify-center shadow-sm shrink-0", config.bg)}>
                            <IconComponent className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 max-w-[140px]">
                            <p className="text-xs font-bold text-slate-800 dark:text-[#eceff4] truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            <p className="text-[9px] font-semibold text-muted-foreground/80 mt-0.5 truncate">
                              {subLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 align-middle hidden sm:table-cell">
                        <p className="text-[10px] font-bold text-slate-700 dark:text-[#d8dee9]">{categoryLabel}</p>
                      </td>
                      <td className="py-3 px-2 align-middle">
                        <span
                          className={cn(
                            "text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap",
                            isTaskToday
                              ? "bg-blue-500 dark:bg-[#88c0d0] text-white dark:text-[#2e3440] shadow-sm shadow-blue-500/10"
                              : "bg-slate-200/50 dark:bg-[#434c5e]/60 text-slate-600 dark:text-[#d8dee9]"
                          )}
                        >
                          {formattedDate}
                        </span>
                      </td>
                      <td className="py-3 pl-2 align-middle text-right">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-[#eceff4] whitespace-nowrap">
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
