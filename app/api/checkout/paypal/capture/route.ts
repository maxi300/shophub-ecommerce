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
    request.requestBody({});
    const captureResponse = await client().execute(request);

    const captureResult = captureResponse.result;

    if (captureResult.status === 'COMPLETED') {
      
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'processing', payment_status: 'paid' })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error actualizando orden tras pago de PayPal:', updateError);
        throw updateError;
      }

      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (!itemsError && orderItems) {
        for (const item of orderItems) {
          const { data: productData } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (productData) {
            const nuevoStock = Math.max(0, productData.stock - item.quantity);
            await supabaseAdmin
              .from('products')
              .update({ stock: nuevoStock })
              .eq('id', item.product_id);
          }
        }
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