import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../types';

// Componente para animação do pulmão - VERSÃO OTIMIZADA
const PulmaoAnimation: React.FC<{ fase: 'inspirar' | 'segurar' | 'expirar', categoria: string }> = ({ fase, categoria }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    // Carregar script Lottie
    const loadLottie = () => {
      if (!(window as any).lottie) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.onload = () => {
          console.log('✅ Lottie carregado');
          loadAnimation();
        };
        document.head.appendChild(script);
      } else {
        loadAnimation();
      }
    };

    loadLottie();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [categoria]);

  const loadAnimation = async () => {
    console.log('🔍 INICIANDO DEBUG COMPLETO');
    console.log('🔍 Categoria:', categoria);
    console.log('🔍 Container:', !!containerRef.current);
    console.log('🔍 Lottie disponível:', !!(window as any).lottie);
    
    // Usar apenas os arquivos pequenos
    let animationFile = '';
    
    switch (categoria) {
      case 'Foco':
        animationFile = '/assets/animations/Ripple Alert.json'; // 2.9KB - PEQUENO!
        break;
      case 'Angústia':
        animationFile = '/assets/animations/Writing - Blue BG.json'; // 233KB - GRANDE
        break;
      case 'Segurança':
        animationFile = '/assets/animations/family hug.json'; // 188KB - GRANDE
        break;
      default:
        animationFile = '/assets/animations/breathing-exercise.json'; // 36KB - MÉDIO
    }

    console.log('🔍 Arquivo selecionado:', animationFile);

    // Para arquivos grandes, usar versão simplificada
    if (categoria === 'Angústia' || categoria === 'Segurança') {
      console.log('🎬 Usando animação simplificada para:', categoria);
      setAnimationData({ simplified: true });
      return;
    }

    console.log(`🎬 Tentando carregar: ${animationFile}`);
    
    try {
      console.log('🔍 Iniciando fetch...');
      const response = await fetch(animationFile);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ Response não ok:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('🔍 Convertendo para JSON...');
      const data = await response.json();
      console.log('✅ Dados carregados, tipo:', typeof data);
      console.log('✅ Dados tem chaves:', Object.keys(data));
      
      if (containerRef.current && (window as any).lottie) {
        console.log('🔍 Criando animação Lottie...');
        
        if (animationRef.current) {
          console.log('🔍 Destruindo animação anterior...');
          animationRef.current.destroy();
        }
        
        console.log('🔍 Chamando lottie.loadAnimation...');
        const animation = (window as any).lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data
        });
        
        console.log('🔍 Animação criada:', !!animation);
        animationRef.current = animation;
        
        const speed = fase === 'inspirar' ? 1.5 : fase === 'segurar' ? 0.5 : 1;
        console.log('🔍 Setando speed:', speed);
        animation.setSpeed(speed);
        
        console.log('🚀 Animação Lottie criada com sucesso!');
        setAnimationData(data);
      } else {
        console.error('❌ Container ou Lottie não disponível:', {
          container: !!containerRef.current,
          lottie: !!(window as any).lottie
        });
        setAnimationData({ simplified: true });
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Stack:', error.stack);
      setAnimationData({ simplified: true });
    }
  };

  // Atualizar velocidade quando a fase mudar
  useEffect(() => {
    if (animationRef.current) {
      const speed = fase === 'inspirar' ? 1.5 : fase === 'segurar' ? 0.5 : 1;
      animationRef.current.setSpeed(speed);
    }
  }, [fase]);

  // Se não tem dados ou é simplificado
  if (!animationData || animationData.simplified) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div 
            className={`absolute inset-0 w-32 h-32 rounded-full bg-primary/20 transition-all duration-2000`}
            style={{
              transform: fase === 'inspirar' ? 'scale(1.3)' : 
                     fase === 'segurar' ? 'scale(1.1)' : 'scale(0.7)',
              opacity: fase === 'inspirar' ? 1 : fase === 'segurar' ? 0.9 : 0.7
            }}
          />
          <div 
            className={`absolute inset-4 w-24 h-24 rounded-full bg-primary/30 transition-all duration-2000 delay-300`}
            style={{
              transform: fase === 'inspirar' ? 'scale(1.2)' : 
                     fase === 'segurar' ? 'scale(1.0)' : 'scale(0.8)',
              opacity: fase === 'inspirar' ? 0.8 : fase === 'segurar' ? 0.6 : 0.4
            }}
          />
          <div className="absolute inset-0 w-32 h-32 rounded-full flex items-center justify-center">
            <div className="text-3xl animate-pulse">
              {categoria === 'Foco' ? '💎' : 
               categoria === 'Angústia' ? '✍️' : 
               categoria === 'Segurança' ? '🤗' : '🫁'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se tem dados Lottie, mostrar animação real
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        className={`transition-all duration-1000 ${
          fase === 'inspirar' ? 'scale-125' : 
          fase === 'segurar' ? 'scale-110' : 
          'scale-75'
        }`}
      >
        <div 
          ref={containerRef}
          className="w-32 h-32"
        />
      </div>
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

      <main className="flex-1 px-4 py-2 flex flex-col items-center justify-center text-center overflow-hidden">
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
        <div className="mb-3 max-w-xs flex-1 overflow-hidden">
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

        {/* Controles */}
        <div className="flex flex-col items-center gap-2 w-full max-w-xs flex-shrink-0">
          <button
            onClick={togglePlay}
            className="size-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-2xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <div className="flex gap-2 w-full">
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
        </div>
      </main>
    </div>
  );
};

export default RespiracaoPratica;
