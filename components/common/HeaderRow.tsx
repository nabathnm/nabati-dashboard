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
  const normalizedCols: HeaderColumn[] =
    columns || (labels?.map(l => ({ header: l })) ?? []);

  return (
    <div className={cn("flex bg-card-foreground", className)}>
      {prefix && <div className="">{prefix}</div>}
      {normalizedCols.map((col, i) => (
        <div key={i} className={cn("flex-1 py-3 text-center", col.className)}>
          <span className="text-xs font-bold text-primary-foreground uppercase">
            {col.header}
          </span>
        </div>
      ))}
    </div>
  );
}
