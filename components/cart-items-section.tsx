'use client'

import { Trash2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartItemsSectionProps {
  items: CartItem[]
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void
  onRemoveItem?: (itemId: string) => void
}

export function CartItemsSection({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemsSectionProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="space-y-4">
          <div className="inline-block p-4 bg-muted rounded-lg">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tu carrito está vacío</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Agrega productos a tu carrito para comenzar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <h2 className="text-lg font-bold text-foreground">
          Artículos en tu carrito ({items.length})
        </h2>
      </div>

      {/* Items List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 flex gap-4 hover:bg-muted/30 transition-colors"
          >
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Imagen no disponible
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-2">
                {item.productName}
              </h3>
              <p className="text-lg font-bold text-primary mt-1">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${item.price.toFixed(2)} por unidad
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem?.(item.id)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    item.quantity > 1 &&
                    onUpdateQuantity?.(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="p-1"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 text-center font-medium text-sm">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdateQuantity?.(item.id, item.quantity + 1)
                  }
                  className="p-1"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border text-sm text-muted-foreground">
        <p>✓ Disponibilidad y precio confirmados hasta finalizar el pago</p>
      </div>
    </div>
  )
}
