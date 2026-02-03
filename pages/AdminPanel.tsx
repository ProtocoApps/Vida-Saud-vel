import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { listarAssinaturas, cancelarAssinatura, estenderAssinatura, buscarEstatisticasAssinaturas, AssinaturaDB } from '../lib/assinaturas-db';

interface AdminPanelProps {
  onNavigate: (screen: AppScreen) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const [assinaturas, setAssinaturas] = useState<AssinaturaDB[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assinaturaSelecionada, setAssinaturaSelecionada] = useState<AssinaturaDB | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assinaturasData, statsData] = await Promise.all([
        listarAssinaturas(),
        buscarEstatisticasAssinaturas()
      ]);

      setAssinaturas(assinaturasData);
      setEstatisticas(statsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarAssinatura = async (assinaturaId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;

    try {
      await cancelarAssinatura(assinaturaId);
      await carregarDados(); // Recarregar dados
      alert('Assinatura cancelada com sucesso!');
    } catch (err: any) {
      alert('Erro ao cancelar assinatura: ' + err.message);
    }
  };

  const handleEstenderAssinatura = async (assinaturaId: string, dias: number) => {
    try {
      await estenderAssinatura(assinaturaId, dias);
      await carregarDados(); // Recarregar dados
      alert(`Assinatura estendida em ${dias} dias com sucesso!`);
    } catch (err: any) {
      alert('Erro ao estender assinatura: ' + err.message);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'text-green-600 bg-green-100';
      case 'cancelada': return 'text-red-600 bg-red-100';
      case 'expirada': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isVencida = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-dark items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando painel administrativo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-dark">
        <header className="p-4 border-b border-gray-100 dark:border-white/5">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">Erro</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="text-center py-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={carregarDados}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </main>
        <BottomNav currentScreen={AppScreen.HOME} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-dark">
      <header className="p-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary dark:text-white">Painel Administrativo</h1>
          <button
            onClick={() => onNavigate(AppScreen.HOME)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            Voltar
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* Estatísticas */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estatisticas?.total || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{estatisticas?.ativas || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativas</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{estatisticas?.canceladas || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Canceladas</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                R$ {estatisticas?.receitaTotal?.toFixed(2) || '0,00'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
            </div>
          </div>
        </div>

        {/* Lista de Assinaturas */}
        <div>
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Assinaturas</h2>
          <div className="space-y-3">
            {assinaturas.map((assinatura) => (
              <div key={assinatura.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold dark:text-white">{assinatura.user_email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Início: {formatarData(assinatura.data_inicio)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vencimento: {formatarData(assinatura.data_vencimento)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assinatura.status)}`}>
                      {assinatura.status}
                    </span>
                    {isVencida(assinatura.data_vencimento) && assinatura.status === 'ativa' && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                        Vencida
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>R$ {assinatura.valor.toFixed(2)}</span>
                    <span>{assinatura.forma_pagamento === 'pix' ? '📱 PIX' : '💳 Cartão'}</span>
                    <span className="text-xs">NSU: {assinatura.order_nsu}</span>
                  </div>

                  <div className="flex gap-2">
                    {assinatura.status === 'ativa' && (
                      <>
                        <button
                          onClick={() => handleEstenderAssinatura(assinatura.id, 30)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          +30 dias
                        </button>
                        <button
                          onClick={() => handleCancelarAssinatura(assinatura.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {assinaturas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Nenhuma assinatura encontrada</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default AdminPanel;
