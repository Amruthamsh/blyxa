import type { Product } from '../lib/types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './LoadingState'
import EmptyState from './EmptyState'
import Button from './Button'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  error: string | null
  cart: Record<string, number>
  canDiscuss: boolean
  onAddToCart: (product: Product) => void
  onOrderNow: (product: Product) => void
  onDiscuss: (product: Product) => void
  onRetry: () => void
}

export default function ProductGrid({
  products,
  loading,
  error,
  cart,
  canDiscuss,
  onAddToCart,
  onOrderNow,
  onDiscuss,
  onRetry,
}: ProductGridProps) {
  if (loading) return <ProductGridSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-900/15 bg-white px-6 py-20 text-center">
        <p className="font-serif text-2xl text-forest-900">
          We couldn’t load the plants
        </p>
        <p className="mt-2 max-w-sm text-sm text-forest-900/60">
          Something went wrong on our side. Please try again in a moment.
        </p>
        <Button variant="secondary" onClick={onRetry} className="mt-6">
          Try again
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="New plants are on the way"
        message="We’re restocking our shelves with fresh, healthy plants. Check back soon to find your next green companion."
        actionLabel={canDiscuss ? 'Chat on WhatsApp' : undefined}
        onAction={() => onDiscuss({} as Product)}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          cartQty={cart[product.id] ?? 0}
          inCart={Boolean(cart[product.id])}
          onAddToCart={onAddToCart}
          onOrderNow={onOrderNow}
          onDiscuss={onDiscuss}
          canDiscuss={canDiscuss}
        />
      ))}
    </div>
  )
}
