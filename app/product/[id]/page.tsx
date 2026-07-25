'use client'

import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { getProductById, products } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function CountdownBadge() {
  const [time, setTime] = useState({ h: 3, m: 22, s: 47 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 5, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="bg-gray-900 text-white text-xs font-mono font-bold px-2 py-1 rounded">
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const product = getProductById(params.id)

  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-lg font-semibold text-gray-700">Producto no encontrado</p>
          <Link href="/" className="text-orange-500 font-semibold hover:underline">
            Volver al inicio
          </Link>
        </main>
      </>
    )
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0
  const displayPrice = product.discountPrice ?? product.price
  const installment = (displayPrice / 12).toFixed(2)
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, { quantity, color: selectedColor, size: selectedSize })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="max-w-[1600px] mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-orange-500">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-2 gap-10 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* Image */}
            <div>
              <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
                {discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-sm font-black px-2.5 py-1 rounded">
                    -{discount}%
                  </div>
                )}
                <button className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow">
                  <Heart className="w-4 h-4 text-gray-500" />
                </button>
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Vendido por <span className="text-orange-500 font-semibold">{product.seller}</span>
                  </p>
                  <h1 className="text-2xl font-black text-gray-900 mt-1 leading-snug">{product.name}</h1>
                </div>
                <button className="shrink-0 text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {product.soldCount && product.soldCount > 100 && (
                <p className="text-sm text-gray-400 mt-2">{product.soldCount.toLocaleString('es')}+ vendidos</p>
              )}

              {/* Price box */}
              <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-4">
                {discount > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">-{discount}%</span>
                    <span className="text-sm text-gray-600">Oferta termina en</span>
                    <CountdownBadge />
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-orange-500">${displayPrice.toFixed(2)}</span>
                  {discount > 0 && (
                    <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  O en 12 cuotas de <span className="font-semibold">${installment}</span> sin interés
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-green-700 font-medium">
                  <Truck className="w-4 h-4" />
                  Envío gratis
                </div>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedColor === color.name ? 'border-orange-500 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor === color.name && (
                          <Check className={`w-4 h-4 ${['#f3f4f6', '#f3f0e8', '#d1d5db'].includes(color.hex) ? 'text-gray-800' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      Talla: <span className="font-normal text-gray-600">{selectedSize}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-3 h-10 rounded-lg border text-sm font-semibold transition-colors ${
                          selectedSize === size
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + availability */}
              <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} disponibles</span>
              </div>

              {/* Trust icons */}
              <div className="flex items-center gap-4 mt-5 text-gray-400">
                <Truck className="w-5 h-5" />
                <RotateCcw className="w-5 h-5" />
                <ShieldCheck className="w-5 h-5" />
              </div>

              {/* Add to cart */}
              <div className="mt-auto pt-6">
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 font-black text-white py-3.5 rounded-lg transition-colors ${
                    justAdded ? 'bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al carrito — ${(displayPrice * quantity).toFixed(2)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full mt-2 border-2 border-gray-900 text-gray-900 font-black py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                >
                  Comprar ahora
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-2">Descripción del producto</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-lg font-black text-gray-900 mb-4">También te puede interesar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
