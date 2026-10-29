import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../lib/types";
import { formatPrice } from "../lib/format";
import { CART_AND_ORDERS_ENABLED } from "../lib/features";
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
import ProductModal from "../components/ProductModal";
import type {
  CheckoutDetails,
  CheckoutLineItem,
} from "../components/CheckoutModal";
import Toast from "../components/Toast";
import Button from "../components/Button";
import Logo from "../components/Logo";

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
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

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
    <div id="top" className="min-h-screen bg-sand-50 text-forest-950">
      <Header
        showCart={CART_AND_ORDERS_ENABLED}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigateTo}
      />

      <main>
        <Hero
          onShop={() => navigateTo("products")}
          onDiscuss={discussGeneral}
        />

        {/* The collection — front and centre */}
        <section id="products" className="relative scroll-mt-24">
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
            {/* <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-forest-900/10 bg-gradient-to-br from-moss-50 via-white to-sand-100 px-6 py-9 sm:px-10 lg:mb-14 lg:px-14 lg:py-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-moss-200/40 blur-3xl"
              />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-moss-600">
                    <span className="h-px w-8 bg-moss-400/70" />
                    The collection
                  </p>
                  <h2 className="mt-4 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-forest-950 sm:text-5xl">
                    Meet the plants{" "}
                    <em className="italic text-moss-600">ready to come home</em>
                    .
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-forest-900/60">
                    A slowly grown, ever-changing gathering of native and unique
                    species. Browse what&rsquo;s in the nursery right now — we
                    are always happy to help you find a good match.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {!loading && !error && products.length > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-moss-200 bg-white/80 px-4 py-2 text-xs font-semibold text-moss-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
                      {products.length}{" "}
                      {products.length === 1 ? "plant" : "plants"} available
                    </span>
                  )}
                  {hasNumber ? (
                    <Button variant="secondary" onClick={discussGeneral}>
                      Ask a question
                    </Button>
                  ) : null}
                </div>
              </div>
            </div> */}

            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              cart={cart}
              commerceEnabled={CART_AND_ORDERS_ENABLED}
              canDiscuss={hasNumber}
              onAddToCart={addToCart}
              onOrderNow={orderNow}
              onDiscuss={discussProduct}
              onView={setViewProduct}
              onRetry={fetchProducts}
            />
          </div>
        </section>

        {/* Introduction — Blyxa Enterprises vision */}
        <section
          id="introduction"
          className="scroll-mt-24 border-y border-forest-900/10 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-moss-600">
                  Our story
                </p>
                <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-forest-950 sm:text-4xl">
                  A living library, grown slowly and shared warmly.
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-forest-900/70">
                  <p>
                    <span className="font-semibold text-forest-900">
                      Blyxa Enterprises
                    </span>{" "}
                    aims to build a large-scale collection and conservation
                    network for native and unique plant species. Our long-term
                    vision is to become a reliable supplier of native plant
                    resources for biodiversity conservation programmes,
                    ecological restoration initiatives, research institutions,
                    educational organisations, and other conservation efforts.
                  </p>
                  <p>
                    We also cater to garden enthusiasts, nature lovers, and
                    urban gardeners by promoting awareness of unique native
                    flora and highlighting their important roles within local
                    ecological niches.
                  </p>
                  <p className="rounded-2xl border border-moss-200 bg-moss-50 px-5 py-4 text-sm leading-relaxed text-moss-900">
                    Through responsible plant collection, conservation,
                    propagation, and awareness, Blyxa Enterprises strives to
                    bridge the gap between biodiversity conservation and
                    everyday appreciation of native plants.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-forest-900/10 bg-sand-50 p-6 lg:p-8">
                  <h3 className="font-serif text-lg font-semibold text-forest-950">
                    Who we serve
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-forest-900/70">
                    <li className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-500" />
                      <span>
                        Biodiversity conservation &amp; ecological restoration
                        programmes
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-500" />
                      <span>
                        Research institutions, universities &amp; schools
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-500" />
                      <span>
                        Garden enthusiasts, nature lovers &amp; urban gardeners
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-moss-500" />
                      <span>
                        Anyone curious about the plants that belong here
                      </span>
                    </li>
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {hasNumber ? (
                      <Button variant="primary" onClick={discussGeneral}>
                        Talk to our team
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={() => navigateTo("products")}
                    >
                      Browse the collection
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-forest-900/50">
                    Have a restoration or lab requirement? Message us on
                    WhatsApp for bulk &amp; institutional enquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {/* <section id="categories" className="scroll-mt-24 bg-sand-100/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-moss-600">
                What we grow
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
                Five plant families, one native heart
              </h2>
              <p className="mt-3 text-base leading-relaxed text-forest-900/60">
                From conservation-grade saplings to home-garden favourites —
                each plant is sourced responsibly and grown for health, not just
                looks.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  className="group flex flex-col rounded-3xl border border-forest-900/10 bg-white p-7 shadow-sm shadow-forest-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-950/[0.07]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-moss-100 to-sand-100 text-2xl ring-1 ring-moss-200/70">
                    <span aria-hidden="true">{cat.icon}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold leading-snug text-forest-950">
                    {cat.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest-900/60">
                    {cat.description}
                  </p>
                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo("products")}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-forest-900/10 bg-sand-50 px-3 py-2 text-xs font-semibold text-forest-900 transition-colors hover:bg-moss-50"
                    >
                      Browse the collection
                    </button>
                    {hasNumber && (
                      <button
                        type="button"
                        onClick={() => discussCategory(cat.title)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-moss-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-moss-700"
                      >
                        Enquire
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-forest-900/45">
              Looking for something specific? Chat with us — we would love to
              help you find the right native species for your space or project.
            </p>
          </div>
        </section> */}

        <section id="about" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="relative overflow-hidden rounded-3xl border border-forest-900/10 bg-gradient-to-br from-moss-50 via-white to-sand-100 sm:rounded-[2.5rem]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-moss-200/40 blur-3xl"
              />
              <div className="relative grid gap-8 p-6 sm:gap-10 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-moss-600">
                    About Blyxa
                  </p>
                  <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-forest-950 sm:text-4xl lg:text-[2.75rem]">
                    Grown with patience,
                    <br />
                    delivered with care.
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-forest-900/60">
                    A small plant studio with a simple belief — that a healthy
                    plant can gently change the feeling of a room, a garden, or
                    an afternoon.
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="space-y-4 text-base leading-relaxed text-forest-900/65">
                    <p>
                      Every plant is handpicked, inspected and potted by our
                      team before it makes its way to you. We keep the range
                      small and the quality high, so each plant arrives ready to
                      settle in.
                    </p>
                    <p>
                      Each order comes with care guidance, and our plant people
                      are only a message away whenever you need a little help.
                    </p>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {[
                      "Handpicked",
                      "Eco-friendly packaging",
                      "Care guidance",
                      "A message away",
                    ].map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-moss-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-moss-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <div className="relative overflow-hidden rounded-3xl bg-forest-900 px-6 py-10 sm:rounded-[2.5rem] sm:px-12 sm:py-12 lg:px-16 lg:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-moss-700/40 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-moss-800/50 blur-3xl"
              />
              <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-moss-300">
                    Let&rsquo;s find your green companion
                  </p>
                  <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-sand-50 sm:text-4xl">
                    Not sure which plant is right for you?
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-sand-50/70">
                    Tell us about your light, your space and your routine. We
                    will happily recommend a plant that will actually thrive
                    with you.
                  </p>
                </div>
                {hasNumber && (
                  <Button
                    variant="whatsapp"
                    size="lg"
                    onClick={discussGeneral}
                    className="w-full shrink-0 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 sm:w-auto"
                  >
                    <WhatsAppIcon />
                    Say hello on WhatsApp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <SocialMedia />
      </main>

      <footer className="relative overflow-hidden border-t border-forest-900/10">
        <img
          src="/border-bottom.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-0 w-[min(760px,85vw)] max-w-none select-none opacity-[0.18] mix-blend-multiply"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Logo />
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-forest-900/50">
                A collection &amp; conservation network for native and unique
                plants — for restoration, research &amp; home gardens.
              </p>
              <p className="mt-2 text-sm text-forest-900/40">
                © {new Date().getFullYear()} Blyxa Enterprises. Grown with
                patience, delivered with care.
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
                href="https://www.linkedin.com/in/amruthamsh-a-0573a822a/"
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

      {CART_AND_ORDERS_ENABLED && toast && (
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

      {CART_AND_ORDERS_ENABLED && orderPlaced && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[70] border-b border-moss-700/30 bg-moss-800 px-4 py-3 sm:px-6 text-sand-50 shadow-lg"
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
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-moss-600 px-3.5 py-1.5 text-xs font-semibold text-sand-50 transition-colors hover:bg-moss-500"
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

      <ProductModal
        product={viewProduct}
        cartQty={viewProduct ? (cart[viewProduct.id] ?? 0) : 0}
        commerceEnabled={CART_AND_ORDERS_ENABLED}
        canDiscuss={hasNumber}
        onClose={() => setViewProduct(null)}
        onAddToCart={addToCart}
        onOrderNow={(product) => {
          setViewProduct(null);
          orderNow(product);
        }}
        onDiscuss={discussProduct}
      />

      {CART_AND_ORDERS_ENABLED && (
        <>
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
        </>
      )}
    </div>
  );
}
