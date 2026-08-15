import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

interface TransactionHeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  onAdd: () => void;
}

export function TransactionHeader({
  onSync,
  isSyncing,
  onAdd,
}: TransactionHeaderProps) {
  return (
    <PageHeader
      title="Transaction"
      description="Manage income and expenses"
    >
      <Button
        variant="outline"
        onClick={onSync}
        disabled={isSyncing}
        className="flex items-center gap-2 rounded-full bg-white text-sky-400 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
        ) : (
          <RefreshCw className="h-4 w-4 text-sky-400" />
        )}
        <span className="font-medium text-sm">Sync Transaction</span>
      </Button>

      <Button
        className="flex items-center gap-2 rounded-full bg-[#42A5F5] hover:bg-[#2196F3] text-white border-0 shadow-sm transition-all"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4 text-white" />
        <span className="font-medium text-sm">Add Transaction</span>
      </Button>
    </PageHeader>
  );
}
