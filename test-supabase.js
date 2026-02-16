// Teste simples para verificar conexão com Supabase
import { supabase } from './supabase';

async function testSupabaseConnection() {
  console.log('🧪 TESTANDO CONEXÃO COM SUPABASE');
  
  try {
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('assinaturas')
      .select('count')
      .single();
    
    console.log('Resultado teste básico:', { testData, testError });
    
    if (testError) {
      console.error('❌ Erro no teste básico:', testError);
      return;
    }
    
    // Teste 2: Inserir registro simples
    console.log('2️⃣ Testando inserção...');
    const testAssinatura = {
      user_email: 'test@example.com',
      status: 'ativa',
      data_inicio: new Date().toISOString(),
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      valor: 1.00,
      forma_pagamento: 'pix',
      order_nsu: 'test_123',
      slug: 'test_slug'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('assinaturas')
      .insert([testAssinatura])
      .select()
      .single();
    
    console.log('Resultado inserção:', { insertData, insertError });
    
    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Código:', insertError.code);
      console.error('Mensagem:', insertError.message);
      console.error('Detalhes:', insertError.details);
    } else {
      console.log('✅ Inserção bem-sucedida:', insertData);
      
      // Limpa o teste
      await supabase
        .from('assinaturas')
        .delete()
        .eq('id', insertData.id);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Exporta para usar no console
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  console.log('🧪 Execute: testSupabaseConnection() no console');
}

export { testSupabaseConnection };
