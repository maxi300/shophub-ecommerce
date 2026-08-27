

// app/checkout/page.tsx
'use client';

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, CreditCard, ShoppingBag, Lock, Wallet } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export default function CheckoutPage() {
  const { items, subtotal: totalAmount, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'paypal'>('wompi')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    documentType: '01',
    customerDocumentId: '',
  })

  const isDuiRequired = totalAmount >= 200

  // Validador centralizado de campos del formulario
  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim()) {
      alert('Por favor completa todos los campos obligatorios de contacto y dirección.');
      return false;
    }
    if (isDuiRequired && !formData.customerDocumentId.trim()) {
      alert('Por normativa fiscal de El Salvador, las compras de $200.00 USD o más requieren indicar el DUI o NIT.');
      return false;
    }
    return true;
  }

  // Manejador exclusivo para Wompi
  const handleWompiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/checkout/wompi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          },
          documentType: formData.documentType,
          customerDocumentId: formData.customerDocumentId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al procesar la orden con Wompi.')

      if (data.checkoutUrl) {
        clearCart()
        localStorage.removeItem('cart')
        localStorage.removeItem('cart-storage')
        localStorage.removeItem('shopping-cart')
        sessionStorage.clear()

        window.location.replace(data.checkoutUrl)
      } else {
        throw new Error('No se recibió la URL de la pasarela Wompi.')
      }

    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Ocurrió un error al procesar la compra.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <Link 
            href="/cart" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al Carrito
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold shadow-2xs">
            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
            Paso 2 de 3 · Datos de Envío y Pago
          </div>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Finalizar Compra</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Completa tus datos para procesar el envío de forma segura.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Encriptación SSL 256-bit
            </span>
          </div>

          {/* Se desvincula el onSubmit global para manejar el flujo por método de pago */}
          <div className="space-y-6">
            
            {/* 1. Contacto */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Información de Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ej. Max"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ej. Quinteros"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* 2. Dirección */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Dirección de Destino</h2>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Dirección de Entrega</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Calle principal, Urbanización"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Municipio / Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="San Miguel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Departamento</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="San Miguel"
                  />
                </div>
              </div>
            </div>

            {/* 3. DTE */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Facturación Electrónica (DTE)</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  DUI o NIT {isDuiRequired && <span className="text-orange-600 font-bold ml-1">* (Requerido a partir de $200.00)</span>}
                </label>
                <input
                  type="text"
                  placeholder="00000000-0"
                  value={formData.customerDocumentId}
                  onChange={(e) => setFormData({ ...formData, customerDocumentId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* 4. Selector de Método de Pago */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">4. Selecciona Método de Pago</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wompi')}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'wompi' ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'wompi' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Tarjeta / Wompi</p>
                    <p className="text-[11px] text-slate-500">Débito o Crédito seguro</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateForm()) {
                      setPaymentMethod('paypal');
                    }
                  }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'paypal' ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'paypal' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">PayPal</p>
                    <p className="text-[11px] text-slate-500">Pago internacional rápido</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total y Botón de acción */}
            <div className="border-t border-slate-100 pt-6 mt-6 space-y-6">
              <div className="flex justify-between items-baseline bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-slate-600 font-bold text-sm">Total a pagar:</span>
                <span className="text-3xl font-black text-orange-600 tracking-tight">${totalAmount.toFixed(2)}</span>
              </div>

              {paymentMethod === 'wompi' ? (
                <button
                  type="button"
                  onClick={handleWompiSubmit}
                  disabled={loading || items.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-orange-600/20 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 text-base"
                >
                  <CreditCard className="w-5 h-5" />
                  {loading ? 'Procesando...' : 'Pagar con Wompi'}
                </button>
              ) : (
                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-blue-900 text-center">Datos validados. Usa los botones de PayPal:</p>
                  
                  <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      createOrder={async () => {
                        if (!validateForm()) {
                          throw new Error('Faltan campos obligatorios');
                        }

                        const res = await fetch('/api/checkout/paypal/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            items: items.map(item => ({
                              id: item.productId,
                              quantity: item.quantity,
                            })),
                            shippingAddress: {
                              address: formData.address,
                              city: formData.city,
                              postalCode: formData.postalCode,
                            },
                            customerInfo: {
                              firstName: formData.firstName,
                              lastName: formData.lastName,
                              email: formData.email,
                            },
                            documentType: formData.documentType,
                            customerDocumentId: formData.customerDocumentId,
                          }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error || 'Error al crear la orden de PayPal')

                        ;(window as any).__paypalInternalOrderId = data.orderId

                        return data.paypalOrderId
                      }}
                      onApprove={async (data) => {
                        const internalOrderId = (window as any).__paypalInternalOrderId

                        const res = await fetch('/api/checkout/paypal/capture', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            paypalOrderId: data.orderID,
                            orderId: internalOrderId 
                          }),
                        })
                        const captureData = await res.json()
                        if (!res.ok) throw new Error(captureData.error || 'Error al capturar el pago de PayPal')

                        clearCart()
                        localStorage.removeItem('cart')
                        localStorage.removeItem('cart-storage')
                        localStorage.removeItem('shopping-cart')
                        sessionStorage.clear()

                        window.location.replace(`/checkout/success?order_id=${internalOrderId}&paypalOrderId=${data.orderID}`)
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tus datos de pago son encriptados y procesados de forma segura.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

