'use client'

import { Header } from '@/components/header'
import { PerfilSidebar } from '@/components/perfil-sidebar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, PackageCheck } from 'lucide-react'

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState('processing')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const status = order.status?.toLowerCase() || ''

    if (activeTab === 'processing') {
      return status === 'processing' || status === 'en proceso'
    }
    if (activeTab === 'enviado') {
      return status === 'enviado' || status === 'shipped'
    }
    if (activeTab === 'entregado') {
      return status === 'entregado' || status === 'delivered'
    }
    
    return status === activeTab.toLowerCase()
  })

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20 md:pb-12">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-orange-500/30">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">Mis Pedidos</h2>
            <p className="text-[11px] text-gray-500 font-medium">Revisa el estado de tus compras</p>
          </div>
        </div>
      </div>

      <main className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 md:pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          <PerfilSidebar />

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200/70 p-4 sm:p-6">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 mb-6">Tus pedidos</h1>

            <div className="flex border-b border-gray-100 gap-6 sm:gap-8 mb-6 text-sm overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'processing', label: 'En proceso' },
                { id: 'enviado', label: 'Enviado' },
                { id: 'entregado', label: 'Entregado' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-xl">
                  📦
                </div>
                <p className="text-sm font-medium text-gray-500">No tienes pedidos en esta categoría</p>
                <Link
                  href="/shop"
                  className="inline-block mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Explorar productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Orden #{order.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-gray-800">Estado: <span className="uppercase text-orange-600">{order.status}</span></p>
                      <p className="text-xs text-gray-500">Total: ${order.total}</p>
                    </div>
                    <Link 
                      href={`/perfil/pedidos/${order.id}`}
                      className="text-xs font-bold text-orange-600 hover:underline bg-orange-50 px-3 py-2 rounded-lg"
                    >
                      Ver detalle y productos
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}