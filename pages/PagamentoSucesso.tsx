import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { ativarAssinatura } from '../lib/assinatura';
import { criarAssinaturaDB } from '../lib/assinaturas-db';
import BottomNav from '../components/BottomNav';

interface PagamentoSucessoProps {
  onNavigate: (screen: AppScreen) => void;
}

const PagamentoSucesso: React.FC<PagamentoSucessoProps> = ({ onNavigate }) => {
  const { userData } = useGlobalUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pega os parâmetros da URL retornados pelo InfinitePay
    const urlParams = new URLSearchParams(window.location.search);
    const receiptUrl = urlParams.get('receipt_url');
    const orderNsu = urlParams.get('order_nsu');
    const slug = urlParams.get('slug');
    const captureMethod = urlParams.get('capture_method');

    if (!receiptUrl || !orderNsu || !slug) {
      setError('Informações de pagamento incompletas.');
      setLoading(false);
      return;
    }

    // Aqui você poderia verificar o status do pagamento
    // e atualizar o banco de dados para ativar a assinatura
    const processarPagamento = async () => {
      try {
        // Simulação - na prática você chamaria sua API
        // para verificar o status e ativar a assinatura
        console.log('Pagamento confirmado:', {
          receiptUrl,
          orderNsu,
          slug,
          captureMethod,
          userEmail: userData?.email
        });

        if (userData?.email) {
          // 1. Salvar no localStorage (compatibilidade)
          const dataVencimento = new Date();
          dataVencimento.setDate(dataVencimento.getDate() + 30);
          
          localStorage.setItem(`assinatura_${userData.email}`, JSON.stringify({
            ativa: true,
            dataVencimento: dataVencimento.toISOString(),
            orderNsu,
            slug
          }));

          // 2. Salvar no banco de dados (novo sistema)
          if (userData?.id) {
            try {
              await criarAssinaturaDB({
                user_id: userData.id,
                user_email: userData.email,
                status: 'ativa',
                data_inicio: new Date().toISOString(),
                data_vencimento: dataVencimento.toISOString(),
                valor: 19.90, // Valor padrão - pode ser dinâmico
                forma_pagamento: captureMethod === 'pix' ? 'pix' : 'cartao',
                order_nsu: orderNsu,
                slug: slug,
                receipt_url: receiptUrl
              });
              console.log('✅ Assinatura salva no banco de dados');
            } catch (dbError) {
              console.error('❌ Erro ao salvar no banco:', dbError);
              // Não falha o processo se o banco falhar
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao processar pagamento:', err);
        setError('Erro ao confirmar pagamento. Entre em contato com o suporte.');
        setLoading(false);
      }
    };

    processarPagamento();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-dark items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Processando seu pagamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-dark">
        <header className="p-4 border-b border-gray-100 dark:border-white/5">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">Erro no Pagamento</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => onNavigate(AppScreen.ASSINATURA)}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </main>
        <BottomNav currentScreen={AppScreen.ASSINATURA} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-dark">
      <header className="p-4 border-b border-gray-100 dark:border-white/5">
        <h1 className="text-xl font-bold text-green-600 dark:text-green-400">Pagamento Confirmado!</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">check_circle</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 dark:text-white font-serif">
            Bem-vindo ao Premium!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sua assinatura Vida Alinhada foi ativada com sucesso. 
            Aproveite todos os recursos exclusivos por 30 dias.
          </p>

          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 rounded-2xl text-white mb-8">
            <h3 className="font-semibold mb-3">O que está desbloqueado:</h3>
            <ul className="space-y-2 text-left max-w-sm mx-auto">
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
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate(AppScreen.HOME)}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
            >
              Começar Agora
            </button>
            
            <button
              onClick={() => window.open('/api/comprovante', '_blank')}
              className="w-full px-6 py-4 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl hover:border-primary transition-colors font-semibold text-gray-700 dark:text-gray-300"
            >
              Ver Comprovante
            </button>
          </div>
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default PagamentoSucesso;
