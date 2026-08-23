'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal: totalAmount } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    documentType: '01',
    customerDocumentId: '',
  });

  const isDuiRequired = totalAmount >= 200;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bloqueo estricto por doble clic o si ya está cargando
    if (loading) return;

    if (isDuiRequired && !formData.customerDocumentId.trim()) {
      alert('Por normativa fiscal de El Salvador, las compras de $200.00 USD o más requieren indicar el DUI o NIT.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout/wompi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
          total: totalAmount,
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la orden.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No se recibió la URL de pago de Wompi.');
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Ocurrió un error al procesar la compra.');
      setLoading(false); // Solo liberamos si ocurre un error para permitir reintentar
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/cart" 
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al Carrito
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <h1 className="text-2xl font-bold text-white tracking-tight">Finalizar Compra</h1>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro Wompi
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  placeholder="Ej. Max"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Apellido</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  placeholder="Ej. Ramos"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Dirección de Entrega</label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                placeholder="Avenida México"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Municipio / Ciudad</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  placeholder="San Miguel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">Departamento</label>
                <input
                  type="text"
                  disabled={loading}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                  placeholder="San Miguel"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-5 mt-6">
              <h2 className="text-sm font-semibold text-zinc-200 mb-3">Datos para la Factura Electrónica (DTE)</h2>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">
                  DUI o NIT{' '}
                  {isDuiRequired && (
                    <span className="text-orange-500 font-bold ml-1">* (Requerido para compras &ge; $200.00)</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="00000000-0"
                  required={isDuiRequired}
                  disabled={loading}
                  value={formData.customerDocumentId}
                  onChange={(e) => setFormData({ ...formData, customerDocumentId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-5 mt-6">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-zinc-400 font-medium">Total a pagar:</span>
                <span className="text-3xl font-extrabold text-white tracking-tight">${totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Redirigiendo a pasarela...' : 'Pagar con Tarjeta (Wompi)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}