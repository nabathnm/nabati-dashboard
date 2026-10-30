import PinnedTasks from "@/components/tasks/PinnedTasks";
import TaskSummary from "@/components/tasks/TaskSummary";
import TaskViewSwitcher from "@/components/tasks/TaskViewSwitcher";

export default function TasksPage() {
  return (
    <div className="space-y-6 px-6 py-6">
      <TaskSummary />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <TaskViewSwitcher />
        </div>

        <PinnedTasks className="h-full lg:col-span-1" />
      </div>
    </div>
  );
}
