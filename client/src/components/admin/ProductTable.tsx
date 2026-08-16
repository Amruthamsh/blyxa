import type { Product } from '../../lib/types'
import { formatPrice } from '../../lib/format'
import EmptyState from '../EmptyState'
import Button from '../Button'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onAdd: () => void
}

export default function ProductTable({ products, onEdit, onAdd }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        message="Add your first plant to start selling. You’ll need a good photo to get started."
        actionLabel="Add your first product"
        onAction={onAdd}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 bg-sand-100/60 text-xs uppercase tracking-wider text-forest-900/50">
              <th scope="col" className="px-6 py-4 font-semibold">
                Product
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Price
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Stock
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-900/5">
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-moss-50/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-moss-100 text-xs text-forest-900/40">
                        —
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-forest-950">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-forest-900/50">
                        {product.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-forest-950">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4">
                  <StockBadge stock={product.stock} />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.is_active
                        ? 'bg-moss-100 text-moss-700'
                        : 'bg-sand-200 text-forest-900/50'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        product.is_active ? 'bg-moss-600' : 'bg-forest-900/30'
                      }`}
                      aria-hidden="true"
                    />
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(product)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-forest-900/5 sm:hidden">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-3 p-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt=""
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-moss-100 text-xs text-forest-900/40">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-forest-950">
                {product.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-900/60">
                <span className="font-bold text-forest-950">
                  {formatPrice(product.price)}
                </span>
                <StockBadge stock={product.stock} />
                <span
                  className={
                    product.is_active ? 'text-moss-600' : 'text-forest-900/40'
                  }
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(product)}
              aria-label={`Edit ${product.name}`}
            >
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className="text-xs font-semibold text-red-600">Out of stock</span>
  }
  if (stock <= 5) {
    return <span className="text-xs font-semibold text-amber-600">Low · {stock}</span>
  }
  return <span className="text-xs font-semibold text-moss-600">{stock} in stock</span>
}
