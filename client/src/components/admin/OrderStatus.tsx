import type { OrderStatus as OrderStatusType } from '../../lib/types'

const STATUS_STYLES: Record<
  OrderStatusType,
  { dot: string; badge: string; label: string }
> = {
  new: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    label: 'New',
  },
  confirmed: {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'Confirmed',
  },
  processing: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Processing',
  },
  completed: {
    dot: 'bg-moss-600',
    badge: 'bg-moss-100 text-moss-700 border-moss-200',
    label: 'Completed',
  },
  cancelled: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Cancelled',
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatusType }) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  )
}
