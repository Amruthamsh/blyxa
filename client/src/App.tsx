import { useMemo, useRef, useState } from "react";
import type { CartEntry } from "./components/CartDrawer";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { PlantCard } from "./components/PlantCard";
import { PlantIcon } from "./components/PlantIcon";
import { WhatsAppIcon } from "./components/WhatsAppIcon";
import {
  CATEGORIES,
  PLANTS,
  whatsappLink,
} from "./data/plants";

type Category = (typeof CATEGORIES)[number];

export default function App() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("All");
  const toastTimer = useRef<number | null>(null);

  const plantsById = useMemo(
    () => new Map(PLANTS.map((plant) => [plant.id, plant])),
    [],
  );

  const cartCount = cart.reduce((sum, entry) => sum + entry.qty, 0);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (id: string) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === id);
      if (existing) {
        return current.map((entry) =>
          entry.id === id ? { ...entry, qty: entry.qty + 1 } : entry,
        );
      }
      return [...current, { id, qty: 1 }];
    });
    const plant = plantsById.get(id);
    if (plant) showToast(`${plant.name} added to your cart`);
  };

  const setQty = (id: string, qty: number) => {
    setCart((current) =>
      qty <= 0
        ? current.filter((entry) => entry.id !== id)
        : current.map((entry) => (entry.id === id ? { ...entry, qty } : entry)),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((entry) => entry.id !== id));
  };

  const checkoutEntries = cart
    .map((entry) => ({ entry, plant: plantsById.get(entry.id) }))
    .filter(({ plant }) => plant !== undefined)
    .map(({ entry, plant }) => ({ plant: plant!, qty: entry.qty }));

  return (
    <div className="min-h-screen">
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <main>
        <Hero />
        <Shop
          category={category}
          onCategory={setCategory}
          onAdd={addToCart}
        />
        <WhyBlyxa />
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        items={cart}
        plants={plantsById}
        onClose={() => setCartOpen(false)}
        onSetQty={setQty}
        onRemove={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        entries={checkoutEntries}
        onClose={() => setCheckoutOpen(false)}
      />

      {toast && (
        <div className="animate-pop fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-leaf-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({
  cartCount,
  onCartOpen,
}: {
  cartCount: number;
  onCartOpen: () => void;
}) {
  const contactLink = whatsappLink("Hello Blyxa Enterprises! 🌿 I'd like to know more about your plants.");

  return (
    <header className="sticky top-0 z-30 border-b border-leaf-100/70 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-leaf-700 text-white shadow-sm shadow-leaf-700/30">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-leaf-900">
              Blyxa
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.22em] text-leaf-600 uppercase">
              Enterprises
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-leaf-800 md:flex">
          <a href="#shop" className="transition-colors hover:text-leaf-600">
            Shop
          </a>
          <a href="#why" className="transition-colors hover:text-leaf-600">
            Why Blyxa
          </a>
          <a href="#contact" className="transition-colors hover:text-leaf-600">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={contactLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#25D366]/40 transition-all hover:brightness-105 sm:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            <span>Chat with us</span>
          </a>
          <button
            type="button"
            onClick={onCartOpen}
            aria-label={`Open cart, ${cartCount} items`}
            className="relative rounded-full border border-leaf-200 bg-white p-2.5 text-leaf-800 transition-colors hover:border-leaf-500 hover:bg-leaf-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-sun-400 text-[11px] font-bold text-leaf-950 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-20"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-leaf-100 bg-gradient-to-br from-leaf-50 via-white to-sun-100 px-6 py-14 shadow-xl shadow-leaf-900/5 sm:px-12 sm:py-20">
        <div className="animate-floaty pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-leaf-200/50 blur-3xl" />
        <div className="animate-floaty-slow pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-sun-200/50 blur-3xl" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-leaf-700 shadow-sm ring-1 ring-leaf-200">
              <span className="size-2 rounded-full bg-leaf-500" />
              Hand-picked plants, delivered with love
            </span>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-leaf-950 sm:text-6xl">
              Grow something{" "}
              <span className="relative text-leaf-600 italic">
                wonderful
                <svg
                  viewBox="0 0 120 12"
                  className="absolute -bottom-2 left-0 w-full text-sun-400"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9 C 30 3 90 3 118 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              at home.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-600 lg:mx-0">
              Blyxa Enterprises brings you a curated collection of thriving
              houseplants. Check live stock, add to your cart, and order in
              seconds — straight over WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="#shop"
                className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-700/30 transition-all hover:bg-leaf-800 active:scale-[0.98]"
              >
                Shop the collection
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#shop"
                className="inline-flex items-center gap-2 rounded-full border border-leaf-300 bg-white px-7 py-3.5 text-sm font-semibold text-leaf-800 transition-all hover:border-leaf-500 hover:bg-leaf-50"
              >
                Explore plants
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 sm:max-w-lg">
              {[
                { value: "10+", label: "Plant varieties" },
                { value: "Same-week", label: "Delivery" },
                { value: "4.9★", label: "Happy growers" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/80 px-3 py-3 text-center ring-1 ring-leaf-100"
                >
                  <dt className="order-2 mt-1 text-[11px] font-medium text-stone-500">
                    {stat.label}
                  </dt>
                  <dd className="font-display order-1 text-lg font-bold text-leaf-800">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up relative hidden h-80 lg:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-floaty relative flex items-end justify-center gap-6">
                {[
                  { plant: PLANTS[0], rotate: "-rotate-6", delay: "0s" },
                  { plant: PLANTS[6], rotate: "rotate-0", delay: "1.2s" },
                  { plant: PLANTS[7], rotate: "rotate-6", delay: "0.6s" },
                ].map(({ plant, rotate, delay }) => (
                  <div
                    key={plant.id}
                    className="rounded-[2rem] bg-white p-3 shadow-xl shadow-leaf-900/10 ring-1 ring-leaf-100"
                    style={{ animation: `floaty 6s ease-in-out ${delay} infinite` }}
                  >
                    <PlantIcon
                      variant={plant.art}
                      pot={plant.pot}
                      leaf={plant.leaf}
                      accent={plant.accent}
                      className={`h-32 w-36 ${rotate}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Shop({
  category,
  onCategory,
  onAdd,
}: {
  category: Category;
  onCategory: (category: Category) => void;
  onAdd: (id: string) => void;
}) {
  const visiblePlants = useMemo(
    () =>
      category === "All"
        ? PLANTS
        : PLANTS.filter((plant) => plant.category === category),
    [category],
  );

  return (
    <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-leaf-600 uppercase">
            Our collection
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold text-leaf-950 sm:text-4xl">
            Plants, ready to find a home
          </h2>
        </div>
        <div className="slim-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onCategory(option)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === option
                  ? "bg-leaf-700 text-white shadow-sm shadow-leaf-700/30"
                  : "bg-white text-leaf-800 ring-1 ring-leaf-200 hover:bg-leaf-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function WhyBlyxa() {
  const reasons = [
    {
      title: "Hand-picked quality",
      text: "Every plant is inspected, repotted and nursed before it ships, so you always receive something healthy and proud.",
      icon: (
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
    },
    {
      title: "Live stock, always",
      text: "No surprises — each plant shows its true availability, and low stock is flagged so you can order while it lasts.",
      icon: (
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      title: "Order via WhatsApp",
      text: "No forms, no accounts. Your cart becomes a ready-to-send WhatsApp message — and we confirm it personally.",
      icon: <WhatsAppIcon className="size-7" />,
    },
  ];

  return (
    <section id="why" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-leaf-600 uppercase">
            Why Blyxa
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold text-leaf-950 sm:text-4xl">
            Green thumbs not required
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-600">
            We make buying a plant as pleasant as owning one — from a warm
            welcome to a doorstep delivery.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-3xl border border-leaf-100 bg-cream p-7 transition-shadow hover:shadow-lg hover:shadow-leaf-900/5"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
                {reason.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-leaf-900">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const contactLink = whatsappLink("Hello Blyxa Enterprises! 🌿 I'd like to know more about your plants.");

  return (
    <footer id="contact" className="scroll-mt-20 bg-leaf-950 text-leaf-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-leaf-800 text-white">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-white">
                Blyxa
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.22em] text-leaf-300 uppercase">
                Enterprises
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-leaf-200/80">
            Premium houseplants, curated with care and delivered to your door.
            Order over WhatsApp and grow something wonderful.
          </p>
          <p className="mt-4 text-xs text-leaf-300/70">
            Stock shown on this site is live.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-[0.22em] text-sun-300 uppercase">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="#shop" className="transition-colors hover:text-sun-200">
                Shop plants
              </a>
            </li>
            <li>
              <a href="#why" className="transition-colors hover:text-sun-200">
                Why Blyxa
              </a>
            </li>
            <li>
              <a href="#top" className="transition-colors hover:text-sun-200">
                Back to top
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-[0.22em] text-sun-300 uppercase">
            Get in touch
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-sun-200"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp us
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@blyxa.example"
                className="transition-colors hover:text-sun-200"
              >
                hello@blyxa.example
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-leaf-900">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-leaf-300/70 sm:px-6">
          © {year} Blyxa Enterprises. Grown with care. 🌿
        </p>
      </div>
    </footer>
  );
}
