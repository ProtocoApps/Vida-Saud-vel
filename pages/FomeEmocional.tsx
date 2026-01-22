
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface FomeEmocionalProps {
  onNavigate: (screen: AppScreen) => void;
}

const FomeEmocional: React.FC<FomeEmocionalProps> = ({ onNavigate }) => {
  const [selected, setSelected] = useState(['Fome Física']);

  const feelings = [
    { id: 'Fome Física', icon: 'restaurant', color: 'text-orange-700', bg: 'bg-orange-100' },
    { id: 'Cansaço', icon: 'battery_low', color: 'text-blue-700', bg: 'bg-blue-100' },
    { id: 'Ansiedade', icon: 'psychology', color: 'text-purple-700', bg: 'bg-purple-100' },
    { id: 'Tédio', icon: 'sentiment_neutral', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { id: 'Tristeza', icon: 'sentiment_dissatisfied', color: 'text-red-700', bg: 'bg-red-100' }
  ];

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Fome Emocional Atualizada</h2>
        <div className="size-10" />
      </header>

      <main className="px-8 pt-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-8 bg-gold-500 rounded-full" />
          <span className="text-[10px] font-bold text-primary dark:text-primary/80 uppercase tracking-widest">Consciência</span>
        </div>
        <h1 className="font-serif text-4xl font-bold leading-tight dark:text-white">
          Antes de comer, <span className="text-primary italic">pause.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg leading-relaxed">Tire um momento para respirar e observar seu corpo. O que você está sentindo agora?</p>

        <div className="mt-8 bg-white/50 dark:bg-white/5 rounded-3xl p-2 ios-shadow border border-white/30 space-y-1">
          {feelings.map((f) => (
            <label 
              key={f.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-full ${f.bg} flex items-center justify-center ${f.color} opacity-80`}>
                  <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                </div>
                <span className="text-lg font-medium dark:text-white">{f.id}</span>
              </div>
              <div onClick={(e) => { e.preventDefault(); toggle(f.id); }}>
                <div className={`size-6 rounded-full border-2 transition-all flex items-center justify-center ${
                  selected.includes(f.id) ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-white/10'
                }`}>
                  {selected.includes(f.id) && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-auto py-10 space-y-4">
          <button className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg active:scale-95 transition-all">
            <span className="material-symbols-outlined">edit_note</span> Registrar
          </button>
          <button className="w-full h-14 bg-burgundy-900 text-white font-bold rounded-2xl shadow-xl shadow-burgundy-900/20 flex items-center justify-center gap-2 text-lg active:scale-95 transition-all">
            <span className="material-symbols-outlined filled-icon">self_improvement</span> Pausa consciente
          </button>
          <p className="text-center text-gray-500 text-sm">A consciência é o primeiro passo para o equilíbrio.</p>
        </div>
      </main>
    </div>
  );
};

export default FomeEmocional;
