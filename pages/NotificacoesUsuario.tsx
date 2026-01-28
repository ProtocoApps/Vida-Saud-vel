import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';

interface NotificacoesUsuarioProps {
  onNavigate: (screen: AppScreen) => void;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  data: string;
  lida: boolean;
}

const NotificacoesUsuario: React.FC<NotificacoesUsuarioProps> = ({ onNavigate }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificacoes();
  }, []);

  const loadNotificacoes = () => {
    // Simular carregamento de notificações
    // Em um app real, viria do backend ou localStorage
    setTimeout(() => {
      // Por enquanto, retornando array vazio para mostrar mensagem de não há notificações
      const mockNotificacoes: Notificacao[] = [];
      
      setNotificacoes(mockNotificacoes);
      setLoading(false);
    }, 1000);
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(not => 
        not.id === id ? { ...not, lida: true } : not
      )
    );
  };

  const getNotificacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getNotificacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `${diffMin} min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
          <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="font-serif text-lg font-bold dark:text-white">Notificações</h2>
          <div className="size-10" />
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Notificações</h2>
        <button 
          onClick={loadNotificacoes}
          className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {notificacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">notifications_off</span>
            </div>
            <h3 className="font-serif text-xl font-bold dark:text-white mb-2">Não tem nenhuma notificação</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Você não tem notificações no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                {notificacoes.length} notificação{notificacoes.length !== 1 ? 'ões' : ''}
              </h3>
              <button 
                onClick={() => {
                  setNotificacoes(prev => prev.map(not => ({ ...not, lida: true })));
                }}
                className="text-xs text-primary font-medium"
              >
                Marcar todas como lidas
              </button>
            </div>

            {notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !notificacao.lida 
                    ? 'bg-white dark:bg-white/5 border-primary/20 shadow-md' 
                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificacaoColor(notificacao.tipo)}`}>
                    <span className="material-symbols-outlined text-lg">
                      {getNotificacaoIcon(notificacao.tipo)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm dark:text-white">
                        {notificacao.titulo}
                      </h4>
                      {!notificacao.lida && (
                        <span className="size-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatarData(notificacao.data)}
                      </span>
                      
                      {!notificacao.lida && (
                        <button
                          onClick={() => marcarComoLida(notificacao.id)}
                          className="text-xs text-primary font-medium"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificacoesUsuario;
