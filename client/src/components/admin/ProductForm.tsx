import type { FormEvent } from 'react'
import Button from '../Button'
import { Input, TextArea } from '../Input'
import ImageUploader from './ImageUploader'
import type { ProductFormErrors } from '../../lib/validation'
import { LIMITS } from '../../lib/validation'

export interface ProductFormValues {
  name: string
  description: string
  price: string
  stock: string
  is_active: boolean
}

interface ProductFormProps {
  values: ProductFormValues
  imageFile: File | null
  editingProductName?: string
  editingProductImageUrl?: string | null
  required?: boolean
  saving: boolean
  error: string | null
  fieldErrors?: ProductFormErrors
  onFieldChange: (field: keyof ProductFormValues, value: string | boolean) => void
  onImageChange: (file: File | null) => void
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
}

export default function ProductForm({
  values,
  imageFile,
  editingProductName,
  editingProductImageUrl,
  required,
  saving,
  error,
  fieldErrors,
  onFieldChange,
  onImageChange,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const isEditing = Boolean(editingProductName)

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-serif text-2xl font-semibold text-forest-950">
            {isEditing ? `Edit · ${editingProductName}` : 'Add a new plant'}
          </h4>
          <p className="mt-1 text-sm text-forest-900/55">
            {isEditing
              ? 'Update the details below. Changes go live immediately.'
              : 'Give your plant a name and tell customers what makes it special.'}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr]">
        <div>
          <p className="mb-2 text-sm font-medium text-forest-900">Photo</p>
          <ImageUploader
            value={imageFile}
            currentImageUrl={isEditing ? editingProductImageUrl : null}
            currentImageName={isEditing ? editingProductName : undefined}
            required={required}
            disabled={saving}
            onChange={onImageChange}
          />
          <p className="mt-3 max-w-[11rem] text-xs leading-relaxed text-forest-900/50">
            Square images look best (1:1). The photo is shown as a square on
            the product card.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Plant name"
            required
            value={values.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="e.g. Monstera Deliciosa"
            maxLength={LIMITS.productName}
            error={fieldErrors?.name}
          />

          <TextArea
            label="Description"
            optional
            rows={3}
            value={values.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            placeholder="A short, friendly description for the plant card"
            maxLength={LIMITS.productDescription}
            error={fieldErrors?.description}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Price (₹)"
              type="number"
              required
              min="0"
              max={LIMITS.price}
              step="0.01"
              value={values.price}
              onChange={(e) => onFieldChange('price', e.target.value)}
              placeholder="0.00"
              error={fieldErrors?.price}
            />
            <Input
              label="Stock"
              type="number"
              required
              min="0"
              max={LIMITS.stock}
              step="1"
              value={values.stock}
              onChange={(e) => onFieldChange('stock', e.target.value)}
              placeholder="0"
              error={fieldErrors?.stock}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-900/10 bg-moss-50/60 px-4 py-3.5">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => onFieldChange('is_active', e.target.checked)}
              className="h-5 w-5 accent-moss-600"
            />
            <span>
              <span className="block text-sm font-semibold text-forest-900">
                Active
              </span>
              <span className="block text-xs text-forest-900/50">
                Visible to customers in the shop
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={saving}
              className="sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="sm:flex-1"
              size="lg"
            >
              {saving ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-sand-50/40 border-t-sand-50"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : isEditing ? (
                'Save changes'
              ) : (
                'Create product'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
