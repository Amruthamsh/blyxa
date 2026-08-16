import Button from './Button'

interface EmptyStateProps {
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-900/15 bg-moss-50/40 text-center ${
        compact ? 'px-6 py-12' : 'px-6 py-20'
      }`}
    >
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-moss-100 text-moss-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8c-1.445-.459-2.904-.601-4.366-.363C13.916 8.175 11.5 9.75 11.5 12.5c0 1.933 1.567 3.5 3.5 3.5.807 0 1.526-.273 2.132-.727M21 8c-4-1.333-8-1.333-12 0m12 0v8.5M9.5 21h5m-2.5-4v4m-2.75-7.5A3.75 3.75 0 013 9.75C3 6.866 5.322 4.5 8.167 4.5c.965 0 1.876.286 2.583.786"
          />
        </svg>
      </span>
      <h3 className="font-serif text-2xl text-forest-900">{title}</h3>
      {message && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-forest-900/60">
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
