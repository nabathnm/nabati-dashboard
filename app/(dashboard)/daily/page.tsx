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
  CalendarDays,
  Plus,
  Target,
  Clock,
  TrendingUp,
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
import { Button } from "@/components/ui/button";
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
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setSelectedDate(new Date());
    setIsMounted(true);
  }, []);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = isMounted ? dateStr === format(new Date(), "yyyy-MM-dd") : false;

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
    const totalMinutes = routines?.reduce((sum, r) => sum + (r.estimated_duration || 0), 0) ?? 0;
    return { total, completed, completionRate, totalMinutes };
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

    const relevantTasks = (tasks ?? [])
      .filter((t) => t.status !== "done" && t.due_date && t.due_date >= dateStr)
      .map((t) => ({
        title: t.title,
        description: t.description,
        due_date: t.due_date,
        category: t.category,
      }));

    generateRoutine({
      date: dateStr,
      profile,
      existingTasks: relevantTasks,
      previousCompletionRate: stats.completionRate || 75,
    });
  };

  // ─── Render ────────────────────────────────────────────────

  if (!isMounted) {
    return (
      <div className="space-y-6 pb-10">
        <PageHeader title="My Routine" description="AI-powered daily routine planner" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  const timeGroups = [
    { key: "morning", label: "Morning", icon: Sunrise, items: grouped.morning, color: "text-amber-500", gradient: "from-amber-500/10 to-orange-500/5" },
    { key: "afternoon", label: "Afternoon", icon: Sun, items: grouped.afternoon, color: "text-blue-500", gradient: "from-blue-500/10 to-sky-500/5" },
    { key: "evening", label: "Evening", icon: Moon, items: grouped.evening, color: "text-violet-500", gradient: "from-violet-500/10 to-purple-500/5" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="My Routine"
        description="AI-powered daily routine planner"
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowProfileModal(true)}
          title="Edit Profile & Goals"
        >
          <Settings className="w-4.5 h-4.5" />
        </Button>
      </PageHeader>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

        {/* ─── Left Column: Summary Panel (sticky on desktop) ─── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">

          {/* Date Navigator Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate((d) => subDays(d, 1))}
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </Button>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  <p className="text-sm font-bold text-slate-800">
                    {isToday ? "Today" : format(selectedDate, "EEEE")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-semibold">
                  {format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate((d) => addDays(d, 1))}
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>

          {/* Progress Ring Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
            {isLoading ? (
              <Skeleton className="w-36 h-36 rounded-full" />
            ) : (
              <ProgressRing
                percentage={stats.completionRate}
                size={144}
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
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 tabular-nums leading-none">{stats.total}</p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Activities</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 tabular-nums leading-none">
                  {stats.totalMinutes > 60 ? `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m` : `${stats.totalMinutes}m`}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">Total Duration</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Button
              variant="default"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center gap-2 h-11"
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
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center gap-2 h-11"
            >
              <Plus className="w-4 h-4" />
              Add Manually
            </Button>

            {routines && routines.length > 0 && isToday && (
              <Button
                onClick={() => setShowReflectionModal(true)}
                variant="secondary"
                className="w-full flex items-center gap-2 h-11"


              >
                <PenTool className="w-4 h-4" />
                Daily Reflection
              </Button>
            )}
          </div>
        </div>

        {/* ─── Right Column: Routine Checklist ─── */}
        <div className="min-w-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : routines && routines.length > 0 ? (
            <div className="space-y-6">
              {timeGroups.map(
                (group) =>
                  group.items.length > 0 && (
                    <div key={group.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Section Header */}
                      <div className={cn("flex items-center justify-between px-5 py-3.5 border-b border-slate-50 bg-gradient-to-r", group.gradient)}>
                        <div className="flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white/80 shadow-sm")}>
                            <group.icon className={cn("w-4 h-4", group.color)} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              {group.label}
                            </h3>
                            <p className="text-[10px] font-semibold text-muted-foreground">
                              {group.items.filter((r) => r.is_completed).length} of {group.items.length} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-slate-600 tabular-nums">
                            {group.items.length > 0
                              ? Math.round((group.items.filter(r => r.is_completed).length / group.items.length) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-50">
                        {group.items.map((routine) => (
                          <div key={routine.id} className="px-3 py-1">
                            <RoutineItem
                              routine={routine}
                              onToggle={(id, completed) =>
                                toggleRoutine({ id, completed })
                              }
                              onDelete={(id) => deleteRoutine(id)}
                              isPending={isToggling}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No routine for this day</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[320px]">
                Click &quot;Generate Today&apos;s Routine&quot; to let AI create a personalized daily plan based on your goals and schedule.
              </p>
            </div>
          )}
        </div>
      </div>

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
