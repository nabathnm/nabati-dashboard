import PinnedTasks from "@/components/tasks/PinnedTasks";
import TaskSummary from "@/components/tasks/TaskSummary";
import TaskViewSwitcher from "@/components/tasks/TaskViewSwitcher";

export default function TasksPage() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Tugas & Jadwal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pusat manajemen kegiatan akademik, praktikum, organisasi, dan sinkronisasi Google Calendar.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <TaskSummary />

      {/* Main Workspace (View Switcher + Pinned Sidebar) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 items-start">
        <div className="lg:col-span-4 min-w-0">
          <TaskViewSwitcher />
        </div>

        <div className="lg:col-span-1 sticky top-6">
          <PinnedTasks className="w-full max-h-[calc(100vh-140px)]" />
        </div>
      </div>
    </div>
  );
}
