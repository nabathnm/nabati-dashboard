"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink, GitBranch, Loader2 } from "lucide-react";

interface Project {
  id: number;
  name: string | null;
  description: string | null;
  category: string | null;
  features: string[];
  github_url: string | null;
  project_url: string | null;
  image_url: string | null;
  tech_stacks: string[];
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const getProjects = useCallback(async (): Promise<Project[]> => {
    const res = await fetch("/api/projects", {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data project");
    }

    const data = await res.json();

    return Array.isArray(data) ? data : data.projects || [];
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [getProjects]);

  useEffect(() => {
    let active = true;

    getProjects()
      .then(data => {
        if (active) {
          setProjects(data);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getProjects]);

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus project ini?");

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus project");
      }

      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Project</h1>

          <p className="text-muted-foreground">
            Kelola daftar project, teknologi, dan tautan aplikasi Anda di sini.
          </p>
        </div>

        {/* Redirect ke halaman Create */}
        <Button onClick={() => router.push("/projects/create")} className="gap-2">
          <Plus className="size-4" />
          Tambah Project
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
      {!loading && !error && projects.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Belum ada project yang tersimpan.</p>

          <Button
            variant="outline"
            onClick={() => router.push("/projects/create")}
            className="mt-4 gap-2"
          >
            <Plus className="size-4" />
            Tambah Project Pertama
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && projects.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Project</th>

                  <th className="px-6 py-4 text-left font-medium">Category</th>

                  <th className="px-6 py-4 text-left font-medium">Tech Stack</th>

                  <th className="px-6 py-4 text-left font-medium">Links</th>

                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {projects.map(project => (
                  <tr key={project.id} className="transition-colors hover:bg-muted/30">
                    {/* Project */}
                    <td className="px-6 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-medium">{project.name || "Tanpa Judul"}</p>

                        <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                          {project.description || "Tidak ada deskripsi."}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {project.category ? (
                        <Badge variant="outline">{project.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Tech Stack */}
                    <td className="px-6 py-4">
                      <div className="flex max-w-[280px] flex-wrap gap-1.5">
                        {project.tech_stacks?.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}

                        {project.tech_stacks && project.tech_stacks.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tech_stacks.length - 3}
                          </Badge>
                        )}

                        {(!project.tech_stacks || project.tech_stacks.length === 0) && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub Repository"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <GitBranch className="size-4" />
                          </a>
                        )}

                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Live Project"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        )}

                        {!project.github_url && !project.project_url && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Project"
                          onClick={() => router.push(`/projects/${project.id}/edit`)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Hapus Project"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(project.id)}
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
