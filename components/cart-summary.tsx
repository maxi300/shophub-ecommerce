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
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 space-y-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
      {/* Título de la sección */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Resumen del Pedido</h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">{itemCount} {itemCount === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}</p>
      </div>

      {/* Desglose de costos */}
      <div className="space-y-3.5 border-y border-slate-100 py-5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 font-medium">Subtotal</span>
          <span className="text-slate-900 font-bold">${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Descuento aplicado</span>
            <span className="text-orange-600 font-bold">-${discount.toFixed(2)}</span>
          </div>
        )}

        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Costo de envío</span>
            <span className="text-slate-900 font-bold">${shipping.toFixed(2)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Impuestos estimados</span>
            <span className="text-slate-900 font-bold">${tax.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total limpio */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-base font-black text-slate-900 block">Total a pagar</span>
          <span className="text-[11px] text-slate-400 font-medium">Impuestos y envío incluidos</span>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-orange-600 tracking-tight">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Beneficios de confianza */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="p-2 bg-orange-100/70 rounded-xl text-orange-600 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Envío Gratis disponible</p>
            <p className="text-[11px] text-slate-500">En compras mayores a $50</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
          <div className="p-2 bg-orange-100/70 rounded-xl text-orange-600 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Checkout Encriptado</p>
            <p className="text-[11px] text-slate-500">Tus datos están protegidos</p>
          </div>
        </div>
      </div>

      {/* Botones de acción principales (Sin botones negros) */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={onCheckout}
          disabled={itemCount === 0}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-black h-12 gap-2 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 transition-all rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Proceder al Pago
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Link href="/shop" className="block">
          <Button variant="outline" className="w-full h-11 bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 rounded-2xl font-bold text-xs transition-colors cursor-pointer">
            Seguir comprando
          </Button>
        </Link>
      </div>

      {/* Sellos de garantía inferiores */}
      <div className="text-center text-[11px] text-slate-400 space-y-1 pt-3 border-t border-slate-100 font-medium">
        <p>✓ Transacción 100% segura y verificada</p>
        <p>✓ Garantía de devolución de 90 días</p>
      </div>
    </div>
  )
}