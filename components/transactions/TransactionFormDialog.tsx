import React, { useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeftRight, DollarSign, CreditCard, Tag, CalendarDays, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTransactionSchema, type CreateTransactionFormValues } from "@/lib/schemas/transaction";
import { typeConfig } from "./transaction-config";
import type { TransactionType, Account, TransactionCategory } from "@/types/database";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateTransactionFormValues) => Promise<void>;
  isPending: boolean;
  accounts: Account[] | undefined;
  categories: TransactionCategory[] | undefined;
  initialType?: TransactionType | null;
  initialDate?: Date;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  accounts,
  categories,
  initialType,
  initialDate,
}: TransactionFormDialogProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<CreateTransactionFormValues>({
      resolver: zodResolver(createTransactionSchema) as any,
      defaultValues: {
        type: initialType || "expense",
        date: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        amount: 0,
      },
    });

  const watchType = watch("type");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        type: initialType || "expense",
        date: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        amount: 0,
      });
    }
  }, [open, initialType, initialDate, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Transaction
          </div>
          <DialogTitle className="text-xl font-bold">
            New Transaction
          </DialogTitle>
        </DialogHeader>

        <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5 overflow-y-auto">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["expense", "income", "transfer"] as const).map((t) => {
              const cfg = typeConfig[t];
              const isActive = watchType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-semibold transition-all
                          ${isActive
                      ? `${cfg.bg} ${cfg.color} shadow-sm`
                      : "border-input bg-muted/40 text-muted-foreground hover:bg-muted/60"
                    }`}
                >
                  <cfg.icon className={`h-4 w-4 ${isActive ? cfg.color : "text-muted-foreground"}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Amount
            </Label>
            <Input
              type="number"
              placeholder="0"
              className="h-11 text-lg font-bold border-input bg-muted/40 rounded-xl focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors shadow-sm"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-rose-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Account
            </Label>
            <Select onValueChange={(v) => { if (v) setValue("account_id", v as string); }}>
              <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {(accounts ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && (
              <p className="text-xs text-rose-500">{errors.account_id.message}</p>
            )}
          </div>

          {/* Transfer destination */}
          {watchType === "transfer" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Transfer To
              </Label>
              <Select onValueChange={(v) => { if (v) setValue("destination_account_id", v as string); }}>
                <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(accounts ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category */}
          {watchType !== "transfer" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Category
              </Label>
              <Select onValueChange={(v) => { if (v) setValue("category_id", v as string); }}>
                <SelectTrigger className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus:ring-1 focus:ring-ring/40">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(categories ?? [])
                    .filter((c) => c.type === watchType)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Date
            </Label>
            <Input
              type="date"
              className="h-11 border-input bg-muted/40 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors"
              {...register("date")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Description
            </Label>
            <Textarea
              placeholder="Optional description..."
              rows={2}
              className="resize-none min-h-20 border-input bg-muted/40 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-ring/40 transition-colors"
              {...register("description")}
            />
          </div>
        </form>
        <div className="px-6 pb-6 pt-4 border-t border-border/50 bg-muted/10">
          <Button
            type="submit"
            form="transaction-form"
            disabled={isPending}
            className="w-full h-11"
          >
            {isPending ? "Adding..." : "Add Transaction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
