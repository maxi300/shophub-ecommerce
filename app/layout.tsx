import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShopHub - Your Ultimate Shopping Destination',
  description: 'Discover amazing products with incredible deals on ShopHub.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#FF7A3D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <CartProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}