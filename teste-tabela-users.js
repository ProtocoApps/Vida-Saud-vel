// Script para testar se a tabela users está funcionando
// Execute com: node teste-tabela-users.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqiklofbfiatcdpenpyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaWtsb2ZiZmlhdGNkcGVucHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDgxOTcsImV4cCI6MjA4NDUyNDE5N30._dNpdz9UjPijmx0QumORBYRxvUHcErFtdQ4KiFkpm6s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarTabelaUsers() {
  console.log('🧪 Testando tabela users...\n');

  try {
    // 1. Verificar se conseguimos fazer uma consulta básica
    console.log('1. Testando conexão com a tabela...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return;
    }

    console.log('✅ Conexão com tabela users OK');

    // 2. Tentar inserir um usuário de teste (isso vai falhar por causa do RLS, mas mostra se a tabela existe)
    console.log('\n2. Testando estrutura da tabela...');
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000', // ID fake para teste
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      gender: 'masculino'
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert([testUser]);

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('✅ Tabela existe e RLS está funcionando (email duplicado)');
      } else if (insertError.code === '42501') {
        console.log('✅ Tabela existe e RLS está funcionando (permissão negada)');
      } else {
        console.log('⚠️  Tabela existe, mas pode haver problemas:', insertError.message);
      }
    } else {
      console.log('⚠️  Inserção funcionou (isso não deveria acontecer sem autenticação)');
    }

    // 3. Verificar estrutura da tabela consultando um usuário real (se existir)
    console.log('\n3. Verificando dados existentes...');
    const { data: existingData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log('ℹ️  Nenhum dado encontrado ou erro na consulta:', selectError.message);
    } else if (existingData && existingData.length > 0) {
      console.log('✅ Dados encontrados na tabela!');
      console.log('📊 Estrutura dos dados:', Object.keys(existingData[0]));
    } else {
      console.log('ℹ️  Tabela existe mas está vazia (normal para novo projeto)');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }

  console.log('\n🎯 Para testar completamente:');
  console.log('1. Execute o script SQL no Supabase');
  console.log('2. Faça um cadastro no app');
  console.log('3. Verifique se os dados apareceram na tabela users');
}

// Executar o teste
testarTabelaUsers();