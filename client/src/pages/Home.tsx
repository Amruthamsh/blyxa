import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../lib/types";
import { formatPrice } from "../lib/format";
import {
  MESSAGES,
  buildDiscussionMessage,
  buildOrderMessage,
  buildWhatsAppLink,
  openWhatsApp,
} from "../lib/whatsapp";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SocialMedia from "../components/SocialMedia";
import ProductGrid from "../components/ProductGrid";
import CartDrawer, { WhatsAppIcon } from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import type {
  CheckoutDetails,
  CheckoutLineItem,
} from "../components/CheckoutModal";
import Toast from "../components/Toast";
import Button from "../components/Button";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string) ?? "";
const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL as string) ?? "";
const contactPhone = (import.meta.env.VITE_CONTACT_PHONE as string) ?? "";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

const DETAILS_STORAGE_KEY = "checkout-details";

const emptyDetails: CheckoutDetails = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function loadDetails(): CheckoutDetails {
  try {
    const raw = localStorage.getItem(DETAILS_STORAGE_KEY);
    if (raw) return { ...emptyDetails, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return emptyDetails;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );
  const toastTimer = useRef<number | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutQty, setCheckoutQty] = useState(1);
  const [form, setForm] = useState<CheckoutDetails>(loadDetails);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!cartOpen && !checkoutOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCartOpen(false);
        setCheckoutOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [cartOpen, checkoutOpen]);

  const cartItems = products.filter((p) => cart[p.id]);
  const cartCount = cartItems.reduce((sum, p) => sum + cart[p.id], 0);
  const cartTotal = cartItems.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const hasNumber = whatsappNumber.replace(/\D/g, "") !== "";

  const checkoutItems: CheckoutLineItem[] = checkoutProduct
    ? [{ product: checkoutProduct, qty: checkoutQty }]
    : cartItems.map((p) => ({ product: p, qty: cart[p.id] }));
  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  function showToast(message: string) {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message }));
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  function addToCart(product: Product) {
    if ((cart[product.id] ?? 0) >= product.stock) return;
    setCart((prev) => ({
      ...prev,
      [product.id]: Math.min((prev[product.id] ?? 0) + 1, product.stock),
    }));
    showToast(`${product.name} added to cart`);
  }

  function orderNow(product: Product) {
    setCartOpen(false);
    setCheckoutError(null);
    setCheckoutProduct(product);
    setCheckoutQty(1);
    setCheckoutOpen(true);
  }

  function discussProduct(product: Product) {
    openWhatsApp(
      whatsappNumber,
      buildDiscussionMessage(
        [`- ${product.name} (${formatPrice(product.price)})`],
        MESSAGES.discussPlant,
      ),
    );
  }

  function discussGeneral() {
    openWhatsApp(whatsappNumber, MESSAGES.generalInquiry);
  }

  function discussCart() {
    const lines = cartItems.map(
      (p) =>
        `- ${p.name} x${cart[p.id]} = ${formatPrice(p.price * cart[p.id])}`,
    );
    openWhatsApp(
      whatsappNumber,
      buildDiscussionMessage(lines, MESSAGES.discussOrder),
    );
  }

  function discussCheckout() {
    const lines = checkoutItems.map(
      (item) =>
        `- ${item.product.name} x${item.qty} = ${formatPrice(item.product.price * item.qty)}`,
    );
    openWhatsApp(
      whatsappNumber,
      buildDiscussionMessage(lines, MESSAGES.discussOrder),
    );
  }

  function openCartCheckout() {
    setCartOpen(false);
    setCheckoutError(null);
    setCheckoutProduct(null);
    setCheckoutOpen(true);
  }

  function adjustCartQuantity(product: Product, delta: number) {
    setCart((prev) => {
      const next = (prev[product.id] ?? 0) + delta;
      if (next <= 0) {
        const { [product.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: Math.min(next, product.stock) };
    });
  }

  function removeFromCart(product: Product) {
    setCart((prev) => {
      const { [product.id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function adjustCheckoutItem(product: Product, delta: number) {
    if (checkoutProduct) {
      setCheckoutQty((qty) =>
        Math.min(Math.max(qty + delta, 1), product.stock),
      );
    } else {
      adjustCartQuantity(product, delta);
    }
  }

  function updateForm(field: keyof CheckoutDetails, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function navigateTo(section: string) {
    if (section === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (checkoutItems.length === 0) return;

    setSubmitting(true);
    setCheckoutError(null);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
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
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          body || `Request failed with status ${response.status}`,
        );
      }

      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(form));
      setOrderPlaced(true);
      setProducts((prev) =>
        prev.map((p) => {
          const item = checkoutItems.find((i) => i.product.id === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
        }),
      );
      if (!checkoutProduct) setCart({});
      setCheckoutQty(1);
      setCheckoutOpen(false);
      openWhatsApp(
        whatsappNumber,
        buildOrderMessage(
          checkoutItems.map(
            (item) =>
              `- ${item.product.name} x${item.qty} = ${formatPrice(item.product.price * item.qty)}`,
          ),
        ),
      );
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id="top"
      className="relative min-h-screen bg-sand-50 text-forest-950"
    >
      <img
        src="/border-top.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-96 opacity-12 sm:w-[30rem] lg:w-[44rem]"
      />
      <img
        src="/border-bottom.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-96 opacity-12 sm:w-[30rem] lg:w-[44rem]"
      />
      <Header
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigateTo}
      />

      <main>
        <Hero
          onShop={() => navigateTo("products")}
          onDiscuss={discussGeneral}
        />

        <section
          id="products"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-8 pb-14 sm:px-6 lg:px-8 lg:pt-10 lg:pb-20"
        >
          <div className="mb-8 flex items-end justify-between gap-4 lg:mb-12">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-moss-600">
                The collection
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
                Plants for your space
              </h2>
            </div>
            {!loading && !error && products.length > 0 && (
              <p className="hidden text-sm text-forest-900/50 sm:block">
                {products.length} {products.length === 1 ? "plant" : "plants"}{" "}
                available
              </p>
            )}
          </div>

          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            cart={cart}
            canDiscuss={hasNumber}
            onAddToCart={addToCart}
            onOrderNow={orderNow}
            onDiscuss={discussProduct}
            onRetry={fetchProducts}
          />
        </section>

        <section
          id="about"
          className="border-y border-forest-900/10 bg-white/60"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-moss-600">
                About Blyxa
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
                Grown with patience, delivered with care.
              </h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-forest-900/65">
              <p>
                Blyxa is a small plant studio built around a simple idea — that
                a healthy plant can change the feeling of a room. Every plant is
                handpicked, inspected and potted by our team before it ships.
              </p>
              <p>
                We keep the range small and the quality high. Each order comes
                with plant care guidance, and our plant people are a message
                away on WhatsApp whenever you need a hand.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-forest-900 px-8 py-10 sm:px-12 lg:flex-row lg:items-center">
              <div className="max-w-lg">
                <h2 className="font-serif text-3xl font-medium tracking-tight text-sand-50">
                  Not sure which plant is right for you?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-sand-50/70">
                  Tell us about your light, your space and your routine. We’ll
                  recommend a plant that will actually thrive with you.
                </p>
              </div>
              {hasNumber && (
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={discussGeneral}
                  className="bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                >
                  <WhatsAppIcon />
                  Chat with us on WhatsApp
                </Button>
              )}
            </div>
          </div>
        </section>

        <SocialMedia />
      </main>

      <footer className="border-t border-forest-900/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="text-center md:text-left">
              <p className="font-serif text-lg font-semibold text-forest-950">
                Blyxa Botanicals
              </p>
              <p className="mt-1 text-sm text-forest-900/50">
                © {new Date().getFullYear()} Blyxa Botanicals. Grown with care.
              </p>
              <p className="mt-1 text-sm text-forest-900/50">
                Healthy plants, delivered with love.
              </p>
            </div>

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 text-sm text-forest-900/60 transition-colors hover:text-forest-950"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                {contactEmail}
              </a>
            )}

            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 text-sm text-forest-900/60 transition-colors hover:text-forest-950"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                {formatPhone(contactPhone)}
              </a>
            )}
          </div>

          <div className="mt-10 border-t border-forest-900/10 pt-6 text-center">
            <p className="text-xs text-forest-900/40">
              Website & maintenance by{" "}
              <a
                href="https://github.com/amruthamsh"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-forest-900/60 underline decoration-moss-400 underline-offset-2 transition-colors hover:text-forest-950"
              >
                Amruthamsh
              </a>
            </p>
          </div>
        </div>
      </footer>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <Toast
            toast={toast}
            onViewCart={() => {
              setToast(null);
              setCartOpen(true);
            }}
          />
        </div>
      )}

      {orderPlaced && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[70] border-b border-moss-700/30 bg-moss-800 px-6 py-3 text-sand-50 shadow-lg"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0 text-moss-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold">
                Your order has been placed successfully!
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber && (
                <a
                  href={buildWhatsAppLink(
                    whatsappNumber,
                    MESSAGES.orderConfirmation,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-moss-600 px-3.5 py-1.5 text-xs font-semibold text-sand-50 transition-colors hover:bg-moss-500"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Track on WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setOrderPlaced(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-sand-50/80 transition-colors hover:bg-moss-700 hover:text-sand-50"
                aria-label="Dismiss order confirmation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        quantities={cart}
        total={cartTotal}
        canDiscuss={hasNumber}
        onClose={() => setCartOpen(false)}
        onAdjust={adjustCartQuantity}
        onRemove={removeFromCart}
        onCheckout={openCartCheckout}
        onDiscuss={discussCart}
        onExplore={() => {
          setCartOpen(false);
          navigateTo("products");
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        total={checkoutTotal}
        form={form}
        submitting={submitting}
        error={checkoutError}
        canDiscuss={hasNumber}
        onClose={() => setCheckoutOpen(false)}
        onUpdateForm={updateForm}
        onAdjust={adjustCheckoutItem}
        onSubmit={handlePlaceOrder}
        onDiscuss={discussCheckout}
      />
    </div>
  );
}
