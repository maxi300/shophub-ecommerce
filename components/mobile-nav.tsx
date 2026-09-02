'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function MobileNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    async function fetchCartCount() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count !== null) setCartCount(count)
    }
    fetchCartCount()
  }, [])

  const navItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Explorar', href: '/', icon: Search },
    { name: 'Favoritos', href: '/perfil/favoritos', icon: Heart },
    { name: 'Perfil', href: '/perfil', icon: User },
    { name: 'Carrito', href: '/cart', icon: ShoppingCart, badge: cartCount },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center relative py-1 px-3 transition-colors ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}