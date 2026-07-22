'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, Lock } from 'lucide-react'
import Link from 'next/link'

interface CartSummaryProps {
  subtotal: number
  discount?: number
  shipping?: number
  tax?: number
  itemCount: number
  onCheckout?: () => void
}

export function CartSummary({
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  itemCount = 0,
  onCheckout,
}: CartSummaryProps) {
  const total = subtotal - discount + shipping + tax

  return (
    <div className="sticky top-20 bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Resumen del Pedido</h2>
        <p className="text-sm text-muted-foreground">{itemCount} artículos</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Descuento</span>
            <span className="text-primary font-medium">-${discount.toFixed(2)}</span>
          </div>
        )}

        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="text-foreground font-medium">${shipping.toFixed(2)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Impuestos</span>
            <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-foreground font-semibold">Total</span>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">Antes del pago final</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Envío Gratis</p>
            <p className="text-xs text-muted-foreground">En compras mayores a $50</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Pago Seguro</p>
            <p className="text-xs text-muted-foreground">Datos encriptados y protegidos</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onCheckout}
        disabled={itemCount === 0}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold h-12 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Ir al Pago
        <ArrowRight className="w-4 h-4" />
      </Button>

      {/* Continue Shopping */}
      <Link href="/shop" className="block">
        <Button variant="outline" className="w-full">
          Seguir comprando
        </Button>
      </Link>

      {/* Trust Badges */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>✓ Todos los datos están protegidos</p>
        <p>✓ Devoluciones en 90 días</p>
      </div>
    </div>
  )
}
