import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface Registro {
  id: string;
  tipo_registro: string;
  sintomas: string[];
  detalhes: { [key: string]: string };
  data_registro: string;
}

interface Atividade {
  id: string;
  tipo_atividade: string;
  titulo: string;
  descricao?: string;
  dados_adicionais?: any;
  data_atividade: string;
  duracao?: number;
  concluida: boolean;
}

interface HistoricoProps {
  onNavigate: (screen: AppScreen) => void;
}

const Historico: React.FC<HistoricoProps> = ({ onNavigate }) => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadHistorico();
  }, [selectedDate]);

  const loadHistorico = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Carregar registros emocionais
      const { data: registrosData, error: registrosError } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_registro', `${selectedDate}T00:00:00`)
        .lte('data_registro', `${selectedDate}T23:59:59`)
        .order('data_registro', { ascending: false });

      if (registrosError) {
        throw registrosError;
      }

      // Carregar outras atividades
      const { data: atividadesData, error: atividadesError } = await supabase
        .from('atividades')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_atividade', `${selectedDate}T00:00:00`)
        .lte('data_atividade', `${selectedDate}T23:59:59`)
        .order('data_atividade', { ascending: false });

      if (atividadesError) {
        throw atividadesError;
      }

      setRegistros(registrosData || []);
      setAtividades(atividadesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      alert('Erro ao carregar histórico: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoRegistroLabel = (tipo: string) => {
    switch (tipo) {
      case 'fome_emocional':
        return 'Fome Emocional';
      case 'forma_fisica_emocional':
        return 'Forma Física & Emocional';
      default:
        return tipo;
    }
  };

  const getTipoAtividadeLabel = (tipo: string) => {
    switch (tipo) {
      case 'audio':
        return 'Áudio Emocional';
      case 'treino':
        return 'Treino';
      case 'fome_emocional':
        return 'Fome Emocional';
      case 'respiracao':
        return 'Respiração Consciente';
      case 'diario':
        return 'Diário';
      default:
        return tipo;
    }
  };

  const getAtividadeIcon = (tipo: string) => {
    switch (tipo) {
      case 'audio':
        return 'headset';
      case 'treino':
        return 'fitness_center';
      case 'fome_emocional':
        return 'restaurant';
      case 'respiracao':
        return 'air';
      case 'diario':
        return 'edit_note';
      default:
        return 'circle';
    }
  };

  const getSintomaIcon = (sintoma: string) => {
    switch (sintoma) {
      case 'Fome Física':
        return 'restaurant';
      case 'Cansaço':
        return 'battery_low';
      case 'Ansiedade':
        return 'psychology';
      case 'Tédio':
        return 'sentiment_neutral';
      case 'Tristeza':
        return 'sentiment_dissatisfied';
      default:
        return 'circle';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Combinar e ordenar todos os itens por data
  const todosItens = [
    ...registros.map(r => ({ ...r, tipo: 'registro' })),
    ...atividades.map(a => ({ ...a, tipo: 'atividade' }))
  ].sort((a, b) => {
    const dateA = new Date(a.tipo === 'registro' ? a.data_registro : a.data_atividade);
    const dateB = new Date(b.tipo === 'registro' ? b.data_registro : b.data_atividade);
    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Meu Histórico do Dia</h2>
        <div className="size-10" />
      </header>

      <div className="px-4 pt-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm dark:text-white"
        />
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {todosItens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">history</span>
            </div>
            <h3 className="font-serif text-xl font-bold dark:text-white mb-2">Nenhuma atividade hoje</h3>
            <p className="text-gray-500 dark:text-gray-400">Comece a usar o app para registrar suas atividades.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todosItens.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-white/5 rounded-2xl p-4 ios-shadow border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">
                        {item.tipo === 'registro' ? 'psychology' : getAtividadeIcon(item.tipo_atividade)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold dark:text-white">
                        {item.tipo === 'registro' ? getTipoRegistroLabel(item.tipo_registro) : getTipoAtividadeLabel(item.tipo_atividade)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.tipo === 'registro' ? item.data_registro : item.data_atividade)}
                        {item.tipo === 'atividade' && item.duracao && ` • ${formatDuration(item.duracao)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {expandedItem === item.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>

                {/* Registros emocionais */}
                {item.tipo === 'registro' && expandedItem === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.sintomas.map((sintoma) => (
                        <div
                          key={sintoma}
                          className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          <span className="material-symbols-outlined text-sm">{getSintomaIcon(sintoma)}</span>
                          <span>{sintoma}</span>
                        </div>
                      ))}
                    </div>
                    {Object.keys(item.detalhes).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(item.detalhes).map(([sintoma, detalhe]) => (
                          <div key={sintoma} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-sm text-primary">
                                {getSintomaIcon(sintoma)}
                              </span>
                              <span className="font-medium text-sm dark:text-white">{sintoma}:</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                              {detalhe}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Outras atividades */}
                {item.tipo === 'atividade' && expandedItem === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                    {item.descricao && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {item.descricao}
                      </p>
                    )}
                    {item.dados_adicionais && (
                      <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detalhes adicionais:</p>
                        <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(item.dados_adicionais, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Historico;
