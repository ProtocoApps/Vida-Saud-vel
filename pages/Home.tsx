
import React from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';

interface HomeProps {
  onNavigate: (screen: AppScreen) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const actions = [
    { title: 'Treino do dia', desc: 'Foco e força', icon: 'fitness_center', screen: AppScreen.TREINOS },
    { title: 'Áudio emocional', desc: 'Equilíbrio interno', icon: 'headset', screen: AppScreen.AUDIOS },
    { title: 'Fome física x emocional', desc: 'Consciência alimentar', icon: 'restaurant', screen: AppScreen.FOME_EMOCIONAL },
    { title: 'Respiração consciente', desc: 'Presença plena', icon: 'air', screen: AppScreen.RESPIRACAO },
    { title: 'Diário', desc: 'Reflexão', icon: 'edit_note', screen: AppScreen.DIARIO },
    { title: 'Rotina do dia', desc: 'Meus hábitos', icon: 'calendar_today', screen: AppScreen.ROTINA },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white dark:bg-neutral-dark">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full overflow-hidden border-2 border-primary/20">
            <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold dark:text-white">Bom dia, Maria <span className="text-gold-500">🤍</span></h2>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Vida Alinhada</p>
          </div>
        </div>
        <button className="size-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-800 dark:text-white">notifications</span>
        </button>
      </header>

      <main className="px-5 pt-4 space-y-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-gold-500/10 border border-primary/10">
          <p className="font-serif italic text-sm text-primary/80 dark:text-white/80 leading-relaxed">
            "O equilíbrio não é algo que você encontra, é algo que você cria."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, i) => (
            <button 
              key={i}
              onClick={() => onNavigate(action.screen)}
              className="flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 ios-shadow text-left h-44 hover:border-gold-500/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-gold-500">{action.icon}</span>
              <div>
                <h3 className="font-bold text-base leading-tight dark:text-white">{action.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
              </div>
              <div className="mt-3 flex items-center text-primary dark:text-gold-500 text-[10px] font-bold uppercase tracking-wider gap-1">
                Acessar <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.HOME} onNavigate={onNavigate} />
    </div>
  );
};

export default Home;
