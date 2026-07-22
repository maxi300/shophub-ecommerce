'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardContent() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, activeUsers: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ count: productsCount }, { count: ordersCount }, { data: ordersData }, { count: usersCount }, { data: recent }] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total').eq('status', 'delivered'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        ])
        const totalRevenue = ordersData?.reduce((s, o) => s + (o.total || 0), 0) || 0
        setStats({ totalProducts: productsCount || 0, totalOrders: ordersCount || 0, totalRevenue, activeUsers: usersCount || 0 })
        setRecentOrders(recent || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  const statCards = [
    { title: 'Productos activos', value: stats.totalProducts, icon: Package, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700', trend: '+12%', up: true, sub: 'vs mes anterior' },
    { title: 'Pedidos totales', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-green-500', lightColor: 'bg-green-50 text-green-700', trend: '+8%', up: true, sub: 'vs mes anterior' },
    { title: 'Ingresos', value: `$${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700', trend: '+23%', up: true, sub: 'pedidos completados' },
    { title: 'Usuarios registrados', value: stats.activeUsers, icon: Users, color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700', trend: '-2%', up: false, sub: 'vs mes anterior' },
  ]

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-700', icon: Package },
    shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: XCircle },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${s.lightColor} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {s.trend}
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-sm font-medium text-gray-600 mt-1">{s.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-black text-gray-900">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-orange-500 text-sm font-semibold hover:underline">Ver todos →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const s = statusMap[order.status] || statusMap.pending
                const StatusIcon = s.icon
                return (
                  <div key={order.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <StatusIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">#{order.id?.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('es')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="text-sm font-black text-gray-900">${order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/productos', icon: Package, label: 'Agregar producto', desc: 'Nuevo artículo al catálogo', color: 'bg-blue-50 text-blue-600' },
                { href: '/admin/pedidos', icon: ShoppingCart, label: 'Gestionar pedidos', desc: 'Ver y actualizar estados', color: 'bg-green-50 text-green-600' },
                { href: '/admin/productos', icon: TrendingUp, label: 'Ver inventario', desc: 'Stock y disponibilidad', color: 'bg-orange-50 text-orange-600' },
              ].map(a => (
                <Link
                  key={a.href + a.label}
                  href={a.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors group"
                >
                  <div className={`${a.color} p-2 rounded-lg shrink-0`}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl p-5 text-white">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-black text-lg leading-tight mb-2">Tu tienda está activa</h3>
            <p className="text-orange-100 text-sm">Los cambios se reflejan en tiempo real para tus compradores.</p>
            <Link href="/" className="mt-3 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
              Ver tienda →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
