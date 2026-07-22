
'use client'

import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

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
  onAddToCart,
}: ProductCardProps) {
  const discount = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0
  const displayPrice = discountPrice || price

  const badgeColorClass = {
    orange: 'bg-orange-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
  }[badgeColor]

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Imagen no disponible</span>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${badgeColorClass}`}>
            {badge}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold">
            -{discount}%
          </div>
        )}

        {/* Add to Cart Button (hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            onClick={onAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          {/* Se fuerza 'en-US' para mantener un formato idéntico en servidor y cliente */}
          <span className="text-xs text-muted-foreground">({reviewsCount.toLocaleString('en-US')})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            ${displayPrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-sm line-through text-muted-foreground">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

