
import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { registrarDiaAtivo } from '../lib/diasAtivos';

const DEFAULT_ACTIONS = [
  { title: 'Treino do dia', desc: 'Foco e força', icon: 'fitness_center', screen: AppScreen.TREINOS },
  { title: 'Áudio emocional', desc: 'Equilíbrio interno', icon: 'headset', screen: AppScreen.AUDIOS },
  { title: 'Fome física x emocional', desc: 'Consciência alimentar', icon: 'restaurant', screen: AppScreen.FOME_EMOCIONAL },
  { title: 'Respiração consciente', desc: 'Presença plena', icon: 'air', screen: AppScreen.RESPIRACAO },
  { title: 'Diário', desc: 'Reflexão', icon: 'edit_note', screen: AppScreen.DIARIO },
  { title: 'Meu histórico do dia', desc: 'Acompanhamento', icon: 'history', screen: AppScreen.HISTORICO },
];

interface HomeProps {
  onNavigate: (screen: AppScreen) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [temNotificacoes, setTemNotificacoes] = useState(false);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);

  const loadHomeCards = async () => {
    try {
      const { data, error } = await supabase
        .from('home_cards')
        .select('title, desc, icon, screen, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        setActions(DEFAULT_ACTIONS);
        return;
      }

      if (!data || data.length === 0) {
        setActions(DEFAULT_ACTIONS);
        return;
      }

      const mapped = data
        .map((row: any) => {
          const screenValue = (AppScreen as any)[row.screen];
          if (!screenValue) return null;
          return {
            title: row.title,
            desc: row.desc,
            icon: row.icon,
            screen: screenValue,
          };
        })
        .filter(Boolean);

      if (mapped.length === 0) {
        setActions(DEFAULT_ACTIONS);
        return;
      }

      setActions(mapped as any);
    } catch {
      setActions(DEFAULT_ACTIONS);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Tentar obter nome dos metadados do usuário
          const nameFromMetadata = user.user_metadata?.name;
          if (nameFromMetadata) {
            setUserName(nameFromMetadata);
          }
          
          // Tentar obter avatar da tabela users
          const { data: userData } = await supabase
            .from('users')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          
          if (userData?.avatar_url) {
            setUserAvatar(userData.avatar_url);
          }

          // Registrar que o usuário está ativo hoje
          await registrarDiaAtivo();
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    loadHomeCards();

    // Adicionar listener de scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="flex flex-col h-full pb-24 bg-white dark:bg-neutral-dark">
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5' 
          : 'bg-transparent'
      } p-6 pb-4`}>
        <div className="flex items-center justify-between mb-4">
          {userAvatar ? (
            <img src={userAvatar} alt="Avatar" className="size-12 rounded-full object-cover border-2 border-gold-500" />
          ) : (
            <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-gold-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{getUserInitial(userName)}</span>
            </div>
          )}
          <div className="text-center">
            <h2 className="font-serif text-xl font-bold dark:text-white">{getGreeting()}{userName ? `, ${userName}` : ''} <span className="text-gold-500">🤍</span></h2>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Vida Alinhada</p>
          </div>
          <button 
            onClick={() => onNavigate(AppScreen.NOTIFICACOES_USUARIO)}
            className="size-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center shadow-md border border-gray-200 dark:border-white/10 hover:shadow-lg transition-all relative"
          >
            <span className="material-symbols-outlined text-gray-800 dark:text-white">notifications</span>
            {temNotificacoes && (
              <span className="absolute -top-1 -right-1 size-3 rounded-full bg-primary border-2 border-white dark:border-neutral-dark"></span>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-3 px-2">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-gold-500 animate-pulse"></div>
            <span className="text-xs text-primary/80 font-medium">Seu dia de equilíbrio</span>
            <div className="size-2 rounded-full bg-gold-500 animate-pulse"></div>
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
      </header>

      <main className="px-5 pt-4 space-y-6 overflow-y-auto flex-1">
        {/* Banner de assinatura */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-5 rounded-3xl text-white shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              <span className="font-bold">Desbloqueie Tudo</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
              PREMIUM
            </span>
          </div>
          <p className="text-sm mb-4 opacity-90">
            Apenas o primeiro vídeo e áudio são gratuitos. Assine para acessar todo o conteúdo!
          </p>
          <button 
            onClick={() => onNavigate(AppScreen.ASSINATURA)}
            className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Assinar Agora
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, i) => (
            <button 
              key={i}
              onClick={() => onNavigate(action.screen)}
              className="flex flex-col justify-between p-5 rounded-3xl bg-primary border border-primary/80 ios-shadow text-left h-44 hover:bg-primary/90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-white">{action.icon}</span>
              <div>
                <h3 className="font-bold text-base leading-tight text-gold-500">{action.title}</h3>
                <p className="text-xs text-gold-400 mt-1">{action.desc}</p>
              </div>
              <div className="mt-3 flex items-center text-gold-500 text-[10px] font-bold uppercase tracking-wider gap-1">
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
