'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Get orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })

        // Get total revenue
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'delivered')

        const totalRevenue =
          ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

        // Get active users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
          activeUsers: usersCount || 0,
        })
      } catch (error) {
        console.error('[v0] Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      title: 'Productos',
      value: stats.totalProducts,
      icon: Package,
      description: 'Artículos en catálogo',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: 'Órdenes totales',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30',
    },
    {
      title: 'Ingresos',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: 'De pedidos completados',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    },
    {
      title: 'Usuarios',
      value: stats.activeUsers,
      icon: Users,
      description: 'Usuarios registrados',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu tienda en línea</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tu tienda desde aquí</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/admin/productos"
              className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted transition"
            >
              <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 p-2 rounded">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Gestionar Productos</p>
                <p className="text-sm text-muted-foreground">Crear, editar o eliminar</p>
              </div>
            </a>

            <a
              href="/admin/pedidos"
              className="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-muted transition"
            >
              <div className="bg-green-100 text-green-700 dark:bg-green-900/30 p-2 rounded">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Ver Pedidos</p>
                <p className="text-sm text-muted-foreground">Manage orders and shipping</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Bienvenido al Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Desde aquí puedes gestionar todos los aspectos de tu tienda en línea
          </p>
          <p>
            • Sube imágenes de productos directamente a Supabase Storage
          </p>
          <p>
            • Monitorea pedidos y actualiza estados de envío
          </p>
          <p>
            • Los cambios se reflejan instantáneamente en tu tienda
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
