'use client';

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useRouter } from 'next/navigation';

interface PayPalButtonProps {
  orderId: string | null | undefined; // Permitimos nulos para validar visualmente
}

export default function PayPalButtonSecure({ orderId }: PayPalButtonProps) {
  const router = useRouter();
  
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture',
  };

  // Si no hay un orderId válido todavía, evitamos renderizar o mostramos un aviso limpio
  if (!orderId) {
    return (
      <div className="p-4 text-center text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
        Completa los datos de envío y guarda la orden para habilitar el pago con PayPal.
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'paypal' }}
        createOrder={async () => {
          // Doble validación de seguridad en cliente
          if (!orderId) {
            throw new Error('No se encontró el ID de la orden en la base de datos.');
          }

          const res = await fetch('/api/checkout/paypal/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Error al iniciar PayPal');
          }
          
          return data.paypalOrderId;
        }}
        onApprove={async (data) => {
          const res = await fetch('/api/checkout/paypal/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paypalOrderId: data.orderID,
              orderId: orderId,
            }),
          });
          
          const result = await res.json();
          if (res.ok && result.success) {
            router.replace(`/checkout/success?identificadorEnlaceComercio=${orderId}`);
          } else {
            alert('Hubo un problema al procesar el pago con PayPal.');
          }
        }}
        onError={(err) => {
          console.error('Error en pasarela PayPal:', err);
          alert('Ocurrió un error con PayPal. Intenta de nuevo.');
        }}
      />
    </PayPalScriptProvider>
  );
}