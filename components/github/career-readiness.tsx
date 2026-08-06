import { Target, Trophy } from "lucide-react";
import type { AIGithubEvaluation } from "@/types/database";
import { cn } from "@/lib/utils";

interface CareerReadinessProps {
  careerReadiness: AIGithubEvaluation["career_readiness"];
}

const ROLE_COLORS: Record<string, string> = {
  frontend: "bg-sky-500",
  backend: "bg-indigo-500",
  mobile: "bg-emerald-500",
  fullstack: "bg-violet-500",
};

const ROLE_LABELS: Record<string, string> = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  mobile: "Mobile Developer",
  fullstack: "Full Stack Developer",
};

export function CareerReadiness({ careerReadiness }: CareerReadinessProps) {
  // Sort roles by score descending
  const sortedRoles = Object.entries(careerReadiness).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-card rounded-3xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Career Readiness</h3>
          <p className="text-xs text-muted-foreground">Based on your portfolio diversity</p>
        </div>
      </div>

      <div className="space-y-5">
        {sortedRoles.map(([roleKey, score], idx) => (
          <div key={roleKey} className="group">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-sm font-bold text-foreground/90 flex items-center gap-1.5">
                {ROLE_LABELS[roleKey] || roleKey}
                {idx === 0 && (
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                )}
              </span>
              <span className="text-xs font-bold text-muted-foreground">{score}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 group-hover:opacity-90",
                  ROLE_COLORS[roleKey] || "bg-slate-500"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}