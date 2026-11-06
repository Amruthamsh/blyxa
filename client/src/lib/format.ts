import type { Product } from './types'

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

// Ranged products are priced on enquiry and can't be ordered online
export function hasPriceRange(product: Pick<Product, 'price' | 'price_max'>) {
  return product.price_max != null && product.price_max > product.price
}

export function formatProductPrice(product: Pick<Product, 'price' | 'price_max'>) {
  return hasPriceRange(product)
    ? `${formatPrice(product.price)} – ${formatPrice(product.price_max!)}`
    : formatPrice(product.price)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
