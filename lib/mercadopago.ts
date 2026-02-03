export const MERCADO_PAGO_CONFIG = {
  publicKey: 'APP_USR-03a06a0f-7453-4064-9864-90d209324440',
  accessToken: 'APP_USR-871494466911326-081800-12d82f678168df47aab6f86eec4e4759-2336152427',
  baseUrl: 'https://api.mercadopago.com'
};

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoPaymentStatus {
  status: string;
  status_detail: string;
  payment_id: number;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  date_approved?: string;
  payment_type_id: string;
  payment_method_id: string;
}

export async function criarPreferenciaMercadoPago(
  userEmail: string,
  userName?: string,
  baseUrl?: string
): Promise<MercadoPagoPreferenceResponse> {
  const externalReference = `assinatura_${Date.now()}_${userEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002');
  
  const preference = {
    items: [{
      title: 'Assinatura Mensal Vida Alinhada',
      quantity: 1,
      unit_price: 49.90,
      currency_id: 'BRL'
    }],
    payer: {
      email: userEmail,
      name: userName || userEmail
    },
    back_urls: {
      success: `${origin}/#/assinatura?status=success&external_reference=${externalReference}`,
      failure: `${origin}/#/assinatura?status=failure&external_reference=${externalReference}`,
      pending: `${origin}/#/assinatura?status=pending&external_reference=${externalReference}`
    },
    auto_return: 'approved',
    external_reference: externalReference
  };

  try {
    const response = await fetch(`${MERCADO_PAGO_CONFIG.baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro ao criar preferência: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error);
    throw error;
  }
}

export async function verificarPagamentoMercadoPago(
  paymentId: string
): Promise<MercadoPagoPaymentStatus> {
  try {
    const response = await fetch(`${MERCADO_PAGO_CONFIG.baseUrl}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar pagamento: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar pagamento Mercado Pago:', error);
    throw error;
  }
}
