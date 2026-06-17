"use client";

import CalendarView from "@/components/calendar/CalendarView";
import { PageHeader } from "@/components/layout/page-header";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <CalendarView />
    </div>
  );
}
