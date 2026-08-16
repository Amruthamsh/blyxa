import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseFieldClasses =
  'w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-950 shadow-sm placeholder:text-forest-900/35 transition-colors focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/25'

interface FieldShellProps {
  label: string
  htmlFor: string
  optional?: boolean
  error?: string | null
  children: React.ReactNode
}

export function FieldShell({
  label,
  htmlFor,
  optional,
  error,
  children,
}: FieldShellProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-forest-900"
        >
          {label}
        </label>
        {optional && (
          <span className="text-xs text-forest-900/40">Optional</span>
        )}
      </div>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  optional?: boolean
  error?: string | null
}

export function Input({ label, optional, error, id, className, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell label={label} htmlFor={inputId} optional={optional} error={error}>
      <input
        id={inputId}
        className={`${baseFieldClasses} ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </FieldShell>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  optional?: boolean
  error?: string | null
}

export function TextArea({
  label,
  optional,
  error,
  id,
  className,
  ...props
}: TextAreaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <FieldShell label={label} htmlFor={textareaId} optional={optional} error={error}>
      <textarea
        id={textareaId}
        className={`${baseFieldClasses} ${className ?? ''}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </FieldShell>
  )
}
