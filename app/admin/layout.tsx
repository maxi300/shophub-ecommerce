'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Store, 
  Settings, 
  ChevronRight, 
  Bell 
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/productos', label: 'Productos', icon: Package, exact: true },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart, exact: true },
  ]

  // Función segura para determinar si la ruta está activa sin colisiones
  const isRouteActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-none">ShopHub</p>
              <p className="text-gray-400 text-xs mt-0.5">Panel Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Principal</p>
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isRouteActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Cuenta</p>
            <Link href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Settings className="w-4 h-4" />
              Configuración
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Store className="w-4 h-4" />
              Ver tienda
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <form action="/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {navItems.find(n => isRouteActive(n.href, n.exact))?.label || 'Admin'}
            </h1>
            <p className="text-sm text-gray-500">Gestiona tu tienda en línea</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}