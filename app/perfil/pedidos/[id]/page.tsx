'use client'

import { Header } from '@/components/header'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Package, CheckCircle2, Clock, Truck, Box, X, Printer, Download } from 'lucide-react'

export default function DetallePedidoPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!params.id) return
      const supabase = createClient()

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()

      if (orderData) {
        setOrder(orderData)
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products(name, image_url, price)')
          .eq('order_id', params.id)

        if (itemsData) setItems(itemsData)
      }
      setLoading(false)
    }
    fetchOrderDetails()
  }, [params.id])

  const getStepStatus = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s === 'delivered' || s === 'entregado') return 4
    if (s === 'shipped' || s === 'enviado') return 3
    if (s === 'processing' || s === 'en proceso') return 2
    return 1
  }

  const currentStep = order ? getStepStatus(order.status) : 1

  const handleDownloadPDF = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      window.print() 
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-24 md:pb-12">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3.5 mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Link 
            href="/perfil/pedidos" 
            className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">Detalle del Pedido</h2>
            <p className="text-[11px] text-gray-500 font-medium">
              {order?.id ? `#${order.id.slice(0, 8)}` : 'Cargando...'}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-2 md:pt-6">
        <Link href="/perfil/pedidos" className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-orange-600 mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver a tus pedidos
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-orange-500 w-6 h-6" /></div>
          ) : !order ? (
            <p className="text-sm text-gray-500">No se encontró el pedido.</p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h1 className="text-base sm:text-lg font-black text-gray-900">Orden #{order.id.slice(0, 8)}</h1>
                  <p className="text-xs text-gray-400">Fecha: {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className="uppercase text-xs font-bold px-3 py-1 bg-orange-50 text-orange-600 rounded-lg">
                  {order.status}
                </span>
              </div>

              <div className="py-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Estado del envío</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { step: 1, label: 'Creado', icon: Clock },
                    { step: 2, label: 'Procesando', icon: Box },
                    { step: 3, label: 'Enviado', icon: Truck },
                    { step: 4, label: 'Entregado', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon
                    const active = currentStep >= item.step
                    return (
                      <div key={item.step} className="flex flex-col items-center space-y-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-medium ${active ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" /> Productos ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const product = item.products || {}
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name || 'Producto'} className="w-12 h-12 object-cover rounded-lg border" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">Img</div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900">{product.name || 'Producto'}</p>
                            <p className="text-xs text-gray-500">Cant: <span className="font-semibold text-gray-800">{item.quantity}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">(${item.price} c/u)</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center bg-orange-50/50 p-4 rounded-xl gap-4">
                <div>
                  <span className="text-xs text-gray-500 block">Total pagado</span>
                  <span className="text-lg font-black text-orange-600">${order.total}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white border border-orange-500 text-orange-600 hover:bg-orange-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar comprobante</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {isModalOpen && order && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            
            <div className="px-6 py-3.5 bg-gray-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Comprobante Fiscal Digital</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50 flex-1">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-800 space-y-4 relative">
                
                <div className="text-center pb-4 border-b border-dashed border-gray-200">
                  <h2 className="font-black text-base sm:text-lg text-gray-900">F-SHOPPING E-COMMERCE</h2>
                  <p className="text-xs text-gray-500">NIT: 0614-280826-102-3</p>
                  <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transacción Exitosa</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Orden ID:</span>
                    <span className="font-mono font-medium text-gray-800">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha y Hora:</span>
                    <span className="font-medium text-gray-800">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>Descripción</span>
                    <span>Subtotal</span>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600">
                      <span>{item.products?.name || 'Producto'} (x{item.quantity})</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>${order.total}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>IVA (13% Inc.)</span>
                    <span>${(order.total * 0.13).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                    <span>TOTAL PAGADO</span>
                    <span className="text-orange-600">${order.total}</span>
                  </div>
                </div>

                <div className="pt-3 text-center">
                  <div className="font-mono tracking-widest text-base sm:text-lg text-gray-400 select-none">
                    ||| | |||| ||| || ||||| ||||
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">ORD-{order.id.slice(0, 8).toUpperCase()}-SV</p>
                </div>

              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 flex items-center justify-end space-x-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Imprimir / Guardar PDF</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}