'use client'

import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Truck, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const featuredProducts = [
  {
    id: '1',
    name: 'Auriculares inalámbricos Bluetooth 5.0',
    price: 89.99,
    discountPrice: 45.99,
    rating: 4.5,
    reviewsCount: 2145,
    badge: 'Top Ventas',
    badgeColor: 'orange' as const,
  },
  {
    id: '2',
    name: 'Cargador rápido 65W USB-C',
    price: 34.99,
    discountPrice: 17.49,
    rating: 4.8,
    reviewsCount: 1876,
    badge: '-50%',
    badgeColor: 'red' as const,
  },
  {
    id: '3',
    name: 'Smartwatch fitness con GPS',
    price: 199.99,
    discountPrice: 99.99,
    rating: 4.3,
    reviewsCount: 1203,
    badge: 'Nuevo',
    badgeColor: 'blue' as const,
  },
  {
    id: '4',
    name: 'Funda protectora para teléfono',
    price: 24.99,
    discountPrice: 12.49,
    rating: 4.6,
    reviewsCount: 3421,
    badge: 'En Oferta',
    badgeColor: 'green' as const,
  },
  {
    id: '5',
    name: 'Batería externa 20000mAh',
    price: 79.99,
    discountPrice: 39.99,
    rating: 4.7,
    reviewsCount: 2789,
    badge: 'Top Ventas',
    badgeColor: 'orange' as const,
  },
  {
    id: '6',
    name: 'Cables USB-C premium pack 3',
    price: 29.99,
    discountPrice: 14.99,
    rating: 4.4,
    reviewsCount: 1543,
    badge: '-50%',
    badgeColor: 'red' as const,
  },
]

const categories = [
  { name: 'Electrónica', icon: '📱', slug: 'electronics' },
  { name: 'Moda', icon: '👕', slug: 'fashion' },
  { name: 'Hogar', icon: '🏠', slug: 'home' },
  { name: 'Deportes', icon: '⚽', slug: 'sports' },
  { name: 'Belleza', icon: '💄', slug: 'beauty' },
  { name: 'Libros', icon: '📚', slug: 'books' },
]

export default function Home() {
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = (productId: string) => {
    setCartCount(prev => prev + 1)
    // Show notification
    alert('Producto agregado al carrito!')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-primary to-secondary py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Descubre Amazing Deals Todos los Días
                </h1>
                <p className="text-lg text-white/90">
                  Compra miles de productos con descuentos increíbles. Envío rápido, garantía de calidad y atención al cliente 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/shop">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold gap-2">
                      Explorar Ahora
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 font-semibold">
                    Ver Ofertas del Día
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white/5 rounded-lg h-40 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Envío Gratis</h3>
                  <p className="text-sm text-muted-foreground">En todos los pedidos mayores a $50</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Compra Segura</h3>
                  <p className="text-sm text-muted-foreground">Datos encriptados y protegidos</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ofertas Relámpago</h3>
                  <p className="text-sm text-muted-foreground">Nuevas ofertas cada hora</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Explora por Categoría</h2>
              <Link href="/shop" className="text-primary font-semibold hover:underline text-sm">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
                  <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-3">
                    <span className="text-4xl">{cat.icon}</span>
                    <h3 className="font-semibold text-foreground text-sm">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                <Zap className="w-6 h-6 inline text-primary mr-2" />
                Ofertas del Momento
              </h2>
              <Link href="/shop" className="text-primary font-semibold hover:underline text-sm">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Únete a millones de compradores satisfechos
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Obtén acceso a ofertas exclusivas, envío gratis y atención al cliente premium.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
                Registrarse Ahora
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-foreground mb-4">ShopHub</h3>
                <p className="text-sm text-muted-foreground">Tu destino para comprar todo lo que necesitas con los mejores precios.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Compañía</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary">Acerca de</Link></li>
                  <li><Link href="/" className="hover:text-primary">Carreras</Link></li>
                  <li><Link href="/" className="hover:text-primary">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Soporte</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary">Ayuda</Link></li>
                  <li><Link href="/" className="hover:text-primary">Contacto</Link></li>
                  <li><Link href="/" className="hover:text-primary">Términos</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary">Privacidad</Link></li>
                  <li><Link href="/" className="hover:text-primary">Seguridad</Link></li>
                  <li><Link href="/" className="hover:text-primary">Cookies</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 ShopHub. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
