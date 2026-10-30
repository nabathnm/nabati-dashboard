"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ExperienceType =
  "internship" | "organization" | "freelance" | "full-time" | "part-time";

const experienceTypes: {
  value: ExperienceType;
  label: string;
}[] = [
  {
    value: "internship",
    label: "Internship",
  },
  {
    value: "organization",
    label: "Organization",
  },
  {
    value: "freelance",
    label: "Freelance",
  },
  {
    value: "full-time",
    label: "Full Time",
  },
  {
    value: "part-time",
    label: "Part Time",
  },
];

export default function CreateExperiencePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    task: "",
    year: "",
    is_current: false,
    location: "",
    type: "" as ExperienceType | "",
    image_url: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title || null,
          company: form.company || null,
          description: form.description || null,
          task: form.task || null,
          year: form.year || null,
          is_current: form.is_current,
          location: form.location || null,
          type: form.type || null,
          image_url: form.image_url || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat experience");
      }

      router.push("/experiences");
      router.refresh();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Terjadi kesalahan saat membuat experience"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/experiences")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Experience</h1>
          <p className="text-muted-foreground">
            Tambahkan pengalaman kerja atau organisasi baru.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Experience Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Frontend Developer"
                  value={form.title}
                  onChange={event =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company / Organization</Label>
                <Input
                  id="company"
                  placeholder="Raion Community"
                  value={form.company}
                  onChange={event =>
                    setForm({
                      ...form,
                      company: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>

                <select
                  id="type"
                  value={form.type}
                  onChange={event =>
                    setForm({
                      ...form,
                      type: event.target.value as ExperienceType,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih type</option>

                  {experienceTypes.map(item => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  placeholder="2025 - 2026"
                  value={form.year}
                  onChange={event =>
                    setForm({
                      ...form,
                      year: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Malang, Indonesia"
                  value={form.location}
                  onChange={event =>
                    setForm({
                      ...form,
                      location: event.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={event =>
                    setForm({
                      ...form,
                      image_url: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Current Experience</p>
                <p className="text-sm text-muted-foreground">
                  Aktifkan jika experience ini masih berlangsung.
                </p>
              </div>

              <Switch
                checked={form.is_current}
                onCheckedChange={checked =>
                  setForm({
                    ...form,
                    is_current: checked,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat mengenai pengalaman..."
                rows={4}
                value={form.description}
                onChange={event =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Task</Label>
              <Textarea
                id="task"
                placeholder="Tugas dan tanggung jawab..."
                rows={6}
                value={form.task}
                onChange={event =>
                  setForm({
                    ...form,
                    task: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/experiences")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Experience
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
