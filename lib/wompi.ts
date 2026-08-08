// lib/wompi.ts

interface WompiTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CreatePaymentLinkParams {
  monto: number;
  idTransaccion: string; // ID de la orden en Supabase
  descripcion: string;
  emailCliente: string;
}

/**
 * Obtiene el token Bearer OAuth2 desde el servidor Identity de Wompi SV.
 */
async function getWompiAccessToken(): Promise<string> {
  const appId = process.env.WOMPI_APP_ID;
  const apiSecret = process.env.WOMPI_API_SECRET;

  if (!appId || !apiSecret) {
    throw new Error('Faltan las credenciales de Wompi en las variables de entorno.');
  }

  // URL del Identity Server de Wompi El Salvador
  const authUrl = 'https://id.wompi.sv/connect/token';

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: appId,
      client_secret: apiSecret,
      audience: 'wompi_api', // Debe ser 'wompi_api'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error autenticación Wompi (Identity):', errorText);
    throw new Error(`Error Wompi Auth (${response.status}): ${errorText}`);
  }

  const data: WompiTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Genera la URL del enlace de pago para redirigir al cliente.
 */
export async function createWompiPaymentLink({
  monto,
  idTransaccion,
  descripcion,
  emailCliente,
}: CreatePaymentLinkParams): Promise<string> {
  const token = await getWompiAccessToken();
  const apiUrl = process.env.WOMPI_API_URL || 'https://api.wompi.sv';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const response = await fetch(`${apiUrl}/EnlacePago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      identificadorEnlaceComercio: idTransaccion,
      monto: Number(monto.toFixed(2)),
      nombreProducto: descripcion,
      formaPago: {
        permitirTarjetaCreditoDebido: true,
        permitirPagoConPuntos: false,
      },
      infoEnlace: {
        emailCliente: emailCliente,
      },
      urlRedireccion: `${appUrl}/checkout/success?order_id=${idTransaccion}`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Error generando EnlacePago Wompi:', errorData);
    throw new Error(`Error al crear EnlacePago (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  return data.urlEnlace;
}