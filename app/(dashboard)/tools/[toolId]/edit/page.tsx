"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

type ToolCategory =
  "frontend" | "backend" | "mobile" | "database" | "cloud" | "infrastructure";

interface Tool {
  id: number;
  name: string | null;
  category: ToolCategory | null;
  svg: string | null;
}

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

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();

  const toolId = params.toolId as string;

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");

  const [category, setCategory] = useState<ToolCategory>("frontend");

  const [svg, setSvg] = useState("");

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  /**
   * Fetch existing tool
   */
  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/tools/${toolId}`, {
          headers: authHeaders(),
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data tool");
        }

        const data: Tool = await response.json();

        setName(data.name ?? "");

        setCategory(data.category ?? "frontend");

        setSvg(data.svg ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (toolId) {
      fetchTool();
    }
  }, [toolId]);

  /**
   * Submit update
   */
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
      const response = await fetch(`/api/tools/${toolId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui tool");
      }

      router.push("/tools");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui tool"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /**
   * Error ketika gagal mengambil data
   */
  if (error && !name) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/tools")} className="gap-2">
          <ArrowLeft className="size-4" />
          Kembali
        </Button>

        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

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

        <h1 className="text-2xl font-bold tracking-tight">Edit Tool</h1>

        <p className="text-muted-foreground">Perbarui informasi tool.</p>
      </div>

      {/* Error */}
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

            <p className="mt-1 text-sm text-muted-foreground">Perbarui SVG icon tool.</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={svg}
              onChange={e => setSvg(e.target.value)}
              rows={10}
              placeholder="<svg>...</svg>"
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

            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
