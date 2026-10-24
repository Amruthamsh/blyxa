export interface Product {
  id: string
  name: string
  botanical_name: string | null
  family: string | null
  plant_type: string | null
  description: string | null
  light: string | null
  water: string | null
  potting_mix: string | null
  maintenance: string | null
  common_pests: string | null
  common_diseases: string | null
  traditional_uses: string | null
  propagation: string | null
  safety_note: string | null
  price: number
  stock: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  customer_name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}
