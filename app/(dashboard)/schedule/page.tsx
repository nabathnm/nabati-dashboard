"use client";

import { PageHeader } from "@/components/layout/page-header";
import ScheduleView from "@/components/schedule/ScheduleView";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <ScheduleView />
    </div>
  );
}
