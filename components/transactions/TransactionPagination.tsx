import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export function TransactionPagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: TransactionPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border/50 px-5 py-3 bg-muted/20">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-semibold text-foreground">{page}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
        <span className="text-muted-foreground/70 ml-1">({totalCount} total)</span>
      </p>
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
