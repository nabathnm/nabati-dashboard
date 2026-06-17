"use client";

import { useState } from "react";
import { X, MessageSquare } from "lucide-react";

interface DailyReflectionModalProps {
  open: boolean;
  onClose: () => void;
  completedCount: number;
  totalCount: number;
}

export default function DailyReflectionModal({
  open,
  onClose,
  completedCount,
  totalCount,
}: DailyReflectionModalProps) {
  const [distraction, setDistraction] = useState("");
  const [productivityRating, setProductivityRating] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = () => {
    // For now just show confirmation. In the future, this can be sent to AI.
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDistraction("");
      setProductivityRating(3);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Daily Reflection</h2>
              <p className="text-xs text-muted-foreground">How was your day?</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <p className="text-lg font-bold text-slate-800">Great job reflecting!</p>
            <p className="text-sm text-muted-foreground mt-1">
              AI will optimize tomorrow&apos;s routine for you.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">
            {/* Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-slate-700">Today&apos;s Progress</p>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {completedCount}/{totalCount}
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                {completionRate}% completed
              </p>
            </div>

            {/* Distraction */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                What distracted you today?
              </label>
              <textarea
                value={distraction}
                onChange={(e) => setDistraction(e.target.value)}
                placeholder="e.g. Social media, unexpected meeting..."
                rows={3}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all resize-none"
              />
            </div>

            {/* Productivity Rating */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                How productive did you feel? ({productivityRating}/5)
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setProductivityRating(n)}
                    className={`w-12 h-12 rounded-xl text-lg font-bold border-2 transition-all ${
                      n <= productivityRating
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {n <= productivityRating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
            >
              Submit Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
