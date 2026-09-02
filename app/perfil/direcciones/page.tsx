'use client'

import { Header } from '@/components/header'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, User, MapPin, Store, Loader2, Save } from 'lucide-react'

export default function DireccionesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [address, setAddress] = useState({
    direccion_exacta: '',
    municipio: '',
    departamento: '',
  })

  useEffect(() => {
    async function fetchAddress() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setAddress({
          direccion_exacta: data.direccion_exacta || '',
          municipio: data.municipio || '',
          departamento: data.departamento || '',
        })
      }
      setLoading(false)
    }
    fetchAddress()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('addresses')
      .upsert({ user_id: user.id, ...address, updated_at: new Date() }, { onConflict: 'user_id' })

    setSaving(false)
    if (error) {
      alert('Error al guardar la dirección')
    } else {
      alert('Dirección guardada con éxito')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 pb-16">
      <Header />

      <main className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 pt-6">
        
        {/* Navegación Móvil */}
        <div className="flex md:hidden bg-white p-2 rounded-xl shadow-sm border border-gray-200/60 mb-4 gap-2 overflow-x-auto">
          <Link href="/perfil/pedidos" className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-gray-500" /> Pedidos
          </Link>
          <Link href="/perfil" className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-500" /> Perfil
          </Link>
          <Link href="/perfil/direcciones" className="px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap bg-orange-500 text-white shadow-sm flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Direcciones
          </Link>
          <Link href="/shop" className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-orange-600 hover:bg-orange-50 flex items-center gap-2 border border-orange-200">
            <Store className="w-3.5 h-3.5" /> Ir a la tienda
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar Desktop */}
          <aside className="hidden md:block w-64 shrink-0 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mi Cuenta
            </div>
            <Link href="/perfil/pedidos" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200/60 transition-colors">
              <Package className="w-4 h-4 text-gray-500" /> Tus pedidos
            </Link>
            <Link href="/perfil" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200/60 transition-colors">
              <User className="w-4 h-4 text-gray-500" /> Tu perfil
            </Link>
            <Link href="/perfil/direcciones" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow-sm">
              <MapPin className="w-4 h-4" /> Direcciones
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link href="/shop" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors">
                <Store className="w-4 h-4" /> Volver a la tienda
              </Link>
            </div>
          </aside>

          {/* Contenido Principal */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6">
            <h1 className="text-xl font-black text-gray-900 mb-6">Dirección de envío predeterminada</h1>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Dirección exacta</label>
                  <input
                    type="text"
                    value={address.direccion_exacta}
                    onChange={(e) => setAddress({ ...address, direccion_exacta: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Colonia, Polígono, Casa #..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Municipio / Ciudad</label>
                    <input
                      type="text"
                      value={address.municipio}
                      onChange={(e) => setAddress({ ...address, municipio: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Ej. San Miguel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Departamento</label>
                    <input
                      type="text"
                      value={address.departamento}
                      onChange={(e) => setAddress({ ...address, departamento: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Ej. San Miguel"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar dirección
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}