'use client'

import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product & { images?: string[] } // Soportamos ambos formatos (imageUrl o images[])
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, discountPrice, imageUrl, images, badge, badgeColor = 'orange', soldCount } = product
  const [wishlisted, setWishlisted] = useState(false)
  const { addToCart } = useCart()
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0
  const displayPrice = discountPrice || price

  // Lógica segura para extraer la imagen: prioriza el arreglo de Supabase (images[0]), luego imageUrl o un placeholder
  const resolvedImageUrl = 
    (images && images.length > 0 && images[0]) || 
    imageUrl || 
    '/placeholder.png'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, { quantity: 1 })
  }

  return (
    <Link
      href={`/product/${id}`}
      className="group relative block bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded">
            -{discount}%
          </div>
        )}

        {/* Custom badge */}
        {badge && (
          <div className={`absolute top-2 ${discount > 0 ? 'left-14' : 'left-2'} text-white text-xs font-semibold px-2 py-0.5 rounded ${
            { orange: 'bg-orange-500', green: 'bg-green-500', red: 'bg-red-500', blue: 'bg-blue-500' }[badgeColor]
          }`}>
            {badge}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setWishlisted(!wishlisted)
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-orange-500 transition-colors leading-4 mb-2">
          {name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black text-orange-500">${displayPrice.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">${price.toFixed(2)}</span>
          )}
        </div>

        {soldCount && soldCount > 100 && (
          <p className="text-xs text-gray-400 mt-0.5">{soldCount.toLocaleString('es')}+ vendidos</p>
        )}
      </div>
    </Link>
  )
}