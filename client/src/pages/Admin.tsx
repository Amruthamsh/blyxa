import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
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

  async function toggleActive(product: Product) {
    const next = !product.is_active
    const { error } = await supabase
      .from('products')
      .update({ is_active: next })
      .eq('id', product.id)

    if (error) {
      setError(error.message)
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: next } : p)),
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Admin</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white">
            Back to shop
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-8 text-3xl font-bold">Product management</h2>

        {loading && <p className="text-slate-400">Loading products…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-slate-400">No products yet.</p>
        )}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Active</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-800/50">
                <td className="py-3 pr-4">{product.name}</td>
                <td className="py-3 pr-4">${product.price}</td>
                <td className="py-3 pr-4">{product.stock}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      product.is_active ? 'text-emerald-400' : 'text-slate-500'
                    }
                  >
                    {product.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
