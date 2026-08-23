import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // --- MAPEO EXACTO SEGÚN LOS LOGS DE WOMPI ---
    const identificadorEnlaceComercio = 
      body.EnlacePago?.IdentificadorEnlaceComercio || 
      body.identificadorEnlaceComercio || 
      body.data?.identificadorEnlaceComercio || 
      body.reference;

    const resultadoTransaccion = 
      body.ResultadoTransaccion || 
      body.estado || 
      body.event || 
      body.data?.estado; 

    console.log(`Identificador detectado: ${identificadorEnlaceComercio}, Resultado detectado: ${resultadoTransaccion}`);

    const esExitoso = 
      resultadoTransaccion === 'ExitosaAprobada' || 
      resultadoTransaccion === 'Aprobada' || 
      resultadoTransaccion === 'SUCCESS' || 
      resultadoTransaccion === 'approved' || 
      resultadoTransaccion === 'COMPLETE';

    if (identificadorEnlaceComercio && esExitoso) {
      // 3. Actualizar el estado de la orden a 'processing' y 'paid'
      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'processing', payment_status: 'paid' })
        .eq('id', identificadorEnlaceComercio);

      if (orderError) {
        console.error('Error actualizando orden en Supabase:', orderError);
        throw orderError;
      }

      // 4. Obtener los productos asociados a esta orden
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', identificadorEnlaceComercio);

      if (itemsError) {
        console.error('Error obteniendo order_items:', itemsError);
        throw itemsError;
      }

      // 5. Recorrer cada producto para descontar su stock de forma segura
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const { data: productData, error: prodFetchError } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (!prodFetchError && productData) {
            const nuevoStock = Math.max(0, productData.stock - item.quantity);

            await supabaseAdmin
              .from('products')
              .update({ stock: nuevoStock })
              .eq('id', item.product_id);
            
            console.log(`¡STOCK DESCONTADO! Producto ${item.product_id}: stock anterior = ${productData.stock}, nuevo stock = ${nuevoStock}`);
          }
        }
      }
    } else {
      console.log('No se cumplieron las condiciones: falta identificador o la transacción no fue exitosa.');
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (error) {
    console.error('Error crítico en webhook de Wompi:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}