
import React, { useState } from 'react';
import { AppScreen, Workout } from '../types';
import BottomNav from '../components/BottomNav';

interface TreinosProps {
  onNavigate: (screen: AppScreen) => void;
}

const Treinos: React.FC<TreinosProps> = ({ onNavigate }) => {
  const [level, setLevel] = useState('Iniciante');
  
  const workouts: Workout[] = [
    {
      id: '1',
      title: 'Yoga de Alinhamento Matinal',
      duration: '15 MIN',
      tag: 'Flexibilidade & Presença',
      objective: 'Equilíbrio Corporal',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
      recommended: true
    },
    {
      id: '2',
      title: 'Força Consciente',
      duration: '30 MIN',
      tag: 'Tonificação Muscular',
      objective: 'Fortalecimento',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: '3',
      title: 'Fluxo Energético',
      duration: '20 MIN',
      tag: 'Vitalidade & Foco',
      objective: 'Ativação Diária',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-2969c63b07b7?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-neutral-light dark:bg-neutral-dark">
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

      <main className="flex-1 px-4 py-6 space-y-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['Iniciante', 'Intermediário', 'Avançado'].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
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
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden ios-shadow border border-gray-50 dark:border-white/5 group active:scale-[0.98] transition-all">
              <div className="relative aspect-video">
                <img src={workout.imageUrl} alt={workout.title} className="w-full h-full object-cover" />
                {workout.recommended && (
                  <div className="absolute top-4 right-4 bg-primary/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">
                    Recomendado
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold dark:text-white mb-4">{workout.title}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-symbols-outlined text-gold-500 text-lg">schedule</span>
                    <span className="text-xs font-bold">{workout.duration}</span>
                  </div>
                  <div className="size-1 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-symbols-outlined text-gold-500 text-lg">psychology</span>
                    <span className="text-xs font-medium">{workout.tag}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Objetivo</p>
                    <p className="text-sm font-semibold dark:text-gray-300">{workout.objective}</p>
                  </div>
                  <button className="h-11 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.TREINOS} onNavigate={onNavigate} />
    </div>
  );
};

export default Treinos;
