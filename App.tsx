
import React, { useState } from 'react';
import { AppScreen, NavigateFunction } from './types';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Treinos from './pages/Treinos';
import Diagnostico from './pages/Diagnostico';
import Perfil from './pages/Perfil';
import AudioLibrary from './pages/AudioLibrary';
import Diario from './pages/Diario';
import Rotina from './pages/Rotina';
import Respiracao from './pages/Respiracao';
import FomeEmocional from './pages/FomeEmocional';
import VideoPlayer from './pages/VideoPlayer';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<{ screen: AppScreen; params?: any }>({ screen: AppScreen.ONBOARDING });

  const navigate: NavigateFunction = (screenOrParams) => {
    if (typeof screenOrParams === 'string') {
      setCurrentScreen({ screen: screenOrParams });
    } else {
      setCurrentScreen(screenOrParams);
    }
  };

  const renderScreen = () => {
    switch (currentScreen.screen) {
      case AppScreen.ONBOARDING:
        return <Onboarding onFinish={() => navigate(AppScreen.LOGIN)} />;
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
      case AppScreen.AUDIOS:
        return <AudioLibrary onNavigate={navigate} />;
      case AppScreen.DIARIO:
        return <Diario onNavigate={navigate} />;
      case AppScreen.ROTINA:
        return <Rotina onNavigate={navigate} />;
      case AppScreen.RESPIRACAO:
        return <Respiracao onNavigate={navigate} />;
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
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-neutral-100 dark:bg-black/20">
      <div className="w-full max-w-[430px] bg-white dark:bg-neutral-dark shadow-2xl relative flex flex-col h-screen overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
