'use client'

import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Zap, Truck, Shield, RotateCcw, ChevronRight, Clock, Star, TrendingUp, Gift } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const flashSaleProducts = [
  { id: '1', name: 'Auriculares Bluetooth 5.0 con cancelación de ruido activa', price: 89.99, discountPrice: 14.99, rating: 4.5, reviewsCount: 2145, badge: 'Top Ventas', badgeColor: 'orange' as const, soldCount: 3200 },
  { id: '2', name: 'Cargador rápido 65W USB-C compatible con todos los modelos', price: 34.99, discountPrice: 8.49, rating: 4.8, reviewsCount: 1876, soldCount: 5100 },
  { id: '3', name: 'Smartwatch fitness con GPS y monitor cardíaco', price: 199.99, discountPrice: 39.99, rating: 4.3, reviewsCount: 1203, badge: 'Nuevo', badgeColor: 'blue' as const, soldCount: 890 },
  { id: '4', name: 'Funda magnética para iPhone 15 Pro con MagSafe', price: 24.99, discountPrice: 6.49, rating: 4.6, reviewsCount: 3421, soldCount: 8900 },
  { id: '5', name: 'Batería externa 20000mAh carga rápida inalámbrica', price: 79.99, discountPrice: 18.99, rating: 4.7, reviewsCount: 2789, badge: 'Top Ventas', badgeColor: 'orange' as const, soldCount: 4300 },
  { id: '6', name: 'Cables USB-C trenzados premium pack 3 unidades 2m', price: 29.99, discountPrice: 5.99, rating: 4.4, reviewsCount: 1543, soldCount: 12000 },
  { id: '7', name: 'Soporte ergonómico de escritorio ajustable para laptop', price: 45.99, discountPrice: 12.49, rating: 4.5, reviewsCount: 987, soldCount: 2100 },
  { id: '8', name: 'Teclado mecánico gaming retroiluminado RGB compacto', price: 120.00, discountPrice: 34.99, rating: 4.6, reviewsCount: 654, badge: 'Nuevo', badgeColor: 'green' as const, soldCount: 1800 },
]

const categories = [
  { name: 'Electrónica', icon: '📱', color: 'from-blue-50 to-blue-100', iconBg: 'bg-blue-100' },
  { name: 'Moda', icon: '👗', color: 'from-pink-50 to-pink-100', iconBg: 'bg-pink-100' },
  { name: 'Hogar', icon: '🏠', color: 'from-green-50 to-green-100', iconBg: 'bg-green-100' },
  { name: 'Deportes', icon: '⚽', color: 'from-orange-50 to-orange-100', iconBg: 'bg-orange-100' },
  { name: 'Belleza', icon: '💄', color: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-100' },
  { name: 'Juguetes', icon: '🧸', color: 'from-yellow-50 to-yellow-100', iconBg: 'bg-yellow-100' },
  { name: 'Herramientas', icon: '🔧', color: 'from-gray-50 to-gray-100', iconBg: 'bg-gray-100' },
  { name: 'Mascotas', icon: '🐾', color: 'from-amber-50 to-amber-100', iconBg: 'bg-amber-100' },
  { name: 'Libros', icon: '📚', color: 'from-teal-50 to-teal-100', iconBg: 'bg-teal-100' },
  { name: 'Joyería', icon: '💍', color: 'from-rose-50 to-rose-100', iconBg: 'bg-rose-100' },
]

const trendingSearches = ['zapatos mujer', 'auriculares', 'vestido verano', 'smartwatch', 'funda celular', 'bolsa', 'reloj hombre']

function FlashSaleTimer() {
  const [time, setTime] = useState({ h: 2, m: 45, s: 33 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s--; if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 5, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white text-sm font-black px-2 py-0.5 rounded">{val}</span>
          {i < 2 && <span className="text-gray-900 font-black text-sm">:</span>}
        </span>
      ))}
    </div>
  )
}

