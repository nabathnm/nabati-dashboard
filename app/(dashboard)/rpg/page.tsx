"use client";

import { PageHeader } from "@/components/layout/page-header";
import { LevelRing } from "@/components/gamification/level-ring";
import { XPProgressBar } from "@/components/gamification/xp-progress-bar";
import { StreakCounter } from "@/components/gamification/streak-counter";
import { SynergyRadarChart } from "@/components/gamification/synergy-radar-chart";
import { BadgesGrid } from "@/components/gamification/badges-grid";
import {
  useGamificationProfile,
  useAllBadges,
  useWeeklySynergy,
} from "@/hooks/use-gamification";
import {
  Loader2,
  Trophy,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

export default function RPGPage() {
  const { data: profile, isLoading: profileLoading } =
    useGamificationProfile();
  const { data: badges, isLoading: badgesLoading } = useAllBadges();
  const { data: synergyData, isLoading: synergyLoading } = useWeeklySynergy();

  const isLoading = profileLoading || badgesLoading || synergyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-400">
            Loading your adventure...
          </p>
        </div>
      </div>
    );
  }

  const unlockedCount = badges?.filter((b) => b.is_unlocked).length ?? 0;
  const totalBadges = badges?.length ?? 0;
  const totalXP = profile?.xp ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Life RPG"
        description="Gamify your life, earn XP, and level up"
      />

      {/* Top Section: Level Card + Synergy Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Level & Stats Card (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 gradient-border relative overflow-hidden">
          {/* Subtle decorative gradient blob */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/15 to-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-rose-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Level Ring */}
            <LevelRing
              level={profile?.level ?? 1}
              xp={totalXP}
              className="mb-6"
            />

            {/* XP Progress Bar */}
            <XPProgressBar xp={totalXP} className="w-full mb-5" />

            {/* Streak */}
            <StreakCounter
              streak={profile?.streak_count ?? 0}
              className="w-full"
            />
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
            <div className="text-center p-3 bg-white/40 rounded-xl">
              <TrendingUp className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-800">{totalXP}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Total XP
              </p>
            </div>
            <div className="text-center p-3 bg-white/40 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-800">
                {unlockedCount}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Badges
              </p>
            </div>
            <div className="text-center p-3 bg-white/40 rounded-xl">
              <Target className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-800">
                {profile?.level ?? 1}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Level
              </p>
            </div>
          </div>
        </div>

        {/* Synergy Radar Chart (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200/50">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Weekly Synergy
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Performa Anda di 4 pilar kehidupan minggu ini
              </p>
            </div>
          </div>

          {synergyData && synergyData.length > 0 ? (
            <SynergyRadarChart data={synergyData} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm font-semibold">
              Belum ada data minggu ini
            </div>
          )}

          {/* Pillar summary under radar */}
          {synergyData && (
            <div className="grid grid-cols-4 gap-3 mt-2">
              {synergyData.map((item) => {
                const colorMap: Record<string, string> = {
                  Productivity: "text-emerald-500",
                  Routine: "text-rose-500",
                  Frugality: "text-amber-500",
                  Coding: "text-violet-500",
                };
                const bgMap: Record<string, string> = {
                  Productivity: "bg-emerald-50",
                  Routine: "bg-rose-50",
                  Frugality: "bg-amber-50",
                  Coding: "bg-violet-50",
                };

                return (
                  <div
                    key={item.pillar}
                    className={`text-center p-2.5 rounded-xl ${bgMap[item.pillar] || "bg-slate-50"}`}
                  >
                    <p
                      className={`text-xl font-black ${colorMap[item.pillar] || "text-slate-600"}`}
                    >
                      {item.value}%
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.pillar}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200/50">
              <Trophy className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Achievements
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                {unlockedCount} dari {totalBadges} lencana terbuka
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{
                  width: `${totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {totalBadges > 0
                ? Math.round((unlockedCount / totalBadges) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {badges && <BadgesGrid badges={badges} />}
      </div>
    </div>
  );
}
