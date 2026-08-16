import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import Button from './Button'
import EmptyState from './EmptyState'

interface CartDrawerProps {
  open: boolean
  items: Product[]
  quantities: Record<string, number>
  total: number
  canDiscuss: boolean
  onClose: () => void
  onAdjust: (product: Product, delta: number) => void
  onRemove: (product: Product) => void
  onCheckout: () => void
  onDiscuss: () => void
  onExplore: () => void
}

export function Stepper({
  value,
  max,
  onDecrease,
  onIncrease,
  label,
}: {
  value: number
  max: number
  onDecrease: () => void
  onIncrease: () => void
  label: string
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-forest-900/15 bg-white"
      aria-label={`Quantity for ${label}`}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100 disabled:opacity-35 disabled:hover:bg-transparent"
        aria-label={`Decrease ${label} quantity`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>
      <span className="w-6 text-center text-sm font-semibold text-forest-950">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100 disabled:opacity-35 disabled:hover:bg-transparent"
        aria-label={`Increase ${label} quantity`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}

export default function CartDrawer({
  open,
  items,
  quantities,
  total,
  canDiscuss,
  onClose,
  onAdjust,
  onRemove,
  onCheckout,
  onDiscuss,
  onExplore,
}: CartDrawerProps) {
  const count = items.reduce((sum, p) => sum + quantities[p.id], 0)

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-forest-950/45 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-sand-50 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-forest-900/10 px-6 py-5">
          <h2 className="font-serif text-xl font-semibold text-forest-950">
            Your cart
            {count > 0 && (
              <span className="ml-2 text-sm font-sans font-normal text-forest-900/50">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-6">
            <EmptyState
              compact
              title="Your cart is feeling a little empty."
              message="Explore our plants and bring a little more green into your space."
              actionLabel="Explore plants"
              onAction={onExplore}
            />
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-5">
              <li className="flex flex-col gap-4">
                {items.map((product) => {
                  const qty = quantities[product.id]
                  return (
                    <div
                      key={product.id}
                      className="flex gap-4 rounded-xl border border-forest-900/10 bg-white p-3.5"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-moss-100 text-xs text-forest-900/40">
                          No image
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-forest-950">
                            {product.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => onRemove(product)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-forest-900/40 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-forest-900/50">
                          {formatPrice(product.price)} each
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <Stepper
                            value={qty}
                            max={product.stock}
                            onDecrease={() => onAdjust(product, -1)}
                            onIncrease={() => onAdjust(product, 1)}
                            label={product.name}
                          />
                          <span className="text-sm font-bold text-forest-950">
                            {formatPrice(product.price * qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </li>
            </ul>

            <footer className="border-t border-forest-900/10 bg-sand-100/60 px-6 py-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-forest-900/70">
                  Subtotal
                </span>
                <span className="font-serif text-2xl font-semibold text-forest-950">
                  {formatPrice(total)}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onCheckout}
              >
                Checkout
              </Button>
              {canDiscuss && (
                <Button
                  variant="whatsapp"
                  fullWidth
                  className="mt-2.5"
                  onClick={onDiscuss}
                >
                  <WhatsAppIcon />
                  Discuss this order
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-forest-900/45">
                Plants are checked and packed with care before dispatch.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
