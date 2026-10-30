"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectPayload {
  name: string;
  description: string;
  category: string;
  features: string[];
  tech_stacks: string[];
  github_url: string;
  project_url: string;
  image_url: string;
}

export default function CreateProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProjectPayload>({
    name: "",
    description: "",
    category: "",
    features: [""],
    tech_stacks: [""],
    github_url: "",
    project_url: "",
    image_url: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ProjectPayload, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const addArrayItem = (field: "features" | "tech_stacks") => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "features" | "tech_stacks", index: number) => {
    setForm(prev => {
      const updated = prev[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...prev,
        [field]: updated.length > 0 ? updated : [""],
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    const payload: ProjectPayload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),

      features: form.features.map(item => item.trim()).filter(Boolean),

      tech_stacks: form.tech_stacks.map(item => item.trim()).filter(Boolean),

      github_url: form.github_url.trim(),
      project_url: form.project_url.trim(),
      image_url: form.image_url.trim(),
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      router.push("/projects");
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Create Project
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new project to your portfolio.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>

              <p className="mt-1 text-sm text-gray-500">
                Provide the basic information about your project.
              </p>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder="e.g. Brawigo"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={e => handleChange("description", e.target.value)}
                  placeholder="Describe your project..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={e => handleChange("category", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option value="">Select category</option>
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
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Features</h2>

              <p className="mt-1 text-sm text-gray-500">
                Add the main features included in this project.
              </p>
            </div>

            <div className="space-y-3">
              {form.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => handleArrayChange("features", index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => removeArrayItem("features", index)}
                    className="rounded-lg border border-gray-300 px-3 text-gray-500 hover:bg-gray-50 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem("features")}
              className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              + Add Feature
            </button>
          </section>

          {/* Tech Stack */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Technology Stack</h2>

              <p className="mt-1 text-sm text-gray-500">
                Specify the technologies used to build this project.
              </p>
            </div>

            <div className="space-y-3">
              {form.tech_stacks.map((tech, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tech}
                    onChange={e =>
                      handleArrayChange("tech_stacks", index, e.target.value)
                    }
                    placeholder={`Technology ${index + 1}`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => removeArrayItem("tech_stacks", index)}
                    className="rounded-lg border border-gray-300 px-3 text-gray-500 hover:bg-gray-50 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem("tech_stacks")}
              className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              + Add Technology
            </button>
          </section>

          {/* Links */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Project Links</h2>

              <p className="mt-1 text-sm text-gray-500">
                Add links related to your project.
              </p>
            </div>

            <div className="space-y-5">
              {/* Github */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  GitHub URL
                </label>

                <input
                  type="url"
                  value={form.github_url}
                  onChange={e => handleChange("github_url", e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Project URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project URL
                </label>

                <input
                  type="url"
                  value={form.project_url}
                  onChange={e => handleChange("project_url", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Image URL
                </label>

                <input
                  type="url"
                  value={form.image_url}
                  onChange={e => handleChange("image_url", e.target.value)}
                  placeholder="https://example.com/project-image.png"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Use a publicly accessible image URL.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
