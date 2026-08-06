"use client";

import { useState } from "react";
import { X, Plus, Trash2, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useRoutineProfile, useUpsertRoutineProfile } from "@/hooks/use-routines";
import type { UpsertRoutineProfileDTO, EnergyPreference } from "@/types/routine";

interface RoutineProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

export default function RoutineProfileModal({ open, onClose }: RoutineProfileModalProps) {
  const { data: profile } = useRoutineProfile();
  const { mutateAsync: upsertProfile, isPending } = useUpsertRoutineProfile();

  // Local form state (initialize from existing profile)
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? [""]);
  const [sleepStart, setSleepStart] = useState(profile?.sleep_start?.slice(0, 5) ?? "23:00");
  const [sleepEnd, setSleepEnd] = useState(profile?.sleep_end?.slice(0, 5) ?? "06:00");
  const [energyPref, setEnergyPref] = useState<EnergyPreference>(profile?.energy_preference ?? "morning");

  if (!open) return null;

  const addGoal = () => setGoals((prev) => [...prev, ""]);
  const removeGoal = (index: number) => setGoals((prev) => prev.filter((_, i) => i !== index));
  const updateGoal = (index: number, value: string) =>
    setGoals((prev) => prev.map((g, i) => (i === index ? value : g)));

  const handleSubmit = async () => {
    const filteredGoals = goals.filter((g) => g.trim() !== "");
    if (filteredGoals.length === 0) return;

    const dto: UpsertRoutineProfileDTO = {
      goals: filteredGoals,
      sleep_start: sleepStart,
      sleep_end: sleepEnd,
      energy_preference: energyPref,
    };

    await upsertProfile(dto);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            Routine Profile
          </div>
          <DialogTitle className="text-xl font-bold">
            Setup Your Routine Profile
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Goals */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Your Goals
            </label>
            <div className="space-y-2">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(i, e.target.value)}
                    placeholder="e.g. Become a Backend Developer"
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                  />
                  {goals.length > 1 && (
                    <button
                      onClick={() => removeGoal(i)}
                      className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addGoal}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add goal
            </button>
          </div>

          {/* Sleep Schedule */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Sleep Schedule
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Wake Up</label>
                <input
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold block mb-1">Sleep</label>
                <input
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Energy Preference */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Peak Energy Time
            </label>
            <div className="flex gap-2">
              {(["morning", "afternoon", "evening"] as EnergyPreference[]).map((pref) => (
                <button
                  key={pref}
                  onClick={() => setEnergyPref(pref)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all capitalize",
                    energyPref === pref
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {pref === "morning" ? "🌅 Morning" : pref === "afternoon" ? "☀️ Afternoon" : "🌙 Evening"}
                </button>
              ))}
            </div>
          </div>

          {/* College Schedule */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              College / Class Schedule
            </label>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-900">Manage visually in Calendar</p>
                <p className="text-[10px] text-indigo-600/80 mt-0.5">
                  AI will use your exact class times to avoid overlaps.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  window.location.href = "/schedule";
                }}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-50 transition-colors"
              >
                Open Calendar
              </button>
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 flex-shrink-0 bg-muted/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || goals.every((g) => g.trim() === "")}
            className="h-11 px-6 rounded-xl"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
