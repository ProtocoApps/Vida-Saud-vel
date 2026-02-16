import { AppScreen, NavigateFunction } from '../types';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import React, { useState, useEffect } from 'react';
import { verificarAssinatura } from '../lib/assinatura';
import PremiumModal from '../components/PremiumModal';

interface TreinosProps {
  onNavigate: NavigateFunction;
}

interface VideoTreino {
  id: string;
  titulo: string;
  categoria: string;
  nivel: string;
  duracao: string;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
}

const Treinos: React.FC<TreinosProps> = ({ onNavigate }) => {
  const { userData } = useGlobalUser();
  const [categoria, setCategoria] = useState('Todos');
  const [videos, setVideos] = useState<VideoTreino[]>([]);
  const [loading, setLoading] = useState(true);
  const [treinoDoDia, setTreinoDoDia] = useState<VideoTreino | null>(null);
  const [loadingTreinoDoDia, setLoadingTreinoDoDia] = useState(true);
  
  const [isAssinante, setIsAssinante] = useState<boolean>(false);
  const [loadingAssinatura, setLoadingAssinatura] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const checkAssinatura = async () => {
      if (userData?.email || userData?.id) {
        try {
          const assinatura = await verificarAssinatura(userData.email, userData.id);
          setIsAssinante(!!assinatura);
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
          setIsAssinante(false);
        }
      } else {
        setIsAssinante(false);
      }
      setLoadingAssinatura(false);
    };

    if (userData) {
      checkAssinatura();
    } else {
      setIsAssinante(false);
      setLoadingAssinatura(false);
    }
  }, [userData]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Carregar treino programado para o dia da semana (se existir)
        const jsDay = new Date().getDay();
        const diaSemana = ((jsDay + 6) % 7) + 1; // 1=Seg ... 7=Dom

        const { data: progRow, error: progError } = await supabase
          .from('treinos_programacao')
          .select('treino_id')
          .eq('dia_semana', diaSemana)
          .eq('is_active', true)
          .maybeSingle();

        if (!progError && progRow?.treino_id) {
          const { data: treinoData, error: treinoError } = await supabase
            .from('videostreinos')
            .select('*')
            .eq('id', progRow.treino_id)
            .maybeSingle();

          if (!treinoError && treinoData) {
            setTreinoDoDia(treinoData);
          } else {
            setTreinoDoDia(null);
          }
        } else {
          setTreinoDoDia(null);
        }

        const { data, error } = await supabase
          .from('videostreinos')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('Resposta do Supabase:', { data, error });
        
        if (error) {
          console.error('Erro ao carregar vídeos:', error);
          setVideos([]);
        } else if (data && Array.isArray(data)) {
          setVideos(data);
        } else {
          console.log('Dados não é um array:', data);
          setVideos([]);
        }
      } catch (err) {
        console.error('Erro ao carregar vídeos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
        setLoadingTreinoDoDia(false);
      }
    };

    loadVideos();
  }, []);

  const handleCategoriaClick = (selectedCategoria: string) => {
    setCategoria(selectedCategoria);
  };

  // Filtrar vídeos por categoria selecionada
  const filteredVideos = categoria === 'Todos' 
    ? videos 
    : videos.filter(video => 
        video.categoria.toLowerCase() === categoria.toLowerCase()
      );

  return (
    <div className="flex flex-col h-full pb-24 bg-neutral-light dark:bg-neutral-dark">
      <header className="sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="font-serif text-xl font-bold dark:text-white">Treinos Atualizados</h1>
          <div className="size-10" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['Todos', 'Meditação', 'Musculação', 'Treinos'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoriaClick(cat)}
              className={`px-6 h-10 rounded-xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${
                categoria === cat 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold dark:text-white">
            {treinoDoDia ? 'Treino do Dia' : (categoria === 'Todos' ? 'Todos os Treinos' : `${categoria}`)}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {treinoDoDia ? 'Treino programado para hoje' : 
             (categoria === 'Todos' ? 'Sessões para equilíbrio e foco' : `Treinos de ${categoria.toLowerCase()}`)}
          </p>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : treinoDoDia ? (
            // Mostra o treino do dia com verificação de assinatura
            <div className={`bg-white dark:bg-white/5 rounded-3xl overflow-hidden ios-shadow border border-gray-50 dark:border-white/5 group active:scale-[0.98] transition-all ${isAssinante ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                 onClick={async () => {
                   if (!isAssinante) {
                     setShowPremiumModal(true);
                     return;
                   }
                   onNavigate({
                     screen: AppScreen.VIDEO_PLAYER,
                     params: {
                       videoUrl: treinoDoDia.video_url,
                       title: treinoDoDia.titulo,
                       category: treinoDoDia.categoria,
                       duration: treinoDoDia.duracao
                     }
                   });
                 }}>
              <div className="relative aspect-video">
                <video 
                  src={treinoDoDia.video_url} 
                  className="w-full h-full object-cover"
                  poster={treinoDoDia.thumbnail_url}
                  controls={false}
                  muted
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="size-16 bg-white/90 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary">play_arrow</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold dark:text-white mb-4">{treinoDoDia.titulo}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-symbols-outlined text-green-700 text-lg">schedule</span>
                    <span className="text-xs font-bold">{treinoDoDia.duracao}</span>
                  </div>
                  <div className="size-1 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-symbols-outlined text-green-700 text-lg">category</span>
                    <span className="text-xs font-medium">{treinoDoDia.categoria}</span>
                  </div>
                  <div className="size-1 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-symbols-outlined text-green-700 text-lg">fitness_center</span>
                    <span className="text-xs font-medium">{treinoDoDia.nivel}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Categoria</p>
                    <p className="text-sm font-semibold dark:text-gray-300">{treinoDoDia.categoria}</p>
                  </div>
                  {!isAssinante && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPremiumModal(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm"
                    >
                      Assinar Agora
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {categoria === 'Todos' ? 'Nenhum vídeo encontrado' : `Nenhum vídeo encontrado para: ${categoria}`}
              </p>
            </div>
          ) : (
            // Mostra lista completa apenas se não houver treino programado
            filteredVideos.map((video, index) => {
              return (
                <div key={video.id} className={`bg-white dark:bg-white/5 rounded-3xl overflow-hidden ios-shadow border border-gray-50 dark:border-white/5 group active:scale-[0.98] transition-all ${isAssinante ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                     onClick={async () => {
                       if (!isAssinante) {
                         setShowPremiumModal(true);
                         return;
                       }
                       onNavigate({
                         screen: AppScreen.VIDEO_PLAYER,
                         params: {
                           videoUrl: video.video_url,
                           title: video.titulo,
                           category: video.categoria,
                           duration: video.duracao
                         }
                       });
                     }}>
<div className="relative aspect-video">
                  <video 
                    src={video.video_url} 
                    className="w-full h-full object-cover"
                    poster={video.thumbnail_url}
                    controls={false}
                    muted
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="size-16 bg-white/90 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary">play_arrow</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold dark:text-white mb-4">{video.titulo}</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="material-symbols-outlined text-green-700 text-lg">schedule</span>
                      <span className="text-xs font-bold">{video.duracao}</span>
                    </div>
                    <div className="size-1 rounded-full bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="material-symbols-outlined text-green-700 text-lg">category</span>
                      <span className="text-xs font-medium">{video.categoria}</span>
                    </div>
                    <div className="size-1 rounded-full bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="material-symbols-outlined text-green-700 text-lg">fitness_center</span>
                      <span className="text-xs font-medium">{video.nivel}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Categoria</p>
                      <p className="text-sm font-semibold dark:text-gray-300">{video.categoria}</p>
                    </div>
                    {!isAssinante && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPremiumModal(true);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm"
                      >
                        Assinar Agora
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })
          )} 
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.TREINOS} onNavigate={onNavigate} />
      
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onAssinar={() => {
          setShowPremiumModal(false);
          onNavigate(AppScreen.ASSINATURA);
        }}
      />
    </div>
  );
};

export default Treinos;
