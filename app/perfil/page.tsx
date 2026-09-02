'use client'

import { Header } from '@/components/header'
import { PerfilSidebar } from '@/components/perfil-sidebar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, UserCheck } from 'lucide-react'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dui_nit: '',
    telefono: '',
    direccion_exacta: '',
    municipio: '',
    departamento: '',
  })

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const [profileRes, addressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('addresses').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      setFormData({
        nombre: profileRes.data?.nombre || '',
        apellido: profileRes.data?.apellido || '',
        dui_nit: profileRes.data?.dui_nit || '',
        telefono: profileRes.data?.telefono || '',
        direccion_exacta: addressRes.data?.direccion_exacta || '',
        municipio: addressRes.data?.municipio || '',
        departamento: addressRes.data?.departamento || '',
      })
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileError, addressError] = await Promise.all([
      supabase.from('profiles').upsert({
        id: user.id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dui_nit: formData.dui_nit,
        telefono: formData.telefono,
        updated_at: new Date(),
      }),
      supabase.from('addresses').upsert({
        user_id: user.id,
        direccion_exacta: formData.direccion_exacta,
        municipio: formData.municipio,
        departamento: formData.departamento,
        updated_at: new Date(),
      }, { onConflict: 'user_id' }),
    ])

    setSaving(false)
    if (profileError.error || addressError.error) {
      alert('Error al guardar los cambios')
    } else {
      alert('Información actualizada con éxito')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20 md:pb-12">
      {/* Header global exclusivo para Escritorio (Oculto en móvil) */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Cabecera exclusiva para Móvil (Limpia, sin buscador de productos, enfocada en la cuenta) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 mb-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-orange-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wide">Mi Cuenta</h2>
            <p className="text-[11px] text-gray-500 font-medium">Gestiona tus datos personales</p>
          </div>
        </div>
      </div>

      <main className="max-w-[1380px] mx-auto px-3 sm:px-4 lg:px-6 pt-2 md:pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          <PerfilSidebar />

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200/70 p-4 sm:p-6">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 mb-6">Mi Perfil y Dirección de Envío</h1>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b pb-2">Información Personal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nombre</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Apellido</label>
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">DUI o NIT (Facturación)</label>
                      <input
                        type="text"
                        value={formData.dui_nit}
                        onChange={(e) => setFormData({ ...formData, dui_nit: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                        placeholder="00000000-0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Teléfono</label>
                      <input
                        type="text"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                        placeholder="7000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h2 className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b pb-2">Dirección de Envío</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Dirección exacta</label>
                      <input
                        type="text"
                        value={formData.direccion_exacta}
                        onChange={(e) => setFormData({ ...formData, direccion_exacta: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                        placeholder="Colonia, Polígono, Casa #..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Municipio / Ciudad</label>
                        <input
                          type="text"
                          value={formData.municipio}
                          onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                          placeholder="Ej. San Miguel"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Departamento</label>
                        <input
                          type="text"
                          value={formData.departamento}
                          onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-gray-50/50"
                          placeholder="Ej. San Miguel"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}