"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Experience {
  id: number;
  title: string | null;
  company: string | null;
  description: string | null;
  task: string | null;
  year: string | null;
  is_current: boolean;
  location: string | null;
  type: "internship" | "organization" | "freelance" | "full-time" | "part-time" | null;
  image_url: string | null;
}

const typeLabels: Record<NonNullable<Experience["type"]>, string> = {
  internship: "Internship",
  organization: "Organization",
  freelance: "Freelance",
  "full-time": "Full Time",
  "part-time": "Part Time",
};

export default function ExperiencesPage() {
  const router = useRouter();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/experiences", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data experiences");
      }

      const data = await response.json();

      setExperiences(Array.isArray(data) ? data : (data.experiences ?? []));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus experience ini?");

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      const response = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus experience");
      }

      setExperiences(prev => prev.filter(experience => experience.id !== id));
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus experience"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experiences</h1>
          <p className="text-muted-foreground">
            Kelola pengalaman kerja, organisasi, internship, dan freelance.
          </p>
        </div>

        <Button onClick={() => router.push("/experiences/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Experience
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Experiences</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : experiences.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada experience.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Experience</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Year</th>
                    <th className="px-4 py-3 text-left font-medium">Location</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {experiences.map(experience => (
                    <tr key={experience.id} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {experience.image_url ? (
                            <img
                              src={experience.image_url}
                              alt={experience.company ?? "Company"}
                              className="h-10 w-10 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-xs">
                              {experience.company?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-medium">{experience.title || "-"}</p>
                            <p className="text-muted-foreground">
                              {experience.company || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {experience.type ? (
                          <Badge variant="secondary">{typeLabels[experience.type]}</Badge>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4">{experience.year || "-"}</td>

                      <td className="px-4 py-4">{experience.location || "-"}</td>

                      <td className="px-4 py-4">
                        {experience.is_current ? (
                          <Badge>Current</Badge>
                        ) : (
                          <Badge variant="outline">Completed</Badge>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              router.push(`/experiences/${experience.id}/edit`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="icon"
                            disabled={deletingId === experience.id}
                            onClick={() => handleDelete(experience.id)}
                          >
                            {deletingId === experience.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
