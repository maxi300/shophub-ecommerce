import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
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
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { total, shippingAddress, customerInfo, documentType, customerDocumentId } = body;

    const parsedTotal = parseFloat(Number(total).toFixed(2));

    // 1. Guardar la orden en Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        total: parsedTotal,
        subtotal: parsedTotal,
        status: 'pending',
        payment_method: 'wompi',
        payment_status: 'pending',
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postalCode || null,
        shipping_country: 'El Salvador',
        notes: `Cliente: ${customerInfo.firstName} ${customerInfo.lastName} - Email: ${customerInfo.email}`,
        document_type: documentType || '01',
        customer_document_id: customerDocumentId || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error insertando orden:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const clientId = process.env.WOMPI_APP_ID?.trim() || '';
    const clientSecret = process.env.WOMPI_API_SECRET?.trim() || '';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Faltan las variables WOMPI_APP_ID o WOMPI_API_SECRET en .env.local' },
        { status: 500 }
      );
    }

    // 2. Autenticación contra Wompi El Salvador
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

    // 3. Crear el Enlace de Pago API en Wompi
    const wompiPayload = {
      identificadorEnlaceComercio: order.id,
      monto: parsedTotal,
      nombreProducto: `Orden #${order.id.slice(0, 8)}`,
      formaPago: {
        permitirTarjetaCreditoDebido: true,
        permitirPagoConPuntos: false,
        permitirPagoEfectivo: false,
      },
      esMontoEditable: false,
      esCantidadEditable: false,
      cantidad: 1,
      redireccionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order_id=${order.id}`,
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

    // Mapeo correcto de los campos de respuesta que envía Wompi El Salvador
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

    // Retorna la URL corta de Wompi (ej. https://s.wompi.sv/2079616tmJ)
    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: checkoutUrl,
    });

  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}