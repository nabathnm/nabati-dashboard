"use client";

import React, { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "@/components/layout/app-sidebar";
import { TaskReduxSync } from "@/components/tasks/TaskReduxSync";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col font-sans">
        <TaskReduxSync />
        <AppSidebar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area aaaadsasddsasadsadsadasdassaaaaaaaaaaaaaaaaadsadssasasa*/}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out pt-16 sm:pt-0",
            isExpanded ? "sm:pl-72" : "sm:pl-20"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
