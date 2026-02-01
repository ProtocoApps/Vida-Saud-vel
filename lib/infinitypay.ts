export interface InfinityPayItem {
  quantity: number;
  price: number;
  description: string;
}

export interface InfinityPayCustomer {
  name: string;
  email: string;
  phone_number?: string;
}

export interface InfinityPayRequest {
  handle: string;
  order_nsu?: string;
  items: InfinityPayItem[];
  customer?: InfinityPayCustomer;
  redirect_url?: string;
  webhook_url?: string;
}

export interface InfinityPayResponse {
  checkout_url: string;
  id: string;
}

export interface PaymentCheckRequest {
  handle: string;
  order_nsu: string;
  transaction_nsu: string;
  slug: string;
}

export interface PaymentCheckResponse {
  success: boolean;
  paid: boolean;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: 'pix' | 'credit_card';
}

export interface WebhookPayload {
  invoice_slug: string;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: 'pix' | 'credit_card';
  transaction_nsu: string;
  order_nsu: string;
  receipt_url: string;
  items: InfinityPayItem[];
}

const INFINITE_PAY_API = 'https://api.infinitepay.io/invoices/public/checkout';

export async function criarPagamentoInfinityPay(
  userEmail: string,
  userName?: string
): Promise<InfinityPayResponse> {
  const handle = 'josue-morales'; // Handle do usuário sem o $
  const orderNsu = `assinatura_${Date.now()}_${userEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  const request: InfinityPayRequest = {
    handle,
    order_nsu: orderNsu,
    items: [
      {
        quantity: 1,
        price: 1990, // R$ 19,90 em centavos
        description: 'Assinatura Mensal Vida Alinhada'
      }
    ],
    customer: {
      name: userName || userEmail,
      email: userEmail
    },
    redirect_url: `${window.location.origin}/pagamento-sucesso`,
    webhook_url: `${window.location.origin}/api/webhook-infinitepay`
  };

  try {
    const response = await fetch(`${INFINITE_PAY_API}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro ao criar pagamento: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar pagamento Infinity Pay:', error);
    throw error;
  }
}

export async function verificarPagamento(
  orderNsu: string,
  transactionNsu: string,
  slug: string
): Promise<PaymentCheckResponse> {
  const handle = 'josue-morales';

  const request: PaymentCheckRequest = {
    handle,
    order_nsu: orderNsu,
    transaction_nsu: transactionNsu,
    slug
  };

  try {
    const response = await fetch(`${INFINITE_PAY_API}/payment_check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar pagamento: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar pagamento Infinity Pay:', error);
    throw error;
  }
}
