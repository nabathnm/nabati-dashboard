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
        variant="secondary"
        onClick={onSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin " />
        ) : (
          <RefreshCw className="h-4 w-4 " />
        )}
        Sync Transaction
      </Button>

      <Button
        onClick={onAdd}
      >
        <Plus className="w-4 h-4 " />
        Add Transaction
      </Button>
    </PageHeader>
  );
}
