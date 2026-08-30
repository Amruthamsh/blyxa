import { useEffect, useState } from 'react'
import Logo from './Logo'

interface HeaderProps {
  cartCount: number
  onOpenCart: () => void
  onNavigate: (section: string) => void
}

export default function Header({ cartCount, onOpenCart, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function goTo(section: string) {
    setMenuOpen(false)
    onNavigate(section)
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-200 ${
        scrolled
          ? 'border-forest-900/10 bg-sand-50/90 backdrop-blur-md'
          : 'border-transparent bg-sand-50/70'
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            goTo('top')
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          aria-label="Blyxa home"
        >
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <button
            type="button"
            onClick={() => goTo('introduction')}
            className="text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            Introduction
          </button>
          <button
            type="button"
            onClick={() => goTo('categories')}
            className="text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => goTo('products')}
            className="text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => goTo('about')}
            className="text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => goTo('contact')}
            className="text-sm font-medium text-forest-900/70 transition-colors hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 rounded"
          >
            Contact
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500"
            aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5.5 w-5.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-moss-600 px-1 text-[0.7rem] font-bold text-sand-50">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5.5 w-5.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-forest-900/10 bg-sand-50 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {(['introduction', 'categories', 'products', 'about', 'contact'] as const).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => goTo(section)}
                className="rounded-lg px-3 py-3 text-left text-base font-medium capitalize text-forest-900 transition-colors hover:bg-moss-100"
              >
                {section === 'products' ? 'Shop' : section}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
