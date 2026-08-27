'use client'

import { Header } from '@/components/header'
import { CartItemsSection } from '@/components/cart-items-section'
import { CartSummary } from '@/components/cart-summary'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ShoppingBag, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  const discount = subtotal > 50 ? 5 : 0
  const shipping = items.length === 0 ? 0 : subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - discount) * 0.08

  const displayItems = items.map((item: any) => ({
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
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Header />
      
      {/* Barra de Navegación / Migas de pan estilo E-commerce Pro */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-2xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-orange-600 transition-colors">Inicio</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Carrito de Compras</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transacción encriptada de extremo a extremo</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Cabecera de la sección */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold mb-3 shadow-2xs">
              <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
              Paso 1 de 3 · Verificación de pedido
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Tu Carrito <span className="text-orange-600 font-light">({displayItems.length} {displayItems.length === 1 ? 'artículo' : 'artículos'})</span>
            </h1>
          </div>

          {displayItems.length > 0 && (
            <button
              onClick={() => router.push('/shop')}
              className="text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors flex items-center gap-1 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto hover:border-slate-300 cursor-pointer"
            >
              Seguir explorando la tienda <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {displayItems.length === 0 ? (
          /* Estado vacío elegante en tonos claros */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-20 h-20 bg-orange-50 border border-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-inner">
              🛒
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Parece que aún no has agregado ningún producto increíble a tu carrito. ¡Explora nuestras ofertas relámpago!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md text-sm"
            >
              Descubrir ofertas ahora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Grid Principal Claro y Pro */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Artículos (8 columnas) */}
            <div className="lg:col-span-8 space-y-6">
              <CartItemsSection
                items={displayItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />

              {/* Banner de Beneficios claro */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-yellow-100" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm md:text-base text-white">¡Protección y Beneficios FerreTec!</h3>
                    <p className="text-xs text-orange-100">Disfrutas de garantía extendida y soporte técnico directo en todas tus compras.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen de Compra Sticky (4 columnas) limpio */}
            <div className="lg:col-span-4 sticky top-6">
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
        )}
      </main>
    </div>
  )
}