import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { criarPreferenciaMercadoPago, verificarPagamentoMercadoPago } from '../lib/mercadopago';
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

  // Detecta quando usuário volta do Mercado Pago
  useEffect(() => {
    const checkMercadoPagoParams = async () => {
      console.log('🔍 INICIANDO VERIFICAÇÃO MERCADO PAGO - userData:', userData);
      
      if (!userData?.email) {
        console.log('❌ Sem userData.email, saindo...');
        return;
      }

      // Verifica parâmetros do Mercado Pago
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const paymentId = urlParams.get('payment_id');
      const externalReference = urlParams.get('external_reference');
      
      console.log('🔍 URL completa:', window.location.href);
      console.log('🔍 Status:', status);
      console.log('🔍 Payment ID:', paymentId);
      console.log('🔍 External Reference:', externalReference);
      
      // Se tiver status, veio do Mercado Pago
      if (status && paymentId && externalReference) {
        console.log('🎉 Detectado retorno do Mercado Pago!');
        
        try {
          if (status === 'approved') {
            console.log('✅ Pagamento APROVADO pelo Mercado Pago!');
            
            // Verifica status detalhado do pagamento
            const paymentStatus = await verificarPagamentoMercadoPago(paymentId);
            console.log('📊 Status detalhado:', paymentStatus);
            
            if (paymentStatus.status === 'approved') {
              // Ativa assinatura
              const dataVencimento = new Date();
              dataVencimento.setDate(dataVencimento.getDate() + 30);
              
              // 1. Salva no localStorage
              const assinaturaData = {
                ativa: true,
                dataVencimento: dataVencimento.toISOString(),
                orderNsu: paymentId,
                slug: externalReference
              };
              
              localStorage.setItem(`assinatura_${userData.email}`, JSON.stringify(assinaturaData));
              console.log('✅ Salvo no localStorage:', assinaturaData);

              // 2. Salva no banco se tiver user_id
              if (userData?.id) {
                try {
                  const { criarAssinaturaDB } = await import('../lib/assinaturas-db');
                  
                  const dbData = {
                    user_id: userData.id,
                    user_email: userData.email,
                    status: 'ativa' as const,
                    data_inicio: new Date().toISOString(),
                    data_vencimento: dataVencimento.toISOString(),
                    valor: paymentStatus.transaction_amount,
                    forma_pagamento: paymentStatus.payment_type_id === 'credit_card' ? 'cartao' as const : 'pix' as const,
                    order_nsu: paymentId,
                    slug: externalReference
                  };
                  
                  const result = await criarAssinaturaDB(dbData);
                  console.log('✅ ASSINATURA SALVA NO BANCO:', result);
                  
                } catch (dbError) {
                  console.error('❌ Erro ao salvar no banco:', dbError);
                }
              }

              // Mostra modal de sucesso
              setShowPagamentoModal(true);
              
            } else {
              console.log('❌ Status não é approved:', paymentStatus.status);
              setError('❌ Pagamento não foi aprovado. Tente novamente.');
            }
          } else if (status === 'pending') {
            console.log('⏳ Pagamento pendente...');
            setError('⏳ Pagamento em processamento. Aguarde a confirmação.');
          } else if (status === 'failure') {
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
      }
    };

    checkMercadoPagoParams();
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
      
      // Cria preferência de pagamento no Mercado Pago
      const preference = await criarPreferenciaMercadoPago(
        userData.email, 
        userData.name, 
        window.location.origin
      );
      
      console.log('✅ Preferência criada:', preference);
      
      // Abre a página de pagamento do Mercado Pago
      // Em desenvolvimento usa sandbox, em produção usa init_point
      const paymentUrl = preference.sandbox_init_point || preference.init_point;
      
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
      <main className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
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
          <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">Plano Mensal</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                MAIS POPULAR
              </span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 5,00</span>
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
            className="w-full p-6 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {loading ? 'Processando...' : 'Assinar Agora por R$ 5,00/mês'}
          </button>

        {/* Informações importantes */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Pagamento Mercado Pago</p>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Após o pagamento, seu acesso será liberado automaticamente. 
            O Mercado Pago confirma o pagamento em tempo real.
          </p>
        </div>
        </section>

        {/* Security Info */}
        <section className="mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">lock</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Pagamento 100% Seguro
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Seus dados são protegidos pelo Mercado Pago, empresa líder em pagamentos digitais na América Latina.
          </p>
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
