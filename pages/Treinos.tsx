
import React, { useState, useEffect } from 'react';
import { AppScreen, NavigateFunction } from '../types';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

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
  const [level, setLevel] = useState('Iniciante');
  const [videos, setVideos] = useState<VideoTreino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
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
      }
    };

    loadVideos();
  }, []);

  const handleLevelClick = (selectedLevel: string) => {
    setLevel(selectedLevel);
  };

  // Filtrar vídeos por nível selecionado
  const filteredVideos = videos.filter(video => 
    video.nivel.toLowerCase() === level.toLowerCase()
  );

  return (
    <div className="flex flex-col h-full pb-24 bg-neutral-light dark:bg-neutral-dark">
      <header className="sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="font-serif text-xl font-bold dark:text-white">Treinos Atualizados</h1>
          <button className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['Iniciante', 'Intermediário', 'Avançado'].map((l) => (
            <button
              key={l}
              onClick={() => handleLevelClick(l)}
              className={`px-6 h-10 rounded-xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${
                level === l 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-white/5'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold dark:text-white">Para o seu momento</h2>
          <p className="text-gray-500 text-sm mt-1">Sessões curadas para equilíbrio e foco</p>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Nenhum vídeo encontrado para o nível: {level}</p>
            </div>
          ) : (
            filteredVideos.map((video) => (
              <div key={video.id} className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden ios-shadow border border-gray-50 dark:border-white/5 group active:scale-[0.98] transition-all cursor-pointer"
                   onClick={() => onNavigate({
                     screen: AppScreen.VIDEO_PLAYER,
                     params: {
                       videoUrl: video.video_url,
                       title: video.titulo,
                       category: video.categoria,
                       duration: video.duracao
                     }
                   })}
                 >
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
                    <button 
                      onClick={() => onNavigate({
                        screen: AppScreen.VIDEO_PLAYER,
                        params: {
                          videoUrl: video.video_url,
                          title: video.titulo,
                          category: video.categoria,
                          duration: video.duracao
                        }
                      })}
                      className="h-11 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.TREINOS} onNavigate={onNavigate} />
    </div>
  );
};

export default Treinos;
