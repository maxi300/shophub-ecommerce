export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}

function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  'use client'

  const Link = require('next/link').default
  const { Button } = require('@/components/ui/button')
  const { LayoutDashboard, Package, ShoppingCart, LogOut } = require('lucide-react')

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Nuevo El Salvador Shop</p>
          </div>
          <form action="/auth/logout" method="POST">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <nav className="space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/productos">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Package className="w-4 h-4" />
                Productos
              </Button>
            </Link>
            <Link href="/admin/pedidos">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ShoppingCart className="w-4 h-4" />
                Pedidos
              </Button>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
