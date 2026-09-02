// app/checkout/success/page.tsx
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, Tag, Receipt, ShieldAlert, MessageSquare } from 'lucide-react';

interface OrderDetails {
  id: string;
  total: number;
  subtotal: number;
  discount: number;
  status: string;
  created_at: string;
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
    product_name?: string;
  }>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = 
    searchParams.get('order_id') || 
    searchParams.get('identificadorEnlaceComercio') || 
    searchParams.get('paypalOrderId');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'security_alert'>('loading');
  const [errorMessage, setErrorMessage] = useState('No se ha especificado un identificador de orden válido.');
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);

  const hasCleanedRef = useRef(false);

  useEffect(() => {
    if (hasCleanedRef.current) return;
    hasCleanedRef.current = true;

    const purgeCartStorage = () => {
      localStorage.removeItem('cart');
      localStorage.removeItem('cart-storage');
      localStorage.removeItem('shopping-cart');
      localStorage.removeItem('current_order_id');
      sessionStorage.clear();

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('cart') || key.includes('basket') || key.includes('checkout'))) {
          localStorage.removeItem(key);
        }
      }
    };

    purgeCartStorage();

    if (window.history && window.history.replaceState) {
      window.history.replaceState(
        { success: true }, 
        '', 
        window.location.pathname + window.location.search
      );
    }
  }, []);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setStatus('error');
      setErrorMessage('No se ha especificado un identificador de orden válido.');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const alphanumericIdRegex = /^[a-zA-Z0-9-_]{8,64}$/;

    if (!uuidRegex.test(orderId) && !alphanumericIdRegex.test(orderId)) {
      setStatus('security_alert');
      setErrorMessage('Se detectó un parámetro de orden con formato sospechoso o inválido.');
      return;
    }

    try {
      const res = await fetch(`/api/orders/verify?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo verificar la orden en el servidor');
      }

      if (typeof data.order?.total === 'number' && (data.order.total < 0 || Number.isNaN(data.order.total))) {
        setStatus('security_alert');
        setErrorMessage('La integridad de los montos de esta orden ha fallado la validación de seguridad.');
        return;
      }

      setOrderData(data.order);
      setStatus('success');
    } catch (err: any) {
      console.error('Error de verificación en pasarela:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error de comunicación al verificar el estado del pago.');
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleManualVerify = async () => {
    if (!orderId) return;
    setIsVerifying(true);
    await fetchOrderDetails();
    setIsVerifying(false);
  };

  const handleVolverTienda = (e: React.MouseEvent) => {
    e.preventDefault();
    router.replace('/');
  };

  const handleWhatsAppTracking = () => {
    const shortId = orderId ? orderId.slice(0, 8) : 'N/A';
    const message = encodeURIComponent(`¡Hola! Acabo de realizar el pago de mi orden #${shortId} y deseo coordinar el seguimiento de mi entrega.`);
    // Reemplaza '50300000000' con tu número de WhatsApp de soporte o negocio real
    const phoneNumber = '50300000000'; 
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="mt-4 text-zinc-400 text-sm">Verificando de forma segura el estado de tu pago...</p>
      </div>
    );
  }

  if (status === 'security_alert') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-zinc-950 text-zinc-100">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 animate-pulse" />
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Alerta de Seguridad</h1>
        <p className="text-zinc-400 mb-6 max-w-md text-sm">{errorMessage}</p>
        <Link
          href="/"
          onClick={handleVolverTienda}
          className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition text-sm"
        >
          Volver a la Tienda Segura
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-zinc-950 text-zinc-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Orden no encontrada</h1>
        <p className="text-zinc-400 mb-6 max-w-md text-sm">{errorMessage}</p>
        <Link
          href="/"
          onClick={handleVolverTienda}
          className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-700 transition text-sm"
        >
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center py-10 px-4 sm:p-6 text-center bg-zinc-950 text-zinc-100 overflow-y-auto">
      <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500 mb-4 shrink-0" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">¡Pago Procesado con Éxito!</h1>
      <p className="text-zinc-400 mb-6 max-w-md text-xs sm:text-sm">
        Gracias por tu compra. Tu orden{' '}
        <span className="font-mono font-bold text-zinc-200">
          #{orderId ? orderId.slice(0, 8) : '--------'}
        </span>{' '}
        ha sido registrada, auditada y confirmada de forma segura.
      </p>

      {orderData && (
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-orange-500" /> Resumen de Cobro Verificado
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Pagado / Completado
            </span>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span>${Number(orderData.subtotal || 0).toFixed(2)}</span>
            </div>
            
            {Number(orderData.discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Descuento aplicado:</span>
                <span>-${Number(orderData.discount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-100 font-bold text-sm sm:text-base pt-2 border-t border-zinc-800">
              <span>Total Pagado:</span>
              <span className="text-orange-500">${Number(orderData.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col gap-3">
        <button
          onClick={handleWhatsAppTracking}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-emerald-900/20 cursor-pointer text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Seguimiento de entrega por WhatsApp
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVolverTienda}
            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-orange-900/20 cursor-pointer text-sm"
          >
            Volver a la Tienda
          </button>
          
          <button
            onClick={handleManualVerify}
            disabled={isVerifying}
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl font-medium transition text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}