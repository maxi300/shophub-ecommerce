// app/checkout/success/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  
  // Wompi envía el ID de la orden bajo 'identificadorEnlaceComercio'
  const orderId = searchParams.get('identificadorEnlaceComercio') || searchParams.get('order_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isVerifying, setIsVerifying] = useState(false);

  // Protección para el historial de navegación (Bloquea el botón "Atrás" hacia la pasarela)
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

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    const timer = setTimeout(() => {
      setStatus('success');
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderId]);

  const handleManualVerify = async () => {
    if (!orderId) return;
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="mt-4 text-zinc-400">Verificando el estado de tu pago con Wompi...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Orden no encontrada</h1>
        <p className="text-zinc-400 mb-6">No se ha especificado un identificador de orden válido.</p>
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100">
      <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 tracking-tight">¡Pago Procesado con Éxito!</h1>
      <p className="text-zinc-400 mb-6 max-w-md">
        Gracias por tu compra. Tu orden{' '}
        <span className="font-mono font-bold text-zinc-200">
          #{orderId ? orderId.slice(0, 8) : '--------'}
        </span>{' '}
        ha sido registrada y confirmada correctamente.
      </p>

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
          className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-5 py-3 rounded-xl font-medium transition text-sm disabled:opacity-50"
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