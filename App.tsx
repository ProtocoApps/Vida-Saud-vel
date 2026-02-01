import React, { useState, useEffect } from 'react';
import { AppScreen, NavigateFunction } from './types';
import { GlobalUserProvider } from './contexts/GlobalUserContext';
import { supabase } from './lib/supabase';
import { trackSession } from './lib/sessions';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Treinos from './pages/Treinos';
import Diagnostico from './pages/Diagnostico';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import Notificacoes from './pages/Notificacoes';
import NotificacoesUsuario from './pages/NotificacoesUsuario';
import AudioLibrary from './pages/AudioLibrary';
import Diario from './pages/Diario';
import Rotina from './pages/Rotina';
import Respiracao from './pages/Respiracao';
import RespiracaoPratica from './pages/RespiracaoPratica';
import FomeEmocional from './pages/FomeEmocional';
import VideoPlayer from './pages/VideoPlayer';
import Historico from './pages/Historico';
import Assinatura from './pages/Assinatura';
import PagamentoSucesso from './pages/PagamentoSucesso';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<{ screen: AppScreen; params?: any }>({ screen: AppScreen.ONBOARDING });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Conta uma sessão quando o app abre e quando volta a ficar visível.
    // Protegido por janela de tempo para não inflar por refresh/navegação.
    trackSession({ minGapMinutes: 30 });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackSession({ minGapMinutes: 30 });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Força limpar hasSeenOnboarding para garantir que o Onboarding apareça (remover depois de testar)
    localStorage.removeItem('hasSeenOnboarding');

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Usuário já está logado, vai direto para Home
          console.log('App: Usuário logado, indo para HOME');
          setUser(session.user);
          setCurrentScreen({ screen: AppScreen.HOME });
        } else {
          // Usuário não está logado, verifica se já viu onboarding
          const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
          console.log('App: hasSeenOnboarding =', hasSeenOnboarding);
          if (hasSeenOnboarding) {
            console.log('App: Já viu onboarding, indo para LOGIN');
            setCurrentScreen({ screen: AppScreen.LOGIN });
          } else {
            console.log('App: Não viu onboarding, indo para ONBOARDING');
            setCurrentScreen({ screen: AppScreen.ONBOARDING });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        console.log('App: Erro, indo para ONBOARDING como fallback');
        setCurrentScreen({ screen: AppScreen.ONBOARDING });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentScreen({ screen: AppScreen.HOME });
      } else {
        setUser(null);
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        setCurrentScreen({ screen: hasSeenOnboarding ? AppScreen.LOGIN : AppScreen.ONBOARDING });
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      subscription.unsubscribe();
    };
  }, []);

  const navigate: NavigateFunction = (screenOrParams) => {
    if (typeof screenOrParams === 'string') {
      setCurrentScreen({ screen: screenOrParams });
    } else {
      setCurrentScreen(screenOrParams);
    }
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-neutral-dark items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentScreen.screen) {
      case AppScreen.ONBOARDING:
        return <Onboarding onFinish={() => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          navigate(AppScreen.LOGIN);
        }} />;
      case AppScreen.LOGIN:
        return <Login onLogin={() => navigate(AppScreen.HOME)} />;
      case AppScreen.HOME:
        return <Home onNavigate={navigate} />;
      case AppScreen.TREINOS:
        return <Treinos onNavigate={navigate} />;
      case AppScreen.DIAGNOSTICO:
        return <Diagnostico onNavigate={navigate} onFinish={() => navigate(AppScreen.HOME)} />;
      case AppScreen.PERFIL:
        return <Perfil onNavigate={navigate} />;
      case AppScreen.EDITAR_PERFIL:
        return <EditarPerfil onNavigate={navigate} />;
      case AppScreen.NOTIFICACOES:
        return <Notificacoes onNavigate={navigate} />;
      case AppScreen.NOTIFICACOES_USUARIO:
        return <NotificacoesUsuario onNavigate={navigate} />;
      case AppScreen.AUDIOS:
        return <AudioLibrary onNavigate={navigate} />;
      case AppScreen.DIARIO:
        return <Diario onNavigate={navigate} />;
      case AppScreen.ROTINA:
        return <Rotina onNavigate={navigate} />;
      case AppScreen.RESPIRACAO:
        return <Respiracao onNavigate={navigate} categoria={currentScreen.params?.categoria} />;
      case AppScreen.RESPIRACAO_PRATICA:
        return <RespiracaoPratica onNavigate={navigate} categoria={currentScreen.params?.categoria} />;
      case AppScreen.FOME_EMOCIONAL:
        return <FomeEmocional onNavigate={navigate} />;
      case AppScreen.VIDEO_PLAYER:
        return <VideoPlayer 
          onNavigate={navigate} 
          videoUrl={currentScreen.params?.videoUrl || ''}
          title={currentScreen.params?.title || ''}
          category={currentScreen.params?.category || ''}
          duration={currentScreen.params?.duration || ''}
        />;
      case AppScreen.HISTORICO:
        return <Historico onNavigate={navigate} />;
      case AppScreen.ASSINATURA:
        return <Assinatura onNavigate={navigate} />;
      case AppScreen.PAGAMENTO_SUCESSO:
        return <PagamentoSucesso onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <GlobalUserProvider value={user}>
      <div className="flex justify-center min-h-screen bg-neutral-100 dark:bg-black/20">
        <div className="w-full max-w-[430px] bg-white dark:bg-neutral-dark shadow-2xl relative flex flex-col h-screen overflow-hidden">
          {user && <input type="hidden" id="user-data" value={JSON.stringify(user)} />}
          {renderScreen()}
        </div>
      </div>
    </GlobalUserProvider>
  );
};

export default App;
