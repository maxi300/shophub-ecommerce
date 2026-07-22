'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  total: number
  status: string
  shipping_address: string
  shipping_city: string
  created_at: string
  updated_at: string
}

interface OrderWithItems extends Order {
  order_items?: Array<{
    id: string
    quantity: number
    price: number
  }>
  profile?: {
    first_name: string
    last_name: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersContent() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            order_items(*),
            profile:profiles(first_name, last_name)
          `
          )
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(ordersData || [])
      } catch (error) {
        console.error('[v0] Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (error) {
      console.error('[v0] Error updating order:', error)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <p className="text-muted-foreground mt-1">
          Administra los pedidos de tus clientes
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay pedidos aún
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido ID</p>
                      <p className="font-mono text-sm font-medium">{order.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="text-sm">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">
                        {order.profile?.first_name} {order.profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dirección</p>
                      <p>
                        {order.shipping_address}, {order.shipping_city}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="text-sm border-t pt-4">
                      <p className="text-muted-foreground mb-2">Artículos ({order.order_items.length})</p>
                      <ul className="space-y-1">
                        {order.order_items.map((item, idx) => (
                          <li key={item.id} className="flex justify-between">
                            <span>Artículo #{idx + 1}</span>
                            <span className="text-muted-foreground">
                              {item.quantity}x @ ${item.price.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Cambiar Estado</p>
                    <div className="flex gap-2 flex-wrap">
                      {statusOptions.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            order.status === status ? 'default' : 'outline'
                          }
                          onClick={() => handleStatusChange(order.id, status)}
                          disabled={updating === order.id}
                          className="capitalize"
                        >
                          {updating === order.id && status === order.status ? (
                            <>
                              <Loader className="w-3 h-3 mr-1 animate-spin" />
                              {statusLabels[status]}
                            </>
                          ) : (
                            statusLabels[status]
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
