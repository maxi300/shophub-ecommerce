'use client'

import { Header } from '@/components/header'
import { CartItemsSection } from '@/components/cart-items-section'
import { CartSummary } from '@/components/cart-summary'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Demo cart items
const demoCartItems = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Auriculares inalámbricos Bluetooth 5.0 - Cancelación de ruido',
    price: 45.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Cargador rápido 65W USB-C con cable incluido',
    price: 17.49,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1591290619946-ca4c0fd84e31?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Funda protectora premium para teléfono',
    price: 12.49,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1607437281810-c67f36c547f2?w=200&h=200&fit=crop',
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(demoCartItems)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = subtotal > 50 ? 5 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
  }

  const handleCheckout = () => {
    alert('Ir al checkout...')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-primary hover:underline">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Carrito</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tu Carrito de Compras</h1>
            <p className="text-muted-foreground">Revisa y confirma tu pedido antes de pagar</p>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2">
              <CartItemsSection
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />

              {/* Continue Shopping Info */}
              {cartItems.length > 0 && (
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Consejo:</span> Agrega más artículos para obtener envío gratis en pedidos mayores a $50.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div>
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                tax={tax}
                itemCount={cartItems.length}
                onCheckout={handleCheckout}
              />
            </div>
          </div>

          {/* Related Products Section */}
          {cartItems.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Artículos que tal vez quieras agregar</h2>
                  <p className="text-muted-foreground">Productos populares que van bien con lo que compraste</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center gap-2 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded" />
                      <div className="w-20 h-4 bg-muted rounded" />
                      <div className="w-16 h-3 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
