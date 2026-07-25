'use client'

import { Header } from '@/components/header'
import { CartItemsSection } from '@/components/cart-items-section'
import { CartSummary } from '@/components/cart-summary'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  const discount = subtotal > 50 ? 5 : 0
  const shipping = items.length === 0 ? 0 : subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08

  // Map cart items to the shape expected by CartItemsSection, including
  // color/size so the selected variant is visible in the cart.
  const displayItems = items.map((item) => ({
    id: item.lineId,
    productId: item.productId,
    productName: [item.name, item.color, item.size].filter(Boolean).join(' · '),
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
  }))

  const handleUpdateQuantity = (lineId: string, newQuantity: number) => {
    updateQuantity(lineId, newQuantity)
  }

  const handleRemoveItem = (lineId: string) => {
    removeItem(lineId)
  }

  const handleCheckout = () => {
    alert('Ir al checkout...')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-primary hover:underline">Inicio</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Carrito</span>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                items={displayItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />

              {/* Continue Shopping Info */}
              {displayItems.length > 0 && (
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
                itemCount={displayItems.length}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
