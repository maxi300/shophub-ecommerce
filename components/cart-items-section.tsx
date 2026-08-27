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
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="space-y-4">
          <div className="inline-block p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-600">
            <svg
              className="w-12 h-12"
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
            <h3 className="text-lg font-bold text-slate-900">Tu carrito está vacío</h3>
            <p className="text-slate-500 text-sm mt-1">
              Agrega productos a tu carrito para comenzar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Artículos en tu carrito <span className="text-orange-600 font-normal">({items.length})</span>
        </h2>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Image Container */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-2">
                      Sin imagen
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2">
                  {item.productName}
                </h3>
                <p className="text-lg font-extrabold text-orange-600 mt-1">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  ${item.price.toFixed(2)} por unidad
                </p>
              </div>
            </div>

            {/* Quantity Controls & Actions */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    item.quantity > 1 &&
                    onUpdateQuantity?.(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-30 rounded-none h-9 w-9"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-3.5 text-center font-bold text-sm text-slate-800 min-w-[36px]">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdateQuantity?.(item.id, item.quantity + 1)
                  }
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors rounded-none h-9 w-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem?.(item.id)}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200 p-2 h-9 w-9"
                title="Eliminar artículo"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
        <span className="text-emerald-600 font-bold">✓</span>
        <span>Disponibilidad y precio confirmados hasta finalizar el pago</span>
      </div>
    </div>
  )
}