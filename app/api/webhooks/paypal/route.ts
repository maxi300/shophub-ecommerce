// app/api/webhooks/paypal/route.ts

// app/api/webhooks/paypal/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;

    // Solo procesamos cuando el pago ha sido capturado exitosamente
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureResource = body.resource;
      
      // Extracción robusta del ID de la orden de PayPal
      const paypalOrderId = 
        captureResource.supplementary_data?.related_ids?.order_id || 
        captureResource.custom_id || 
        captureResource.id;

      // Extracción segura del monto pagado
      const amountPaid = captureResource.amount?.value;

      console.log(`Webhook recibido: Pago completado para la orden de PayPal: ${paypalOrderId} por $${amountPaid}`);

      if (!paypalOrderId) {
        console.error('No se pudo extraer el ID de la orden de PayPal del payload del webhook.');
        return NextResponse.json({ error: 'Payload inválido: falta order_id' }, { status: 400 });
      }

      // Inicializamos Supabase Admin (service role)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Buscamos la orden en la base de datos usando el payment_gateway_id
      const { data: order, error: findError } = await supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('payment_gateway_id', paypalOrderId)
        .single();

      if (findError || !order) {
        console.error('No se encontró una orden local asociada al ID de PayPal:', paypalOrderId);
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
      }

      // 2. Si la orden sigue pendiente, la actualizamos unificando los estados (ej. 'processing' o 'completed')
      if (order.status === 'pending') {
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'processing', // Súper recomendado unificarlo con tu flujo manual de captura
            payment_status: 'paid', // Asegura consistencia si manejas esta columna
            updated_at: new Date().toISOString() 
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('Error al actualizar la orden vía Webhook:', updateError);
          return NextResponse.json({ error: 'Error al actualizar base de datos' }, { status: 500 });
        }

        console.log(`Orden interna ${order.id} marcada como pagada exitosamente vía Webhook.`);
      }
    }

    // Siempre retornar 200 OK a PayPal para confirmar recepción del evento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error procesando el webhook de PayPal:', error);
    return NextResponse.json({ error: 'Error interno en el Webhook' }, { status: 400 });
  }
}