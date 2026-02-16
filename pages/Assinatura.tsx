import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { criarPreferenciaMercadoPago, verificarPagamentoMercadoPago, MERCADO_PAGO_CONFIG } from '../lib/mercadopago';
import { verificarAssinatura } from '../lib/assinatura';
import BottomNav from '../components/BottomNav';
import PagamentoModal from '../components/PagamentoModal';

interface AssinaturaProps {
  onNavigate: (screen: AppScreen) => void;
}

const Assinatura: React.FC<AssinaturaProps> = ({ onNavigate }) => {
  const { userData } = useGlobalUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);

  // Função para buscar pagamentos recentes do usuário
  const buscarPagamentosRecentes = async (userEmail: string, paymentId?: string) => {
    try {
      console.log('🔍 Buscando pagamentos recentes para:', userEmail);
      if (paymentId) {
        console.log('🔍 Também verificando payment_id específico:', paymentId);
      }
      
      // Se tem payment_id específico, verifica direto
      if (paymentId) {
        try {
          const specificPayment = await verificarPagamentoMercadoPago(paymentId);
          console.log('💳 Pagamento específico encontrado:', specificPayment);
          
          if (specificPayment.status === 'approved') {
            console.log('🎉 Pagamento específico APROVADO!');
            try {
              await ativarAssinaturaNoSupabase(specificPayment, specificPayment.external_reference, userData);
              setShowPagamentoModal(true);
              return true;
            } catch (dbError) {
              console.error('❌ Erro ao salvar no Supabase, mas pagamento foi aprovado:', dbError);
              setShowPagamentoModal(true);
              return true; // Considera como sucesso mesmo com erro no DB
            }
          }
        } catch (error) {
          console.error('❌ Erro ao buscar pagamento específico:', error);
        }
      }
      
      // Busca pagamentos nos últimos 15 minutos
      const response = await fetch(`${MERCADO_PAGO_CONFIG.baseUrl}/v1/payments/search`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_CONFIG.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pagamentos: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Pagamentos encontrados:', data);

      // Filtra pagamentos do usuário nos últimos 15 minutos
      const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);
      const pagamentosRecentes = data.results.filter((payment: any) => {
        const dataPagamento = new Date(payment.date_created);
        return payment.payer?.email === userEmail && 
               dataPagamento > quinzeMinutosAtras &&
               payment.status === 'approved';
      });

      console.log('💰 Pagamentos aprovados recentes:', pagamentosRecentes);

      if (pagamentosRecentes.length > 0) {
        const pagamento = pagamentosRecentes[0];
        console.log('🎉 Pagamento aprovado encontrado!', pagamento);
        
        // Ativa assinatura
        try {
          await ativarAssinaturaNoSupabase(pagamento, pagamento.external_reference, userData);
          setShowPagamentoModal(true);
          return true;
        } catch (dbError) {
          console.error('❌ Erro ao salvar no Supabase, mas pagamento foi aprovado:', dbError);
          setShowPagamentoModal(true);
          return true; // Considera como sucesso mesmo com erro no DB
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos recentes:', error);
      return false;
    }
  };
  const ativarAssinaturaNoSupabase = async (paymentStatus: any, externalReference: string, userData: any) => {
    console.log('🎯 Ativando assinatura no Supabase...');
    console.log('📊 Dados do pagamento:', JSON.stringify(paymentStatus, null, 2));
    console.log('👤 Dados do usuário:', JSON.stringify(userData, null, 2));
    
    // Ativa assinatura no Supabase
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);
    
    const dbData = {
      user_id: userData?.id || null,
      user_email: userData.email,
      status: 'ativa' as const,
      data_inicio: new Date().toISOString(),
      data_vencimento: dataVencimento.toISOString(),
      valor: paymentStatus.transaction_amount || paymentStatus.amount,
      forma_pagamento: paymentStatus.payment_type_id === 'credit_card' ? 'cartao' as const : 'pix' as const,
      order_nsu: paymentStatus.payment_id || paymentStatus.id || paymentStatus.collection_id,
      slug: externalReference
    };
    
    console.log('💾 Dados para salvar no Supabase:', JSON.stringify(dbData, null, 2));
    
    try {
      const { criarAssinaturaDB } = await import('../lib/assinaturas-db');
      console.log('🔧 Chamando criarAssinaturaDB...');
      const result = await criarAssinaturaDB(dbData);
      console.log('✅ ASSINATURA SALVA NO SUPABASE:', result);
      return result;
    } catch (dbError) {
      console.error('❌ Erro detalhado ao salvar no Supabase:', dbError);
      console.error('❌ Mensagem do erro:', dbError.message);
      console.error('❌ Código do erro:', dbError.code);
      console.error('❌ Detalhes:', dbError.details);
      
      // Fallback: salva no localStorage
      console.log('💾 Usando fallback localStorage...');
      const assinaturaData = {
        ativa: true,
        dataVencimento: dataVencimento.toISOString(),
        orderNsu: paymentStatus.payment_id || paymentStatus.id || paymentStatus.collection_id,
        slug: externalReference
      };
      localStorage.setItem(`assinatura_${userData.email}`, JSON.stringify(assinaturaData));
      console.log('✅ Salvo no localStorage como fallback:', assinaturaData);
      throw dbError; // Re-lança o erro para ser tratado acima
    }
  };

  // Detecta quando usuário volta do Mercado Pago
  useEffect(() => {
    const checkMercadoPagoParams = async () => {
      console.log('🔍 INICIANDO VERIFICAÇÃO MERCADO PAGO');
      console.log('🔍 URL completa:', window.location.href);
      console.log('🔍 userData:', userData);
      
      if (!userData?.email) {
        console.log('❌ Sem userData.email, aguardando 2 segundos...');
        setTimeout(() => {
          if (!userData?.email) {
            console.log('❌ Ainda sem userData.email após espera');
            return;
          }
          checkMercadoPagoParams();
        }, 2000);
        return;
      }

      // Verifica parâmetros do Mercado Pago
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const collectionStatus = urlParams.get('collection_status');
      const paymentId = urlParams.get('payment_id');
      const externalReference = urlParams.get('external_reference');
      
      console.log('🔍 Status:', status);
      console.log('🔍 Collection Status:', collectionStatus);
      console.log('🔍 Payment ID:', paymentId);
      console.log('🔍 External Reference:', externalReference);
      console.log('🔍 userData.email:', userData?.email);
      console.log('🔍 userData.id:', userData?.id);
      
      // Se tiver status, veio do Mercado Pago
      if ((status || collectionStatus) && paymentId && externalReference) {
        console.log('🎉 Detectado retorno do Mercado Pago!');
        
        // Para Pix, collection_status é mais confiável que status
        const finalStatus = collectionStatus || status;
        console.log('📊 Status final:', finalStatus);
        
        try {
          if (finalStatus === 'approved' || finalStatus === 'success') {
            console.log('✅ Pagamento APROVADO pelo Mercado Pago!');
            
            // Verifica status detalhado do pagamento
            const paymentStatus = await verificarPagamentoMercadoPago(paymentId);
            console.log('📊 Status detalhado:', paymentStatus);
            
            if (paymentStatus.status === 'approved') {
              console.log('🎯 Status confirmado como APPROVED! Ativando assinatura...');
              await ativarAssinaturaNoSupabase(paymentStatus, externalReference, userData);
              setShowPagamentoModal(true);
            } else {
              console.log('❌ Status não é approved:', paymentStatus.status);
              setError('❌ Pagamento não foi aprovado. Tente novamente.');
            }
          } else if (finalStatus === 'pending') {
            console.log('⏳ Pagamento pendente... Verificando status real...');
            setError('⏳ Pagamento em processamento. Verificando automaticamente...');
            
            // Para Pix, verificar se já foi aprovado (as vezes demora)
            console.log('⏳ Iniciando verificação automática em 2 segundos...');
            setError('⏳ Pagamento em processamento. Verificando automaticamente...');
            
            setTimeout(async () => {
              try {
                console.log('🔍 PRIMEIRA VERIFICAÇÃO - Payment ID:', paymentId);
                const paymentStatus = await verificarPagamentoMercadoPago(paymentId);
                console.log('🔄 Status detalhado completo:', JSON.stringify(paymentStatus, null, 2));
                console.log('🔄 Status verificado:', paymentStatus.status);
                console.log('🔄 Status detail:', paymentStatus.status_detail);
                console.log('🔄 Date approved:', paymentStatus.date_approved);
                
                if (paymentStatus.status === 'approved') {
                  console.log('🎉 Pagamento APROVADO! Ativando assinatura...');
                  try {
                    await ativarAssinaturaNoSupabase(paymentStatus, externalReference, userData);
                    setShowPagamentoModal(true);
                    setError(null);
                  } catch (dbError) {
                    console.error('❌ Erro ao salvar no Supabase, mas pagamento foi aprovado:', dbError);
                    setShowPagamentoModal(true);
                    setError('✅ Pagamento aprovado! O acesso será liberado em instantes...');
                  }
                } else {
                  console.log('⏳ Ainda pendente, tentando novamente em 5 segundos...');
                  setError('⏳ Pagamento ainda em processamento. Tentando novamente...');
                  
                  // Segunda verificação após 5 segundos
                  setTimeout(async () => {
                    try {
                      console.log('🔍 SEGUNDA VERIFICAÇÃO - Payment ID:', paymentId);
                      const secondCheck = await verificarPagamentoMercadoPago(paymentId);
                      console.log('🔄 Segunda verificação completa:', JSON.stringify(secondCheck, null, 2));
                      
                      if (secondCheck.status === 'approved') {
                        console.log('🎉 Pagamento APROVADO na segunda verificação!');
                        try {
                          await ativarAssinaturaNoSupabase(secondCheck, externalReference, userData);
                          setShowPagamentoModal(true);
                          setError(null);
                        } catch (dbError) {
                          console.error('❌ Erro ao salvar no Supabase, mas pagamento foi aprovado:', dbError);
                          setShowPagamentoModal(true);
                          setError('✅ Pagamento aprovado! O acesso será liberado em instantes...');
                        }
                      } else {
                        console.log('❌ Ainda não aprovado após segunda verificação');
                        setError('⏳ Pagamento ainda em processamento. Clique em "Verificar Pagamento Realizado" ou aguarde mais alguns minutos.');
                        
                        // Terceira verificação após mais 10 segundos
                        setTimeout(async () => {
                          try {
                            console.log('🔍 TERCEIRA VERIFICAÇÃO - Payment ID:', paymentId);
                            const thirdCheck = await verificarPagamentoMercadoPago(paymentId);
                            console.log('🔄 Terceira verificação:', thirdCheck.status);
                            
                            if (thirdCheck.status === 'approved') {
                              console.log('🎉 Pagamento APROVADO na terceira verificação!');
                              try {
                                await ativarAssinaturaNoSupabase(thirdCheck, externalReference, userData);
                                setShowPagamentoModal(true);
                                setError(null);
                              } catch (dbError) {
                                console.error('❌ Erro ao salvar no Supabase, mas pagamento foi aprovado:', dbError);
                                setShowPagamentoModal(true);
                                setError('✅ Pagamento aprovado! O acesso será liberado em instantes...');
                              }
                            } else {
                              console.log('❌ Pagamento não aprovado após 3 tentativas');
                              setError('⏳ Pagamento demorando para ser aprovado. Clique no botão "Verificar Pagamento Realizado" ou contate o suporte.');
                            }
                          } catch (error) {
                            console.error('❌ Erro na terceira verificação:', error);
                          }
                        }, 10000);
                      }
                    } catch (error) {
                      console.error('❌ Erro na segunda verificação:', error);
                      setError('❌ Erro ao verificar pagamento. Tente clicar em "Verificar Pagamento Realizado".');
                    }
                  }, 5000);
                }
              } catch (error) {
                console.error('❌ Erro ao verificar pagamento:', error);
                setError('❌ Erro ao verificar pagamento. Tente clicar em "Verificar Pagamento Realizado".');
              }
            }, 2000); // Primeira verificação após 2 segundos
          } else if (finalStatus === 'failure') {
            console.log('❌ Pagamento falhou');
            setError('❌ Pagamento falhou. Tente novamente.');
          }
          
        } catch (error) {
          console.error('❌ Erro ao verificar pagamento:', error);
          setError('❌ Erro ao confirmar pagamento. Tente novamente.');
        }
        
        // Limpa os parâmetros da URL
        console.log('🧹 Limpando parâmetros da URL...');
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        console.log('ℹ️ Nenhum parâmetro do Mercado Pago detectado');
        
        // Verifica se há pagamentos recentes mesmo sem parâmetros
        console.log('🔍 Verificando pagamentos recentes mesmo sem parâmetros...');
        const encontrou = await buscarPagamentosRecentes(userData.email, paymentId);
        if (encontrou) {
          console.log('🎉 Pagamento encontrado e ativado!');
        }
      }
    };

    checkMercadoPagoParams();
  }, [userData?.email, window.location.search]); // Adicionado window.location.search como dependência

  const handleAssinar = async () => {
    if (!userData?.email) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Criando preferência no Mercado Pago...');
      
      // Cria preferência de pagamento no Mercado Pago
      const preference = await criarPreferenciaMercadoPago(
        userData.email, 
        userData.name, 
        window.location.origin
      );
      
      console.log('✅ Preferência criada:', preference);
      
      // Abre a página de pagamento do Mercado Pago
      // Em produção usa init_point, em desenvolvimento usa sandbox_init_point
      const paymentUrl = preference.init_point || preference.sandbox_init_point;
      
      console.log('🔗 Abrindo link de pagamento:', paymentUrl);
      window.open(paymentUrl, '_blank');
      
    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-dark">
      {/* Header */}
      <header className="p-4 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-2xl font-bold text-primary dark:text-white font-serif">
          Assinatura Vida Alinhada
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
            {error.includes('processamento') && (
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 dark:text-red-400 text-sm underline hover:no-underline"
              >
                Verificar novamente
              </button>
            )}
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">workspace_premium</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 dark:text-white font-serif">
            Acesso Premium Completo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Desbloqueie todos os recursos e transforme sua jornada de bem-estar
          </p>
        </section>

        {/* Pricing Card */}
        <section className="mb-8">
          <div className="bg-primary p-6 rounded-3xl text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">Plano Mensal</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                MAIS POPULAR
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 1,00</span>
              <span className="text-lg opacity-90">/mês</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-300">check_circle</span>
                <span>Todas as meditações guiadas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-300">check_circle</span>
                <span>Treinos personalizados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-300">check_circle</span>
                <span>Diário emocional completo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-300">check_circle</span>
                <span>Conteúdo exclusivo novo todo mês</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-300">check_circle</span>
                <span>Suporte prioritário</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Payment Button */}
        <section className="space-y-4">
          <button
            onClick={() => handleAssinar()}
            disabled={loading}
            className="w-full p-6 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {loading ? 'Processando...' : 'Assinar Agora por R$ 1,00/mês'}
          </button>

          {/* Botão para verificar pagamentos */}
          {userData?.email && (
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const paymentId = urlParams.get('payment_id');
                buscarPagamentosRecentes(userData.email, paymentId || undefined);
              }}
              className="w-full p-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition-all"
            >
              Verificar Pagamento Realizado
            </button>
          )}

        </section>


        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-dark p-6 rounded-2xl text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300">Processando pagamento...</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentScreen={AppScreen.ASSINATURA} onNavigate={onNavigate} />

      {/* Modal de pagamento automático */}
      {showPagamentoModal && (
        <PagamentoModal onClose={() => setShowPagamentoModal(false)} />
      )}
    </div>
  );
};

export default Assinatura;
