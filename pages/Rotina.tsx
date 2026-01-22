
import React, { useState } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';

interface RotinaProps {
  onNavigate: (screen: AppScreen) => void;
}

const Rotina: React.FC<RotinaProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState('Manhã');
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Respiração', sub: '5 min • Foco no Presente', icon: 'air', done: true, color: 'gold' },
    { id: '2', title: 'Treino Funcional', sub: '20 min • Nível Médio', icon: 'fitness_center', done: true, color: 'primary' },
    { id: '3', title: 'Diário de Gratidão', sub: 'Escreva 3 motivos para sorrir', icon: 'auto_stories', done: false, color: 'primary' }
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="flex flex-col h-full pb-24 bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white dark:bg-neutral-dark">
        <button onClick={() => onNavigate(AppScreen.HOME)} className="size-10 flex items-center justify-center"><span className="material-symbols-outlined">arrow_back_ios</span></button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Rotina Atualizada</h2>
        <div className="size-10" />
      </header>

      <main className="p-4 space-y-6">
        <div className="p-6 bg-[#fcf8f8] dark:bg-white/5 rounded-3xl border border-primary/10 ios-shadow flex items-center gap-6">
          <div className="relative size-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-white/5" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * 0.35} className="text-primary" />
            </svg>
            <span className="text-xl font-bold text-green-700">65%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evolução Hoje</p>
            <p className="text-2xl font-bold dark:text-white">Quase lá!</p>
            <p className="text-green-700 font-bold text-sm mt-0.5">+10% desde ontem</p>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold dark:text-white">Equilíbrio e Bem-estar</h3>
          <p className="text-sm italic text-green-700/70 dark:text-green-700/90 mt-1">Um passo de cada vez para sua evolução</p>
        </div>

        <div className="flex border-b border-gray-100 dark:border-white/5">
          {['Manhã', 'Tarde', 'Noite'].map((t) => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${
                tab === t ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl ios-shadow border border-gray-50 dark:border-white/5 cursor-pointer hover:border-primary/20 transition-all group"
            >
              <div className="size-12 rounded-xl bg-green-700/10 flex items-center justify-center text-green-700">
                <span className="material-symbols-outlined text-2xl filled-icon">{task.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base dark:text-white leading-tight">{task.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{task.sub}</p>
              </div>
              <div className={`size-8 rounded-full border-2 transition-all flex items-center justify-center ${
                task.done ? 'bg-green-700 border-green-700 text-white' : 'border-gray-100 dark:border-white/10'
              }`}>
                {task.done && <span className="material-symbols-outlined text-sm font-bold">check</span>}
              </div>
            </div>
          ))}
          
          <button className="w-full flex items-center gap-4 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
            <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl filled-icon">add_circle</span>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-base leading-tight">Adicionar Hábito</h4>
              <p className="text-white/60 text-[10px] font-bold mt-1">Personalize sua manhã</p>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.ROTINA} onNavigate={onNavigate} />
    </div>
  );
};

export default Rotina;
