import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import { SHOW_STOCK_ENABLED } from '../lib/features'
import Button from './Button'

interface ProductCardProps {
  product: Product
  cartQty: number
  inCart: boolean
  commerceEnabled: boolean
  onAddToCart: (product: Product) => void
  onOrderNow: (product: Product) => void
  onDiscuss: (product: Product) => void
  onView: (product: Product) => void
  canDiscuss: boolean
}

export default function ProductCard({
  product,
  cartQty,
  inCart,
  commerceEnabled,
  onAddToCart,
  onOrderNow,
  onDiscuss,
  onView,
  canDiscuss,
}: ProductCardProps) {
  const outOfStock = product.stock <= 0
  const available = Math.max(product.stock - cartQty, 0)
  const atMax = available <= 0

  const stockLabel = outOfStock
    ? 'Out of stock'
    : available === 0
      ? 'All in your cart'
      : available === 1
        ? 'Only 1 left'
        : `${available} in stock`

  return (
    <article
      onClick={() => onView(product)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onView(product)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border sm:rounded-3xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-950/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 focus-visible:ring-offset-2 ${
        inCart ? 'border-moss-500/50' : 'border-forest-900/10'
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-moss-50 to-moss-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-forest-900/40">
            No image available
          </div>
        )}

        {SHOW_STOCK_ENABLED && outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-forest-950/75 px-2.5 py-1 text-[0.65rem] sm:left-3 sm:top-3 sm:px-3 sm:text-xs font-semibold text-sand-50 backdrop-blur">
            Out of stock
          </span>
        )}
        {SHOW_STOCK_ENABLED && !outOfStock && available === 1 && (
          <span className="absolute left-2 top-2 rounded-full bg-moss-100/90 px-2.5 py-1 text-[0.65rem] sm:left-3 sm:top-3 sm:px-3 sm:text-xs font-semibold text-moss-700 backdrop-blur">
            Only 1 left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-serif text-base font-semibold leading-snug text-forest-950 sm:text-lg">
          {product.name}
        </h3>
        {(product.botanical_name || product.family) && (
          <p className="mt-0.5 hidden text-xs italic text-forest-900/45 sm:block">
            {[product.botanical_name, product.family]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed sm:text-sm text-forest-900/55">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline justify-between pt-2 gap-x-2 gap-y-0.5">
          <p className="text-base font-bold text-forest-950 sm:text-lg">
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

        {commerceEnabled ? (
          <>
            <div
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                variant={inCart ? 'secondary' : 'primary'}
                size="xs"
                className="flex-1"
                onClick={() => onAddToCart(product)}
                disabled={outOfStock || atMax}
              >
                {inCart
                  ? atMax
                    ? 'In cart'
                    : 'Add more'
                  : 'Add to cart'}
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="flex-1"
                onClick={() => onOrderNow(product)}
                disabled={outOfStock || atMax}
              >
                Order now
              </Button>
            </div>

            {canDiscuss && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDiscuss(product)
                }}
                className="mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[0.7rem] sm:text-xs font-semibold text-moss-600 transition-colors hover:bg-moss-50 hover:text-moss-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Discuss this plant
              </button>
            )}
          </>
        ) : (
          canDiscuss && (
            <Button
              variant="whatsapp"
              size="xs"
              fullWidth
              className="mt-3 gap-1.5"
              onClick={(event) => {
                event.stopPropagation()
                onDiscuss(product)
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-[0.7rem] sm:text-xs">Enquire on WhatsApp</span>
            </Button>
          )
        )}
      </div>
    </article>
  )
}
