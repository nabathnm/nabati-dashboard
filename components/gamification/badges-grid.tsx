"use client";

import {
  Lock,
  Footprints,
  Swords,
  Flame,
  Shield,
  PiggyBank,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import type { BadgeWithStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface BadgesGridProps {
  badges: BadgeWithStatus[];
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Footprints,
  Swords,
  Flame,
  Shield,
  PiggyBank,
  Zap,
  Star,
  Crown,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  productivity: {
    bg: "from-emerald-400 to-teal-500",
    text: "text-emerald-600",
    glow: "shadow-emerald-300/40",
  },
  finances: {
    bg: "from-amber-400 to-orange-500",
    text: "text-amber-600",
    glow: "shadow-amber-300/40",
  },
  routine: {
    bg: "from-rose-400 to-pink-500",
    text: "text-rose-600",
    glow: "shadow-rose-300/40",
  },
  github: {
    bg: "from-violet-400 to-purple-500",
    text: "text-violet-600",
    glow: "shadow-violet-300/40",
  },
  synergy: {
    bg: "from-indigo-400 to-cyan-500",
    text: "text-indigo-600",
    glow: "shadow-indigo-300/40",
  },
};

export function BadgesGrid({ badges, className }: BadgesGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {badges.map((badge) => {
        const IconComponent = ICON_MAP[badge.icon] || Star;
        const colors = CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.synergy;

        return (
          <div
            key={badge.id}
            className={cn(
              "relative group rounded-2xl border p-5 text-center transition-all duration-300",
              badge.is_unlocked
                ? "bg-white border-slate-100 hover:shadow-lg hover:-translate-y-1 cursor-default"
                : "bg-slate-50/60 border-slate-100/60 opacity-60"
            )}
          >
            {/* Badge Icon */}
            <div className="flex justify-center mb-3">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative",
                  badge.is_unlocked
                    ? `bg-gradient-to-br ${colors.bg} shadow-lg ${colors.glow}`
                    : "bg-slate-200"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-7 h-7",
                    badge.is_unlocked ? "text-white" : "text-slate-400"
                  )}
                />

                {/* Lock overlay */}
                {!badge.is_unlocked && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Badge Name */}
            <h4
              className={cn(
                "text-sm font-bold mb-1",
                badge.is_unlocked ? "text-slate-800" : "text-slate-400"
              )}
            >
              {badge.name}
            </h4>

            {/* Badge Description */}
            <p
              className={cn(
                "text-[10px] leading-relaxed",
                badge.is_unlocked
                  ? "text-slate-500 font-medium"
                  : "text-slate-400"
              )}
            >
              {badge.description}
            </p>

            {/* XP Reward tag */}
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
                badge.is_unlocked
                  ? `bg-gradient-to-r ${colors.bg} text-white`
                  : "bg-slate-100 text-slate-400"
              )}
            >
              <Zap className="w-3 h-3" />
              +{badge.xp_reward} XP
            </div>

            {/* Unlocked date */}
            {badge.is_unlocked && badge.unlocked_at && (
              <p className="text-[9px] text-slate-400 mt-2 font-semibold">
                Unlocked{" "}
                {new Date(badge.unlocked_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
