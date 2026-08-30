export const LIMITS = {
  customerName: 100,
  phone: 15,
  email: 254,
  address: 300,
  notes: 500,
  productName: 120,
  productDescription: 1000,
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
  description?: string
  price?: string
  stock?: string
}

export function validateProductForm(values: {
  name: string
  description: string
  price: string
  stock: string
}): ProductFormErrors {
  const errors: ProductFormErrors = {}

  if (!isRequired(values.name)) {
    errors.name = 'Please enter a plant name.'
  } else if (!isWithinLimit(values.name, LIMITS.productName)) {
    errors.name = `Plant name must be ${LIMITS.productName} characters or fewer.`
  }

  if (!isWithinLimit(values.description, LIMITS.productDescription)) {
    errors.description = `Description must be ${LIMITS.productDescription} characters or fewer.`
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