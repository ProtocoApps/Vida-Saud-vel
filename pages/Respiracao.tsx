
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface RespiracaoProps {
  onNavigate: (screen: AppScreen) => void;
}

const Respiracao: React.FC<RespiracaoProps> = ({ onNavigate }) => {
  const [selected, setSelected] = useState('Ansiedade');

  const moods = [
    { id: 'Ansiedade', icon: 'air' },
    { id: 'Foco', icon: 'diamond' },
    { id: 'Angústia', icon: 'eco' },
    { id: 'Segurança', icon: 'terrain' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Respiração Atualizada</h2>
        <div className="size-10" />
      </header>

      <div className="flex justify-center gap-2 py-6">
        <div className="h-1 w-8 rounded-full bg-primary" />
        <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-white/10" />
        <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>

      <main className="px-8 pt-2 text-center flex-1 flex flex-col">
        <h1 className="font-serif text-[32px] font-bold leading-tight dark:text-white">Como você está agora?</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-[280px] mx-auto leading-relaxed">Escolha um estado para alinhar sua prática e encontrar equilíbrio.</p>

        <div className="grid grid-cols-2 gap-4 mt-12 content-start">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelected(mood.id)}
              className={`relative flex flex-col items-center justify-center gap-4 p-5 rounded-3xl aspect-square transition-all border-2 ios-shadow ${
                selected === mood.id 
                  ? 'bg-white dark:bg-white/10 border-primary' 
                  : 'bg-white dark:bg-white/5 border-transparent'
              }`}
            >
              <div className="size-14 rounded-full bg-neutral-light dark:bg-white/5 flex items-center justify-center text-gold-500 shadow-sm">
                <span className="material-symbols-outlined text-3xl filled-icon">{mood.icon}</span>
              </div>
              <span className={`text-lg font-serif font-bold ${selected === mood.id ? 'text-primary dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>
                {mood.id}
              </span>
              {selected === mood.id && (
                <div className="absolute top-3 right-3 text-primary">
                  <span className="material-symbols-outlined filled-icon">check_circle</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      <footer className="p-8 pb-12 mt-auto text-center space-y-4">
        <button className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg tracking-wide">
          Iniciar Prática
        </button>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sessão de 5 minutos</p>
      </footer>
    </div>
  );
};

export default Respiracao;
