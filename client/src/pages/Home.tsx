import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setProducts(data ?? [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Shop</h1>
          <a href="/admin" className="text-sm text-slate-400 hover:text-white">
            Admin
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-8 text-3xl font-bold">Products</h2>

        {loading && <p className="text-slate-400">Loading products…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-slate-400">No products yet.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.description && (
                  <p className="mt-1 text-sm text-slate-400">
                    {product.description}
                  </p>
                )}
                <p className="mt-3 text-xl font-bold text-emerald-400">
                  ${product.price}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
