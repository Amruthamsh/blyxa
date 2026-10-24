export const LIMITS = {
  customerName: 100,
  phone: 15,
  email: 254,
  address: 300,
  notes: 500,
  productName: 120,
  botanicalName: 200,
  family: 120,
  plantType: 160,
  productDescription: 1000,
  light: 300,
  water: 300,
  pottingMix: 500,
  maintenance: 1000,
  commonPests: 500,
  commonDiseases: 500,
  traditionalUses: 1000,
  propagation: 500,
  safetyNote: 1500,
  price: 9_999_999,
  stock: 999_999,
} as const

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

export function isWithinLimit(value: string, max: number): boolean {
  return value.length <= max
}

export function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return (
    digits.length === 10 ||
    (digits.length === 12 && digits.startsWith('91'))
  )
}

export function isEmailValid(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value.trim())
}

export interface ProductFormErrors {
  name?: string
  botanical_name?: string
  family?: string
  plant_type?: string
  description?: string
  light?: string
  water?: string
  potting_mix?: string
  maintenance?: string
  common_pests?: string
  common_diseases?: string
  traditional_uses?: string
  propagation?: string
  safety_note?: string
  price?: string
  stock?: string
}

export interface ProductFormValuesForValidation {
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
}

export function validateProductForm(
  values: ProductFormValuesForValidation,
): ProductFormErrors {
  const errors: ProductFormErrors = {}

  if (!isRequired(values.name)) {
    errors.name = 'Please enter a plant name.'
  } else if (!isWithinLimit(values.name, LIMITS.productName)) {
    errors.name = `Plant name must be ${LIMITS.productName} characters or fewer.`
  }

  const textFields: {
    field: keyof ProductFormErrors
    value: string
    limit: number
    label: string
  }[] = [
    { field: 'botanical_name', value: values.botanical_name, limit: LIMITS.botanicalName, label: 'Botanical name' },
    { field: 'family', value: values.family, limit: LIMITS.family, label: 'Family' },
    { field: 'plant_type', value: values.plant_type, limit: LIMITS.plantType, label: 'Plant type' },
    { field: 'description', value: values.description, limit: LIMITS.productDescription, label: 'Description' },
    { field: 'light', value: values.light, limit: LIMITS.light, label: 'Light' },
    { field: 'water', value: values.water, limit: LIMITS.water, label: 'Water' },
    { field: 'potting_mix', value: values.potting_mix, limit: LIMITS.pottingMix, label: 'Potting mix' },
    { field: 'maintenance', value: values.maintenance, limit: LIMITS.maintenance, label: 'Maintenance' },
    { field: 'common_pests', value: values.common_pests, limit: LIMITS.commonPests, label: 'Common pests' },
    { field: 'common_diseases', value: values.common_diseases, limit: LIMITS.commonDiseases, label: 'Common diseases' },
    { field: 'traditional_uses', value: values.traditional_uses, limit: LIMITS.traditionalUses, label: 'Traditional uses' },
    { field: 'propagation', value: values.propagation, limit: LIMITS.propagation, label: 'Propagation' },
    { field: 'safety_note', value: values.safety_note, limit: LIMITS.safetyNote, label: 'Safety note' },
  ]

  for (const { field, value, limit, label } of textFields) {
    if (!isWithinLimit(value, limit)) {
      errors[field] = `${label} must be ${limit} characters or fewer.`
    }
  }

  const price = parseFloat(values.price)
  if (!isRequired(values.price) || Number.isNaN(price)) {
    errors.price = 'Please enter a valid price.'
  } else if (price < 0) {
    errors.price = 'Price cannot be negative.'
  } else if (price > LIMITS.price) {
    errors.price = `Price must be ${LIMITS.price} or less.`
  }

  const stock = parseInt(values.stock, 10)
  if (!isRequired(values.stock) || Number.isNaN(stock)) {
    errors.stock = 'Please enter a valid stock count.'
  } else if (stock < 0) {
    errors.stock = 'Stock cannot be negative.'
  } else if (stock > LIMITS.stock) {
    errors.stock = `Stock must be ${LIMITS.stock} or less.`
  }

  return errors
}