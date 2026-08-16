import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isAdminUser } from '../lib/admin'
import Logo from '../components/Logo'
import Button from '../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkSignedIn() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && (await isAdminUser(user.id))) {
        navigate('/admin')
      }
    }
    checkSignedIn()
  }, [navigate])

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : signInError.message,
      )
      setLoading(false)
      return
    }

    const user = data.user
    const admin = user ? await isAdminUser(user.id) : false

    if (!admin) {
      await supabase.auth.signOut()
      setError('This account does not have admin access.')
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen bg-sand-50">
      <div className="relative hidden w-1/2 overflow-hidden bg-forest-900 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 to-forest-950" />
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-moss-600/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-moss-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo onDark />
          <div className="max-w-md">
            <p className="font-serif text-4xl font-medium leading-tight text-sand-50">
              The plants are ready.
              <br />
              Let’s look after them together.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-sand-50/60">
              Manage your product collection, keep stock healthy and fulfil
              every order with care.
            </p>
          </div>
          <p className="text-xs text-sand-50/40">
            © {new Date().getFullYear()} Blyxa Botanicals
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-forest-950">
            Admin sign in
          </h1>
          <p className="mt-1.5 text-sm text-forest-900/55">
            Welcome back — sign in to manage your shop.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-forest-900"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 shadow-sm placeholder:text-forest-900/35 transition-colors focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/25"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-forest-900"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 shadow-sm placeholder:text-forest-900/35 transition-colors focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/25"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-sand-50/40 border-t-sand-50"
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <Link
            to="/"
            className="mt-6 block text-center text-sm font-medium text-forest-900/55 transition-colors hover:text-forest-950"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    </div>
  )
}
