export type ToastVariant = 'success' | 'error'

export interface ToastData {
  id: number
  message: string
  variant?: ToastVariant
}

interface ToastProps {
  toast: ToastData
  onViewCart?: () => void
}

export default function Toast({ toast, onViewCart }: ToastProps) {
  const isError = toast.variant === 'error'
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="pointer-events-auto animate-toast-in"
    >
      <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-forest-900/10 bg-white px-4 py-3 shadow-xl shadow-forest-950/10">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isError
              ? 'bg-red-50 text-red-600'
              : 'bg-moss-100 text-moss-600'
          }`}
        >
          {isError ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="flex-1 text-sm font-medium text-forest-900">
          {toast.message}
        </span>
        {!isError && onViewCart && (
          <button
            type="button"
            onClick={onViewCart}
            className="shrink-0 rounded-full bg-forest-900 px-3 py-1.5 text-xs font-semibold text-sand-50 transition-colors hover:bg-forest-950"
          >
            View cart
          </button>
        )}
        <span
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left animate-toast-progress ${
            isError ? 'bg-red-300' : 'bg-moss-300'
          }`}
        />
      </div>
    </div>
  )
}
