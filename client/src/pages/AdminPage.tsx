import { useState } from "react";
import { Link } from "../lib/router";
import { AdminOrders } from "./AdminOrders";
import { AdminProducts } from "./AdminProducts";

type Tab = "orders" | "products";

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-leaf-950 text-leaf-100 shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-leaf-800 text-white">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-bold text-white">
                Blyxa Admin
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-sun-300 uppercase">
                Store management
              </span>
            </span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-leaf-800 bg-leaf-900 px-4 py-2 text-sm font-semibold text-leaf-100 transition-colors hover:border-sun-300 hover:text-sun-200"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            View site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex gap-1 rounded-full bg-white p-1 ring-1 ring-leaf-200 sm:w-fit">
          {(
            [
              { id: "orders", label: "Orders", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
              { id: "products", label: "Products", icon: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10Zm0-10V7m0 5h5m-5 0H7" },
            ] as { id: Tab; label: string; icon: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                tab === item.id
                  ? "bg-leaf-700 text-white shadow-sm shadow-leaf-700/30"
                  : "text-leaf-800 hover:bg-leaf-50"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "orders" ? <AdminOrders /> : <AdminProducts />}
      </div>
    </div>
  );
}
