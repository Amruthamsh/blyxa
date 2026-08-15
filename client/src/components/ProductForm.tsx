import { useState } from "react";
import type { FormEvent } from "react";
import {
  ART_PALETTES,
  ART_VARIANTS,
  PLANT_CATEGORIES,
} from "../data/plants";
import type { PlantArtVariant } from "../data/plants";
import { emptyPlantInput } from "../store/plantInput";
import type { PlantInput } from "../store/plantInput";
import { PlantIcon } from "./PlantIcon";

interface ProductFormProps {
  title: string;
  initial?: PlantInput;
  onSave: (input: PlantInput) => void;
  onClose: () => void;
}

const fieldClasses =
  "w-full rounded-xl border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-900 outline-none placeholder:text-stone-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200";

export function ProductForm({
  title,
  initial,
  onSave,
  onClose,
}: ProductFormProps) {
  const [form, setForm] = useState<PlantInput>(
    initial ? { ...initial } : emptyPlantInput(),
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PlantInput>(key: K, value: PlantInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required.");
      return;
    }
    if (Number.isNaN(form.price) || form.price < 0) {
      setError("Price must be a positive number.");
      return;
    }
    if (Number.isNaN(form.stockCount) || form.stockCount < 0) {
      setError("Stock must be zero or more.");
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      latin: form.latin.trim(),
      description: form.description.trim(),
      tag: form.tag.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-leaf-950/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="animate-pop relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold text-leaf-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-leaf-50 hover:text-leaf-900"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="e.g. Monstera Deliciosa"
                  className={fieldClasses}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Latin name
                </span>
                <input
                  type="text"
                  value={form.latin}
                  onChange={(event) => set("latin", event.target.value)}
                  placeholder="e.g. Monstera deliciosa"
                  className={fieldClasses}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Price (USD)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    set("price", Number(event.target.value))
                  }
                  className={fieldClasses}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Stock count
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockCount}
                  onChange={(event) =>
                    set("stockCount", Math.floor(Number(event.target.value)))
                  }
                  className={fieldClasses}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Category
                </span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    set("category", event.target.value as PlantInput["category"])
                  }
                  className={fieldClasses}
                >
                  {PLANT_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-600">
                  Tag <span className="text-stone-400">(optional)</span>
                </span>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(event) => set("tag", event.target.value)}
                  placeholder="e.g. Bestseller"
                  className={fieldClasses}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-600">
                Description <span className="text-red-500">*</span>
              </span>
              <textarea
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                rows={3}
                placeholder="A short, inviting description for the shop…"
                className={`${fieldClasses} resize-none`}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-art p-4">
              <PlantIcon
                variant={form.art}
                pot={form.pot}
                leaf={form.leaf}
                accent={form.accent}
                className="mx-auto h-32 w-40"
              />
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-600">
                Illustration
              </span>
              <select
                value={form.art}
                onChange={(event) =>
                  set("art", event.target.value as PlantArtVariant)
                }
                className={fieldClasses}
              >
                {ART_VARIANTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-stone-600">
                Colors
              </span>
              <div className="flex flex-wrap gap-2">
                {ART_PALETTES.map((palette, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        pot: palette.pot,
                        leaf: palette.leaf,
                        accent: palette.accent,
                      }))
                    }
                    aria-label={`Color palette ${index + 1}`}
                    className={`flex h-9 items-center gap-1 rounded-full border-2 p-1 transition-colors ${
                      form.pot === palette.pot &&
                      form.leaf === palette.leaf &&
                      form.accent === palette.accent
                        ? "border-leaf-600"
                        : "border-transparent hover:border-leaf-300"
                    }`}
                  >
                    <span
                      className="size-6 rounded-full border border-black/10"
                      style={{ backgroundColor: palette.pot }}
                    />
                    <span
                      className="size-6 rounded-full border border-black/10"
                      style={{ backgroundColor: palette.leaf }}
                    />
                    <span
                      className="size-6 rounded-full border border-black/10"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-leaf-200 px-5 py-2.5 text-sm font-semibold text-leaf-800 transition-colors hover:bg-leaf-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-leaf-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-leaf-700/30 transition-colors hover:bg-leaf-800"
          >
            Save product
          </button>
        </div>
      </form>
    </div>
  );
}
