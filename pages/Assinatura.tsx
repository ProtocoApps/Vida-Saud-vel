import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { criarPreferenciaMercadoPago, verificarPagamentoMercadoPago, MERCADO_PAGO_CONFIG } from '../lib/mercadopago';
import { verificarAssinatura } from '../lib/assinatura';
import { criarAssinaturaDB } from '../lib/assinaturas-db';
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
  const [aguardandoPix, setAguardandoPix] = useState(false);

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
            await salvarAssinatura(specificPayment);
            setShowPagamentoModal(true);
            return true; // Considera como sucesso mesmo com erro no DB
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
          await salvarAssinatura(pagamento);
          setShowPagamentoModal(true);
          return true; // Considera como sucesso mesmo com erro no DB
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
  // Salva assinatura no Supabase usando o cliente com sessão (RLS permite INSERT com auth.uid())
  const salvarAssinatura = async (paymentData: any) => {
    console.log('💾 SALVANDO ASSINATURA NO SUPABASE (com sessão)');
    const dataInicio = new Date().toISOString();
    const dataVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const payload = {
      user_email: userData.email,
      user_id: userData?.id ?? null,
      status: 'ativa' as const,
      data_inicio: dataInicio,
      data_vencimento: dataVencimento,
      valor: paymentData.transaction_amount ?? 1.00,
      forma_pagamento: (paymentData.payment_type_id === 'credit_card' ? 'cartao' : 'pix') as 'pix' | 'cartao',
      order_nsu: String(paymentData.payment_id ?? paymentData.id ?? ''),
      slug: paymentData.external_reference || 'manual'
    };

    try {
      await criarAssinaturaDB(payload);
      console.log('✅ SALVO NO SUPABASE');
      // Atualiza cache local para desbloqueio imediato
      localStorage.setItem(`assinatura_${userData.email}`, JSON.stringify({
        ativa: true,
        dataVencimento,
        orderNsu: payload.order_nsu
      }));
      return true;
    } catch (err) {
      console.error('❌ Erro ao salvar no Supabase:', err);
      // Fallback: guarda no localStorage para desbloquear mesmo se RLS falhar
      localStorage.setItem(`assinatura_${userData.email}`, JSON.stringify({
        ativa: true,
        dataVencimento,
        orderNsu: payload.order_nsu
      }));
      console.log('✅ SALVO NO LOCALSTORAGE (fallback)');
      return true;
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

      // Verifica parâmetros do Mercado Pago (query pode vir em search ou no hash)
      const queryString = window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const urlParams = new URLSearchParams(queryString);
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
              await salvarAssinatura(paymentStatus);
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
                    await salvarAssinatura(paymentStatus);
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
                          await salvarAssinatura(secondCheck);
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
                                await salvarAssinatura(thirdCheck);
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

  // Verificação contínua para pagamentos Pix
  useEffect(() => {
    if (!userData?.email) return;

    const interval = setInterval(async () => {
      console.log('🔄 Verificação contínua de pagamentos...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id');
      
      const encontrou = await buscarPagamentosRecentes(userData.email, paymentId || undefined);
      if (encontrou) {
        console.log('🎉 Pagamento encontrado na verificação contínua!');
        clearInterval(interval); // Para a verificação quando encontrar
      }
    }, 10000); // Verifica a cada 10 segundos

    return () => clearInterval(interval); // Limpa ao desmontar
  }, [userData?.email]);

  const handleAssinar = async () => {
    if (!userData?.email) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Criando preferência no Mercado Pago...');
      const preference = await criarPreferenciaMercadoPago(
        userData.email,
        userData.name,
        window.location.origin
      );
      console.log('✅ Preferência criada:', preference);

      const paymentUrl = preference.init_point || preference.sandbox_init_point;
      console.log('🔗 Abrindo link de pagamento:', paymentUrl);
      window.open(paymentUrl, '_blank');

      // PIX: usuário pode ficar na tela do QR; polling na nossa aba detecta o pagamento
      setAguardandoPix(true);
    } catch (err: any) {
      console.error('❌ Erro ao criar pagamento:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Polling enquanto aguarda pagamento PIX (tela do MP não redireciona sozinha)
  useEffect(() => {
    if (!aguardandoPix || !userData?.email) return;

    const interval = setInterval(async () => {
      const encontrou = await buscarPagamentosRecentes(userData.email);
      if (encontrou) {
        setAguardandoPix(false);
        setShowPagamentoModal(true);
        setError(null);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [aguardandoPix, userData?.email]);

  
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
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
            Desbloqueie todos os vídeos de treinos e conteúdos exclusivos com acesso ilimitado.
          </p>
          
          {/* Card "Aguardando PIX" quando a janela do MP está aberta */}
          {aguardandoPix && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-2">
                ⏳ Aguardando pagamento PIX
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                Não feche esta aba. Assim que você pagar (mesmo que a tela do Mercado Pago continue no QR), vamos detectar e liberar seu acesso em até 1 minuto.
              </p>
              <button
                type="button"
                onClick={() => setAguardandoPix(false)}
                className="text-amber-600 dark:text-amber-400 text-sm underline hover:no-underline"
              >
                Já paguei / Cancelar espera
              </button>
            </div>
          )}

          {/* Mensagem para usuários que pagaram Pix */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              <span className="font-semibold">ℹ️ Pagou com Pix?</span><br/>
              Após o pagamento, volte para esta página. O sistema detecta automaticamente seu pagamento em até 1 minuto.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-8 max-w-md mx-auto">
          <div className="bg-primary rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
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
