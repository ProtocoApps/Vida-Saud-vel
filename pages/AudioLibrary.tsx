
import React, { useState } from 'react';
import { AppScreen, AudioTrack } from '../types';

interface AudioLibraryProps {
  onNavigate: (screen: AppScreen) => void;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState('Emoções');

  const tracks: AudioTrack[] = [
    { id: '1', title: 'Equilíbrio Emocional', duration: '15 min', category: 'EMOÇÕES', imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=200' },
    { id: '2', title: 'Paz Interior e Silêncio', duration: '12 min', category: 'EMOÇÕES', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200' },
    { id: '3', title: 'Manejo da Ansiedade', duration: '18 min', category: 'EMOÇÕES', imageUrl: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&q=80&w=200' },
    { id: '4', title: 'Frequência da Gratidão', duration: '10 min', category: 'EMOÇÕES', imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=200' },
    { id: '5', title: 'Acolhendo a Sombra', duration: '25 min', category: 'EMOÇÕES', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light dark:bg-neutral-dark">
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
                tab === t ? 'border-gold-500 text-gray-800 dark:text-white' : 'border-transparent text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4 pb-32">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-2xl ios-shadow border-l-4 border-transparent hover:border-gold-500 transition-all cursor-pointer group">
            <img src={track.imageUrl} alt={track.title} className="size-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-serif font-bold dark:text-white text-base leading-tight mb-1">{track.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{track.duration}</span>
                <div className="size-1 rounded-full bg-gold-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{track.category}</span>
              </div>
            </div>
            <button className="size-11 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl filled-icon">play_circle</span>
            </button>
          </div>
        ))}
      </main>

      {/* Mini Player */}
      <div className="fixed bottom-6 left-4 right-4 w-[calc(100%-32px)] max-w-[398px] z-50">
        <div className="bg-white/90 dark:bg-neutral-dark/95 backdrop-blur-xl rounded-2xl p-3 ios-shadow border border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={tracks[0].imageUrl} className="size-11 rounded-lg object-cover" />
            <div className="flex flex-col">
              <h4 className="text-sm font-bold dark:text-white leading-tight">Equilíbrio Emocional</h4>
              <div className="flex items-center gap-1.5 text-gold-500">
                <span className="material-symbols-outlined text-[14px] filled-icon">graphic_eq</span>
                <span className="text-[10px] font-bold uppercase tracking-tight text-gray-500 dark:text-gray-400">Em reprodução • 04:20</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 px-2">
            <button className="text-gold-500"><span className="material-symbols-outlined">timer</span></button>
            <button className="text-gold-500"><span className="material-symbols-outlined">edit_note</span></button>
            <button className="size-11 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-2xl filled-icon">pause</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioLibrary;
