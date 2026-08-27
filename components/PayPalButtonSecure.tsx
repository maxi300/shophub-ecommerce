// app/api/checkout/paypal/create/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const body = await req.json();
    const { shippingAddress, customerInfo, documentType, customerDocumentId, items, orderId: existingFrontendOrderId } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let parsedTotal = 0;
    let orderId = existingFrontendOrderId;

    // CASO A: Si el frontend solo mandó el orderId, leemos el total directamente de la base de datos
    if (orderId && (!items || items.length === 0)) {
      const { data: dbOrder, error: dbOrderError } = await supabaseAdmin
        .from('orders')
        .select('total')
        .eq('id', orderId)
        .single();

      if (dbOrderError || !dbOrder) {
        return NextResponse.json({ error: 'No se encontró la orden registrada en la base de datos.' }, { status: 400 });
      }

      parsedTotal = Number(dbOrder.total);
    } 
    // CASO B: Si el frontend mandó los items del carrito, hacemos la validación y cálculo en el servidor
    else {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'No se especificaron productos en el carrito.' }, { status: 400 });
      }

      let calculatedTotal = 0;
      const verifiedOrderItems = [];

      for (const item of items) {
        const productId = item.id || item.productId;
        const requestedQuantity = item.quantity;

        if (!productId || !requestedQuantity || requestedQuantity <= 0) {
          return NextResponse.json({ error: 'Estructura de producto inválida en el carrito.' }, { status: 400 });
        }

        const { data: dbProduct, error: dbError } = await supabaseAdmin
          .from('products')
          .select('id, price, discount_price, name')
          .eq('id', productId)
          .single();

        if (dbError || !dbProduct) {
          return NextResponse.json({ error: `El producto con ID ${productId} no existe o no está disponible.` }, { status: 400 });
        }

        const realPrice = (dbProduct.discount_price !== null && dbProduct.discount_price > 0)
          ? Number(dbProduct.discount_price)
          : Number(dbProduct.price);
        
        calculatedTotal += realPrice * requestedQuantity;

        verifiedOrderItems.push({
          product_id: dbProduct.id,
          quantity: requestedQuantity,
          price: realPrice,
          variant_selections: item.variantSelections || null
        });
      }

      parsedTotal = parseFloat(calculatedTotal.toFixed(2));
      const userId = user?.id || null;

      let existingOrderQuery = supabaseAdmin
        .from('orders')
        .select('id, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (userId) {
        existingOrderQuery = existingOrderQuery.eq('user_id', userId);
      } else {
        existingOrderQuery = existingOrderQuery.ilike('notes', `%Email: ${customerInfo?.email}%`);
      }

      const { data: existingOrder } = await existingOrderQuery.maybeSingle();

      if (existingOrder) {
        orderId = existingOrder.id;

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            total: parsedTotal,
            subtotal: parsedTotal,
            shipping_address: shippingAddress?.address || '',
            shipping_city: shippingAddress?.city || '',
            shipping_postal_code: shippingAddress?.postalCode || null,
            shipping_country: 'El Salvador',
            notes: `Cliente: ${customerInfo?.firstName} ${customerInfo?.lastName} - Email: ${customerInfo?.email}`,
            document_type: documentType || '01',
            customer_document_id: customerDocumentId || null,
            customer_business_name: `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error al actualizar orden pendiente existente:', updateError);
          return NextResponse.json({ error: 'Error al actualizar la orden en la base de datos' }, { status: 500 });
        }

        await supabaseAdmin.from('order_items').delete().eq('order_id', orderId);

      } else {
        const { data: orderData, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: userId,
            total: parsedTotal,
            subtotal: parsedTotal,
            status: 'pending',
            payment_method: 'paypal',
            shipping_address: shippingAddress?.address || '',
            shipping_city: shippingAddress?.city || '',
            shipping_postal_code: shippingAddress?.postalCode || null,
            shipping_country: 'El Salvador',
            notes: `Cliente: ${customerInfo?.firstName} ${customerInfo?.lastName} - Email: ${customerInfo?.email}`,
            document_type: documentType || '01',
            customer_document_id: customerDocumentId || null,
            customer_business_name: `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim()
          })
          .select('id')
          .single();

        if (orderError || !orderData) {
          console.error('Error al crear orden de PayPal en Supabase:', orderError);
          return NextResponse.json({ error: orderError?.message || 'Error al registrar la orden' }, { status: 500 });
        }

        orderId = orderData.id;
      }

      const orderItemsPayload = verifiedOrderItems.map(item => ({
        order_id: orderId,
        ...item
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) {
        console.error('Error al registrar items de la orden de PayPal:', itemsError);
        return NextResponse.json({ error: 'Error al registrar los productos de la orden' }, { status: 500 });
      }
    }

    // ==========================================
    // CREACIÓN DE LA ORDEN EN PAYPAL
    // ==========================================
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: parsedTotal.toFixed(2), // Usará exactamente el total verificado (ej. $99.00)
          },
        },
      ],
    });

    const paypalResponse = await client().execute(request);
    const paypalOrderId = paypalResponse.result.id;

    // Guardamos de inmediato el ID de la pasarela en la orden
    await supabaseAdmin
      .from('orders')
      .update({ payment_gateway_id: paypalOrderId })
      .eq('id', orderId);

    return NextResponse.json({ paypalOrderId, orderId }, { status: 200 });

  } catch (error: any) {
    console.error('Error creando orden de PayPal:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar PayPal' }, { status: 500 });
  }
}