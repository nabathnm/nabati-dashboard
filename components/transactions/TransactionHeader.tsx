import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

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
      title="Transaksi"
      description="Pantau pemasukan, pengeluaran, dan sinkronkan otomatis dari Gmail"
    >
      <Button
        variant="secondary"
        onClick={onSync}
        disabled={isSyncing}
        className="gap-2 cursor-pointer"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
        <span>{isSyncing ? "Menyinkronkan..." : "Sync Gmail"}</span>
      </Button>

      <Button
        onClick={onAdd}
        className="gap-2 cursor-pointer shadow-xs"
      >
        <Plus className="w-4 h-4" />
        Tambah Transaksi
      </Button>
    </PageHeader>
  );
}
