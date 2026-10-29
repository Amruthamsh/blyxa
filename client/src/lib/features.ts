function isEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

export const CART_AND_ORDERS_ENABLED = isEnabled(
  import.meta.env.VITE_ENABLE_CART_AND_ORDERS,
)

export const SHOW_STOCK_ENABLED = isEnabled(
  import.meta.env.VITE_SHOW_STOCK,
)
