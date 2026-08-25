import React from "react";
import { cn } from "@/lib/utils";

export interface HeaderColumn {
  header: string;
  className?: string;
}

interface HeaderRowProps {
  labels?: string[];
  columns?: HeaderColumn[];
  prefix?: React.ReactNode;
  className?: string;
}

export function HeaderRow({ labels, columns, prefix, className }: HeaderRowProps) {
  const normalizedCols: HeaderColumn[] = columns || (labels?.map((l) => ({ header: l })) ?? []);

  return (
    <div className={cn("flex border-b border-primary/20 bg-primary", className)}>
      {prefix && (
        <div className="border-r border-primary/20">
          {prefix}
        </div>
      )}
      {normalizedCols.map((col, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 py-3 text-center border-r border-primary/20 last:border-0",
            col.className
          )}
        >
          <span className="text-xs font-bold text-primary-foreground uppercase">
            {col.header}
          </span>
        </div>
      ))}
    </div>
  );
}