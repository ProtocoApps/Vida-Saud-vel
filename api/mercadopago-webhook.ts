import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MERCADO_PAGO_CONFIG } from '../lib/mercadopago.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('🔔 Webhook recebido:', body)

    // Verificar se é uma notificação de pagamento
    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      // Buscar informações detalhadas do pagamento
      const paymentResponse = await fetch(
        `${MERCADO_PAGO_CONFIG.baseUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
          }
        }
      )

      if (!paymentResponse.ok) {
        throw new Error(`Erro ao buscar pagamento: ${paymentResponse.status}`)
      }

      const payment = await paymentResponse.json()
      console.log('💳 Dados do pagamento:', payment)

      // Verificar se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const userEmail = payment.payer.email
        const externalReference = payment.external_reference

        if (!userEmail) {
          throw new Error('Email do pagador não encontrado')
        }

        // Conectar ao Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Ativar assinatura no localStorage (simulado via banco)
        const dataVencimento = new Date()
        dataVencimento.setDate(dataVencimento.getDate() + 30)

        // Salvar na tabela de assinaturas
        const { error } = await supabase
          .from('assinaturas')
          .upsert({
            user_email: userEmail,
            status: 'ativa',
            data_inicio: new Date().toISOString(),
            data_vencimento: dataVencimento.toISOString(),
            valor: payment.transaction_amount,
            forma_pagamento: payment.payment_type_id === 'credit_card' ? 'cartao' : 'pix',
            order_nsu: payment.id.toString(),
            slug: externalReference,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('❌ Erro ao salvar assinatura:', error)
          throw error
        }

        console.log('✅ Assinatura ativada com sucesso via webhook!')
        console.log(`📧 Email: ${userEmail}`)
        console.log(`💰 Valor: R$ ${payment.transaction_amount}`)
        console.log(`📅 Vencimento: ${dataVencimento.toISOString()}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
