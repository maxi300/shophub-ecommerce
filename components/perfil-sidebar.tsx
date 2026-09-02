'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Heart, User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function PerfilSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { name: 'Pedidos', href: '/perfil/pedidos', icon: Package },
    { name: 'Favoritos', href: '/perfil/favoritos', icon: Heart },
    { name: 'Mi perfil', href: '/perfil', icon: User },
    { name: 'Ajustes', href: '/perfil/ajustes', icon: Settings },
  ]

  return (
    <>
      {/* Menú lateral clásico para Escritorio (Desktop) */}
      <aside className="hidden md:block w-64 shrink-0 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs h-fit space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
          Mi Cuenta
        </div>
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== '/perfil' && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-gray-600 hover:bg-orange-50/60 hover:text-orange-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
              {link.name}
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-100/60"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Barra de navegación móvil ultra compacta tipo píldoras deslizantes sin barra gris */}
      <div className="md:hidden w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
        <div className="flex gap-2 min-w-max pb-1 items-center">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/perfil' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-orange-500/20'
                    : 'bg-white text-gray-700 border border-gray-200/70 hover:bg-orange-50/40 hover:text-orange-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </>
  )
}