'use client'

import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { FlashDealsSection } from '@/components/flash-deals'
import { createClient } from '@/lib/supabase/client'
import { Zap, Truck, Shield, RotateCcw, ChevronRight, Star, TrendingUp, Gift, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const trendingSearches = ['zapatos mujer', 'auriculares', 'vestido verano', 'smartwatch', 'funda celular', 'bolsa', 'reloj hombre']

const CATEGORY_STYLES: Record<string, { icon: string; iconBg: string }> = {
  'Electronica': { icon: '📱', iconBg: 'bg-blue-100' },
  'Electrónica': { icon: '📱', iconBg: 'bg-blue-100' },
  'Moda': { icon: '👗', iconBg: 'bg-pink-100' },
  'Hogar': { icon: '🏠', iconBg: 'bg-green-100' },
  'Deportes': { icon: '⚽', iconBg: 'bg-orange-100' },
  'Belleza': { icon: '💄', iconBg: 'bg-purple-100' },
  'Juguetes': { icon: '🧸', iconBg: 'bg-yellow-100' },
  'Herramientas': { icon: '🔧', iconBg: 'bg-gray-100' },
  'Mascotas': { icon: '🐾', iconBg: 'bg-amber-100' },
  'Libros': { icon: '📚', iconBg: 'bg-teal-100' },
  'Joyería': { icon: '💍', iconBg: 'bg-rose-100' },
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 animate-pulse space-y-3 flex flex-col justify-between">
      <div className="w-full aspect-square bg-gray-200 rounded-lg" />
      <div className="space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-7 w-7 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 10
  const observerRef = useRef<HTMLDivElement | null>(null)

  // Carga inicial y por páginas con el cliente instanciado de manera segura
  async function loadProducts(pageIndex: number) {
    if (pageIndex === 0) setInitialLoading(true)
    else setLoadingMore(true)

    try {
      const supabase = createClient() 
      const from = pageIndex * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error al cargar productos de Supabase:', error.message)
      } else if (dbProducts) {
        // Tipado explícito de 'p: any' para evitar el subrayado rojo de TypeScript
        const formatted = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          discountPrice: p.discount_price ? Number(p.discount_price) : null,
          imageUrl: p.image_url,
          badgeText: p.badge_text,
          rating: p.rating || 5,
          salesCount: p.sold_count || 0,
        }))

        if (dbProducts.length < PAGE_SIZE) {
          setHasMore(false)
        }

        setProducts((prev) => (pageIndex === 0 ? formatted : [...prev, ...formatted]))
      }
    } catch (err) {
      console.error('Fallo de red al conectar con Supabase:', err)
    } finally {
      setInitialLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadProducts(0)

    async function fetchCategories() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('categories').select('*')
        if (data) setCategories(data)
      } catch (err) {
        console.error('Error al obtener categorías:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !initialLoading) {
          const nextPage = page + 1
          setPage(nextPage)
          loadProducts(nextPage)
        }
      },
      { threshold: 0.5 }
    )

    if (observerRef.current) observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [page, hasMore, loadingMore, initialLoading])

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-[#f5f5f5] text-gray-900 pb-16">
        <section className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 py-8 md:py-12">
          <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  Ofertas relámpago activas ahora
                </div>
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                  Compra inteligente,<br />
                  <span className="text-yellow-300">ahorra más</span>
                </h1>
                <p className="text-orange-50 text-sm md:text-base">
                  Millones de productos con hasta 90% de descuento. Envío gratis garantizado.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link href="/shop" className="bg-white text-orange-600 hover:bg-orange-50 transition-colors font-black px-5 py-2.5 rounded-lg text-xs md:text-sm flex items-center gap-2 shadow-sm">
                    Ver todas las ofertas <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link href="/auth/sign-up" className="border border-white/80 text-white hover:bg-white/10 transition-colors font-semibold px-5 py-2.5 rounded-lg text-xs md:text-sm">
                    Crear cuenta gratis
                  </Link>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-3">
                {[
                  { icon: '🛍️', label: 'Productos', value: '50M+' },
                  { icon: '⭐', label: 'Calificación media', value: '4.8' },
                  { icon: '🚚', label: 'Entregas hoy', value: '120K+' },
                  { icon: '💰', label: 'Ahorro promedio', value: '67%' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/20 backdrop-blur rounded-xl p-3.5 text-white text-center border border-white/10">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-[11px] text-orange-100">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-gray-200/60 py-2.5">
          <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {[
                { icon: Truck, text: 'Envío gratis +$30', color: 'text-green-600' },
                { icon: RotateCcw, text: 'Devolución fácil', color: 'text-blue-600' },
                { icon: Shield, text: 'Pago 100% seguro', color: 'text-purple-600' },
                { icon: Star, text: 'Garantía de calidad', color: 'text-yellow-600' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-2.5 border-b border-gray-200/60 mb-5">
          <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 text-orange-500 font-bold text-xs shrink-0 mr-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tendencias:</span>
              </div>
              {trendingSearches.map((q) => (
                <Link
                  key={q}
                  href={`/shop?q=${encodeURIComponent(q)}`}
                  className="shrink-0 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
          <section>
            <FlashDealsSection />
          </section>

          {categories.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-orange-500" />
                  Explora por categoría
                </h2>
                <Link href="/shop" className="text-orange-600 text-xs font-medium hover:underline flex items-center gap-0.5">
                  Ver todas <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {categories.map((cat) => {
                  const style = CATEGORY_STYLES[cat.name] || { icon: cat.icon || '📦', iconBg: 'bg-orange-100' }
                  return (
                    <Link key={cat.id || cat.name} href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}>
                      <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                        <div className={`w-11 h-11 ${style.iconBg} rounded-full flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-sm`}>
                          {style.icon}
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 text-center leading-tight group-hover:text-orange-600 transition-colors">
                          {cat.name}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <section className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5 tracking-tight">
                <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
                Descubre más para ti
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {products.map((p, index) => (
                <ProductCard key={`feed-${p.id}-${index}`} product={p} />
              ))}

              {(initialLoading || loadingMore) &&
                Array.from({ length: 10 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            <div ref={observerRef} className="h-10 w-full mt-6 flex justify-center items-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  Cargando más ofertas...
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-4">
                  ✨ ¡Has llegado al final del catálogo! ✨
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
          <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 py-10">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-xs">F</span>
                  </div>
                  <span className="text-white font-black text-base">FerreTec</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tu destino de compras inteligentes con millones de productos al mejor precio.
                </p>
              </div>
              {[
                { title: 'Compañía', links: ['Acerca de', 'Carreras', 'Blog', 'Prensa'] },
                { title: 'Soporte', links: ['Centro de ayuda', 'Contacto', 'Rastrear pedido', 'Devoluciones'] },
                { title: 'Legal', links: ['Privacidad', 'Términos', 'Seguridad', 'Cookies'] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-white font-bold text-xs mb-3">{col.title}</h4>
                  <ul className="space-y-1.5">
                    {col.links.map((l) => (
                      <li key={l}>
                        <Link href="/" className="text-xs text-gray-400 hover:text-orange-400 transition-colors">
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <p>© FerreTec. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <span>🇸🇻 USD</span>
                <span>🌐 Español</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}