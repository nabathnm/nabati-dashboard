"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  PenTool,
  Sunrise,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import ProgressRing from "@/components/routine/progress-ring";
import RoutineItem from "@/components/routine/routine-item";
import RoutineProfileModal from "@/components/routine/routine-profile-modal";
import DailyReflectionModal from "@/components/routine/daily-reflection-modal";
import AddRoutineModal from "@/components/routine/add-routine-modal";
import {
  useRoutinesByDate,
  useToggleRoutine,
  useDeleteRoutine,
  useGenerateRoutine,
  useRoutineProfile,
} from "@/hooks/use-routines";
import { useTasks } from "@/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyRoutine } from "@/types/routine";

// ─── Helpers ─────────────────────────────────────────────────

function groupByTimeOfDay(routines: DailyRoutine[]) {
  const morning: DailyRoutine[] = [];
  const afternoon: DailyRoutine[] = [];
  const evening: DailyRoutine[] = [];

  routines.forEach((r) => {
    const hour = parseInt(r.scheduled_time.split(":")[0], 10);
    if (hour < 12) morning.push(r);
    else if (hour < 17) afternoon.push(r);
    else evening.push(r);
  });

  return { morning, afternoon, evening };
}

// ─── Page Component ──────────────────────────────────────────

export default function RoutinePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  // Data
  const { data: routines, isLoading } = useRoutinesByDate(dateStr);
  const { data: profile, isLoading: isLoadingProfile } = useRoutineProfile();
  const { data: tasks } = useTasks();
  const { mutate: toggleRoutine, isPending: isToggling } = useToggleRoutine();
  const { mutate: deleteRoutine } = useDeleteRoutine();
  const { mutate: generateRoutine, isPending: isGenerating } = useGenerateRoutine();

  // Auto-open profile modal if no profile exists
  useEffect(() => {
    if (!isLoadingProfile && !profile) {
      setShowProfileModal(true);
    }
  }, [isLoadingProfile, profile]);

  // Stats
  const stats = useMemo(() => {
    const total = routines?.length ?? 0;
    const completed = routines?.filter((r) => r.is_completed).length ?? 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, completionRate };
  }, [routines]);

  // Grouped routines
  const grouped = useMemo(() => {
    if (!routines) return { morning: [], afternoon: [], evening: [] };
    return groupByTimeOfDay(routines);
  }, [routines]);

  // Handler: Generate routine
  const handleGenerate = () => {
    if (!profile) {
      setShowProfileModal(true);
      return;
    }

    // Pass pending tasks that are due on or after the selected date
    const relevantTasks = (tasks ?? [])
      .filter((t) => t.status !== "done" && t.due_date && t.due_date >= dateStr)
      .map((t) => ({ 
        title: t.title, 
        description: t.description,
        due_date: t.due_date, 
        category: t.category 
      }));

    generateRoutine({
      date: dateStr,
      profile,
      existingTasks: relevantTasks,
      previousCompletionRate: stats.completionRate || 75,
    });
  };

  // ─── Render ────────────────────────────────────────────────

  const timeGroups = [
    { key: "morning", label: "Morning", icon: Sunrise, items: grouped.morning, color: "text-amber-500" },
    { key: "afternoon", label: "Afternoon", icon: Sun, items: grouped.afternoon, color: "text-blue-500" },
    { key: "evening", label: "Evening", icon: Moon, items: grouped.evening, color: "text-violet-500" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="My Routine"
        description="AI-powered daily routine planner"
      >
        <button
          onClick={() => setShowProfileModal(true)}
          className="p-2.5 hover:bg-white/50 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          title="Edit Profile & Goals"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </PageHeader>

      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="text-center min-w-[160px]">
          <p className="text-sm font-bold text-slate-800">
            {isToday ? "Today" : format(selectedDate, "EEEE")}
          </p>
          <p className="text-xs text-muted-foreground font-semibold">
            {format(selectedDate, "MMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Progress Ring + Generate Button */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-5">
        {isLoading ? (
          <Skeleton className="w-40 h-40 rounded-full" />
        ) : (
          <ProgressRing
            percentage={stats.completionRate}
            label={`${stats.completed} of ${stats.total} completed`}
            sublabel={
              stats.total === 0
                ? "Generate a routine to get started"
                : stats.completionRate === 100
                  ? "🎉 All done! Great job!"
                  : undefined
            }
          />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              routines && routines.length > 0
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating
              ? "Generating..."
              : routines && routines.length > 0
                ? "Regenerate Routine"
                : "Generate Today's Routine"}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center p-2.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            title="Add Routine Manually"
          >
            <span className="font-bold text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      {/* Routine Checklist */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : routines && routines.length > 0 ? (
        <div className="space-y-6">
          {timeGroups.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.key}>
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <group.icon className={cn("w-4 h-4", group.color)} />
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {group.label}
                    </h3>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {group.items.filter((r) => r.is_completed).length}/
                      {group.items.length}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {group.items.map((routine) => (
                      <RoutineItem
                        key={routine.id}
                        routine={routine}
                        onToggle={(id, completed) =>
                          toggleRoutine({ id, completed })
                        }
                        onDelete={(id) => deleteRoutine(id)}
                        isPending={isToggling}
                      />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No routine for this day</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
            Click &quot;Generate Today&apos;s Routine&quot; to let AI create a personalized daily plan based on your goals and schedule.
          </p>
        </div>
      )}

      {/* Daily Reflection Button */}
      {routines && routines.length > 0 && isToday && (
        <button
          onClick={() => setShowReflectionModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-violet-200 bg-violet-50 text-violet-700 font-bold text-sm hover:bg-violet-100 transition-colors"
        >
          <PenTool className="w-4 h-4" />
          Daily Reflection
        </button>
      )}

      {/* Modals */}
      <RoutineProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <DailyReflectionModal
        open={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        completedCount={stats.completed}
        totalCount={stats.total}
      />
      <AddRoutineModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        dateStr={dateStr}
      />
    </div>
  );
}
