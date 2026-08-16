import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-forest-900 text-sand-50 hover:bg-forest-950 active:bg-forest-950 shadow-sm',
  secondary:
    'border border-forest-900/15 bg-white text-forest-900 hover:border-forest-900/30 hover:bg-moss-50',
  ghost: 'text-moss-700 hover:bg-moss-50 hover:text-forest-900',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-700 shadow-sm',
  whatsapp:
    'border border-emerald-600/20 bg-emerald-50 text-emerald-800 hover:border-emerald-600/40 hover:bg-emerald-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-50 disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
