
import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { icon: 'home', label: 'Início', screen: AppScreen.HOME },
    { icon: 'fitness_center', label: 'Treinos', screen: AppScreen.TREINOS },
    { icon: 'menu_book', label: 'Diários', screen: AppScreen.DIARIO },
    { icon: 'account_circle', label: 'Perfil', screen: AppScreen.PERFIL },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 px-4 pt-3 pb-6 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.screen}
          onClick={() => onNavigate(item.screen)}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
            currentScreen === item.screen ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <span className={`material-symbols-outlined text-2xl ${currentScreen === item.screen ? 'filled-icon' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
