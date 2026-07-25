'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  Menu,
  Truck,
  RotateCcw,
  Smartphone,
  Bell,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const categories = [
  'Electrónica', 'Moda Mujer', 'Moda Hombre', 'Hogar y Cocina',
  'Deportes', 'Belleza', 'Juguetes', 'Herramientas', 'Mascotas', 'Joyería'
]

export function Header() {
  const pathname = usePathname()
  const searchQueryState = useState('')
  const [searchQuery, setSearchQuery] = searchQueryState
  const isAuthPage = pathname?.includes('/auth')
  const { cartCount } = useCart()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  // Estados para el comportamiento de ocultado automático al hacer scroll
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Detector de scroll inteligente
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Si bajamos más de 60px y la distancia crece -> Ocultar Header
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false)
        setAccountMenuOpen(false) // Cierra el menú desplegable si estaba abierto al bajar
      } else {
        // Al scroll hacia arriba -> Mostrar Header inmediatamente
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Lógica de autenticación de Supabase
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // Verificación de ROL Admin
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(Boolean(data?.is_admin)))
  }, [user])

  if (isAuthPage) return null

  return (
    <header
      className={`sticky top-0 z-50 shadow-md transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top Announcement Bar */}
      <div className="bg-gray-900 text-white text-xs py-2">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-4">
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
        <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center gap-4">
          {/* Logo FerreTec */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-orange-500 font-black text-lg leading-none">F</span>
            </div>
            <span className="hidden sm:inline text-white font-black text-xl tracking-tight">Shopping</span>
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
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-yellow-400 text-gray-900 text-xs font-black flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs hidden sm:block">Carrito</span>
            </Link>

            <div className="relative">
              {user ? (
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors p-2"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs hidden sm:block max-w-20 truncate">{user.email?.split('@')[0]}</span>
                </button>
              ) : (
                <Link
                  href={`/auth/login?next=${encodeURIComponent(pathname || '/')}`}
                  className="flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors p-2"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs hidden sm:block">Ingresar</span>
                </Link>
              )}

              {user && accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Sesión iniciada como</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Panel admin
                    </Link>
                  )}
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <div className="border-t border-orange-400/50">
          <div className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6">
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