
import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import AudioPlayer from '../components/AudioPlayer';
import { supabase } from '../lib/supabase';

interface AudioTrack {
  id: string;
  title: string;
  duration: string;
  category: string;
  imageUrl: string;
  audioUrl: string;
  description?: string;
}

interface AudioLibraryProps {
  onNavigate: (screen: AppScreen) => void;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState('Emoções');
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    try {
      const { data, error } = await supabase
        .from('audios')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar áudios:', error);
        // Carregar áudios de fallback
        loadFallbackAudios();
      } else {
        setTracks(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar áudios:', error);
      loadFallbackAudios();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackAudios = () => {
    const fallbackTracks: AudioTrack[] = [
      {
        id: '1',
        title: 'Equilíbrio Emocional',
        duration: '15 min',
        category: 'EMOÇÕES',
        imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-meditation.mp3',
        description: 'Meditação para equilibrar suas emoções'
      },
      {
        id: '2',
        title: 'Paz Interior e Silêncio',
        duration: '12 min',
        category: 'EMOÇÕES',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3',
        description: 'Encontre paz e silêncio interior'
      },
      {
        id: '3',
        title: 'Manejo da Ansiedade',
        duration: '18 min',
        category: 'EMOÇÕES',
        imageUrl: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3',
        description: 'Técnicas para manejar a ansiedade'
      },
      {
        id: '4',
        title: 'Frequência da Gratidão',
        duration: '10 min',
        category: 'EMOÇÕES',
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-happiness.mp3',
        description: 'Pratique a gratidão diária'
      },
      {
        id: '5',
        title: 'Acolhendo a Sombra',
        duration: '25 min',
        category: 'EMOÇÕES',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-spiritual.mp3',
        description: 'Integração das partes sombrias'
      },
      {
        id: '6',
        title: 'Respiração Consciente',
        duration: '8 min',
        category: 'CORPO',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-yoga.mp3',
        description: 'Exercícios de respiração consciente'
      },
      {
        id: '7',
        title: 'Relaxamento Profundo',
        duration: '20 min',
        category: 'CORPO',
        imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=200',
        audioUrl: 'https://www.bensound.com/bensound-music/bensound-wellness.mp3',
        description: 'Técnica de relaxamento profundo'
      },
    ];
    setTracks(fallbackTracks);
  };

  const getAllTracks = () => {
    switch (tab) {
      case 'Emoções':
        return tracks.filter(track => track.category === 'EMOÇÕES');
      case 'Corpo':
        return tracks.filter(track => track.category === 'CORPO');
      case 'Constância':
        return tracks.slice(0, 3);
      case 'Profecias':
        return tracks.slice(2, 5);
      default:
        return tracks;
    }
  };

  if (selectedTrack) {
    return (
      <AudioPlayer 
        track={selectedTrack} 
        onClose={() => setSelectedTrack(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando áudios...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-20">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => onNavigate(AppScreen.HOME)} className="size-12 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">chevron_left</span>
          </button>
          <h2 className="font-serif text-xl font-bold dark:text-white">Biblioteca de Áudios</h2>
          <button className="size-12 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>
        <div className="flex border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar px-4">
          {['Emoções', 'Corpo', 'Constância', 'Profecias'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 px-4 font-bold text-sm tracking-wide transition-all border-b-2 whitespace-nowrap ${
                tab === t ? 'border-green-700 text-gray-800 dark:text-white' : 'border-transparent text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4 pb-32 overflow-y-auto flex-1">
        {getAllTracks().map((track) => (
          <div 
            key={track.id} 
            className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-2xl ios-shadow border-l-4 border-transparent hover:border-green-700 transition-all cursor-pointer group"
            onClick={() => setSelectedTrack(track)}
          >
            <img src={track.imageUrl} alt={track.title} className="size-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-serif font-bold dark:text-white text-base leading-tight mb-1">{track.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{track.duration}</span>
                <div className="size-1 rounded-full bg-green-700" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{track.category}</span>
              </div>
              {track.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{track.description}</p>
              )}
            </div>
            <button className="size-11 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl filled-icon">play_circle</span>
            </button>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AudioLibrary;
