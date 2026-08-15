import { useState } from "react";
import type { FormEvent } from "react";
import { formatPrice } from "../data/plants";
import { useOrders } from "../store/ordersContextValue";
import type { NewOrder, OrderItem, OrderStatus } from "../store/OrdersContext";
import { ORDER_STATUSES, STATUS_LABELS, STATUS_STYLES } from "../store/orderMeta";
import { usePlants } from "../store/plantsContextValue";

type Filter = "All" | OrderStatus;

export function AdminOrders() {
  const { orders, addOrder, setStatus, deleteOrder } = useOrders();
  const [filter, setFilter] = useState<Filter>("All");
  const [addOpen, setAddOpen] = useState(false);

  const visible = filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const pending = orders.filter((order) => order.status === "pending").length;
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-leaf-950">
            Orders
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Orders placed on the site are tracked here automatically. Log
            WhatsApp or phone orders with the button below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-full bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-leaf-700/30 transition-colors hover:bg-leaf-800"
        >
          + Add order
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total orders", value: String(orders.length), tone: "bg-leaf-100 text-leaf-900" },
          { label: "Pending", value: String(pending), tone: "bg-sun-200 text-sun-700" },
          { label: "Completed", value: String(orders.filter((o) => o.status === "delivered").length), tone: "bg-leaf-600 text-white" },
          { label: "Revenue", value: formatPrice(revenue), tone: "bg-white text-leaf-900" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl px-4 py-3 ring-1 ring-leaf-100 ${stat.tone}`}>
            <p className="text-[11px] font-semibold tracking-wide uppercase opacity-80">
              {stat.label}
            </p>
            <p className="font-display mt-1 text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...ORDER_STATUSES] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === option
                ? "bg-leaf-700 text-white shadow-sm shadow-leaf-700/30"
                : "bg-white text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50"
            }`}
          >
            {STATUS_LABELS[option as OrderStatus] ?? option}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-leaf-300 bg-white px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-art text-leaf-500">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-leaf-900">
              No orders here yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-stone-500">
              When a customer checks out on the site, their order will appear
              here as "Pending". You can also add WhatsApp or phone orders
              manually.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-leaf-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-stone-400">
                      #{order.id.slice(-6)}
                    </span>
                    <span className="font-display text-base font-semibold text-leaf-900">
                      {order.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(order.placedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-leaf-900">
                    {formatPrice(order.total)}
                  </p>
                  <select
                    value={order.status}
                    onChange={(event) =>
                      setStatus(order.id, event.target.value as OrderStatus)
                    }
                    aria-label={`Status for order ${order.name}`}
                    className="mt-1 rounded-full border border-leaf-200 bg-white px-2.5 py-1 text-xs font-semibold text-leaf-800 outline-none focus:border-leaf-500"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-3 space-y-1 border-t border-leaf-100 pt-3">
                {order.items.map((item) => (
                  <li
                    key={`${order.id}-${item.id}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-stone-600">
                      {item.qty} × {item.name}
                    </span>
                    <span className="font-medium text-stone-500">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.note && (
                <p className="mt-3 rounded-xl bg-sun-100 px-3 py-2 text-xs text-stone-600">
                  <span className="font-semibold">Note:</span> {order.note}
                </p>
              )}

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-leaf-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete order for ${order.name}?`)) {
                      deleteOrder(order.id);
                    }
                  }}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <AddOrderModal
          onClose={() => setAddOpen(false)}
          onSave={(order) => {
            addOrder(order);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AddOrderModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (order: NewOrder) => void;
}) {
  const { plants } = usePlants();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<OrderItem[]>([]);

  const inStock = plants.filter((plant) => plant.stockCount > 0);
  const selectedPlant = plants.find((plant) => plant.id === selectedId);

  const addItem = () => {
    if (!selectedPlant) return;
    const existing = items.find((item) => item.id === selectedPlant.id);
    if (existing) {
      setItems((current) =>
        current.map((item) =>
          item.id === selectedPlant.id
            ? { ...item, qty: item.qty + qty }
            : item,
        ),
      );
    } else {
      setItems((current) => [
        ...current,
        {
          id: selectedPlant.id,
          name: selectedPlant.name,
          price: selectedPlant.price,
          qty,
        },
      ]);
    }
    setSelectedId("");
    setQty(1);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || items.length === 0) return;
    onSave({
      name: name.trim(),
      note: note.trim(),
      items,
      total,
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
        className="animate-pop relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold text-leaf-900">
            Add order
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

        <label className="mb-1 block text-sm font-medium text-stone-600">
          Customer name
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ada Greenleaf"
          className="mb-4 w-full rounded-xl border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-900 outline-none placeholder:text-stone-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        />

        <span className="mb-2 block text-sm font-medium text-stone-600">
          Items
        </span>
        <div className="mb-2 flex gap-2">
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            aria-label="Select plant"
            className="min-w-0 flex-1 rounded-xl border border-leaf-200 bg-white px-3 py-2.5 text-sm text-leaf-900 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          >
            <option value="">Choose a plant…</option>
            {inStock.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name} — ${plant.price.toFixed(2)}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value)))}
            aria-label="Quantity"
            className="w-16 rounded-xl border border-leaf-200 bg-white px-2 py-2.5 text-center text-sm text-leaf-900 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!selectedPlant}
            className="rounded-xl bg-leaf-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {items.length > 0 ? (
          <ul className="mb-4 space-y-1.5 rounded-2xl bg-cream p-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-stone-600">
                  {item.qty} × {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-leaf-900">
                    {formatPrice(item.price * item.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current.filter((candidate) => candidate.id !== item.id),
                      )
                    }
                    aria-label={`Remove ${item.name}`}
                    className="text-stone-400 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-leaf-100 pt-1.5 text-sm font-semibold text-leaf-900">
              <span>Total</span>
              <span className="font-display text-base">
                {formatPrice(total)}
              </span>
            </li>
          </ul>
        ) : (
          <p className="mb-4 rounded-2xl bg-cream px-4 py-3 text-sm text-stone-400">
            Add at least one plant to the order.
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-stone-600">
          Note <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          placeholder="Delivery address, preferences…"
          className="mb-5 w-full resize-none rounded-xl border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-900 outline-none placeholder:text-stone-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
        />

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-leaf-200 px-5 py-2.5 text-sm font-semibold text-leaf-800 transition-colors hover:bg-leaf-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || items.length === 0}
            className="rounded-full bg-leaf-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-leaf-700/30 transition-colors hover:bg-leaf-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save order
          </button>
        </div>
      </form>
    </div>
  );
}
