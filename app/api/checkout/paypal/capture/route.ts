// app/api/checkout/paypal/capture/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  return process.env.PAYPAL_MODE === 'live'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { paypalOrderId, orderId } = await req.json();

    if (!paypalOrderId || !orderId) {
      return NextResponse.json({ error: 'Datos incompletos para la captura' }, { status: 400 });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({} as any);
    const captureResponse = await client().execute(request);

    const captureResult = captureResponse.result;

    if (captureResult.status === 'COMPLETED') {
      
      // Actualizamos únicamente el estado base de la orden. 
      // El descuento de stock y la actualización profunda quedan a cargo exclusivo del Webhook de PayPal.
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'processing', 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error actualizando orden tras pago de PayPal:', updateError);
        throw updateError;
      }

      return NextResponse.json({ success: true, captureId: captureResult.id }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'La transacción de PayPal no se completó' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error crítico al capturar pago de PayPal:', error);
    return NextResponse.json({ error: 'Error al procesar la captura de PayPal' }, { status: 500 });
  }
}