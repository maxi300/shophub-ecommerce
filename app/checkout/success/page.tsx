// app/checkout/success/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">¡Pago Procesado con Éxito!</h1>
      <p className="text-gray-600 mb-6">
        Gracias por tu compra. Tu orden{' '}
        <span className="font-mono font-bold">
          #{orderId ? orderId.slice(0, 8) : '--------'}
        </span>{' '}
        está siendo procesada.
      </p>
      <p className="text-sm text-gray-500 mb-8 max-w-md">
        Se emitirá y enviará tu Documento Tributario Electrónico (DTE) a tu correo electrónico una vez que el pago sea confirmado por el banco.
      </p>

      <Link
        href="/"
        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        Volver a la Tienda
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
          <p className="mt-4 text-gray-600">Cargando detalles de la orden...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}