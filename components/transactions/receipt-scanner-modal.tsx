"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Sparkles, X, Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveAccounts } from "@/hooks/use-accounts";
import { useTransactionCategories, useCreateTransaction } from "@/hooks/use-transactions";
import { transactionsService } from "@/services/transactions.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/hooks/use-currency";
import { toTitleCase } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface ScannedItem {
  id: string;
  name: string;
  price: number;
  category_name: string;
  category_id?: string;
}

export function ReceiptScannerModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [accountId, setAccountId] = useState<string>("");
  const [items, setItems] = useState<ScannedItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: accounts } = useActiveAccounts();
  const { data: categories } = useTransactionCategories();
  const createMutation = useCreateTransaction();
  const queryClient = useQueryClient();

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target?.result as string;
      setImagePreview(base64String);

      // Extract base64 payload
      const base64Payload = base64String.split(",")[1];
      const mimeType = file.type;

      // Start scanning
      await scanReceipt(base64Payload, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const scanReceipt = async (base64: string, mimeType: string) => {
    setStep("scanning");
    try {
      const response = await fetch("/api/receipt/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!response.ok) {
        throw new Error("Failed to scan receipt");
      }

      const data = await response.json();

      setMerchant(toTitleCase(data.merchant || "Unknown Merchant"));
      if (data.date) {
        // basic validation of date format
        if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          setDate(data.date);
        }
      }

      // Map categories
      const mappedItems = (data.items || []).map((item: any, idx: number) => {
        // Try to find matching category by name
        const match = categories?.find(c =>
          c.name.toLowerCase().includes(item.category_name?.toLowerCase() || "") ||
          (item.category_name || "").toLowerCase().includes(c.name.toLowerCase())
        );

        return {
          id: Date.now().toString() + idx,
          name: item.name,
          price: item.price,
          category_name: item.category_name,
          category_id: match?.id,
        };
      });

      setItems(mappedItems);
      setStep("review");
      toast.success("Receipt scanned successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Error scanning receipt: " + error.message);
      setStep("upload");
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!accountId) {
      toast.error("Please select an account to pay from");
      return;
    }

    if (items.length === 0) {
      toast.error("No items to save");
      return;
    }

    // Verify all items have categories
    if (items.some(i => !i.category_id)) {
      toast.error("Please select a category for all items");
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price), 0);

    // Fallback main category (use first item's category or find a generic 'Shopping' one)
    const fallbackCategoryId = items[0]?.category_id;

    try {
      // SMART MERGE CHECK
      const existing = await transactionsService.findByAmountAndDate(totalAmount, date, "expense");

      if (existing && existing.length > 0) {
        // Find the one that matches best or just use the first one
        const targetTx = existing[0];

        await transactionsService.attachItemsToTransaction(
          targetTx.id,
          toTitleCase(merchant),
          items.map(i => ({
            name: toTitleCase(i.name),
            amount: Number(i.price),
            category_id: i.category_id,
          }))
        );

        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        toast.success("Receipt merged with an existing transaction!");
      } else {
        await createMutation.mutateAsync({
          account_id: accountId,
          category_id: fallbackCategoryId,
          type: "expense",
          amount: totalAmount,
          description: `Receipt from ${toTitleCase(merchant)}`,
          date: date,
          items: items.map(i => ({
            name: toTitleCase(i.name),
            amount: Number(i.price),
            category_id: i.category_id,
          }))
        });
      }

      handleOpenChange(false);
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // reset state
      setTimeout(() => {
        setStep("upload");
        setImagePreview(null);
        setItems([]);
        setMerchant("");
        setAccountId("");
      }, 200);
    }
  };

  const updateItem = (id: string, field: keyof ScannedItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: "New Item",
      price: 0,
      category_name: "",
      category_id: categories?.[0]?.id,
    }]);
  };

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const expenseCategories = categories?.filter(c => c.type === "expense") || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button
          variant="outline"
          className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 rounded-xl h-10 shadow-sm font-semibold transition-all group"
        />
      }>
        <Sparkles className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
        AI Scan Receipt
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Receipt Scanner
          </div>
          <DialogTitle className="text-xl font-bold">
            Scan & Auto-categorize
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 bg-slate-50/50">
          {step === "upload" && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">Take Photo or Upload</h3>
                <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                  JPEG, PNG, or WEBP up to 5MB
                </p>
              </div>
            </div>
          )}

          {step === "scanning" && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-32 h-32 mb-8">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover rounded-2xl opacity-50 grayscale"
                  />
                )}
                {/* Scanner animation overlay */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-indigo-200">
                  <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_3px_rgba(99,102,241,0.6)] animate-scan-line" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-2">Analyzing Receipt...</h3>
              <p className="text-sm text-slate-500 font-medium">Extracting items, prices, and categories</p>
            </div>
          )}

          {step === "review" && (
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              {/* Left Column: Image & Meta */}
              <div className="w-full lg:w-1/3 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[250px]">
                  {imagePreview && (
                    <img src={imagePreview} alt="Scanned Receipt" className="w-full object-contain bg-slate-100" />
                  )}
                </div>

                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Merchant</Label>
                    <Input
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="h-9 text-sm font-semibold rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-9 text-sm font-semibold rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Pay From Account</Label>
                    <Select value={accountId || null} onValueChange={(val) => setAccountId(val || "")}>
                      <SelectTrigger className="h-9 text-sm font-semibold rounded-xl">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {(accounts ?? []).map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column: Items */}
              <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                  <h3 className="text-sm font-bold text-slate-700">Scanned Items ({items.length})</h3>
                  <Button variant="ghost" size="sm" onClick={addItem} className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row gap-2 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors relative">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Item name"
                            className="h-8 text-sm font-medium rounded-lg bg-white"
                          />
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", e.target.value)}
                            className="h-8 text-sm font-bold w-[100px] tabular-nums rounded-lg bg-white"
                          />
                        </div>
                        <Select value={item.category_id} onValueChange={(val) => updateItem(item.id, "category_id", val)}>
                          <SelectTrigger className={`h-8 text-xs rounded-lg bg-white ${!item.category_id ? 'border-rose-300 ring-1 ring-rose-300/50 text-rose-600' : ''}`}>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-[200px]">
                            {expenseCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === "review" && (
          <div className="p-4 border-t border-border/50 flex justify-end gap-3 flex-shrink-0">
            <Button variant="outline" onClick={() => setStep("upload")} className="h-11 rounded-xl border-input bg-background hover:bg-accent">
              Scan Another
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="h-11 px-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm border-0 font-bold"
            >
              {createMutation.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
