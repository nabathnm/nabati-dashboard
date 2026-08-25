import React from "react";
import { format, subMonths, addMonths } from "date-fns";
import { SlidersHorizontal, Search, List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TransactionCategory, Account } from "@/types/database";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: "list" | "calendar";
  setViewMode: (mode: "list" | "calendar") => void;
  currentDate: Date;
  setCurrentDate: (date: Date | ((prev: Date) => Date)) => void;
  isAllTime: boolean;
  setIsAllTime: (isAllTime: boolean) => void;
  onFilterChange: (key: string, value: string | undefined) => void;
  categories?: TransactionCategory[];
  accounts?: Account[];
}

export function TransactionFilters({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  currentDate,
  setCurrentDate,
  isAllTime,
  setIsAllTime,
  onFilterChange,
  categories,
  accounts,
}: TransactionFiltersProps) {
  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
    setIsAllTime(false);
  };
  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
    setIsAllTime(false);
  };

  return (
    <div className="flex items-center px-3 py-2 gap-5 rounded-full border border-border/50 bg-card shadow-sm overflow-x-auto overflow-y-hidden no-scrollbar">
      {/* Filter Label */}
      <div className="flex items-center gap-2 px-3 text-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-[14px] font-semibold">Filter</span>
      </div>

      {/* Search Input */}
      <div className="relative flex-1 border rounded-full overflow-hidden border-border/50">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transaction..."
          className="pl-9 h-9 text-[14px] bg-muted/50 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-ring transition-colors shadow-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>



      {/* Categories */}
      <Select
        onValueChange={(v) => onFilterChange("category_id", v === "all" || !v ? undefined : (v as string))}
      >
        <SelectTrigger className="w-32 px-4 bg-muted/50 hover:bg-muted rounded-full border border-border/50 text-[14px] shadow-none focus:ring-0 text-foreground shrink-0 justify-between">
          <SelectValue placeholder="Categories" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All categories</SelectItem>
          {(categories ?? []).map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month Navigator */}
      <div className="flex items-center bg-muted/50 border rounded-full border-border/50 h-9 px-1 shrink-0 justify-between w-32">
        <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-7 w-7 rounded-full hover:bg-muted">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Button>
        <button
          onClick={() => {
            if (viewMode === "list") {
              setIsAllTime(true);
            } else {
              setCurrentDate(new Date());
              setIsAllTime(false);
            }
          }}
          className="text-sm w-24 text-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAllTime && viewMode === "list" ? "All Time" : format(currentDate, "MMMM")}
        </button>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7 rounded-full hover:bg-muted">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* View Toggle */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
        className="flex items-center text-[14px] bg-muted/50 hover:bg-muted rounded-full transition-colors shrink-0 text-foreground border border-border/50 w-32 px-3 py-2 justify-between"
      >
        {viewMode === "list" ? "List" : "Calendar"}
        {viewMode === "list" ? <List className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
      </button>
    </div>
  );
}
