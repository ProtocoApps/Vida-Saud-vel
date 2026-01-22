
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface DiagnosticoProps {
  onNavigate: (screen: AppScreen) => void;
  onFinish: () => void;
}

const Diagnostico: React.FC<DiagnosticoProps> = ({ onNavigate, onFinish }) => {
  const [value, setValue] = useState(7);

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark relative">
      <header className="flex items-center p-4 justify-between border-b border-gray-100 dark:border-white/5">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Diagnóstico Inicial</h2>
        <button onClick={onFinish} className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sair</button>
      </header>

      <main className="px-6 flex flex-col flex-1">
        <div className="py-8 space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sessão de Equilíbrio</p>
            <p className="text-gold-500 font-bold text-sm">20%</p>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full shadow-[0_0_10px_rgba(234,213,137,0.5)] transition-all duration-700" style={{ width: '20%' }} />
          </div>
        </div>

        <div className="relative mt-8 p-8 rounded-3xl bg-white dark:bg-white/5 ios-shadow border border-gold-500/10">
          <div className="absolute -top-3 left-8 px-4 py-1.5 bg-gold-100 dark:bg-gold-500/20 text-gold-700 dark:text-gold-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold-500/20">
            Corpo & Vitalidade
          </div>

          <div className="mt-4 mb-10">
            <div className="size-12 rounded-2xl bg-gold-100 dark:bg-white/10 flex items-center justify-center text-gold-600 mb-6">
              <span className="material-symbols-outlined text-3xl">wb_sunny</span>
            </div>
            <h3 className="font-serif text-2xl font-bold dark:text-white leading-tight">Como você avalia seu nível de energia ao acordar hoje?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">Sintonize-se com sua vitalidade interna e escolha a intensidade que melhor descreve seu despertar.</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Letárgico</span>
                <span className="font-serif text-5xl font-bold text-primary">{value}</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Radiante</span>
              </div>
              <div className="relative flex items-center h-8">
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full" />
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={value} 
                  onChange={(e) => setValue(parseInt(e.target.value))}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-500 [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-runnable-track]:bg-transparent"
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 opacity-30">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500" />
              <span className="material-symbols-outlined text-sm text-gold-500">spa</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500" />
            </div>

            <div className="grid grid-cols-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
              <span className={value <= 3 ? 'text-gold-500' : ''}>Estágio 1</span>
              <span className={value > 3 && value <= 7 ? 'text-gold-500' : ''}>Estágio 2</span>
              <span className={value > 7 ? 'text-gold-500' : ''}>Estágio 3</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 sticky bottom-0 bg-neutral-light dark:bg-neutral-dark">
        <button onClick={onFinish} className="w-full h-16 bg-primary text-white font-bold rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest">
          Continuar Diagnóstico <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default Diagnostico;
