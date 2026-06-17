import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10", className)}>
      <div>
        <h1 className={cn("text-2xl font-bold text-slate-800 tracking-tight", titleClassName)}>
          {title}
        </h1>
        {description && (
          <p className={cn("text-sm text-slate-500 mt-0.5", descriptionClassName)}>
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
