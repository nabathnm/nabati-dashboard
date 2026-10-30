"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

type ToolCategory =
  "frontend" | "backend" | "mobile" | "database" | "cloud" | "infrastructure";

const categories: {
  value: ToolCategory;
  label: string;
}[] = [
  {
    value: "frontend",
    label: "Frontend",
  },
  {
    value: "backend",
    label: "Backend",
  },
  {
    value: "mobile",
    label: "Mobile",
  },
  {
    value: "database",
    label: "Database",
  },
  {
    value: "cloud",
    label: "Cloud",
  },
  {
    value: "infrastructure",
    label: "Infrastructure",
  },
];

export default function CreateToolPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ToolCategory>("frontend");
  const [svg, setSvg] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim() || null,
      category,
      svg: svg.trim() || null,
    };

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat tool");
      }

      router.push("/tools");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat membuat tool"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/tools")}
          className="-ml-2 mb-4 gap-2"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Tools
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">Tambah Tool</h1>

        <p className="text-muted-foreground">Tambahkan tool baru ke dalam daftar.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Information */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-semibold">Tool Information</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Informasi dasar mengenai tool.
            </p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Tool
                <span className="ml-1 text-destructive">*</span>
              </label>

              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Next.js"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category
                <span className="ml-1 text-destructive">*</span>
              </label>

              <select
                value={category}
                onChange={e => setCategory(e.target.value as ToolCategory)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                required
              >
                {categories.map(item => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* SVG */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-semibold">SVG Icon</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Masukkan kode SVG untuk icon tool.
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              value={svg}
              onChange={e => setSvg(e.target.value)}
              placeholder={`<svg
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  ...
</svg>`}
              rows={10}
              className="w-full resize-y rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />

            {/* Preview */}
            {svg.trim() && (
              <div>
                <p className="mb-2 text-sm font-medium">Preview</p>

                <div className="flex min-h-24 items-center justify-center rounded-lg border bg-muted/20 p-6">
                  <div
                    className="size-16"
                    dangerouslySetInnerHTML={{
                      __html: svg,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/tools")}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting && <Loader2 className="size-4 animate-spin" />}

            {submitting ? "Menyimpan..." : "Tambah Tool"}
          </Button>
        </div>
      </form>
    </div>
  );
}
