import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';

interface NotificacoesProps {
  onNavigate: (screen: AppScreen) => void;
}

interface NotificationSettings {
  dailyReminder: boolean;
  sessionComplete: boolean;
  weeklyReport: boolean;
  motivationalQuotes: boolean;
  breathingReminder: boolean;
}

const Notificacoes: React.FC<NotificacoesProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: true,
    sessionComplete: true,
    weeklyReport: false,
    motivationalQuotes: true,
    breathingReminder: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Carregar configurações salvas no localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setLoading(true);
    try {
      // Salvar no localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // Aqui você pode integrar com um serviço de notificações real
      // Por exemplo: Firebase Cloud Messaging, OneSignal, etc.
      console.log('Configurações de notificação salvas:', newSettings);
      
      // Simular requisição para backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    saveSettings(newSettings);
  };

  const notificationOptions = [
    {
      key: 'dailyReminder' as keyof NotificationSettings,
      title: 'Lembrete Diário',
      description: 'Receba um lembrete para usar o app todos os dias',
      icon: 'notifications_active',
      time: '09:00'
    },
    {
      key: 'sessionComplete' as keyof NotificationSettings,
      title: 'Conclusão de Sessão',
      description: 'Notificação quando completar uma atividade',
      icon: 'task_alt',
      time: null
    },
    {
      key: 'weeklyReport' as keyof NotificationSettings,
      title: 'Relatório Semanal',
      description: 'Resumo semanal do seu progresso',
      icon: 'summarize',
      time: 'Domingo 10:00'
    },
    {
      key: 'motivationalQuotes' as keyof NotificationSettings,
      title: 'Frases Motivacionais',
      description: 'Receba inspiração diária',
      icon: 'psychology',
      time: '12:00'
    },
    {
      key: 'breathingReminder' as keyof NotificationSettings,
      title: 'Lembrete de Respiração',
      description: 'Lembrete para fazer exercícios de respiração',
      icon: 'air',
      time: '15:00'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.PERFIL)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Notificações</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Status geral */}
          <div className="p-5 bg-white dark:bg-white/5 rounded-3xl ios-shadow border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-primary">notifications</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold dark:text-white">Status das Notificações</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.values(settings).filter(v => v).length} de {Object.keys(settings).length} ativas
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const allEnabled = Object.keys(settings).reduce((acc, key) => ({
                    ...acc,
                    [key]: true
                  }), {} as NotificationSettings);
                  saveSettings(allEnabled);
                }}
                className="flex-1 py-2 px-4 bg-primary text-white text-sm font-medium rounded-xl active:scale-95 transition-all"
              >
                Ativar Todas
              </button>
              <button
                onClick={() => {
                  const allDisabled = Object.keys(settings).reduce((acc, key) => ({
                    ...acc,
                    [key]: false
                  }), {} as NotificationSettings);
                  saveSettings(allDisabled);
                }}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl active:scale-95 transition-all"
              >
                Silenciar Todas
              </button>
            </div>
          </div>

          {/* Opções individuais */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold dark:text-white">Configurações Individuais</h3>
            
            {notificationOptions.map((option) => (
              <div
                key={option.key}
                className="p-5 bg-white dark:bg-white/5 rounded-3xl ios-shadow border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-primary">{option.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm dark:text-white">{option.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                      {option.time && (
                        <p className="text-xs text-primary mt-1">
                          <span className="material-symbols-outlined text-xs align-middle">schedule</span>
                          {' '}{option.time}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting(option.key)}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[option.key] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Informações adicionais */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">info</span>
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Sobre as Notificações</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  As notificações ajudam você a manter o foco no seu bem-estar. Você pode ativar ou desativar cada uma conforme sua preferência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notificacoes;
