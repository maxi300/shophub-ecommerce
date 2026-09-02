//api/orders/verify

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'No se proporcionó un ID de orden' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .or(`id.eq.${orderId},payment_gateway_id.eq.${orderId}`)
      .limit(1);

    if (error || !orders || orders.length === 0) {
      return NextResponse.json({ error: 'Orden no encontrada en la base de datos' }, { status: 404 });
    }

    return NextResponse.json({ order: orders[0] }, { status: 200 });
  } catch (err: any) {
    console.error('Error en /api/orders/verify:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}