import type { ReactNode } from 'react'
import Logo from '../Logo'
import Button from '../Button'

interface AdminLayoutProps {
  onNavigate: (view: 'products' | 'orders') => void
  activeView: 'products' | 'orders'
  onLogout: () => void
  children: ReactNode
}

export default function AdminLayout({
  onNavigate,
  activeView,
  onLogout,
  children,
}: AdminLayoutProps) {
  const navItems = [
    { id: 'products' as const, label: 'Products' },
    { id: 'orders' as const, label: 'Orders' },
  ]

  return (
    <div className="min-h-screen bg-sand-50 text-forest-950">
      <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-sand-50/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            <Logo />
            <span className="rounded-full bg-moss-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-moss-700">
              Admin
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 sm:inline-flex"
            >
              Back to shop
            </a>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav
          className="mb-8 inline-flex rounded-full border border-forest-900/10 bg-white p-1 shadow-sm"
          aria-label="Admin sections"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 ${
                activeView === item.id
                  ? 'bg-forest-900 text-sand-50'
                  : 'text-forest-900/60 hover:text-forest-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {children}
      </div>
    </div>
  )
}
