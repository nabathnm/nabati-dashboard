"use client";

import { PageHeader } from "@/components/layout/page-header";
import UpcomingTask from "@/components/dashboard/upcoming-task";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import StatCards from "@/components/dashboard/stat-cards";
import PendingTasksWidget from "@/components/dashboard/pending-tasks-widget";
import RoutineProgressWidget from "@/components/dashboard/routine-progress-widget";
import AccountsOverview from "@/components/dashboard/accounts-overview";
import MonthlySpendingChart from "@/components/dashboard/monthly-spending-chart";
import ExpenseDonutChart from "@/components/dashboard/expense-donut-chart";
import QuickAccessServices from "@/components/dashboard/quick-access-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Your personal growth overview"
      />

      {/* Quick Access Services + Side Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <QuickAccessServices />
        </div>
        <div className="space-y-6">
          <RoutineProgressWidget />
          <AccountsOverview />
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards year={year} month={month} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Spending Trend */}
          <MonthlySpendingChart year={year} />

          {/* Upcoming Tasks */}
          <UpcomingTask />
        </div>

        {/* Right Column (Spans 1 column on desktop) */}
        <div className="space-y-8">
          {/* Expense Donut Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseDonutChart year={year} month={month} />
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <PendingTasksWidget />

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
