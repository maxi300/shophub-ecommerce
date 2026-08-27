import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // 1. Cliente para autenticar al usuario (saber quién está comprando si ha iniciado sesión)
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

    // 2. Cliente Admin con Service Role para evitar bloqueos de RLS al insertar la orden e ítems
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Insertar directamente en la tabla orders usando el cliente Admin
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user?.id || null,
        total: parsedTotal,
        subtotal: parsedTotal,
        status: 'pending',
        payment_method: 'wompi',
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postalCode || null,
        shipping_country: 'El Salvador',
        notes: `Cliente: ${customerInfo.firstName} ${customerInfo.lastName} - Email: ${customerInfo.email}`,
        document_type: documentType || '01',
        customer_document_id: customerDocumentId || null,
        customer_business_name: `${customerInfo.firstName} ${customerInfo.lastName}`
      })
      .select('id')
      .single();

    if (orderError || !orderData) {
      console.error('Error al crear orden en Supabase:', orderError);
      return NextResponse.json({ error: orderError?.message || 'Error al registrar la orden' }, { status: 500 });
    }

    const orderId = orderData.id;

    // 4. Insertar los ítems asociados en la tabla order_items usando el cliente Admin
    const orderItemsPayload = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      variant_selections: item.variantSelections || null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Error al registrar items de la orden:', itemsError);
      return NextResponse.json({ error: 'Error al registrar los productos de la orden' }, { status: 500 });
    }

    const clientId = process.env.WOMPI_APP_ID?.trim() || '';
    const clientSecret = process.env.WOMPI_API_SECRET?.trim() || '';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Faltan las variables WOMPI_APP_ID o WOMPI_API_SECRET en .env.local' },
        { status: 500 }
      );
    }

    // 5. Autenticación contra Wompi El Salvador
    const authResponse = await fetch('https://id.wompi.sv/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: 'https://api.wompi.sv',
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      return NextResponse.json(
        { error: `Error de autenticación: ${authData.error || 'Token no recibido'}` },
        { status: 500 }
      );
    }

    // 6. Crear el Enlace de Pago API en Wompi precargando los datos del cliente
    const wompiPayload = {
      identificadorEnlaceComercio: orderId,
      monto: parsedTotal,
      nombreProducto: `Orden #${orderId.slice(0, 8)}`,
      cliente: {
        correoElectronico: customerInfo.email,
        nombres: customerInfo.firstName,
        apellidos: customerInfo.lastName,
      },
      formaPago: {
        permitirTarjetaCreditoDebido: true,
        permitirPagoConPuntos: false,
        permitirPagoEfectivo: false,
      },
      esMontoEditable: false,
      esCantidadEditable: false,
      cantidad: 1,
      urlRedireccion: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://b831-138-97-141-210.ngrok-free.app/'}/checkout/success?order_id=${orderId}`,
    };

    const wompiResponse = await fetch('https://api.wompi.sv/EnlacePago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify(wompiPayload),
    });

    const wompiData = await wompiResponse.json();
    const checkoutUrl = wompiData.urlEnlace || wompiData.urlEnlaceLargo || wompiData.urlEnlacePago;

    if (!wompiResponse.ok || !checkoutUrl) {
      console.error('=== ERROR WOMPI ENLACE PAGO ===', {
        status: wompiResponse.status,
        data: wompiData,
      });

      return NextResponse.json(
        { error: `Error Wompi (${wompiResponse.status}): No se pudo obtener la URL de pago.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: orderId,
      checkoutUrl: checkoutUrl,
    });

  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}