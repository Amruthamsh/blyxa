import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import type { Product } from '../lib/types'
import { formatPrice } from '../lib/format'
import Button from './Button'
import { Input, TextArea } from './Input'
import { Stepper } from './CartDrawer'
import { WhatsAppIcon } from './CartDrawer'
import { LIMITS, isEmailValid, isPhoneValid } from '../lib/validation'

export interface CheckoutLineItem {
  product: Product
  qty: number
}

export interface CheckoutDetails {
  customer_name: string
  phone: string
  email: string
  address: string
  notes: string
}

interface CheckoutModalProps {
  open: boolean
  items: CheckoutLineItem[]
  total: number
  form: CheckoutDetails
  submitting: boolean
  error: string | null
  canDiscuss: boolean
  onClose: () => void
  onUpdateForm: (field: keyof CheckoutDetails, value: string) => void
  onAdjust: (product: Product, delta: number) => void
  onSubmit: (event: FormEvent) => void
  onDiscuss: () => void
}

export default function CheckoutModal({
  open,
  items,
  total,
  form,
  submitting,
  error,
  canDiscuss,
  onClose,
  onUpdateForm,
  onAdjust,
  onSubmit,
  onDiscuss,
}: CheckoutModalProps) {
  const [fieldErrors, setFieldErrors] = useState<Partial<CheckoutDetails>>({})

  useEffect(() => {
    if (open) setFieldErrors({})
  }, [open])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors: Partial<CheckoutDetails> = {}
    if (!form.customer_name.trim()) errors.customer_name = 'Please enter your name.'
    else if (form.customer_name.length > LIMITS.customerName)
      errors.customer_name = `Name must be ${LIMITS.customerName} characters or fewer.`
    if (!form.phone.trim()) errors.phone = 'Please enter your phone number.'
    else if (!isPhoneValid(form.phone))
      errors.phone = 'Please enter a valid 10-digit phone number.'
    if (form.email.trim()) {
      if (!isEmailValid(form.email))
        errors.email = 'Please enter a valid email address.'
      else if (form.email.length > LIMITS.email)
        errors.email = `Email must be ${LIMITS.email} characters or fewer.`
    }
    if (!form.address.trim()) errors.address = 'Please enter your delivery address.'
    else if (form.address.length > LIMITS.address)
      errors.address = `Address must be ${LIMITS.address} characters or fewer.`
    if (form.notes.length > LIMITS.notes)
      errors.notes = `Notes must be ${LIMITS.notes} characters or fewer.`
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    onSubmit(event)
  }

  function updateField(field: keyof CheckoutDetails, value: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    onUpdateForm(field, value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-forest-950/45"
        onClick={submitting ? undefined : onClose}
      />
      <div className="relative flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-sand-50 shadow-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between border-b border-forest-900/10 px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-forest-950">
              Complete your order
            </h2>
            <p className="mt-0.5 text-sm text-forest-900/50">
              We’ll confirm on WhatsApp once it’s placed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-full text-forest-900 transition-colors hover:bg-moss-100 disabled:opacity-40"
            aria-label="Close checkout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 sm:px-8"
          noValidate
        >
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>
                {error.startsWith('{')
                  ? 'We couldn’t place your order. Please try again or chat with us.'
                  : error}
              </span>
            </div>
          )}

          <section aria-labelledby="details-heading">
            <h3
              id="details-heading"
              className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-moss-600"
            >
              Your details
            </h3>
            <div className="space-y-4">
              <Input
                label="Name"
                required
                value={form.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={LIMITS.customerName}
                error={fieldErrors.customer_name}
              />
              <Input
                label="Phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Your phone number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={LIMITS.phone}
                error={fieldErrors.phone}
              />
              <Input
                label="Email"
                type="email"
                optional
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={LIMITS.email}
                error={fieldErrors.email}
              />
              <Input
                label="Address"
                required
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Delivery address"
                autoComplete="street-address"
                maxLength={LIMITS.address}
                error={fieldErrors.address}
              />
              <TextArea
                label="Notes"
                optional
                rows={2}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any special instructions"
                maxLength={LIMITS.notes}
                error={fieldErrors.notes}
              />
            </div>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="mt-7 rounded-2xl border border-forest-900/10 bg-white p-5"
          >
            <h3
              id="summary-heading"
              className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-moss-600"
            >
              Order summary
            </h3>
            <ul className="space-y-3.5">
              {items.map(({ product, qty }) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-forest-950">
                      {product.name}
                    </p>
                    <p className="text-xs text-forest-900/50">
                      {formatPrice(product.price)} each
                    </p>
                  </div>
                  <Stepper
                    value={qty}
                    max={product.stock}
                    onDecrease={() => onAdjust(product, -1)}
                    onIncrease={() => onAdjust(product, 1)}
                    label={product.name}
                  />
                  <span className="w-20 text-right text-sm font-bold text-forest-950">
                    {formatPrice(product.price * qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between border-t border-forest-900/10 pt-4">
              <span className="text-sm font-medium text-forest-900/70">
                Total
              </span>
              <span className="font-serif text-2xl font-semibold text-forest-950">
                {formatPrice(total)}
              </span>
            </div>
          </section>

          <div className="mt-6 space-y-2.5">
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={submitting || items.length === 0}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-50/40 border-t-sand-50" aria-hidden="true" />
                  Placing your order…
                </>
              ) : (
                'Place order'
              )}
            </Button>
            {canDiscuss && (
              <Button
                type="button"
                variant="whatsapp"
                fullWidth
                onClick={onDiscuss}
                disabled={submitting}
              >
                <WhatsAppIcon />
                Have a question? Chat with us
              </Button>
            )}
            <p className="pt-1 text-center text-xs text-forest-900/45">
              After placing your order, we’ll reach out on WhatsApp to confirm.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
