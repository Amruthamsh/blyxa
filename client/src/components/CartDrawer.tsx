import type { Plant } from "../data/plants";
import { formatPrice } from "../data/plants";
import { PlantIcon } from "./PlantIcon";

export interface CartEntry {
  id: string;
  qty: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartEntry[];
  plants: Map<string, Plant>;
  onClose: () => void;
  onSetQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  items,
  plants,
  onClose,
  onSetQty,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  const entries = items
    .map((entry) => ({ entry, plant: plants.get(entry.id) }))
    .filter(({ plant }) => plant !== undefined) as {
    entry: CartEntry;
    plant: Plant;
  }[];

  const subtotal = entries.reduce(
    (sum, { entry, plant }) => sum + plant.price * entry.qty,
    0,
  );
  const count = entries.reduce((sum, { entry }) => sum + entry.qty, 0);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-leaf-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-leaf-100 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-leaf-900">
            Your cart
            <span className="ml-2 align-middle text-sm font-normal text-stone-500">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-leaf-50 hover:text-leaf-900"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-art">
              <svg viewBox="0 0 24 24" className="size-10 text-leaf-500" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-leaf-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Add a few leafy friends and we'll bring them home to you.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-leaf-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-800"
            >
              Browse plants
            </button>
          </div>
        ) : (
          <>
            <div className="slim-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {entries.map(({ entry, plant }) => (
                <div
                  key={plant.id}
                  className="flex items-center gap-3 rounded-2xl border border-leaf-100 bg-cream p-3"
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
                    <p className="truncate text-sm font-semibold text-leaf-900">
                      {plant.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatPrice(plant.price)} each
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSetQty(plant.id, entry.qty - 1)}
                        aria-label="Decrease quantity"
                        className="flex size-6 items-center justify-center rounded-full border border-leaf-200 text-leaf-700 transition-colors hover:bg-leaf-100"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {entry.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSetQty(plant.id, entry.qty + 1)}
                        aria-label="Increase quantity"
                        className="flex size-6 items-center justify-center rounded-full border border-leaf-200 text-leaf-700 transition-colors hover:bg-leaf-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-leaf-900">
                      {formatPrice(plant.price * entry.qty)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(plant.id)}
                      aria-label={`Remove ${plant.name} from cart`}
                      className="text-xs font-medium text-stone-400 underline-offset-2 hover:text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-leaf-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Subtotal</span>
                <span className="font-display text-lg font-semibold text-leaf-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm shadow-[#25D366]/40 transition-all hover:brightness-105 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
                  />
                </svg>
                Checkout on WhatsApp
              </button>
              <p className="text-center text-xs text-stone-400">
                No payment on the site — we'll confirm your order in WhatsApp.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
