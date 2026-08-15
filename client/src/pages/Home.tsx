import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string) ?? ''

const DETAILS_STORAGE_KEY = 'checkout-details'

type CheckoutDetails = {
  customer_name: string
  phone: string
  email: string
  address: string
  notes: string
}

const emptyDetails: CheckoutDetails = {
  customer_name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

function loadDetails(): CheckoutDetails {
  try {
    const raw = localStorage.getItem(DETAILS_STORAGE_KEY)
    if (raw) return { ...emptyDetails, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return emptyDetails
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

function openWhatsApp(message: string) {
  const number = whatsappNumber.replace(/\D/g, '')
  if (!number) return
  window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
    '_blank',
  )
}

function orderMessage(lines: string[]) {
  return `Hello, I have placed an order. Kindly share updates on the status and expected delivery time.\n\nOrder details:\n${lines.join('\n')}`
}

function Stepper({
  value,
  max,
  onDecrease,
  onIncrease,
  label,
}: {
  value: number
  max: number
  onDecrease: () => void
  onIncrease: () => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= 1}
        className="h-7 w-7 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40"
        aria-label={`Decrease ${label} quantity`}
      >
        −
      </button>
      <span className="w-6 text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        className="h-7 w-7 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40"
        aria-label={`Increase ${label} quantity`}
      >
        +
      </button>
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)

  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  )
  const toastTimer = useRef<number | null>(null)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
  const [checkoutQty, setCheckoutQty] = useState(1)
  const [form, setForm] = useState<CheckoutDetails>(loadDetails)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

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

  useEffect(() => {
    if (!cartOpen && !checkoutOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setCheckoutOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [cartOpen, checkoutOpen])

  const cartItems = products.filter((p) => cart[p.id])
  const cartCount = cartItems.reduce((sum, p) => sum + cart[p.id], 0)
  const cartTotal = cartItems.reduce(
    (sum, p) => sum + p.price * cart[p.id],
    0,
  )
  const hasNumber = whatsappNumber.replace(/\D/g, '') !== ''

  const checkoutItems = checkoutProduct
    ? [{ product: checkoutProduct, qty: checkoutQty }]
    : cartItems.map((p) => ({ product: p, qty: cart[p.id] }))
  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  )

  function showToast(message: string) {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message }))
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2500)
  }

  function addToCart(product: Product) {
    if ((cart[product.id] ?? 0) >= product.stock) return
    setCart((prev) => ({
      ...prev,
      [product.id]: Math.min((prev[product.id] ?? 0) + 1, product.stock),
    }))
    showToast(`${product.name} added to cart`)
  }

  function orderNow(product: Product) {
    setCartOpen(false)
    setCheckoutError(null)
    setCheckoutProduct(product)
    setCheckoutQty(1)
    setCheckoutOpen(true)
  }

  function discussProduct(product: Product) {
    openWhatsApp(
      `Hello, I'd like to discuss this product:\n\n- ${product.name} (${formatPrice(product.price)})`,
    )
  }

  function discussCart() {
    const lines = cartItems.map(
      (p) => `- ${p.name} x${cart[p.id]} = ${formatPrice(p.price * cart[p.id])}`,
    )
    openWhatsApp(`Hello, I'd like to discuss this order:\n\n${lines.join('\n')}`)
  }

  function discussCheckout() {
    const lines = checkoutItems.map(
      (item) =>
        `- ${item.product.name} x${item.qty} = ${formatPrice(item.product.price * item.qty)}`,
    )
    openWhatsApp(`Hello, I'd like to discuss this order:\n\n${lines.join('\n')}`)
  }

  function openCartCheckout() {
    setCartOpen(false)
    setCheckoutError(null)
    setCheckoutProduct(null)
    setCheckoutOpen(true)
  }

  function adjustCartQuantity(product: Product, delta: number) {
    setCart((prev) => {
      const next = (prev[product.id] ?? 0) + delta
      if (next <= 0) {
        const { [product.id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [product.id]: Math.min(next, product.stock) }
    })
  }

  function removeFromCart(product: Product) {
    setCart((prev) => {
      const { [product.id]: _removed, ...rest } = prev
      return rest
    })
  }

  function adjustCheckoutItem(product: Product, delta: number) {
    if (checkoutProduct) {
      setCheckoutQty((qty) =>
        Math.min(Math.max(qty + delta, 1), product.stock),
      )
    } else {
      adjustCartQuantity(product, delta)
    }
  }

  function updateForm(field: keyof CheckoutDetails, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault()
    if (checkoutItems.length === 0) return

    setSubmitting(true)
    setCheckoutError(null)
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-order`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_name: form.customer_name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            notes: form.notes,
            items: checkoutItems.map((item) => ({
              product_id: item.product.id,
              quantity: item.qty,
            })),
          }),
        },
      )

      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Request failed with status ${response.status}`)
      }

      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(form))
      setOrderPlaced(true)
      setProducts((prev) =>
        prev.map((p) => {
          const item = checkoutItems.find((i) => i.product.id === p.id)
          return item
            ? { ...p, stock: Math.max(0, p.stock - item.qty) }
            : p
        }),
      )
      if (!checkoutProduct) setCart({})
      setCheckoutQty(1)
      setCheckoutOpen(false)
      openWhatsApp(
        orderMessage(
          checkoutItems.map(
            (item) =>
              `- ${item.product.name} x${item.qty} = ${formatPrice(item.product.price * item.qty)}`,
          ),
        ),
      )
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Failed to place order',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Shop</h1>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
            aria-label="Open cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-slate-950">
                {cartCount}
              </span>
            )}
          </button>
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
          {products.map((product) => {
            const cartQty = cart[product.id] ?? 0
            const outOfStock = product.stock <= 0
            const available = Math.max(product.stock - cartQty, 0)
            const atMax = available <= 0

            return (
              <div
                key={product.id}
                className={`overflow-hidden rounded-xl border bg-slate-900 ${
                  cart[product.id] ? 'border-emerald-500' : 'border-slate-800'
                }`}
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
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {outOfStock
                      ? 'Out of stock'
                      : available === 0
                        ? 'All in cart'
                        : `${available} left in stock`}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={outOfStock || atMax}
                      className="flex-1 rounded-lg border border-slate-600 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-800 active:scale-[0.97] disabled:opacity-40"
                    >
                      Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => orderNow(product)}
                      disabled={outOfStock || atMax}
                      className="flex-1 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.97] disabled:opacity-40"
                    >
                      Order now
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => discussProduct(product)}
                    disabled={!hasNumber}
                    className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 active:scale-[0.97] disabled:opacity-40"
                  >
                    Discuss in WhatsApp
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        >
          <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur animate-toast-in">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <span className="flex-1 text-sm font-medium text-white">
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              View cart
            </button>
            <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-emerald-500/60 animate-toast-progress" />
          </div>
        </div>
      )}

      {orderPlaced && (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 border-b border-emerald-700 bg-emerald-600 px-6 py-3 font-semibold text-white">
          <span>Your order has been placed successfully!</span>
          <button
            type="button"
            onClick={() => setOrderPlaced(false)}
            className="rounded border border-white/30 px-2 py-0.5 text-sm hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm transform flex-col border-l border-slate-800 bg-slate-900 transition-transform duration-300 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold">
            Cart
            {cartCount > 0 && (
              <span className="ml-2 text-sm text-slate-400">
                ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-lg border border-slate-700 px-2.5 py-1 text-slate-400 hover:text-white"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <p className="text-sm text-slate-400">
              Your cart is empty. Add some products to get started.
            </p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((product) => (
                <li key={product.id} className="text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="mt-0.5 text-slate-400">
                        {formatPrice(product.price)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product)}
                      className="text-slate-400 hover:text-red-400"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Stepper
                      value={cart[product.id]}
                      max={product.stock}
                      onDecrease={() => adjustCartQuantity(product, -1)}
                      onIncrease={() => adjustCartQuantity(product, 1)}
                      label={product.name}
                    />
                    <span className="font-semibold text-emerald-400">
                      {formatPrice(product.price * cart[product.id])}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-300">Total</span>
              <span className="text-xl font-bold text-emerald-400">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={openCartCheckout}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Checkout
            </button>
            <button
              type="button"
              onClick={discussCart}
              disabled={!hasNumber}
              className="mt-3 w-full rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
            >
              Discuss in WhatsApp
            </button>
          </div>
        )}
      </aside>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setCheckoutOpen(false)}
          />
          <div className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold">Complete your order</h2>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-lg border border-slate-700 px-2.5 py-1 text-slate-400 hover:text-white"
                aria-label="Close checkout"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handlePlaceOrder}
              className="space-y-4 px-6 py-5"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="mb-1 block text-sm text-slate-400"
                  >
                    Name
                  </label>
                  <input
                    id="customer_name"
                    required
                    value={form.customer_name}
                    onChange={(e) =>
                      updateForm('customer_name', e.target.value)
                    }
                    placeholder="Your name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm text-slate-400"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="Your phone number"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm text-slate-400"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="address"
                    className="mb-1 block text-sm text-slate-400"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    required
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    placeholder="Delivery address"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm text-slate-400"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    placeholder="Any special instructions (optional)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <h3 className="mb-3 font-semibold">Order summary</h3>
                <ul className="space-y-3">
                  {checkoutItems.map(({ product, qty }) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{product.name}</p>
                        <p className="text-slate-400">
                          {formatPrice(product.price)} each
                        </p>
                      </div>
                      <Stepper
                        value={qty}
                        max={product.stock}
                        onDecrease={() => adjustCheckoutItem(product, -1)}
                        onIncrease={() => adjustCheckoutItem(product, 1)}
                        label={product.name}
                      />
                      <span className="w-20 text-right font-semibold text-emerald-400">
                        {formatPrice(product.price * qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-sm text-slate-300">Total</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatPrice(checkoutTotal)}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-sm text-red-400">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || checkoutItems.length === 0}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitting ? 'Placing order…' : 'Place order'}
              </button>
              <button
                type="button"
                onClick={discussCheckout}
                disabled={!hasNumber}
                className="w-full rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                Discuss in WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
