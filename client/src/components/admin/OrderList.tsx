import type { Order, OrderStatus, Product } from '../../lib/types'
import { formatPrice, formatDate } from '../../lib/format'
import { ORDER_STATUSES, capitalizeStatus } from '../../lib/orderStatus'
import { OrderStatusBadge } from './OrderStatus'
import EmptyState from '../EmptyState'

interface OrderListProps {
  orders: Order[]
  products: Product[]
  onStatusChange: (order: Order, status: OrderStatus) => void
  statusUpdating: boolean
}

export default function OrderList({
  orders,
  products,
  onStatusChange,
  statusUpdating,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        message="When customers place orders, they’ll appear here with all the details you need to fulfil them."
      />
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-2xl border border-forest-900/10 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="font-serif text-lg font-semibold text-forest-950">
                  {order.customer_name}
                </h4>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-forest-900/50">
                {formatDate(order.created_at)} · #{order.id.slice(0, 8).toUpperCase()}
              </p>

              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {order.phone && (
                  <div className="flex items-center gap-1.5 text-forest-900/70">
                    <span className="font-medium text-forest-900">Phone:</span>
                    <a href={`tel:${order.phone}`} className="hover:text-moss-600">
                      {order.phone}
                    </a>
                  </div>
                )}
                {order.email && (
                  <div className="truncate text-forest-900/70">
                    <span className="font-medium text-forest-900">Email:</span>{' '}
                    {order.email}
                  </div>
                )}
                {order.address && (
                  <div className="text-forest-900/70 sm:col-span-2">
                    <span className="font-medium text-forest-900">Address:</span>{' '}
                    {order.address}
                  </div>
                )}
              </dl>
              {order.notes && (
                <p className="mt-2 rounded-lg bg-sand-100 px-3 py-2 text-sm text-forest-900/70">
                  <span className="font-medium text-forest-900">Note:</span>{' '}
                  {order.notes}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="font-serif text-2xl font-semibold text-forest-950">
                {formatPrice(order.total_amount)}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Update order status</span>
                <select
                  value={order.status}
                  onChange={(e) =>
                    onStatusChange(order, e.target.value as OrderStatus)
                  }
                  disabled={statusUpdating}
                  className="rounded-full border border-forest-900/15 bg-sand-50 px-3.5 py-2 text-sm font-semibold text-forest-900 transition-colors focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/25 disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {capitalizeStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {order.order_items && order.order_items.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-forest-900/10 pt-4">
              {order.order_items.map((item) => {
                const product = products.find((p) => p.id === item.product_id)
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {product?.image_url && (
                        <img
                          src={product.image_url}
                          alt=""
                          loading="lazy"
                          className="h-9 w-9 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <span className="truncate text-forest-900">
                        {product?.name ?? 'Unknown product'}
                        <span className="text-forest-900/50"> × {item.quantity}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-forest-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </article>
      ))}
    </div>
  )
}
