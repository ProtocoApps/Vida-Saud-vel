// Script para testar ativação de assinatura
// Execute no console do navegador após fazer login

// Simular pagamento bem-sucedido
function simularPagamento() {
  const userEmail = 'seu-email@teste.com'; // Substitua pelo seu email
  
  const dataVencimento = new Date();
  dataVencimento.setDate(dataVencimento.getDate() + 30);
  
  localStorage.setItem(`assinatura_${userEmail}`, JSON.stringify({
    ativa: true,
    dataVencimento: dataVencimento.toISOString(),
    orderNsu: 'TEST_' + Date.now(),
    slug: 'vhd7943-descobreville'
  }));
  
  console.log('Assinatura ativada para:', userEmail);
  console.log('Válido até:', dataVencimento.toLocaleDateString('pt-BR'));
  
  // Recarregar a página para ver o efeito
  window.location.reload();
}

// Para usar: simularPagamento();
console.log('Para testar, execute: simularPagamento()');
