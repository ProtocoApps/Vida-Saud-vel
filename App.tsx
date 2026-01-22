
import React, { useState } from 'react';
import { AppScreen } from './types';
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

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.ONBOARDING);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.ONBOARDING:
        return <Onboarding onFinish={() => setCurrentScreen(AppScreen.LOGIN)} />;
      case AppScreen.LOGIN:
        return <Login onLogin={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.HOME:
        return <Home onNavigate={setCurrentScreen} />;
      case AppScreen.TREINOS:
        return <Treinos onNavigate={setCurrentScreen} />;
      case AppScreen.DIAGNOSTICO:
        return <Diagnostico onNavigate={setCurrentScreen} onFinish={() => setCurrentScreen(AppScreen.HOME)} />;
      case AppScreen.PERFIL:
        return <Perfil onNavigate={setCurrentScreen} />;
      case AppScreen.AUDIOS:
        return <AudioLibrary onNavigate={setCurrentScreen} />;
      case AppScreen.DIARIO:
        return <Diario onNavigate={setCurrentScreen} />;
      case AppScreen.ROTINA:
        return <Rotina onNavigate={setCurrentScreen} />;
      case AppScreen.RESPIRACAO:
        return <Respiracao onNavigate={setCurrentScreen} />;
      case AppScreen.FOME_EMOCIONAL:
        return <FomeEmocional onNavigate={setCurrentScreen} />;
      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-neutral-100 dark:bg-black/20">
      <div className="w-full max-w-[430px] bg-white dark:bg-neutral-dark shadow-2xl relative flex flex-col min-h-screen overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
