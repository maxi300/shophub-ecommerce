'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, ChevronDown, Menu, X, Truck, RotateCcw, Smartphone, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const categories = [
  'Electrónica', 'Moda Mujer', 'Moda Hombre', 'Hogar y Cocina',
  'Deportes', 'Belleza', 'Juguetes', 'Herramientas', 'Mascotas', 'Joyería'
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isAuthPage = pathname?.includes('/auth')

  if (isAuthPage) return null

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Announcement Bar */}
      <div className="bg-gray-900 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex items-center gap-1.5 text-green-400 font-medium shrink-0">
              <Truck className="w-3.5 h-3.5" />
              <span>Envío gratis en pedidos +$30</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-400 shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Devoluciones gratuitas</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 shrink-0">
              <Bell className="w-3.5 h-3.5" />
              <span>Ofertas relámpago cada hora</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-gray-300">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Descarga la app</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-orange-500 font-black text-lg leading-none">S</span>
            </div>
            <span className="hidden sm:inline text-white font-black text-xl tracking-tight">ShopHub</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca entre millones de productos..."
                className="w-full h-10 px-4 text-sm text-gray-800 bg-white rounded-l-lg border-0 outline-none placeholder:text-gray-400"
              />
              <button className="h-10 px-4 bg-gray-900 hover:bg-gray-800 transition-colors rounded-r-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors p-2">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-black flex items-center justify-center rounded-full">0</span>
              </div>
              <span className="text-xs hidden sm:block">Carrito</span>
            </Link>
            <Link href="/auth/login" className="flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors p-2">
              <User className="w-6 h-6" />
              <span className="text-xs hidden sm:block">Cuenta</span>
            </Link>
          </div>
        </div>

        {/* Category Nav */}
        <div className="border-t border-orange-400/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              <button className="flex items-center gap-1 text-white text-xs font-semibold whitespace-nowrap px-3 py-1.5 hover:bg-orange-400/40 rounded transition-colors shrink-0">
                <Menu className="w-3.5 h-3.5" />
                Categorías
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="w-px h-4 bg-orange-400/60 mx-1 shrink-0" />
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="text-white text-xs whitespace-nowrap px-3 py-1.5 hover:bg-orange-400/40 rounded transition-colors shrink-0"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
