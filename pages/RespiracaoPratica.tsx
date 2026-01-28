import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../types';

interface RespiracaoPraticaProps {
  onNavigate: (screen: AppScreen | { screen: AppScreen; params?: { categoria: string } }) => void;
  categoria?: string;
}

interface Sessao {
  id: number;
  titulo: string;
  descricao: string;
  instrucoes: string[];
  duracao: number; // segundos
}

const RespiracaoPratica: React.FC<RespiracaoPraticaProps> = ({ onNavigate, categoria = 'Ansiedade' }) => {

  const [sessaoAtual, setSessaoAtual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [fase, setFase] = useState<'inspirar' | 'segurar' | 'expirar'>('inspirar');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const configuracoes: Record<string, Sessao[]> = {
    Ansiedade: [
      {
        id: 1,
        titulo: 'Acalmando a Mente',
        descricao: 'Respiração quadrada para reduzir a ansiedade',
        instrucoes: ['Inspire por 4 segundos', 'Segure por 4 segundos', 'Expire por 4 segundos', 'Mantenha vazio por 4 segundos'],
        duracao: 16, // 4+4+4+4
      },
      {
        id: 2,
        titulo: 'Liberando Tensão',
        descricao: 'Respiração profunda com foco no relaxamento',
        instrucoes: ['Inspire lentamente por 5 segundos', 'Segure suavemente por 2 segundos', 'Expire completamente por 6 segundos'],
        duracao: 13,
      },
      {
        id: 3,
        titulo: 'Ancoragem no Presente',
        descricao: 'Respiração consciente para ancorar no agora',
        instrucoes: ['Inspire contando até 4', 'Expire contando até 6', 'Repita com ritmo constante'],
        duracao: 10,
      },
    ],
    Foco: [
      {
        id: 1,
        titulo: 'Foco Visual',
        descricao: 'Concentre em um ponto fixo',
        instrucoes: ['Escolha um ponto na parede', 'Mantenha o olhar fixo por 30s', 'Sinta a mente clarear', 'Respire naturalmente'],
        duracao: 30,
      },
      {
        id: 2,
        titulo: 'Contagem Mental',
        descricao: 'Exercício de numeração progressiva',
        instrucoes: ['Feche os olhos', 'Conte de 100 a 1 de 2 em 2', 'Se perder, recomece', 'Mantenha o ritmo constante'],
        duracao: 45,
      },
      {
        id: 3,
        titulo: 'Varredura Corporal',
        descricao: 'Foco em cada parte do corpo',
        instrucoes: ['Deite-se confortavelmente', 'Foque nos pés por 10s', 'Suba até a cabeça', 'Sinta cada parte relaxar'],
        duracao: 60,
      },
    ],
    Angústia: [
      {
        id: 1,
        titulo: 'Escrita Livre',
        descricao: 'Libere tudo o que sente no papel',
        instrucoes: ['Pegue papel e caneta', 'Escreva sem parar por 3 minutos', 'Não se preocupe com gramática', 'Deixe tudo sair'],
        duracao: 180,
      },
      {
        id: 2,
        titulo: 'Carta para Si Mesmo',
        descricao: 'Escreva uma mensagem de acolhimento',
        instrucoes: ['Enderece a carta para você', 'Escreva palavras de conforto', 'Seja gentil consigo mesmo', 'Guarde ou queime a carta'],
        duracao: 120,
      },
      {
        id: 3,
        titulo: 'Liberação Física',
        descricao: 'Expresse a angústia com o corpo',
        instrucoes: ['Bata em um travesseiro', 'Grite em um lugar isolado', 'Chore se precisar', 'Sinta o alívio'],
        duracao: 90,
      },
    ],
    Segurança: [
      {
        id: 1,
        titulo: 'Toque Consciente',
        descricao: 'Sinta diferentes texturas com as mãos',
        instrucoes: ['Toque algo macio (almofada)', 'Sinta a textura por 15s', 'Toque algo áspero (parede)', 'Compare as sensações'],
        duracao: 60,
      },
      {
        id: 2,
        titulo: '5-4-3-2-1 Grounding',
        descricao: 'Técnica de ancoragem sensorial',
        instrucoes: ['Nomeie 5 coisas que vê', 'Nomeie 4 coisas que toca', 'Nomeie 3 sons que ouve', 'Nomeie 2 cheiros, 1 gosto'],
        duracao: 90,
      },
      {
        id: 3,
        titulo: 'Postura de Poder',
        descricao: 'Adote uma posição de segurança',
        instrucoes: ['Fique em pé com pés afastados', 'Levante os braços acima da cabeça', 'Mantenha por 30 segundos', 'Sinta a confiança'],
        duracao: 45,
      },
    ],
  };

  const sessoes = configuracoes[categoria] || configuracoes.Ansiedade;
  const sessao = sessoes[sessaoAtual];

  useEffect(() => {
    if (isPlaying) {
      let tempo = tempoRestante || sessao.duracao;
      let faseAtual = 0;
      const fases: ('inspirar' | 'segurar' | 'expirar')[] = ['inspirar', 'segurar', 'expirar'];
      const duracoesFases = categoria === 'Ansiedade' ? [4, 4, 8] : categoria === 'Foco' ? [4, 0, 4] : [5, 3, 7];

      intervalRef.current = setInterval(() => {
        tempo--;

        if (tempo <= 0) {
          faseAtual++;
          if (faseAtual >= fases.length) {
            // Ciclo completo
            tempo = sessao.duracao;
            faseAtual = 0;
          } else {
            tempo = duracoesFases[faseAtual] || 4;
          }
          setFase(fases[faseAtual] || 'inspirar');
        }

        setTempoRestante(tempo);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, sessao.duracao, categoria]);

  const togglePlay = () => {
    if (!isPlaying && tempoRestante === 0) {
      setTempoRestante(sessao.duracao);
    }
    setIsPlaying(!isPlaying);
  };

  const proximaSessao = () => {
    if (sessaoAtual < sessoes.length - 1) {
      setSessaoAtual(sessaoAtual + 1);
      setTempoRestante(0);
      setIsPlaying(false);
      setFase('inspirar');
    }
  };

  const sessaoAnterior = () => {
    if (sessaoAtual > 0) {
      setSessaoAtual(sessaoAtual - 1);
      setTempoRestante(0);
      setIsPlaying(false);
      setFase('inspirar');
    }
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.RESPIRACAO)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Prática de Respiração</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center text-center">
        {/* Indicador de sessão */}
        <div className="flex gap-2 mb-8">
          {sessoes.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full transition-all ${
                index === sessaoAtual ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Categoria */}
        <div className="mb-4">
          <span className="text-sm font-bold text-primary uppercase tracking-wider">{categoria}</span>
        </div>

        {/* Título e descrição */}
        <h1 className="font-serif text-2xl font-bold dark:text-white mb-2">{sessao.titulo}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">{sessao.descricao}</p>

        {/* Círculo da prática */}
        <div className="relative mb-8">
          <div
            className={`size-48 rounded-full flex items-center justify-center transition-all duration-1000 ${
              fase === 'inspirar'
                ? 'bg-primary/20 scale-110'
                : fase === 'segurar'
                ? 'bg-primary/10 scale-105'
                : 'bg-primary/5 scale-95'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{formatarTempo(tempoRestante)}</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                {categoria === 'Foco' ? 'Concentre' : 
                 categoria === 'Angústia' ? 'Expresse' : 
                 categoria === 'Segurança' ? 'Sinta' : 
                 'Respire'}
              </div>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mb-8 max-w-md">
          <h3 className="font-semibold dark:text-white mb-3">Instruções:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {sessao.instrucoes.map((instrucao, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{instrucao}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Controles */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <button
            onClick={togglePlay}
            className="size-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-3xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <div className="flex gap-4 w-full">
            <button
              onClick={sessaoAnterior}
              disabled={sessaoAtual === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {sessaoAtual === sessoes.length - 1 ? (
              <button
                onClick={() => onNavigate({ screen: AppScreen.RESPIRACAO, params: { categoria } })}
                className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-medium"
              >
                Concluir
              </button>
            ) : (
              <button
                onClick={proximaSessao}
                disabled={sessaoAtual === sessoes.length - 1}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RespiracaoPratica;
