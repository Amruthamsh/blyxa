import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Button from '../Button'
import { Input, TextArea } from '../Input'
import ImageUploader from './ImageUploader'
import type { ProductFormErrors } from '../../lib/validation'
import { LIMITS } from '../../lib/validation'
import { extractPlantDetailsFromDocx } from '../../lib/docxImport'

export interface ProductFormValues {
  name: string
  botanical_name: string
  family: string
  plant_type: string
  description: string
  light: string
  water: string
  potting_mix: string
  maintenance: string
  common_pests: string
  common_diseases: string
  traditional_uses: string
  propagation: string
  safety_note: string
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

const MAX_DOCX_SIZE = 10 * 1024 * 1024

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleDocxChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImportError(null)
    setImportMessage(null)

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setImportError('Please choose a .docx Word document.')
      return
    }
    if (file.size > MAX_DOCX_SIZE) {
      setImportError('The Word document must be 10 MB or smaller.')
      return
    }

    setImporting(true)
    try {
      const details = await extractPlantDetailsFromDocx(file)
      const entries = Object.entries(details).filter(
        (entry): entry is [keyof ProductFormValues, string] => Boolean(entry[1]),
      )

      if (entries.length === 0) {
        setImportError(
          'No plant details were found. Check that the document uses labels such as “Botanical Name” and “Description”.',
        )
        return
      }

      for (const [field, value] of entries) {
        onFieldChange(field, value)
      }
      setImportMessage(
        `Filled ${entries.length} ${entries.length === 1 ? 'field' : 'fields'} from ${file.name}.`,
      )
    } catch (err) {
      setImportError(
        err instanceof Error
          ? err.message
          : 'We could not read that Word document.',
      )
    } finally {
      setImporting(false)
    }
  }

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

      <div className="mb-6 rounded-2xl border border-dashed border-moss-300 bg-moss-50/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-forest-950">
            Autofill from a Word document
          </p>
          <p className="mt-1 text-xs leading-relaxed text-forest-900/55">
            Choose a .docx with labelled details such as Botanical Name, Family,
            Description, Light, Water, and Common Pests. It is read in your
            browser and never uploaded or saved. You can review and edit
            everything before saving.
          </p>
        </div>
        <div className="mt-3 shrink-0 sm:mt-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={handleDocxChange}
            disabled={saving || importing}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving || importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? 'Reading document…' : 'Choose .docx'}
          </Button>
        </div>
      </div>

      {importMessage && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-moss-200 bg-moss-50 px-4 py-3 text-sm text-moss-800"
        >
          {importMessage}
        </p>
      )}

      {importError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {importError}
        </p>
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
            Portrait images look best (2:3, e.g. 4128 × 6192). The photo is
            shown in a tall frame on the product card.
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-moss-600">
              Plant details
            </h5>

            <Input
              label="Plant name"
              required
              value={values.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="e.g. Wild Kottambari"
              maxLength={LIMITS.productName}
              error={fieldErrors?.name}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Botanical name"
                optional
                value={values.botanical_name}
                onChange={(e) => onFieldChange('botanical_name', e.target.value)}
                placeholder="e.g. Eryngium foetidum"
                maxLength={LIMITS.botanicalName}
                error={fieldErrors?.botanical_name}
              />
              <Input
                label="Family"
                optional
                value={values.family}
                onChange={(e) => onFieldChange('family', e.target.value)}
                placeholder="e.g. Apiaceae"
                maxLength={LIMITS.family}
                error={fieldErrors?.family}
              />
            </div>

            <Input
              label="Plant type"
              optional
              value={values.plant_type}
              onChange={(e) => onFieldChange('plant_type', e.target.value)}
              placeholder="e.g. Aromatic herb"
              maxLength={LIMITS.plantType}
              error={fieldErrors?.plant_type}
            />

            <TextArea
              label="Description"
              optional
              rows={4}
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
          </section>

          <section className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-moss-600">
              Growing and care
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Light"
                optional
                value={values.light}
                onChange={(e) => onFieldChange('light', e.target.value)}
                placeholder="e.g. Partial shade"
                maxLength={LIMITS.light}
                error={fieldErrors?.light}
              />
              <Input
                label="Water"
                optional
                value={values.water}
                onChange={(e) => onFieldChange('water', e.target.value)}
                placeholder="e.g. Keep soil consistently moist"
                maxLength={LIMITS.water}
                error={fieldErrors?.water}
              />
            </div>

            <TextArea
              label="Potting mix"
              optional
              rows={2}
              value={values.potting_mix}
              onChange={(e) => onFieldChange('potting_mix', e.target.value)}
              placeholder="e.g. Fertile loamy soil, compost, and cocopeat"
              maxLength={LIMITS.pottingMix}
              error={fieldErrors?.potting_mix}
            />

            <TextArea
              label="Maintenance"
              optional
              rows={2}
              value={values.maintenance}
              onChange={(e) => onFieldChange('maintenance', e.target.value)}
              placeholder="e.g. Harvest mature leaves carefully"
              maxLength={LIMITS.maintenance}
              error={fieldErrors?.maintenance}
            />
          </section>

          <section className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-moss-600">
              Pests, diseases, and notes
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Common pests"
                optional
                value={values.common_pests}
                onChange={(e) => onFieldChange('common_pests', e.target.value)}
                placeholder="e.g. Aphids, slugs, snails"
                maxLength={LIMITS.commonPests}
                error={fieldErrors?.common_pests}
              />
              <Input
                label="Common diseases"
                optional
                value={values.common_diseases}
                onChange={(e) => onFieldChange('common_diseases', e.target.value)}
                placeholder="e.g. Leaf spots and root rot"
                maxLength={LIMITS.commonDiseases}
                error={fieldErrors?.common_diseases}
              />
            </div>

            <TextArea
              label="Traditional uses"
              optional
              rows={2}
              value={values.traditional_uses}
              onChange={(e) => onFieldChange('traditional_uses', e.target.value)}
              placeholder="Culinary, medicinal, or cultural uses"
              maxLength={LIMITS.traditionalUses}
              error={fieldErrors?.traditional_uses}
            />

            <TextArea
              label="Propagation"
              optional
              rows={2}
              value={values.propagation}
              onChange={(e) => onFieldChange('propagation', e.target.value)}
              placeholder="e.g. Stem cuttings, divisions, or seeds"
              maxLength={LIMITS.propagation}
              error={fieldErrors?.propagation}
            />

            <TextArea
              label="Safety note"
              optional
              rows={3}
              value={values.safety_note}
              onChange={(e) => onFieldChange('safety_note', e.target.value)}
              placeholder="Food safety, toxicity, or handling notes"
              maxLength={LIMITS.safetyNote}
              error={fieldErrors?.safety_note}
            />
          </section>

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
