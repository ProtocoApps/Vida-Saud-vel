import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { getDiasAtivosStats, registrarDiaAtivo } from '../lib/diasAtivos';
import { getSessionStats } from '../lib/sessions';

interface PerfilProps {
  onNavigate: (screen: AppScreen) => void;
}

const Perfil: React.FC<PerfilProps> = ({ onNavigate }) => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [diasAtivosStats, setDiasAtivosStats] = useState({ diasAtivos: 0, streakAtual: 0, melhorStreak: 0 });
  const [sessionStats, setSessionStats] = useState<{ sessionsThisMonth: number; percentChange: number | null }>({ sessionsThisMonth: 0, percentChange: null });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Obter nome dos metadados
          const nameFromMetadata = user.user_metadata?.name;
          if (nameFromMetadata) {
            setUserName(nameFromMetadata);
          }
          
          // Obter email
          setUserEmail(user.email || '');
          
          // Tentar obter avatar e outros dados da tabela users
          const { data: userData } = await supabase
            .from('users')
            .select('avatar_url, phone, gender')
            .eq('id', user.id)
            .single();
          
          if (userData?.avatar_url) {
            setUserAvatar(userData.avatar_url);
          }

          // Carregar estatísticas de dias ativos
          const stats = await getDiasAtivosStats();
          setDiasAtivosStats(stats);

          const s = await getSessionStats();
          setSessionStats({ sessionsThisMonth: s.sessionsThisMonth, percentChange: s.percentChange });

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
  }, []);

  const getUserInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="flex flex-col h-full pb-24 bg-neutral-light dark:bg-neutral-dark">
      <header className="sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10 p-4 flex items-center justify-between">
        <div className="size-10" />
        <h2 className="font-serif text-lg font-bold dark:text-white">Perfil</h2>
        <button 
          onClick={() => onNavigate(AppScreen.EDITAR_PERFIL)}
          className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      </header>

      <main className="px-5 pt-4 space-y-8 overflow-y-auto flex-1">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {loading ? (
              <div className="size-32 rounded-full border-4 border-gold-500 shadow-xl bg-gray-100 animate-pulse" />
            ) : userAvatar ? (
              <div className="size-32 rounded-full border-4 border-gold-500 shadow-xl overflow-hidden">
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="size-32 rounded-full border-4 border-gold-500 shadow-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-5xl">{getUserInitial(userName)}</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 size-8 bg-primary text-white rounded-full border-2 border-white dark:border-neutral-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-sm filled-icon">verified</span>
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold mt-4 dark:text-white">{loading ? 'Carregando...' : (userName || 'Usuário')}</h1>
          {userEmail && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{userEmail}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-gold-500 text-sm filled-icon">workspace_premium</span>
            <span className="text-primary font-bold text-sm">Membro Premium</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic max-w-xs">"Equilíbrio entre corpo, emoção e consciência."</p>
        </div>

        <section className="space-y-4">
          <h3 className="font-serif text-lg font-bold dark:text-white">Progresso</h3>
          <div className="p-5 bg-white dark:bg-white/5 rounded-3xl ios-shadow border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sessões</span>
              <span className="material-symbols-outlined text-primary text-lg">spa</span>
            </div>
            <p className="text-2xl font-bold dark:text-white">{sessionStats.sessionsThisMonth}</p>
            <p className="text-[10px] font-bold text-primary mt-1">
              {sessionStats.percentChange === null
                ? '—'
                : `${sessionStats.percentChange >= 0 ? '+' : ''}${sessionStats.percentChange}% este mês`}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-serif text-lg font-bold dark:text-white">Plano Atual</h3>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-burgundy-900 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Vitalício</span>
                <span className="material-symbols-outlined text-gold-500 filled-icon">diamond</span>
              </div>
              <h4 className="font-serif text-xl font-bold">Plano Consciência Plena</h4>
              <p className="text-white/70 text-xs mt-1">Acesso ilimitado a todas as jornadas.</p>
              <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center">
                <p className="text-[10px] font-medium text-white/50 italic">Próxima renovação: 12 Jan 2025</p>
                <button className="px-4 py-1.5 border border-white/40 rounded-xl text-xs font-bold hover:bg-white hover:text-primary transition-all">Gerenciar</button>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/5 transition-transform group-hover:scale-110">energy_savings_leaf</span>
          </div>
        </section>

        <section className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden ios-shadow border border-gray-100 dark:border-white/5">
          {[
            { 
              title: 'Notificações', 
              icon: 'notifications',
              action: () => onNavigate(AppScreen.NOTIFICACOES)
            },
            { 
              title: 'Suporte', 
              icon: 'contact_support',
              action: undefined
            },
            { 
              title: 'Privacidade', 
              icon: 'lock',
              action: undefined
            }
          ].map((item, i) => (
            <button 
              key={item.title}
              onClick={item.action || undefined}
              className={`w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i !== 2 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                <span className="font-semibold text-sm dark:text-gray-200">{item.title}</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-lg">
                {item.action ? 'chevron_right' : ''}
              </span>
            </button>
          ))}
        </section>

        <div className="flex flex-col items-center gap-4 py-8">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('hasSeenOnboarding');
            }}
            className="text-red-500 font-bold text-sm uppercase tracking-widest hover:underline"
          >
            Sair
          </button>
          <button className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">Cancelar Assinatura</button>
          
          {/* Botão secreto para admin - clique 5 vezes rapidamente */}
          <button 
            onClick={() => onNavigate(AppScreen.ADMIN_PANEL)}
            className="text-gray-300 text-[8px] uppercase tracking-[0.3em] hover:text-gray-400 transition-colors"
            style={{ opacity: 0.3 }}
          >
            Admin Panel
          </button>
          
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em]">Vida Alinhada • v2.4.0</p>
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.PERFIL} onNavigate={onNavigate} />
    </div>
  );
};

export default Perfil;
