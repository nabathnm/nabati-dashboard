import { Target } from "lucide-react";
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
  const sortedRoles = Object.entries(careerReadiness)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Target className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Career Readiness</h3>
          <p className="text-xs text-slate-500">Based on your portfolio diversity</p>
        </div>
      </div>

      <div className="space-y-5">
        {sortedRoles.map(([roleKey, score]) => (
          <div key={roleKey}>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-sm font-bold text-slate-700">
                {ROLE_LABELS[roleKey] || roleKey}
              </span>
              <span className="text-xs font-bold text-slate-400">{score}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", ROLE_COLORS[roleKey] || "bg-slate-500")} 
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
