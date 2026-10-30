"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

interface Project {
  id: number;
  name: string | null;
  description: string | null;
  category: string | null;
  features: string[];
  tech_stacks: string[];
  github_url: string | null;
  project_url: string | null;
  image_url: string | null;
}

interface ProjectForm {
  name: string;
  description: string;
  category: string;
  features: string[];
  tech_stacks: string[];
  github_url: string;
  project_url: string;
  image_url: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    category: "",
    features: [""],
    tech_stacks: [""],
    github_url: "",
    project_url: "",
    image_url: "",
  });

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  /**
   * Fetch project berdasarkan ID
   */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/projects/${projectId}`, {
          headers: authHeaders(),
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data project");
        }

        const data: Project = await response.json();

        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          category: data.category ?? "",

          features: data.features && data.features.length > 0 ? data.features : [""],

          tech_stacks:
            data.tech_stacks && data.tech_stacks.length > 0 ? data.tech_stacks : [""],

          github_url: data.github_url ?? "",
          project_url: data.project_url ?? "",
          image_url: data.image_url ?? "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  /**
   * Update field biasa
   */
  const handleChange = (
    field: keyof Omit<ProjectForm, "features" | "tech_stacks">,
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Update item pada array
   */
  const handleArrayChange = (
    field: "features" | "tech_stacks",
    index: number,
    value: string
  ) => {
    setForm(prev => {
      const updated = [...prev[field]];

      updated[index] = value;

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  /**
   * Tambah item array
   */
  const addArrayItem = (field: "features" | "tech_stacks") => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  /**
   * Hapus item array
   */
  const removeArrayItem = (field: "features" | "tech_stacks", index: number) => {
    setForm(prev => {
      const updated = prev[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...prev,
        [field]: updated.length > 0 ? updated : [""],
      };
    });
  };

  /**
   * Submit update
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    const payload = {
      name: form.name.trim() || null,

      description: form.description.trim() || null,

      category: form.category.trim() || null,

      features: form.features.map(feature => feature.trim()).filter(Boolean),

      tech_stacks: form.tech_stacks.map(tech => tech.trim()).filter(Boolean),

      github_url: form.github_url.trim() || null,

      project_url: form.project_url.trim() || null,

      image_url: form.image_url.trim() || null,
    };

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui project");
      }

      router.push("/projects");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui project"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /**
   * Error state
   */
  if (error && !form.name) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="gap-2"
        >
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="mb-4 -ml-2 gap-2"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Project
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>

        <p className="text-muted-foreground">Perbarui informasi project Anda.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold">Basic Information</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Informasi dasar mengenai project.
            </p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Project
                <span className="ml-1 text-destructive">*</span>
              </label>

              <Input
                value={form.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder="Contoh: Brawigo"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>

              <textarea
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Deskripsi project..."
                rows={5}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>

              <select
                value={form.category}
                onChange={e => handleChange("category", e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">Pilih category</option>

                <option value="Web Development">Web Development</option>

                <option value="Mobile Development">Mobile Development</option>

                <option value="Game Development">Game Development</option>

                <option value="IoT">IoT</option>

                <option value="Artificial Intelligence">Artificial Intelligence</option>

                <option value="UI/UX">UI/UX</option>

                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold">Features</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Fitur utama yang tersedia pada project.
            </p>
          </div>

          <div className="space-y-3">
            {form.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={e => handleArrayChange("features", index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem("features", index)}
                  title="Hapus feature"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem("features")}
            className="mt-4 gap-2"
          >
            <Plus className="size-4" />
            Tambah Feature
          </Button>
        </section>

        {/* Tech Stack */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold">Technology Stack</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Teknologi yang digunakan pada project.
            </p>
          </div>

          <div className="space-y-3">
            {form.tech_stacks.map((tech, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tech}
                  onChange={e => handleArrayChange("tech_stacks", index, e.target.value)}
                  placeholder={`Technology ${index + 1}`}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem("tech_stacks", index)}
                  title="Hapus technology"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem("tech_stacks")}
            className="mt-4 gap-2"
          >
            <Plus className="size-4" />
            Tambah Technology
          </Button>
        </section>

        {/* Links */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold">Project Links</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Link repository dan project.
            </p>
          </div>

          <div className="space-y-5">
            {/* GitHub */}
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>

              <Input
                type="url"
                value={form.github_url}
                onChange={e => handleChange("github_url", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project URL</label>

              <Input
                type="url"
                value={form.project_url}
                onChange={e => handleChange("project_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>

              <Input
                type="url"
                value={form.image_url}
                onChange={e => handleChange("image_url", e.target.value)}
                placeholder="https://example.com/project.png"
              />

              <p className="text-xs text-muted-foreground">
                Gunakan URL gambar yang dapat diakses secara publik.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projects")}
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
