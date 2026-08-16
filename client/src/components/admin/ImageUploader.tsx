import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_MB = 8

function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WebP or AVIF image.'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Image is too large. Maximum size is ${MAX_SIZE_MB}MB.`
  }
  return null
}

interface ImageUploaderProps {
  value: File | null
  currentImageUrl?: string | null
  currentImageName?: string
  required?: boolean
  disabled?: boolean
  uploading?: boolean
  onChange: (file: File | null) => void
}

export default function ImageUploader({
  value,
  currentImageUrl,
  currentImageName,
  required = false,
  disabled = false,
  uploading = false,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showCurrent = Boolean(currentImageUrl) && !value
  const previewUrl = value ? URL.createObjectURL(value) : null

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const validationError = validateImage(file)
    if (validationError) {
      setError(validationError)
      onChange(null)
      return
    }
    setError(null)
    onChange(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (disabled || uploading) return
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="sr-only"
        aria-hidden="true"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {showCurrent && (
        <div>
          <div className="relative aspect-square w-44 overflow-hidden rounded-2xl border border-forest-900/10">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={currentImageName ?? 'Current product image'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-moss-100 text-sm text-forest-900/40">
                No image
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-forest-950/70 px-2.5 py-1 text-[0.65rem] font-semibold text-sand-50 backdrop-blur">
              Current image
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="rounded-full border border-forest-900/15 px-4 py-2 text-sm font-semibold text-forest-900 transition-colors hover:bg-moss-50 disabled:opacity-45"
            >
              Replace image
            </button>
            {required && (
              <span className="text-xs text-forest-900/50">
                Choose a new image to replace it
              </span>
            )}
          </div>
        </div>
      )}

      {value && previewUrl && (
        <div>
          <div className="relative aspect-square w-44 overflow-hidden rounded-2xl border-2 border-moss-500/60">
            <img
              src={previewUrl}
              alt="New product image preview"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-2 top-2 rounded-full bg-moss-600 px-2.5 py-1 text-[0.65rem] font-semibold text-sand-50">
              New image
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="rounded-full border border-forest-900/15 px-4 py-2 text-sm font-semibold text-forest-900 transition-colors hover:bg-moss-50 disabled:opacity-45"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled || uploading}
              className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-45"
            >
              Remove
            </button>
            {required && (
              <span className="text-xs text-forest-900/50">
                A product must have an image
              </span>
            )}
          </div>
        </div>
      )}

      {!showCurrent && !value && (
        <div
          onClick={() => {
            if (!disabled && !uploading) inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled && !uploading) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!disabled && !uploading) inputRef.current?.click()
            }
          }}
          aria-label="Upload product image"
          className={`flex aspect-square w-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-500 ${
            dragging
              ? 'border-moss-500 bg-moss-50'
              : 'border-forest-900/20 bg-white hover:border-moss-500 hover:bg-moss-50'
          } ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-moss-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
          <span className="text-sm font-semibold text-forest-900">
            Upload product image
          </span>
          <span className="text-xs text-forest-900/50">
            Drag &amp; drop or click to browse
          </span>
          <span className="text-[0.65rem] text-forest-900/40">
            JPG, PNG, WebP or AVIF · max 8MB
          </span>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {uploading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-forest-900/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-moss-600/30 border-t-moss-600" aria-hidden="true" />
          Uploading image…
        </div>
      )}
    </div>
  )
}
