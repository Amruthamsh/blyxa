import { useState } from "react";
import type { FormEvent } from "react";
import type { Plant } from "../data/plants";
import { buildOrderMessage, formatPrice, whatsappLink } from "../data/plants";
import type { OrderItem } from "../store/OrdersContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface CheckoutModalProps {
  open: boolean;
  entries: { plant: Plant; qty: number }[];
  onClose: () => void;
  onPlaceOrder: (payload: {
    name: string;
    note: string;
    items: OrderItem[];
    total: number;
  }) => void;
}

export function CheckoutModal({
  open,
  entries,
  onClose,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const total = entries.reduce(
    (sum, { plant, qty }) => sum + plant.price * qty,
    0,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const items: OrderItem[] = entries.map(({ plant, qty }) => ({
      id: plant.id,
      name: plant.name,
      price: plant.price,
      qty,
    }));
    const message = buildOrderMessage(entries, name, note);
    onPlaceOrder({ name: name.trim(), note: note.trim(), items, total });
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setName("");
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-leaf-950/40 backdrop-blur-sm"
      />
      <div className="animate-pop relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-leaf-100">
              <svg viewBox="0 0 24 24" className="size-8 text-leaf-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-leaf-900">
                Order sent to WhatsApp
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                We just opened a chat with you. Hit send and we'll confirm your
                plants right away. 🌿
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-leaf-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-leaf-900">
                Finish your order
              </h3>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close checkout"
                className="rounded-full p-2 text-stone-500 transition-colors hover:bg-leaf-50 hover:text-leaf-900"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mb-5 space-y-2 rounded-2xl bg-cream p-4">
              {entries.map(({ plant, qty }) => (
                <div
                  key={plant.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-stone-600">
                    {qty} × {plant.name}
                  </span>
                  <span className="font-semibold text-leaf-900">
                    {formatPrice(plant.price * qty)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-leaf-100 pt-2 font-semibold text-leaf-900">
                <span>Total</span>
                <span className="font-display text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <label className="mb-1 block text-sm font-medium text-stone-600">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Ada Greenleaf"
              required
              className="mb-4 w-full rounded-xl border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-900 outline-none placeholder:text-stone-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
            />

            <label className="mb-1 block text-sm font-medium text-stone-600">
              Note <span className="text-stone-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Delivery instructions, questions, a pot upgrade…"
              rows={2}
              className="mb-5 w-full resize-none rounded-xl border border-leaf-200 bg-white px-4 py-2.5 text-sm text-leaf-900 outline-none placeholder:text-stone-400 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200"
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm shadow-[#25D366]/40 transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-5" />
              Send order via WhatsApp
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              This opens WhatsApp with your order pre-filled. Just press send.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
