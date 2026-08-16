import type { OrderStatus } from './types'

export const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'processing',
  'completed',
  'cancelled',
]

export function capitalizeStatus(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
