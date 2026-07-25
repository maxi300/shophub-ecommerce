'use client'

import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingCart,
  Heart,
  Truck,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

const PAGE_SIZE = 4

function ProductPageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50/50 animate-pulse">
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid lg:grid-cols-12 gap-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="lg:col-span-5 flex gap-4">
            <div className="hidden sm:flex flex-col gap-2 w-14">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-14 h-14 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="flex-1 aspect-square max-w-[380px] bg-gray-200 rounded-xl"></div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-full mt-6"></div>
          </div>
        </div>
      </div>
    </main>
  )
}

function CountdownBadge() {
  const [time, setTime] = useState({ h: 2, m: 45, s: 12 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 3, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="bg-red-600 text-white text-xs font-mono font-black px-2 py-0.5 rounded">
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

function InfiniteRelatedProducts({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchMoreProducts = async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, image_url, images, rating, badge_text')
      .eq('is_active', true)
      .neq('id', currentProductId)
      .range(from, to)

    if (!error && data) {
      if (data.length < PAGE_SIZE) setHasMore(false)

      const formatted = data.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        discountPrice: p.discount_price ? Number(p.discount_price) : null,
        imageUrl: (p.images && p.images[0]) || p.image_url,
        rating: Number(p.rating) || 5,
        badgeText: p.badge_text,
      }))

      setProducts((prev) => [...prev, ...formatted])
      setPage((prev) => prev + 1)
    }
    setLoading(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreProducts()
        }
      },
      { threshold: 0.2 }
    )

    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        Recomendados para ti
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}

        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
          ))}
      </div>

      <div ref={observerTarget} className="h-12 flex items-center justify-center mt-4">
        {!hasMore && products.length > 0 && (
          <p className="text-xs text-gray-400 font-medium">Has explorado todos los productos</p>
        )}
      </div>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const supabase = createClient()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    async function loadProductData() {
      if (!params?.id) return
      setLoading(true)

      const { data: currentProd, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !currentProd) {
        setProduct(null)
        setLoading(false)
        return
      }

      const imageList: string[] = Array.isArray(currentProd.images) && currentProd.images.length > 0
        ? currentProd.images
        : currentProd.image_url
        ? [currentProd.image_url]
        : []

      const formattedProduct = {
        id: currentProd.id,
        name: currentProd.name,
        description: currentProd.description || 'Sin descripción disponible.',
        price: Number(currentProd.price),
        discountPrice: currentProd.discount_price ? Number(currentProd.discount_price) : null,
        images: imageList,
        stock: currentProd.stock ?? 0,
        rating: Number(currentProd.rating) || 5.0,
        reviewsCount: currentProd.reviews_count || 0,
        badgeText: currentProd.badge_text,
        isFlashDeal: currentProd.is_flash_deal || false,
      }

      setProduct(formattedProduct)
      setSelectedImage(imageList[0] || '')
      setLoading(false)
    }

    loadProductData()
  }, [params?.id])

  if (loading) {
    return (
      <>
        <Header />
        <ProductPageSkeleton />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-gray-700">El producto no existe o fue retirado.</p>
          <Link href="/" className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl">
            Ir a la tienda
          </Link>
        </main>
      </>
    )
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0
  const displayPrice = product.discountPrice ?? product.price

  const handleAddToCart = () => {
    addToCart({ ...product, imageUrl: selectedImage }, { quantity })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50/60 pb-16">
        {/* Breadcrumb */}
        <div className="max-w-[1280px] mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-orange-500">Inicio</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 items-start">
            
            {/* GALERÍA COMPACTA (5 cols en escritorio) */}
            <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3 items-start justify-center">
              {/* Miniaturas */}
              {product.images.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[420px] shrink-0">
                  {product.images.map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === imgUrl ? 'border-orange-500 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgUrl} alt={`Vista ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Imagen Principal Limitada a max-w-[420px] */}
              <div className="relative w-full max-w-[420px] aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center mx-auto">
                {product.badgeText && (
                  <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                    {product.badgeText}
                  </span>
                )}
                {discount > 0 && !product.badgeText && (
                  <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                    -{discount}%
                  </span>
                )}
                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>

                {selectedImage ? (
                  <Image src={selectedImage} alt={product.name} fill priority className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-300">
                    <ShoppingCart className="w-10 h-10 mb-1" />
                    <span className="text-xs">Sin foto disponible</span>
                  </div>
                )}
              </div>
            </div>

            {/* INFORMACIÓN DEL PRODUCTO (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">{product.name}</h1>

                {/* DESCRIPCIÓN JUSTO ABAJO DEL TÍTULO */}
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-sm font-bold ml-1 text-gray-800">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-400">({product.reviewsCount} evaluaciones)</span>
                </div>

                {/* Banner Precios / Oferta */}
                <div className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl p-4">
                  {discount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-red-600" /> Oferta Relámpago
                      </span>
                      <CountdownBadge />
                    </div>
                  )}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-orange-600">${displayPrice.toFixed(2)}</span>
                    {discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Envío gratis a todo el país
                  </div>
                </div>

                {/* Cantidad */}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.stock} disponibles</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                    product.stock === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : justAdded
                      ? 'bg-emerald-600'
                      : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.99]'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5" /> ¡Agregado al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Agregar al Carrito — ${(displayPrice * quantity).toFixed(2)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleAddToCart()
                    router.push('/cart')
                  }}
                  disabled={product.stock === 0}
                  className="w-full py-2.5 rounded-xl font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40"
                >
                  Comprar Ahora
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Recomendados Infinita */}
          <InfiniteRelatedProducts currentProductId={product.id} />
        </div>
      </main>
    </>
  )
}