export default function Home() {
  const [cartCount, setCartCount] = useState(0)
  const handleAddToCart = (id: string) => setCartCount(p => p + 1)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">

        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white space-y-5">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  Ofertas relámpago activas ahora
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight">
                  Compra inteligente,<br />
                  <span className="text-yellow-300">ahorra más</span>
                </h1>
                <p className="text-orange-50 text-lg">
                  Millones de productos con hasta 90% de descuento. Envío gratis garantizado.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/shop" className="bg-white text-orange-500 hover:bg-orange-50 transition-colors font-black px-6 py-3 rounded-lg text-sm flex items-center gap-2">
                    Ver todas las ofertas <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link href="/auth/sign-up" className="border-2 border-white text-white hover:bg-white/10 transition-colors font-semibold px-6 py-3 rounded-lg text-sm">
                    Crear cuenta gratis
                  </Link>
                </div>
              </div>
              {/* Quick stats */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { icon: '🛍️', label: 'Productos', value: '50M+' },
                  { icon: '⭐', label: 'Calificación media', value: '4.8' },
                  { icon: '🚚', label: 'Entregas hoy', value: '120K+' },
                  { icon: '💰', label: 'Ahorro promedio', value: '67%' },
                ].map(s => (
                  <div key={s.label} className="bg-white/20 backdrop-blur rounded-xl p-4 text-white text-center">
                    <div className="text-3xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black">{s.value}</div>
                    <div className="text-xs text-orange-100">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-white border-b border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {[
                { icon: Truck, text: 'Envío gratis +$30', color: 'text-green-600' },
                { icon: RotateCcw, text: 'Devolución fácil', color: 'text-blue-600' },
                { icon: Shield, text: 'Pago 100% seguro', color: 'text-purple-600' },
                { icon: Star, text: 'Garantía de calidad', color: 'text-yellow-600' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Searches */}
        <section className="bg-white py-3 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 text-orange-500 font-semibold text-sm shrink-0">
                <TrendingUp className="w-4 h-4" />
                <span>Tendencias:</span>
              </div>
              {trendingSearches.map(q => (
                <Link
                  key={q}
                  href={`/shop?q=${encodeURIComponent(q)}`}
                  className="shrink-0 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Sales */}
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="text-white font-black text-lg">OFERTAS RELÁMPAGO</span>
                <FlashSaleTimer />
              </div>
              <Link href="/shop" className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Products */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3">
              {flashSaleProducts.map((p) => (
                <ProductCard key={p.id} {...p} onAddToCart={() => handleAddToCart(p.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-500" />
                Explora por categoría
              </h2>
              <Link href="/shop" className="text-orange-500 text-sm font-semibold hover:underline flex items-center gap-1">
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3">
              {categories.map((cat) => (
                <Link key={cat.name} href={`/shop?category=${encodeURIComponent(cat.name)}`}>
                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`w-12 h-12 ${cat.iconBg} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <span className="text-xs text-gray-600 text-center leading-tight group-hover:text-orange-500 transition-colors">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* More Products */}
        <section className="max-w-7xl mx-auto px-4 mt-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">Recomendado para ti</h2>
              <Link href="/shop" className="text-orange-500 text-sm font-semibold hover:underline flex items-center gap-1">
                Ver más <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {flashSaleProducts.slice(0, 4).map((p) => (
                <ProductCard key={`rec-${p.id}`} {...p} badge={undefined} onAddToCart={() => handleAddToCart(p.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm">S</span>
                  </div>
                  <span className="text-white font-black text-lg">ShopHub</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">Tu destino de compras inteligentes con millones de productos al mejor precio.</p>
              </div>
              {[
                { title: 'Compañía', links: ['Acerca de', 'Carreras', 'Blog', 'Prensa'] },
                { title: 'Soporte', links: ['Centro de ayuda', 'Contacto', 'Rastrear pedido', 'Devoluciones'] },
                { title: 'Legal', links: ['Privacidad', 'Términos', 'Seguridad', 'Cookies'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map(l => (
                      <li key={l}><Link href="/" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">{l}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p>© 2025 ShopHub. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <span>🇺🇸 USD</span>
                <span>🌐 Español</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
