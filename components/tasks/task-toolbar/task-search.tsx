"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { RefObject } from "react";

interface TaskSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLDivElement | null>;
  className: string;
}

export default function TaskSearch({
  searchTerm,
  onSearchChange,
  searchRef,
  className,
}: TaskSearchProps) {
  return (
    <div
      ref={searchRef}
      className={`relative min-w-0 transition-[flex-grow,width] duration-300 ease-in-out ${className}`}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={searchTerm}
        onChange={event => onSearchChange(event.target.value)}
        placeholder="Search tasks..."
        className="h-9 w-full rounded-full pl-9 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
