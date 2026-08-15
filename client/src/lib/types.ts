export interface Product {
  id: string
  name: string
  description: string | null
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
