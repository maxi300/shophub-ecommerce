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
    const { total, shippingAddress, customerInfo, documentType, customerDocumentId, items } = body;

    const parsedTotal = parseFloat(Number(total).toFixed(2));

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No se especificaron productos en el carrito.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let orderId;
    const userId = user?.id || null;

    // 1. REUTILIZACIÓN INTELIGENTE: Buscar si ya existe una orden pendiente para este usuario o sesión
    let existingOrderQuery = supabaseAdmin
      .from('orders')
      .select('id, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (userId) {
      existingOrderQuery = existingOrderQuery.eq('user_id', userId);
    } else {
      // Si es un usuario invitado, podemos buscar por correo en las notas
      existingOrderQuery = existingOrderQuery.ilike('notes', `%Email: ${customerInfo?.email}%`);
    }

    const { data: existingOrder } = await existingOrderQuery.maybeSingle();

    if (existingOrder) {
      // Reutilizamos la orden existente y actualizamos sus datos
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

      // Limpiamos los items viejos de esta orden para insertar los actuales del carrito actualizado
      await supabaseAdmin.from('order_items').delete().eq('order_id', orderId);

    } else {
      // Si no existe, creamos una orden completamente nueva
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

    // 2. Insertar los items correspondientes (para nueva orden u orden reutilizada)
    const orderItemsPayload = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id || item.productId,
      quantity: item.quantity,
      price: item.price,
      variant_selections: item.variantSelections || null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Error al registrar items de la orden de PayPal:', itemsError);
      return NextResponse.json({ error: 'Error al registrar los productos de la orden' }, { status: 500 });
    }

    // 3. Crear la orden de pago en PayPal SDK
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: parsedTotal.toFixed(2),
          },
        },
      ],
    });

    const paypalResponse = await client().execute(request);
    const paypalOrderId = paypalResponse.result.id;

    // 4. Guardar el ID externo de PayPal en la orden
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