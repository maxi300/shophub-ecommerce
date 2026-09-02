'use client'

import { Header } from '@/components/header'
import { PerfilSidebar } from '@/components/perfil-sidebar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, Heart } from 'lucide-react'

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*, products(*)')
        .eq('user_id', user.id)

      if (!error && data) {
        setFavorites(data)
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20 md:pb-12">
      {/* Header global solo en escritorio (Oculto en móvil) */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Cabecera limpia exclusiva para Móvil */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-orange-500/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">Mis Favoritos</h2>
            <p className="text-[11px] text-gray-500 font-medium">Productos guardados</p>
          </div>
        </div>
      </div>

      <main className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 md:pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          <PerfilSidebar />

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200/70 p-4 sm:p-6">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 mb-6">Mis Productos Favoritos</h1>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-500">No tienes productos guardados en favoritos</p>
                <Link
                  href="/shop"
                  className="inline-block mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Explorar tienda
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                    <p className="text-sm font-bold text-gray-800">{fav.products?.nombre || 'Producto'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}