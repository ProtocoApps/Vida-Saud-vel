import React, { useState } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { criarPagamentoInfinityPay } from '../lib/infinitypay';
import BottomNav from '../components/BottomNav';

interface AssinaturaProps {
  onNavigate: (screen: AppScreen) => void;
}

const Assinatura: React.FC<AssinaturaProps> = ({ onNavigate }) => {
  const { userData } = useGlobalUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssinar = async (metodo: 'pix' | 'cartao') => {
    if (!userData?.email) {
      setError('Usuário não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Abre o link de pagamento em nova aba
      window.open('https://loja.infinitepay.io/protocoloapps/vhd7943-descobreville', '_blank');
    } catch (err: any) {
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
              <span className="text-4xl font-bold">R$ 19,90</span>
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

        {/* Payment Methods */}
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Escolha a forma de pagamento:
          </h3>
          
          <button
            onClick={() => handleAssinar('pix')}
            disabled={loading}
            className="w-full p-4 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">qr_code_2</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Pagar com PIX</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aprovação imediata</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </button>

          <button
            onClick={() => handleAssinar('cartao')}
            disabled={loading}
            className="w-full p-4 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-between hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">credit_card</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Pagar com Cartão</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Até 12x sem juros</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </button>
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
            Seus dados são protegidos pela Infinity Pay, empresa líder em pagamentos digitais no Brasil.
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
    </div>
  );
};

export default Assinatura;
