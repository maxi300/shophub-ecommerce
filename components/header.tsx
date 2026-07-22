'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const isAuthPage = pathname?.includes('/auth')

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="hidden sm:inline text-xl font-bold text-foreground">ShopHub</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Inicio
          </Link>
          <Link href="/shop" className={`text-sm font-medium transition-colors ${pathname?.includes('/shop') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Tienda
          </Link>
          <Link href="/orders" className={`text-sm font-medium transition-colors ${pathname?.includes('/orders') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Mis Pedidos
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <>
              <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">0</span>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="bg-primary hover:bg-primary/90">Registrarse</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-card">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-sm font-medium text-foreground hover:text-primary">
              Inicio
            </Link>
            <Link href="/shop" className="block text-sm font-medium text-foreground hover:text-primary">
              Tienda
            </Link>
            <Link href="/orders" className="block text-sm font-medium text-foreground hover:text-primary">
              Mis Pedidos
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
