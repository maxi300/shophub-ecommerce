import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js'; // O usa tu cliente configurado de Supabase

// Inicializa tu cliente de Supabase para el backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Usa service role para inserciones seguras del backend
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { total, items, customerInfo, documentType, customerDocumentId, shippingAddress } = body;

    if (!total || !items || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos en el carrito o el total es inválido.' }, { status: 400 });
    }

    const amountInCents = Math.round(Number(total) * 100);
    const reference = `FERRETEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const currency = 'USD';

    const publicKey = process.env.NEXT_PUBLIC_WOMPI_APP_ID;
    const apiSecret = process.env.WOMPI_API_SECRET;

    if (!publicKey || !apiSecret) {
      return NextResponse.json({ error: 'Faltan las credenciales de Wompi en el archivo .env del servidor.' }, { status: 500 });
    }

    // 1. Registrar la orden en Supabase como pendiente antes de abrir la pasarela
    const { error: dbError } = await supabase.from('orders').insert([
      {
        reference,
        total: Number(total),
        currency,
        status: 'pending',
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.phone || '00000000',
        customer_document: customerDocumentId,
        items: JSON.stringify(items),
        shipping_address: shippingAddress || {}
      }
    ]);

    if (dbError) {
      console.error('Error al guardar orden en Supabase:', dbError);
      return NextResponse.json({ error: 'Error al registrar la orden en la base de datos.' }, { status: 500 });
    }

    // 2. Generar la firma de integridad HMAC-SHA256 requerida por Wompi
    const concatenation = `${reference}${amountInCents}${currency}${apiSecret}`;
    const integritySignature = crypto.createHash('sha256').update(concatenation).digest('hex');

    return NextResponse.json({
      success: true,
      reference,
      amountInCents,
      currency,
      publicKey,
      integritySignature,
      customer: {
        email: customerInfo.email,
        fullName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phoneNumber: customerInfo.phone || '00000000',
        legalId: customerDocumentId,
        legalIdType: documentType || 'DUI'
      }
    });

  } catch (error: any) {
    console.error('Error en API de Wompi:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar Wompi.' }, { status: 500 });
  }
}