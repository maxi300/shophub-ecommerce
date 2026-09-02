// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, CreditCard, ShoppingBag, Lock, Wallet, Edit2 } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { CheckoutAddressForm } from '@/components/checkout-address-form'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const { items, subtotal: totalAmount, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'paypal'>('wompi')

  // Estado para controlar si ya se guardó la dirección o si se está editando
  const [step, setStep] = useState<'address' | 'payment'>('address')

  const [formData, setFormData] = useState({
    pais: 'El Salvador',
    nombre: '',
    apellido: '',
    telefono: '',
    departamento: '',
    municipio: '',
    codigoPostal: '',
    calle: '',
    depto: '',
    dui: '',
    email: '',
  })

  // Cargar automáticamente los datos del perfil y usuario autenticado al abrir el checkout
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Consultar la tabla profiles creada por el trigger
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setFormData((prev) => ({
          ...prev,
          email: user.email || prev.email,
          nombre: profile?.first_name || prev.nombre,
          apellido: profile?.last_name || prev.apellido,
          telefono: profile?.phone || prev.telefono,
          dui: profile?.dui || prev.dui,
          calle: profile?.address || prev.calle,
          municipio: profile?.city || prev.municipio,
          departamento: profile?.state || prev.departamento,
        }))
      }
    }
    loadUserData()
  }, [])

  const isDuiRequired = totalAmount >= 200

  // Guardar datos desde el componente modular y avanzar al pago
  const handleSaveAddress = async (savedData: any) => {
    setFormData(savedData)
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Opcional: Actualizar la tabla profiles con los nuevos datos de envío para futuras compras
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          first_name: savedData.nombre,
          last_name: savedData.apellido,
          phone: savedData.telefono,
          dui: savedData.dui,
          address: savedData.calle,
          city: savedData.municipio,
          state: savedData.departamento,
        }).eq('id', user.id)
      }
    } catch (error) {
      console.error('Error al sincronizar perfil:', error)
    }
  }

  // Validador centralizado para las pasarelas
  const validateOrder = () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.departamento || !formData.calle || !formData.dui) {
      alert('Por favor completa los datos de envío requeridos.');
      setStep('address');
      return false;
    }
    if (isDuiRequired && !formData.dui.trim()) {
      alert('Por normativa fiscal de El Salvador, las compras de $200.00 USD o más requieren indicar el DUI.');
      return false;
    }
    return true;
  }

  // Manejador exclusivo para Wompi
  const handleWompiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!validateOrder()) return

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
            address: `${formData.calle}, ${formData.depto || ''}`,
            city: formData.municipio,
            state: formData.departamento,
            postalCode: formData.codigoPostal,
            country: formData.pais,
          },
          customerInfo: {
            firstName: formData.nombre,
            lastName: formData.apellido,
            email: formData.email || 'cliente@tucomercio.com',
            phone: formData.telefono,
          },
          customerDocumentId: formData.dui,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white py-6 px-4 sm:px-6 lg:px-8 relative">
      
      <div className="max-w-2xl mx-auto w-full space-y-4">
        
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
            {step === 'address' ? 'Paso 2 de 3 · Envío' : 'Paso 3 de 3 · Pago'}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          
          {/* PASO 1: Formulario de Dirección Móvil */}
          {step === 'address' ? (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dirección de Envío</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Ingresa tus datos de destino para calcular aduana y envíos.</p>
              </div>
              <CheckoutAddressForm initialData={formData} onSave={handleSaveAddress} />
            </div>
          ) : (
            /* PASO 2: Resumen de dirección guardada y pasarelas de pago */
            <div className="space-y-6">
              
              {/* Tarjeta resumen de la dirección ingresada (Permite editar) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enviar a:</span>
                    <span className="text-xs font-black text-slate-900">{formData.nombre} {formData.apellido}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {formData.calle}{formData.depto ? `, ${formData.depto}` : ''}, {formData.municipio}, {formData.departamento}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">DUI: {formData.dui} · Tel: +503 {formData.telefono}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </div>

              {/* Selector de Método de Pago */}
              <div className="space-y-4 pt-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Selecciona Método de Pago</h2>
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
                    onClick={() => setPaymentMethod('paypal')}
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

              {/* Total y Botón de acción final */}
              <div className="border-t border-slate-100 pt-6 space-y-6">
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
                          if (!validateOrder()) {
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
                                address: `${formData.calle}, ${formData.depto || ''}`,
                                city: formData.municipio,
                                postalCode: formData.codigoPostal,
                              },
                              customerInfo: {
                                firstName: formData.nombre,
                                lastName: formData.apellido,
                                email: formData.email || 'cliente@tucomercio.com',
                              },
                              documentType: '01',
                              customerDocumentId: formData.dui,
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
          )}

        </div>
      </div>
    </div>
  )
}