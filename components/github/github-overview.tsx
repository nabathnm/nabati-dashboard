import { BookMarked, Activity, Star, Users, Code2, Flame, CalendarDays } from "lucide-react";
import type { GithubUser, GithubAggregatedStats } from "@/types/github";
import { cn } from "@/lib/utils";

interface GithubOverviewProps {
  user: GithubUser;
  stats: GithubAggregatedStats;
  score?: number;
}

export function GithubOverview({ user, stats, score }: GithubOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Top Section: Profile & Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-primary rounded-3xl p-6 text-primary-foreground relative overflow-hidden flex items-center gap-6">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <img 
            src={user.avatar_url} 
            alt={user.name} 
            className="w-20 h-20 rounded-2xl border-2 border-white/10 relative z-10"
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
            <a 
              href={user.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm mt-1"
            >
              <Code2 className="w-4 h-4" /> @{user.login}
            </a>
            <p className="text-slate-300 text-sm mt-3 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-500" /> {user.followers} followers</span>
              <span className="flex items-center gap-1.5"><BookMarked className="w-4 h-4 text-slate-500" /> {stats.totalRepos} repositories</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Developer Score
          </h3>
          <div className="flex items-end gap-1">
            <span className={cn(
              "text-5xl font-black tracking-tighter",
              score && score >= 80 ? "text-emerald-500" :
              score && score >= 60 ? "text-amber-500" : 
              score ? "text-rose-500" : "text-slate-300"
            )}>
              {score || "--"}
            </span>
            <span className="text-lg font-bold text-slate-400 mb-1">/100</span>
          </div>
          {score && (
            <p className="text-xs font-semibold text-slate-500 mt-2 bg-slate-50 px-3 py-1 rounded-full">
              {score >= 80 ? "🔥 Excellent Growth" : score >= 60 ? "📈 Steady Progress" : "⚠️ Needs Consistency"}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.streak.current} Days</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Current Streak (Max: {stats.streak.longest})</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <CalendarDays className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.activeDays}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Active Days (Recently)</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Star className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalStars}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Total Stars Earned</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.recentCommitsCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Recent Commits</p>
        </div>
      </div>
    </div>
  );
}
