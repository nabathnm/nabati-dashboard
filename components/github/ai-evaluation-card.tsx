import { Sparkles, BrainCircuit, Lightbulb, FolderCheck } from "lucide-react";
import type { AIGithubEvaluation } from "@/types/database";

interface AiEvaluationCardProps {
  evaluation: AIGithubEvaluation;
}

export function AiEvaluationCard({ evaluation }: AiEvaluationCardProps) {
  return (
    <div className="bg-primary rounded-3xl p-6 text-primary-foreground shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-400/15 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-400/15 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
          <Sparkles className="w-5 h-5 text-indigo-300" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Growth Analysis</h3>
          <p className="text-xs text-primary-foreground/60">Generated based on your GitHub activity</p>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {/* Habit Analysis */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.09] transition-colors">
          <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2">
            <BrainCircuit className="w-4 h-4" /> Coding Rhythm
          </h4>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            {evaluation.habit_analysis}
          </p>
        </div>

        {/* Learning Insights */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.09] transition-colors">
          <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" /> Learning Insights
          </h4>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            {evaluation.learning_insights}
          </p>
        </div>

        {/* Portfolio Review */}
        <div>
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3 px-1">
            <FolderCheck className="w-4 h-4" /> Portfolio Review
          </h4>
          <ul className="space-y-2">
            {evaluation.portfolio_review.map((point, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm text-primary-foreground/80 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl p-3.5 hover:bg-white/[0.09] transition-colors"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}