"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Tool {
  id: number;
  name: string | null;
  category:
    "frontend" | "backend" | "mobile" | "database" | "cloud" | "infrastructure" | null;
  svg: string | null;
}

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  cloud: "Cloud",
  infrastructure: "Infrastructure",
};

export default function ToolsPage() {
  const router = useRouter();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const getTools = useCallback(async (): Promise<Tool[]> => {
    const response = await fetch("/api/tools", {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data tools");
    }

    const data = await response.json();

    return Array.isArray(data) ? data : data.tools || [];
  }, []);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTools();
      setTools(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [getTools]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus tool ini?");

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus tool");
      }

      fetchTools();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus tool");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tools</h1>

          <p className="text-muted-foreground">
            Kelola tools dan teknologi yang digunakan.
          </p>
        </div>

        <Button onClick={() => router.push("/tools/create")} className="gap-2">
          <Plus className="size-4" />
          Tambah Tool
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tools.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Belum ada tool yang tersimpan.</p>

          <Button
            variant="outline"
            onClick={() => router.push("/tools/create")}
            className="mt-4 gap-2"
          >
            <Plus className="size-4" />
            Tambah Tool Pertama
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && tools.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Tool</th>

                  <th className="px-6 py-4 text-left font-medium">Category</th>

                  <th className="px-6 py-4 text-left font-medium">SVG</th>

                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {tools.map(tool => (
                  <tr key={tool.id} className="transition-colors hover:bg-muted/30">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <span className="font-medium">{tool.name || "Tanpa Nama"}</span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {tool.category ? (
                        <Badge variant="outline">
                          {categoryLabels[tool.category] || tool.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* SVG Preview */}
                    <td className="px-6 py-4">
                      {tool.svg ? (
                        <div
                          className="flex size-10 items-center justify-center rounded-md border bg-background p-1"
                          dangerouslySetInnerHTML={{
                            __html: tool.svg,
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Tool"
                          onClick={() => router.push(`/tools/${tool.id}/edit`)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Hapus Tool"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tool.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
