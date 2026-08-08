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

    // Obtener usuario autenticado usando el método validado del servidor
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { items, total, shippingAddress, customerInfo, documentType, customerDocumentId } = body;

    const userId = user?.id || null;

    // Insertar orden mapeando la estructura exacta de la tabla de Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total: total,
        subtotal: total,
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

    return NextResponse.json({
      orderId: order.id,
      monto: total,
      emailCliente: customerInfo.email,
      appId: process.env.NEXT_PUBLIC_WOMPI_APP_ID || '',
    });
  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}