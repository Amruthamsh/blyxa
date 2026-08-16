import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isAdminUser } from '../lib/admin'
import type { Order, OrderStatus, Product } from '../lib/types'
import AdminLayout from '../components/admin/AdminLayout'
import ProductForm from '../components/admin/ProductForm'
import type { ProductFormValues } from '../components/admin/ProductForm'
import ProductTable from '../components/admin/ProductTable'
import OrderList from '../components/admin/OrderList'
import { Skeleton } from '../components/LoadingState'
import Button from '../components/Button'

const PRODUCT_IMAGE_BUCKET = 'product-images'

const emptyProductForm: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  is_active: true,
}

export default function Admin() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      const admin = await isAdminUser(user.id)
      if (!admin) {
        await supabase.auth.signOut()
        navigate('/login')
        return
      }
      setAuthorized(true)
    }
    checkAuth()
  }, [navigate])

  async function fetchData() {
    setLoading(true)
    setError(null)
    const [productResult, orderResult] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false }),
    ])

    if (productResult.error) {
      setError(productResult.error.message)
    } else {
      setProducts(productResult.data ?? [])
    }
    if (orderResult.error) {
      setError(orderResult.error.message)
    } else {
      setOrders(orderResult.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  function startCreate() {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setImageFile(null)
    setError(null)
    setShowAddProduct(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      stock: String(product.stock),
      is_active: product.is_active,
    })
    setImageFile(null)
    setError(null)
    setShowAddProduct(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setImageFile(null)
    setShowAddProduct(false)
  }

  async function uploadProductImage(file: File, productId: string) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const path = `${productId}/main-${Date.now()}.${extension}`

    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  }

  async function submitProduct(event: FormEvent) {
    event.preventDefault()
    const price = parseFloat(productForm.price)
    const stock = parseInt(productForm.stock, 10) || 0
    if (!productForm.name.trim() || Number.isNaN(price) || price < 0) {
      setError('Please provide a plant name and a valid price.')
      return
    }

    if (!editingProduct && !imageFile) {
      setError('Please upload a product image. A product must have a photo.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (editingProduct) {
        let imageUrl = editingProduct.image_url
        if (imageFile) {
          imageUrl = await uploadProductImage(imageFile, editingProduct.id)
        }

        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name.trim(),
            description: productForm.description.trim() || null,
            price,
            stock,
            image_url: imageUrl,
            is_active: productForm.is_active,
          })
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const productId = crypto.randomUUID()
        const imageUrl = await uploadProductImage(imageFile!, productId)

        const { error } = await supabase.from('products').insert({
          id: productId,
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          price,
          stock,
          image_url: imageUrl,
          is_active: productForm.is_active,
        })

        if (error) throw error
      }

      cancelForm()
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  async function updateOrderStatus(order: Order, status: OrderStatus) {
    setStatusUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (error) {
      setError(error.message)
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
      )
    }
    setStatusUpdating(false)
  }

  function updateProductForm(field: keyof typeof emptyProductForm, value: string | boolean) {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (authorized !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <div className="text-center">
          <p className="text-sm text-forest-900/60">Checking access…</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      activeView={tab}
      onNavigate={(view) => {
        setTab(view)
        setShowAddProduct(false)
        setEditingProduct(null)
        setError(null)
      }}
      onLogout={handleLogout}
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          {error && !showAddProduct && (
            <div
              role="alert"
              className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Something went wrong loading your dashboard.
                </p>
                <p className="text-sm text-red-600/80">{error}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchData}>
                Try again
              </Button>
            </div>
          )}
          {tab === 'products' ? (
            <section>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-3xl font-medium tracking-tight text-forest-950">
                    Products
                  </h3>
                  <p className="mt-1 text-sm text-forest-900/55">
                    {products.length} {products.length === 1 ? 'plant' : 'plants'} in your collection
                  </p>
                </div>
                {!showAddProduct && (
                  <Button variant="primary" onClick={startCreate}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add product
                  </Button>
                )}
              </div>

              {showAddProduct && (
                <div className="mb-8">
                  <ProductForm
                    values={productForm}
                    imageFile={imageFile}
                    editingProductName={editingProduct?.name}
                    editingProductImageUrl={editingProduct?.image_url}
                    required={!editingProduct}
                    saving={saving}
                    error={error}
                    onFieldChange={updateProductForm}
                    onImageChange={setImageFile}
                    onSubmit={submitProduct}
                    onCancel={cancelForm}
                  />
                </div>
              )}

              {!showAddProduct && (
                <ProductTable
                  products={products}
                  onEdit={startEdit}
                  onAdd={startCreate}
                />
              )}
            </section>
          ) : (
            <section>
              <div className="mb-6">
                <h3 className="font-serif text-3xl font-medium tracking-tight text-forest-950">
                  Orders
                </h3>
                <p className="mt-1 text-sm text-forest-900/55">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} received
                </p>
              </div>

              <OrderList
                orders={orders}
                products={products}
                onStatusChange={updateOrderStatus}
                statusUpdating={statusUpdating}
              />
            </section>
          )}
        </>
      )}
    </AdminLayout>
  )
}
