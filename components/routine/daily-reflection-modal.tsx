"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
            Daily Reflection
          </div>
          <DialogTitle className="text-xl font-bold">
            How was your day?
          </DialogTitle>
        </DialogHeader>

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
                    className={`w-12 h-12 rounded-xl text-lg font-bold border-2 transition-all ${n <= productivityRating
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
          <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm"
            >
              Submit Reflection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
