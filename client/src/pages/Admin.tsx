import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isAdminUser } from '../lib/admin'
import type { Order, OrderStatus, Product } from '../lib/types'

const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'processing',
  'completed',
  'cancelled',
]

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  image_url: '',
  is_active: true,
}

export default function Admin() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState(emptyProductForm)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      const admin = await isAdminUser(user.id)
      if (!admin) {
        await supabase.auth.signOut()
        navigate('/login')
        return
      }
      setAuthorized(true)
    }
    checkAuth()
  }, [navigate])

  async function fetchData() {
    const [productResult, orderResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false }),
    ])

    if (productResult.error) {
      setError(productResult.error.message)
    } else {
      setProducts(productResult.data ?? [])
    }
    if (orderResult.error) {
      setError(orderResult.error.message)
    } else {
      setOrders(orderResult.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function startCreate() {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setShowAddProduct(true)
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url ?? '',
      is_active: product.is_active,
    })
    setShowAddProduct(true)
  }

  function cancelForm() {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setShowAddProduct(false)
  }

  async function submitProduct(event: FormEvent) {
    event.preventDefault()
    const price = parseFloat(productForm.price)
    const stock = parseInt(productForm.stock, 10) || 0
    if (!productForm.name.trim() || Number.isNaN(price) || price < 0) return

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price,
      stock,
      image_url: productForm.image_url.trim() || null,
      is_active: productForm.is_active,
    }

    const { error } = editingProduct
      ? await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)
      : await supabase.from('products').insert(payload)

    if (error) {
      setError(error.message)
      return
    }
    cancelForm()
    await fetchData()
  }

  async function updateOrderStatus(order: Order, status: OrderStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (error) {
      setError(error.message)
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
      )
    }
  }

  function productName(productId: string) {
    const product = products.find((p) => p.id === productId)
    return product ? product.name : 'Unknown product'
  }

  function updateProductForm(field: keyof typeof emptyProductForm, value: string | boolean) {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const inputClass =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none'

  if (authorized !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Checking access…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Admin</h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-slate-400 hover:text-white">
              Back to shop
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-8 text-3xl font-bold">Dashboard</h2>

        <div className="mb-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'products'
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === 'orders'
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Orders
          </button>
        </div>

        {loading && <p className="text-slate-400">Loading…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && tab === 'products' && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Products</h3>
              <button
                type="button"
                onClick={showAddProduct ? cancelForm : startCreate}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {showAddProduct ? 'Cancel' : '+ Add product'}
              </button>
            </div>

            {showAddProduct && (
              <form
                onSubmit={submitProduct}
                className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-2"
              >
                <h4 className="text-lg font-semibold sm:col-span-2">
                  {editingProduct ? 'Edit product' : 'Add product'}
                </h4>
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="mb-1 block text-sm text-slate-400">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    value={productForm.name}
                    onChange={(e) => updateProductForm('name', e.target.value)}
                    placeholder="Product name"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="mb-1 block text-sm text-slate-400">
                    Description
                  </label>
                  <input
                    id="description"
                    value={productForm.description}
                    onChange={(e) =>
                      updateProductForm('description', e.target.value)
                    }
                    placeholder="Short description (optional)"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="price" className="mb-1 block text-sm text-slate-400">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => updateProductForm('price', e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="mb-1 block text-sm text-slate-400">
                    Stock
                  </label>
                  <input
                    id="stock"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={(e) => updateProductForm('stock', e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="image_url" className="mb-1 block text-sm text-slate-400">
                    Image URL
                  </label>
                  <input
                    id="image_url"
                    value={productForm.image_url}
                    onChange={(e) =>
                      updateProductForm('image_url', e.target.value)
                    }
                    placeholder="https://… (optional)"
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) =>
                      updateProductForm('is_active', e.target.checked)
                    }
                    className="h-4 w-4 accent-emerald-500"
                  />
                  Active
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    {editingProduct ? 'Save changes' : 'Create product'}
                  </button>
                </div>
              </form>
            )}

            {products.length === 0 ? (
              <p className="text-slate-400">No products yet.</p>
            ) : (
              <div className="overflow-x-auto">
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
                        <td className="py-3 pr-4">{formatPrice(product.price)}</td>
                        <td className="py-3 pr-4">{product.stock}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={
                              product.is_active
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                            }
                          >
                            {product.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {!loading && !error && tab === 'orders' && (
          <section>
            <h3 className="mb-6 text-xl font-semibold">Orders</h3>

            {orders.length === 0 ? (
              <p className="text-slate-400">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-semibold">
                            {order.customer_name}
                          </h4>
                          <span className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-sm text-slate-400">
                          {order.phone && <p>{order.phone}</p>}
                          {order.email && <p>{order.email}</p>}
                          {order.address && <p>{order.address}</p>}
                          {order.notes && (
                            <p className="text-slate-500">Note: {order.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-emerald-400">
                          {formatPrice(order.total_amount)}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              order,
                              e.target.value as OrderStatus,
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <ul className="mt-4 space-y-1 border-t border-slate-800/50 pt-3 text-sm">
                        {order.order_items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between gap-3 text-slate-300"
                          >
                            <span>
                              {productName(item.product_id)} × {item.quantity}
                            </span>
                            <span className="text-slate-400">
                              {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
