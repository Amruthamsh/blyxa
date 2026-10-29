import { useEffect } from 'react'
import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import { SHOW_STOCK_ENABLED } from '../lib/features'
import Button from './Button'
import { WhatsAppIcon } from './CartDrawer'

interface ProductModalProps {
  product: Product | null
  cartQty: number
  commerceEnabled: boolean
  canDiscuss: boolean
  onClose: () => void
  onAddToCart: (product: Product) => void
  onOrderNow: (product: Product) => void
  onDiscuss: (product: Product) => void
}

export default function ProductModal({
  product,
  cartQty,
  commerceEnabled,
  canDiscuss,
  onClose,
  onAddToCart,
  onOrderNow,
  onDiscuss,
}: ProductModalProps) {
  const open = Boolean(product)

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!product) return null

  const outOfStock = product.stock <= 0
  const available = Math.max(product.stock - cartQty, 0)
  const atMax = available <= 0

  const stockLabel = outOfStock
    ? 'Out of stock'
    : available === 1
      ? 'Only 1 left'
      : `${available} in stock`

  const details = [
    { label: 'Plant type', value: product.plant_type },
    { label: 'Light', value: product.light },
    { label: 'Water', value: product.water },
    { label: 'Potting mix', value: product.potting_mix },
    { label: 'Maintenance', value: product.maintenance },
    { label: 'Propagation', value: product.propagation },
    { label: 'Common pests', value: product.common_pests },
    { label: 'Common diseases', value: product.common_diseases },
    { label: 'Traditional uses', value: product.traditional_uses },
  ].filter((detail) => detail.value)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-sand-50 sm:rounded-3xl shadow-2xl sm:aspect-[8/5] sm:max-h-[90dvh] sm:w-[min(72rem,144dvh)] sm:max-w-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-forest-900 shadow-md backdrop-blur transition-colors hover:bg-white"
          aria-label="Close product details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain sm:grid sm:grid-cols-2 sm:overflow-hidden">
          <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-moss-50 to-moss-100 sm:aspect-auto sm:h-full">
            {product.image_url ? (
              <>
                <img
                  src={product.image_url}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl sm:hidden"
                />
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="relative h-full w-full object-contain sm:object-cover"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-forest-900/40">
                No image available
              </div>
            )}
            {SHOW_STOCK_ENABLED && outOfStock && (
              <span className="absolute left-3 top-3 rounded-full bg-forest-950/75 px-3 py-1 text-xs font-semibold text-sand-50 backdrop-blur">
                Out of stock
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col sm:min-h-0">
            <div className="flex-1 px-5 pb-5 pt-4 sm:overflow-y-auto sm:p-7">
              <h2 className="font-serif text-xl font-semibold leading-tight text-forest-950 sm:text-[1.7rem]">
                {product.name}
              </h2>
              {(product.botanical_name || product.family) && (
                <p className="mt-1 text-sm italic text-forest-900/45">
                  {[product.botanical_name, product.family]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {product.description && (
                <p className="mt-3 text-sm leading-relaxed text-forest-900/70">
                  {product.description}
                </p>
              )}

              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-forest-900/10 pt-3">
                <p className="text-xl font-bold text-forest-950 sm:text-2xl">
                  {formatPrice(product.price)}
                </p>
                {SHOW_STOCK_ENABLED && (
                  <p
                    className={`text-xs font-medium ${
                      outOfStock ? 'text-red-500' : 'text-moss-600'
                    }`}
                  >
                    {stockLabel}
                  </p>
                )}
              </div>

              {details.length > 0 && (
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-5 sm:gap-y-2.5">
                  {details.map((detail) => (
                    <div key={detail.label} className="min-w-0">
                      <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-forest-900/40">
                        {detail.label}
                      </dt>
                      <dd className="mt-0.5 text-[0.8rem] leading-snug text-forest-900/80 sm:line-clamp-2">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {product.safety_note && (
                <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2.5">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-amber-700/70">
                    Safety note
                  </p>
                  <p className="mt-0.5 text-[0.8rem] sm:line-clamp-3 leading-snug text-amber-900/80">
                    {product.safety_note}
                  </p>
                </div>
              )}
            </div>

            <footer className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-2 border-t border-forest-900/10 bg-sand-50/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:flex sm:gap-2.5 sm:bg-sand-50 sm:py-4 sm:items-center sm:justify-end sm:px-7">
              {canDiscuss && (
                <Button
                  variant="whatsapp"
                  size="md"
                  onClick={() => onDiscuss(product)}
                  className="col-span-2 sm:order-first sm:mr-auto"
                >
                  <WhatsAppIcon />
                  Enquire on WhatsApp
                </Button>
              )}
              {commerceEnabled && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onOrderNow(product)}
                    disabled={outOfStock || atMax}
                  >
                    Order now
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onAddToCart(product)}
                    disabled={outOfStock || atMax}
                  >
                    {atMax ? 'In cart' : 'Add to cart'}
                  </Button>
                </>
              )}
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
