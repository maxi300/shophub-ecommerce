import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${mode}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    // 1. Extraer las cabeceras criptográficas que envía PayPal
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionSig || !certUrl) {
      return NextResponse.json({ error: 'Cabeceras de firma de PayPal faltantes' }, { status: 400 });
    }

    // 2. Obtener el cuerpo crudo (raw body) de la petición
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // 3. Verificar la firma llamando a la API de PayPal
    const accessToken = await getPayPalAccessToken();
    const mode = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const verifyRes = await fetch(`${mode}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: body,
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyData.verification_status !== 'SUCCESS') {
      console.warn('Fallo en la verificación de firma del Webhook de PayPal (Spoofing detectado)');
      return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 400 });
    }

    // ==========================================
    // LÓGICA DE NEGOCIO (IDEMPOTENCIA Y STOCK)
    // ==========================================
    const eventType = body.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureResource = body.resource;
      const paypalOrderId = 
        captureResource.supplementary_data?.related_ids?.order_id || 
        captureResource.custom_id || 
        captureResource.id;

      if (!paypalOrderId) {
        return NextResponse.json({ error: 'Payload inválido: falta order_id' }, { status: 400 });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: order, error: findError } = await supabaseAdmin
        .from('orders')
        .select('id, status, stock_deducted')
        .eq('payment_gateway_id', paypalOrderId)
        .single();

      if (findError || !order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
      }

      if (!order.stock_deducted) {
        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id);

        if (orderItems) {
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

        await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'processing',
            payment_status: 'paid',
            stock_deducted: true,
            updated_at: new Date().toISOString() 
          })
          .eq('id', order.id);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error crítico procesando webhook:', error);
    return NextResponse.json({ error: 'Error interno en el Webhook' }, { status: 500 });
  }
}