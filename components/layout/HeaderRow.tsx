import React from "react";
import { cn } from "@/lib/utils";

interface HeaderRowProps {
  labels: string[];
  prefix?: React.ReactNode;
}

export function HeaderRow({ labels, prefix }: HeaderRowProps) {
  return (
    <div className="flex border-b border-primary/20 bg-primary">
      {prefix && (
        <div className="shrink-0 border-r border-primary/20">
          {prefix}
        </div>
      )}
      {labels.map((label, i) => (
        <div 
          key={i} 
          className="flex-1 py-3 text-center border-r border-primary/20 last:border-0"
        >
          <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}