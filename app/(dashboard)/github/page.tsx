"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GithubOverview } from "@/components/github/github-overview";
import { LanguageChart } from "@/components/github/language-chart";
import { CareerReadiness } from "@/components/github/career-readiness";
import { AiEvaluationCard } from "@/components/github/ai-evaluation-card";
import { Code2, Loader2, Sparkles, AlertCircle } from "lucide-react";

import {
  useGithubCredentials,
  useGithubProfile,
  useGithubStats,
  useGithubEvaluation,
  useConnectGithub,
  useDisconnectGithub,
  useGenerateGithubEvaluation,
} from "@/hooks/use-github";

export default function GithubGrowthPage() {
  // Form State
  const [usernameInput, setUsernameInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  const { data: creds, isLoading: isLoadingCreds } = useGithubCredentials();
  
  const hasCreds = !!creds?.github_username;
  const username = creds?.github_username;
  const token = creds?.github_access_token;

  const { data: userProfile, isLoading: isLoadingProfile } = useGithubProfile(username, token);
  const { data: stats, isLoading: isLoadingStats } = useGithubStats(username, token);
  const { data: evaluation } = useGithubEvaluation(username);

  const connectMutation = useConnectGithub();
  const disconnectMutation = useDisconnectGithub();
  const evaluateMutation = useGenerateGithubEvaluation();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    connectMutation.mutate({ username: usernameInput.trim(), token: tokenInput.trim() });
  };

  const handleDisconnect = () => {
    if (!confirm("Are you sure you want to disconnect?")) return;
    disconnectMutation.mutate();
  };

  const handleEvaluate = () => {
    if (!username) return;
    evaluateMutation.mutate({ username, token });
  };

  const isDataLoading = isLoadingProfile || isLoadingStats;
  const error = connectMutation.error?.message;
  const connecting = connectMutation.isPending;
  const evaluating = evaluateMutation.isPending;

  if (isLoadingCreds) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Onboarding Screen
  if (!hasCreds) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-10 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code2 className="w-10 h-10 text-slate-800" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Connect GitHub</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Link your GitHub account to let AI analyze your coding patterns, repository quality, and provide personalized career growth insights.
          </p>

          <form onSubmit={handleConnect} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">GitHub Username</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. octocat"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Personal Access Token (Optional)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Required for private repos"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                Only needed if you want AI to analyze your private repositories. We do not store tokens permanently in the frontend, but it will be saved securely in the backend.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={connecting}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code2 className="w-5 h-5" />}
              {connecting ? "Connecting..." : "Connect Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Developer Growth"
          description="AI-powered insights based on your GitHub activity."
        />
        <div className="flex gap-3">
          <button
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            className="px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
          </button>
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {evaluating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {evaluating ? "Evaluating..." : "Generate AI Report"}
          </button>
        </div>
      </div>

      {userProfile && stats && (
        <>
          <GithubOverview
            user={userProfile}
            stats={stats}
            score={evaluation?.developer_score}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <CareerReadiness careerReadiness={evaluation?.career_readiness || { frontend: 0, backend: 0, mobile: 0, fullstack: 0 }} />
              <LanguageChart languages={stats.languages} />
            </div>

            <div className="lg:col-span-2">
              {evaluation ? (
                <AiEvaluationCard evaluation={evaluation} />
              ) : (
                <div className="bg-primary rounded-3xl p-10 text-primary-foreground shadow-xl h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 relative z-10 backdrop-blur-md">
                    <Sparkles className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 relative z-10">AI Report Not Generated</h3>
                  <p className="text-sm text-slate-400 max-w-sm relative z-10 mb-6">
                    We haven't generated an AI analysis for your profile yet. Click the button above to get your personalized growth report.
                  </p>
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="relative z-10 px-6 py-3 bg-background text-primary font-bold rounded-xl hover:bg-background/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Report Now"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
