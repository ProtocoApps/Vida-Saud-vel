
import React, { useState } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';

interface DiarioProps {
  onNavigate: (screen: AppScreen) => void;
}

const Diario: React.FC<DiarioProps> = ({ onNavigate }) => {
  const [focus, setFocus] = useState('Gratidão');

  return (
    <div className="flex flex-col h-full pb-24 bg-neutral-light dark:bg-neutral-dark">
      <header className="p-6 pb-2 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <div>
          <span className="text-green-700 text-[10px] font-bold uppercase tracking-[0.2em]">Bom dia</span>
          <h1 className="text-2xl font-bold dark:text-white mt-1">Diário</h1>
        </div>
        <button className="size-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center ios-shadow">
          <span className="material-symbols-outlined text-green-700">calendar_today</span>
        </button>
      </header>

      <main className="px-6 py-6 flex flex-col flex-1 space-y-8">
        <div>
          <h3 className="text-lg font-bold dark:text-white mb-4">Escolha um foco</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Gratidão', icon: 'favorite' },
              { id: 'Alimentar', icon: 'restaurant' },
              { id: 'Profecias', icon: 'auto_awesome' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFocus(item.id)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl aspect-square ios-shadow transition-all border-2 ${
                  focus === item.id 
                    ? 'bg-white dark:bg-white/10 border-green-700' 
                    : 'bg-white dark:bg-white/5 border-transparent opacity-60'
                }`}
              >
                <div className={`p-2 rounded-full ${focus === item.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="material-symbols-outlined text-2xl filled-icon">{item.icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{item.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <p className="font-serif italic font-bold text-lg dark:text-white mb-4">"O que aqueceu seu coração hoje?"</p>
          <textarea 
            className="w-full flex-1 p-6 rounded-3xl bg-white dark:bg-white/5 border-none ios-shadow text-base resize-none focus:ring-1 focus:ring-green-700 placeholder:text-gray-300 transition-all dark:text-white"
            placeholder="Deixe suas palavras fluírem aqui..."
          />
        </div>
      </main>

      <footer className="p-6 sticky bottom-20 bg-neutral-light dark:bg-neutral-dark">
        <button className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
          Salvar Reflexão
        </button>
      </footer>

      <BottomNav currentScreen={AppScreen.DIARIO} onNavigate={onNavigate} />
    </div>
  );
};

export default Diario;
