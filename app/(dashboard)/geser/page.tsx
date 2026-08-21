"use client";

import React, { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { SpinWheel } from "@/components/hangout/spin-wheel";
import { SpotDetailModal } from "@/components/hangout/spot-detail-modal";
import { HangoutSpot, HangoutVibe, PriceLevel } from "@/types/hangout";
import { geserService } from "@/services/geser.service";
import {
  Sparkles,
  Compass,
  MapPin,
  Coffee,
  RotateCw,
  SlidersHorizontal,
  Star,
  Search,
  History,
  TrendingUp,
  Flame,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const vibeOptions: { id: HangoutVibe; label: string }[] = [
  { id: "all", label: "Semua Suasana" },
  { id: "nugas", label: "Nugas & WiFi Kencang" },
  { id: "aesthetic", label: "Aesthetic & Spot Foto" },
  { id: "heritage", label: "Heritage Kayutangan" },
  { id: "night_view", label: "Night View & City Light" },
  { id: "budget_student", label: "Budget Mahasiswa" },
  { id: "nature_relax", label: "Asri & Hutan Rindang" },
];

export default function GeserPage() {
  const [selectedVibe, setSelectedVibe] = useState<HangoutVibe>("all");
  const [selectedBudget, setSelectedBudget] = useState<"all" | PriceLevel>("all");
  const [customPrompt, setCustomPrompt] = useState("");

  const [activeSpots, setActiveSpots] = useState<HangoutSpot[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedSpot, setSelectedSpot] = useState<HangoutSpot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinHistory, setSpinHistory] = useState<HangoutSpot[]>([]);

  // Generate Tempat Geser using AI API
  const handleGenerateSpots = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await geserService.generateSpots({
        vibe: selectedVibe,
        budget: selectedBudget,
        customPrompt: customPrompt.trim(),
        count: 8,
      });

      if (res.spots && res.spots.length > 0) {
        setActiveSpots(res.spots);
        setHasGenerated(true);
        if (res.source === "ai_generated") {
          toast.success("AI berhasil meracik 8 rekomendasi tempat nongkrong dekat UB!");
        } else {
          toast.info("Memuat 8 tempat nongkrong favorit terkurasi di Malang Raya.");
        }
      } else {
        toast.error("Gagal mendapatkan rekomendasi tempat. Coba lagi.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memanggil AI.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedVibe, selectedBudget, customPrompt]);

  const handleSpotWon = useCallback((spot: HangoutSpot) => {
    setSelectedSpot(spot);
    setIsModalOpen(true);
    setSpinHistory((prev) => [spot, ...prev.filter((p) => p.id !== spot.id)].slice(0, 6));
  }, []);

  const handleSpinAgain = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Compute stats matching TaskStats pattern
  const stats = useMemo(() => {
    const totalCount = activeSpots.length;
    const avgRating = totalCount > 0
      ? (activeSpots.reduce((acc, s) => acc + s.rating, 0) / totalCount).toFixed(1)
      : "—";

    return [
      {
        label: "Tempat di Roda",
        value: totalCount > 0 ? `${totalCount} Tempat` : "0 Tempat",
        icon: Compass,
        iconBg: "bg-blue-100 dark:bg-[#88c0d0]/20",
        iconColor: "text-blue-500 dark:text-[#88c0d0]",
        accent: "border-t-blue-400 dark:border-t-[#88c0d0]",
      },
      {
        label: "Lokasi Fokus",
        value: "Dekat UB & Malang",
        icon: MapPin,
        iconBg: "bg-emerald-100 dark:bg-[#a3be8c]/20",
        iconColor: "text-emerald-500 dark:text-[#a3be8c]",
        accent: "border-t-emerald-400 dark:border-t-[#a3be8c]",
      },
      {
        label: "Suasana Terpilih",
        value: selectedVibe === "all" ? "Semua Vibe" : vibeOptions.find(v => v.id === selectedVibe)?.label || "Custom",
        icon: Coffee,
        iconBg: "bg-amber-100 dark:bg-[#ebcb8b]/20",
        iconColor: "text-amber-500 dark:text-[#ebcb8b]",
        accent: "border-t-amber-400 dark:border-t-[#ebcb8b]",
      },
      {
        label: "Rating Rata-rata",
        value: avgRating !== "—" ? `${avgRating} ★` : "4.8 ★",
        icon: Star,
        iconBg: "bg-rose-100 dark:bg-[#bf616a]/20",
        iconColor: "text-rose-500 dark:text-[#bf616a]",
        accent: "border-t-rose-400 dark:border-t-[#bf616a]",
      },
      {
        label: "Status Roda",
        value: hasGenerated ? "Siap Diputar" : "Perlu Generate",
        icon: Flame,
        iconBg: "bg-indigo-100 dark:bg-[#81a1c1]/20",
        iconColor: "text-indigo-500 dark:text-[#81a1c1]",
        accent: "border-t-indigo-400 dark:border-t-[#81a1c1]",
      },
    ];
  }, [activeSpots, selectedVibe, hasGenerated]);

  return (
    <div className="space-y-6">
      {/* ─── 1. Header (Reusing PageHeader) ─── */}
      <PageHeader
        title="Geser — Nongkrong Dekat UB"
        description="Roda putar rekomendasi tempat nongkrong & nugas dekat kampus Universitas Brawijaya Malang bertenaga AI"
      >
        <Button
          onClick={handleGenerateSpots}
          disabled={isGenerating}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Generating AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {hasGenerated ? "Generate Ulang" : "Generate Tempat Geser"}
            </>
          )}
        </Button>
      </PageHeader>

      {/* ─── 2. Statistics Bar (Reusing TaskStats Pattern) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-card rounded-xl shadow-sm border border-border/50 border-t-2 ${stat.accent} p-4 transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <div className={`w-8 h-8 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ─── 3. Filter Bar (Reusing TaskFilters Pattern) ─── */}
      <div className="bg-card shadow-sm border border-border/50 px-4 py-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter icon label */}
          <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground hidden sm:block">
              Filter
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border shrink-0" />

          {/* Mood / Search prompt input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari vibe khusus (contoh: nugas bawa laptop dekat kampus UB / Suhat)..."
              className="pl-9 h-9 text-sm bg-muted/40 border-border/60 rounded-xl focus:bg-card focus:border-primary transition-colors"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerateSpots()}
            />
          </div>

          {/* Vibe filter select */}
          <Select
            value={selectedVibe}
            onValueChange={(v) => setSelectedVibe(v as HangoutVibe)}
          >
            <SelectTrigger className="w-[160px] h-9 text-sm bg-muted/40 border-border/60 rounded-xl hover:bg-card hover:border-primary transition-colors">
              <SelectValue placeholder="Semua Suasana" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {vibeOptions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Budget filter select */}
          <Select
            value={selectedBudget}
            onValueChange={(v) => setSelectedBudget(v as "all" | PriceLevel)}
          >
            <SelectTrigger className="w-[150px] h-9 text-sm bg-muted/40 border-border/60 rounded-xl hover:bg-card hover:border-primary transition-colors">
              <SelectValue placeholder="Semua Budget" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Budget</SelectItem>
              <SelectItem value="cheap">Ramah Kantong (&lt;25rb)</SelectItem>
              <SelectItem value="moderate">Menengah (25rb-50rb)</SelectItem>
              <SelectItem value="premium">Premium (50rb+)</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Trigger Button */}
          <Button
            onClick={handleGenerateSpots}
            disabled={isGenerating}
            size="sm"
            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1" />
            )}
            <span>Generate Tempat Geser</span>
          </Button>
        </div>
      </div>

      {/* ─── 4. Main Interactive Area: Spin Wheel & Spot Table ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Spin Wheel Card */}
        <div className="lg:col-span-6 bg-card rounded-xl shadow-sm border border-border/50 p-6 flex flex-col items-center justify-center min-h-[460px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Skeleton className="h-56 w-56 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-64 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
            </div>
          ) : hasGenerated && activeSpots.length > 0 ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  Roda Putar Geser ({activeSpots.length} Tempat)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Putar roda untuk memilih tempatmu
                </span>
              </div>
              <SpinWheel
                spots={activeSpots}
                onSpotSelected={handleSpotWon}
                className="w-full"
              />
            </div>
          ) : (
            /* Empty State (Reusing EmptyState design pattern from Task Manager) */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-sky-500/20 border border-primary/20">
                  <Compass className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              </div>

              <h3 className="text-lg font-bold tracking-tight mb-1 text-foreground">
                Roda Geser Belum Memiliki Data
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
                Tekan tombol <strong className="text-foreground">&quot;Generate Tempat Geser&quot;</strong> di atas untuk meminta AI menyusun daftar kafe pilihan dekat kampus Universitas Brawijaya.
              </p>

              <Button
                onClick={handleGenerateSpots}
                className="bg-primary text-primary-foreground font-semibold shadow-md cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Tempat Geser Sekarang
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Table of Spots (Reusing HeaderRow & TaskTable pattern) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <HeaderRow labels={["No", "Nama Tempat", "Area Sekitar UB", "Estimasi Harga", "Rating"]} />

              {!hasGenerated ? (
                <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground/60" />
                  <span>Daftar tempat akan muncul di sini setelah Anda mengklik tombol Generate.</span>
                </div>
              ) : (
                <div className="divide-y divide-border/40 bg-card">
                  {activeSpots.map((spot, idx) => (
                    <div
                      key={spot.id || idx}
                      onClick={() => handleSpotWon(spot)}
                      className="flex items-center hover:bg-muted/40 transition-colors cursor-pointer group px-4 py-3"
                    >
                      {/* No */}
                      <div className="w-10 shrink-0">
                        <span className="h-6 w-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-[140px] pr-2">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {spot.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {spot.tagline}
                        </p>
                      </div>

                      {/* Area */}
                      <div className="w-28 shrink-0 hidden sm:block">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border/50 truncate">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{spot.area}</span>
                        </span>
                      </div>

                      {/* Price */}
                      <div className="w-28 shrink-0 text-right pr-3 hidden md:block">
                        <span className="text-xs font-semibold text-foreground">
                          {spot.priceRange}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="w-16 shrink-0 text-right">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>{spot.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Spin History Log */}
          {spinHistory.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border/50 p-4">
              <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-4 w-4 text-amber-400" />
                  Riwayat Putaran Terakhir
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Klik untuk melihat detail & navigasi
                </span>
              </div>
              <div className="space-y-1.5">
                {spinHistory.map((spot, i) => (
                  <div
                    key={i}
                    onClick={() => handleSpotWon(spot)}
                    className="p-2.5 rounded-lg bg-muted/20 hover:bg-muted/50 border border-border/30 flex items-center justify-between text-xs cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-foreground truncate">{spot.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground">{spot.area}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 5. Spot Detail Modal (Reusing Dialog Primitive) ─── */}
      <SpotDetailModal
        spot={selectedSpot}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpinAgain={handleSpinAgain}
      />
    </div>
  );
}
