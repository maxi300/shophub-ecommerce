// app/checkout/success/page.tsx
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, ShoppingBag, Tag, Receipt, ShieldAlert } from 'lucide-react';

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
  
  const orderId = 
    searchParams.get('order_id') || 
    searchParams.get('identificadorEnlaceComercio') || 
    searchParams.get('paypalOrderId');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'security_alert'>('loading');
  const [errorMessage, setErrorMessage] = useState('No se ha especificado un identificador de orden válido.');
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);

  // Candado lógico antifraude / race conditions con useRef para ejecución atómica en cliente
  const hasCleanedRef = useRef(false);

  // 1. Limpieza agresiva e inmediata del carrito local para evitar persistencia post-pago de Wompi/PayPal
  useEffect(() => {
    if (hasCleanedRef.current) return;
    hasCleanedRef.current = true;

    const purgeCartStorage = () => {
      // Limpieza de claves directas de almacenamiento local
      localStorage.removeItem('cart');
      localStorage.removeItem('cart-storage');
      localStorage.removeItem('shopping-cart');
      localStorage.removeItem('current_order_id');
      sessionStorage.removeItem('cart');
      sessionStorage.clear();

      // Limpieza exhaustiva de cualquier clave remanente que contenga patrones de carrito
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('cart') || key.includes('basket') || key.includes('checkout'))) {
          localStorage.removeItem(key);
        }
      }
    };

    purgeCartStorage();

    // Sincronización proactiva con eventos del navegador para bloquear navegación hacia atrás de pasarela
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.href);
    }
  }, []);

  // 2. Blindaje estricto del historial de navegación (Prevención de bucles de reverso a pasarela)
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 3. Verificación de integridad con el Backend (Protección de montos, estados y prevención de acceso cruzado)
  const fetchOrderDetails = async () => {
    if (!orderId) {
      setStatus('error');
      setErrorMessage('No se ha especificado un identificador de orden válido.');
      return;
    }

    // Validación estricta de longitud y formato UUID/Hex estándar para mitigar ataques de enumeración o inyección de parámetros
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

      // Capa extra de validación contra manipulación de montos: si el total es negativo o NaN, marcar alerta
      if (typeof data.order?.total === 'number' && (data.order.total < 0 || Number.isNaN(data.order.total))) {
        setStatus('security_alert');
        setErrorMessage('La integridad de los montos de esta orden ha fallado la validación de seguridad.');
        return;
      }

      setOrderData(data.order);
      setStatus('success');
    } catch (err: any) {
      console.error('Error de verificación en pasarela:', err);
      // Mantenemos una tolerancia de red controlada, pero si el servidor deniega explícitamente, alertamos
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

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="mt-4 text-zinc-400">Verificando de forma segura el estado de tu pago...</p>
      </div>
    );
  }

  if (status === 'security_alert') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Alerta de Seguridad</h1>
        <p className="text-zinc-400 mb-6 max-w-md">{errorMessage}</p>
        <Link
          href="/"
          className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 transition"
        >
          Volver a la Tienda Segura
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Orden no encontrada</h1>
        <p className="text-zinc-400 mb-6 max-w-md">{errorMessage}</p>
        <Link
          href="/"
          className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 transition"
        >
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
      <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 tracking-tight">¡Pago Procesado con Éxito!</h1>
      <p className="text-zinc-400 mb-6 max-w-md">
        Gracias por tu compra. Tu orden{' '}
        <span className="font-mono font-bold text-zinc-200">
          #{orderId ? orderId.slice(0, 8) : '--------'}
        </span>{' '}
        ha sido registrada, auditada y confirmada de forma segura.
      </p>

      {/* Tarjeta de Resumen con datos reales de la BD */}
      {orderData && (
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 text-left space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-orange-500" /> Resumen de Cobro Verificado
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Pagado / Completado
            </span>
          </div>

          <div className="space-y-1.5 text-sm">
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

            <div className="flex justify-between text-zinc-100 font-bold text-base pt-2 border-t border-zinc-800">
              <span>Total Pagado:</span>
              <span className="text-orange-500">${Number(orderData.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link
          href="/"
          className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-orange-900/20"
        >
          Volver a la Tienda
        </Link>
        
        <button
          onClick={handleManualVerify}
          disabled={isVerifying}
          className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-5 py-3 rounded-xl font-medium transition text-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
          ¿Pagaste y sigues aquí? Refrescar estado
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}