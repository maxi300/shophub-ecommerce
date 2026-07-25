'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/product-card'
import { Zap } from 'lucide-react'

export function FlashDealsSection() {
  const [flashProducts, setFlashProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadFlashDeals() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, discount_price, image_url, images, rating, badge_text')
        .eq('is_active', true)
        .not('discount_price', 'is', null) // Solo trae productos con descuento
        .limit(6)

      if (!error && data) {
        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          discountPrice: Number(p.discount_price),
          imageUrl: (p.images && p.images[0]) || p.image_url,
          rating: Number(p.rating) || 5,
          badgeText: p.badge_text || 'OFERTA',
        }))
        setFlashProducts(formatted)
      }
      setLoading(false)
    }

    loadFlashDeals()
  }, [])

  // Si no hay ofertas o está cargando, NO renderiza nada (desaparece limpiamente)
  if (loading || flashProducts.length === 0) return null

  return (
    <section className="max-w-[1400px] mx-auto px-4 my-8">
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-md mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 fill-white" />
          <h2 className="text-xl font-black uppercase tracking-wide">Ofertas Relámpago</h2>
        </div>
        <span className="text-xs bg-white/20 font-bold px-3 py-1 rounded-full">Por tiempo limitado</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {flashProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}