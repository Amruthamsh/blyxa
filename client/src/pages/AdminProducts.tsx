import { useState } from "react";
import { ProductForm } from "../components/ProductForm";
import { PlantIcon } from "../components/PlantIcon";
import { stockLevel } from "../data/plants";
import type { PlantInput } from "../store/plantInput";
import { usePlants } from "../store/plantsContextValue";

export function AdminProducts() {
  const { plants, addPlant, updatePlant, deletePlant } = usePlants();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; input: PlantInput } | null>(
    null,
  );

  const handleSave = (input: PlantInput) => {
    if (editing) {
      updatePlant(editing.id, input);
      setEditing(null);
    } else {
      addPlant(input);
    }
    setFormOpen(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    const plant = plants.find((candidate) => candidate.id === id);
    if (!plant) return;
    setEditing({
      id,
      input: { ...plant, tag: plant.tag ?? "" },
    });
    setFormOpen(true);
  };

  const restock = (id: string) => {
    const plant = plants.find((candidate) => candidate.id === id);
    if (!plant) return;
    updatePlant(id, { stockCount: Math.max(plant.stockCount, 5) });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-leaf-950">
            Products
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {plants.length} products in your catalogue. Changes apply to the
            shop instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-full bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-leaf-700/30 transition-colors hover:bg-leaf-800"
        >
          + Add product
        </button>
      </div>

      <div className="space-y-3">
        {plants.map((plant) => {
          const stock = stockLevel(plant);
          return (
            <div
              key={plant.id}
              className="flex flex-col gap-4 rounded-2xl border border-leaf-100 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-art">
                <PlantIcon
                  variant={plant.art}
                  pot={plant.pot}
                  leaf={plant.leaf}
                  accent={plant.accent}
                  className="h-14 w-16"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-leaf-900">
                    {plant.name}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      stock === "out"
                        ? "bg-stone-200 text-stone-500"
                        : stock === "low"
                          ? "bg-sun-200 text-sun-700"
                          : "bg-leaf-100 text-leaf-800"
                    }`}
                  >
                    {stock === "out"
                      ? "Out of stock"
                      : stock === "low"
                        ? "Low stock"
                        : "In stock"}
                  </span>
                  <span className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                    {plant.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-stone-500">
                  {plant.description}
                </p>
                <p className="mt-1 text-sm font-semibold text-leaf-800">
                  ${plant.price.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updatePlant(plant.id, {
                        stockCount: Math.max(0, plant.stockCount - 1),
                      })
                    }
                    aria-label={`Decrease stock of ${plant.name}`}
                    className="flex size-8 items-center justify-center rounded-full border border-leaf-200 text-leaf-700 transition-colors hover:bg-leaf-100"
                  >
                    −
                  </button>
                  <span className="w-16 text-center text-sm font-semibold">
                    {plant.stockCount} in stock
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePlant(plant.id, {
                        stockCount: plant.stockCount + 1,
                      })
                    }
                    aria-label={`Increase stock of ${plant.name}`}
                    className="flex size-8 items-center justify-center rounded-full border border-leaf-200 text-leaf-700 transition-colors hover:bg-leaf-100"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {plant.stockCount === 0 ? (
                    <button
                      type="button"
                      onClick={() => restock(plant.id)}
                      className="rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold text-leaf-800 transition-colors hover:bg-leaf-200"
                    >
                      Back in stock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updatePlant(plant.id, { stockCount: 0 })}
                      className="rounded-full border border-stone-300 px-4 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-100"
                    >
                      Mark sold out
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(plant.id)}
                    className="rounded-full bg-leaf-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-leaf-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${plant.name}" from the catalogue?`,
                        )
                      ) {
                        deletePlant(plant.id);
                      }
                    }}
                    aria-label={`Delete ${plant.name}`}
                    className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <ProductForm
          title={editing ? "Edit product" : "Add a new product"}
          initial={editing?.input}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
