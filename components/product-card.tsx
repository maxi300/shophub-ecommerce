'use client'

import { Star, ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  discountPrice?: number
  imageUrl?: string
  rating: number
  reviewsCount: number
  badge?: string
  badgeColor?: 'orange' | 'green' | 'red' | 'blue'
  soldCount?: number
  onAddToCart?: () => void
}

export function ProductCard({
  id,
  name,
  price,
  discountPrice,
  imageUrl,
  rating,
  reviewsCount,
  badge,
  badgeColor = 'orange',
  soldCount,
  onAddToCart,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false)
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0
  const displayPrice = discountPrice || price

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
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
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={onAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <Link href={`/product/${id}`}>
          <p className="text-xs text-gray-700 line-clamp-2 hover:text-orange-500 transition-colors leading-4 mb-2">
            {name}
          </p>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({reviewsCount.toLocaleString('es')})</span>
        </div>

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
    </div>
  )
}
