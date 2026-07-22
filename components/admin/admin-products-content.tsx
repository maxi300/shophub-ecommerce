'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Loader } from 'lucide-react'
import { ImageUploader } from '@/components/admin/image-uploader'

interface Product {
  id: string
  name: string
  price: number
  discount_price?: number
  image_url?: string
  stock: number
  is_active: boolean
  category_id?: string
  badge_text?: string
  description?: string
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: '',
    category_id: '',
    stock: '',
    badge_text: '',
    is_active: true,
  })

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order')

        if (catError) throw catError
        setCategories(categoriesData || [])

        // Fetch products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (prodError) throw prodError
        setProducts(productsData || [])
      } catch (error) {
        console.error('[v0] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        image_url: formData.image_url,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock),
        badge_text: formData.badge_text || null,
        is_active: formData.is_active,
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error

        setProducts(
          products.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        )
      } else {
        // Create
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()

        if (error) throw error
        setProducts([...(data || []), ...products])
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        image_url: '',
        category_id: '',
        stock: '',
        badge_text: '',
        is_active: true,
      })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('[v0] Error saving product:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      stock: product.stock.toString(),
      badge_text: product.badge_text || '',
      is_active: product.is_active,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error('[v0] Error deleting product:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground mt-1">Administra tu catálogo de productos</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              discount_price: '',
              image_url: '',
              category_id: '',
              stock: '',
              badge_text: '',
              is_active: true,
            })
            setShowForm(!showForm)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_price">Precio con Descuento (USD)</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Badge de Oferta</Label>
                  <Input
                    id="badge"
                    placeholder="ej: OFERTA, TOP VENTAS"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen del Producto</Label>
                <ImageUploader
                  onImageUpload={(url) => setFormData({ ...formData, image_url: url })}
                  currentImage={formData.image_url}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Producto activo (visible en la tienda)
                </Label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    `${editingId ? 'Actualizar' : 'Crear'} Producto`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Productos ({products.length})</h2>
        <div className="space-y-2">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay productos aún</p>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4 items-start">
                    {product.image_url && (
                      <div className="relative w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        {product.badge_text && (
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {product.badge_text}
                          </Badge>
                        )}
                        {product.is_active ? (
                          <Badge variant="default" className="whitespace-nowrap">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="whitespace-nowrap">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Precio: ${product.price}</span>
                        {product.discount_price && (
                          <span className="line-through">
                            ${product.discount_price}
                          </span>
                        )}
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
