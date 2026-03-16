import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../types';
import lottie, { AnimationItem } from 'lottie-web';
import { animationPaths } from '../src/data/animations';

// Componente para animação Lottie REAL
const PulmaoAnimation: React.FC<{ fase: 'inspirar' | 'segurar' | 'expirar', categoria: string }> = ({ fase, categoria }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadAnimation = async () => {
      const container = containerRef.current;
      if (!container) {
        console.log('Container não encontrado');
        return;
      }

      // Limpar animação anterior
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }

      let path: string;
      switch (categoria) {
        case 'Foco':
          path = animationPaths.focus;
          break;
        case 'Angústia':
          path = animationPaths.anguish;
          break;
        case 'Segurança':
          path = animationPaths.safety;
          break;
        default:
          path = animationPaths.breathing;
      }

      try {
        console.log('🎬 Carregando animação de:', path);
        const response = await fetch(path);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ JSON carregado com sucesso');
        
        if (!isMounted) return;

        console.log('🎨 Criando animação Lottie...');
        const animation = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data
        });

        console.log('🚀 Animação Lottie criada e rodando!');
        animationRef.current = animation;
      } catch (error) {
        console.error('❌ Erro ao carregar animação:', error);
      }
    };

    loadAnimation();

    return () => {
      isMounted = false;
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [categoria]);

  // Atualizar velocidade da animação baseado na fase
  useEffect(() => {
    if (animationRef.current) {
      const speed = fase === 'inspirar' ? 1.2 : fase === 'segurar' ? 0.3 : 1;
      animationRef.current.setSpeed(speed);
    }
  }, [fase]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        ref={containerRef}
        style={{
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(0,0,0,0.05)',
          transform: fase === 'inspirar' ? 'scale(1.1)' : 
                 fase === 'segurar' ? 'scale(1.05)' : 'scale(1.0)',
          transition: 'transform 1s ease-in-out'
        }}
      />
    </div>
  );
};

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
        titulo: 'Abraço Familiar',
        descricao: 'Sinta o conforto e amor da sua família',
        instrucoes: ['Abrace seu esposo(a) com carinho', 'Sinta o amor por 30 segundos', 'Abrace seus filhos com força', 'Sinta a segurança do amor familiar'],
        duracao: 60,
      },
      {
        id: 2,
        titulo: 'Conexão Familiar',
        descricao: 'Fortaleça os laços com quem você ama',
        instrucoes: ['Pense em cada membro da família', 'Sinta gratidão por cada um', 'Lembre-se de momentos felizes', 'Agradeça por ter essa família'],
        duracao: 90,
      },
      {
        id: 3,
        titulo: 'Proteção Familiar',
        descricao: 'Sinta-se seguro no amor dos seus',
        instrucoes: ['Feche os olhos e imagine sua família', 'Sinta o abraço coletivo', 'Respire sentindo esse amor', 'Você está seguro e amado'],
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
    <div className="flex flex-col h-screen bg-neutral-light dark:bg-neutral-dark overflow-hidden">
      <header className="p-3 flex items-center justify-between bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10 flex-shrink-0">
        <button onClick={() => onNavigate(AppScreen.RESPIRACAO)} className="size-8 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-base font-bold dark:text-white">Prática de Respiração</h2>
        <div className="size-8" />
      </header>

      <main className="flex-1 px-4 py-2 flex flex-col items-center justify-center text-center overflow-y-auto">
        {/* Indicador de sessão */}
        <div className="flex gap-1 mb-2">
          {sessoes.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-6 rounded-full transition-all ${
                index === sessaoAtual ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Categoria */}
        <div className="mb-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{categoria}</span>
        </div>

        {/* Título e descrição */}
        <h1 className="font-serif text-lg font-bold dark:text-white mb-1">{sessao.titulo}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 max-w-xs">{sessao.descricao}</p>

        {/* Animação do pulmão */}
        <div className="relative mb-3">
          <div className="size-32 rounded-full overflow-hidden">
            <PulmaoAnimation fase={fase} categoria={categoria} />
          </div>
        </div>

        {/* Cronômetro abaixo da animação */}
        <div className="mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{formatarTempo(tempoRestante)}</div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
              {categoria === 'Foco' ? 'Concentre' : 
               categoria === 'Angústia' ? 'Expresse' : 
               categoria === 'Segurança' ? 'Sinta' : 
               'Respire'}
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mb-2 max-w-xs">
          <h3 className="font-semibold dark:text-white mb-1 text-xs">Instruções:</h3>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {sessao.instrucoes.map((instrucao, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-primary mt-0.5">•</span>
                <span className="line-clamp-1">{instrucao}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="p-8 pb-12 text-center space-y-4">
        <button
          onClick={togglePlay}
          className="size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all mx-auto mb-4"
        >
          <span className="material-symbols-outlined text-3xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="flex gap-2 w-full max-w-xs mx-auto">
          <button
            onClick={sessaoAnterior}
            disabled={sessaoAtual === 0}
            className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Anterior
          </button>
          {sessaoAtual === sessoes.length - 1 ? (
            <button
              onClick={() => onNavigate({ screen: AppScreen.RESPIRACAO, params: { categoria } })}
              className="flex-1 py-2 px-3 rounded-xl bg-green-600 text-white font-medium text-xs"
            >
              Concluir
            </button>
          ) : (
            <button
              onClick={proximaSessao}
              disabled={sessaoAtual === sessoes.length - 1}
              className="flex-1 py-2 px-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Próxima
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default RespiracaoPratica;
