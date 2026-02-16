import React from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssinar: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onAssinar }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-dark rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-500">diamond</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
            Conteúdo Premium
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Você não é um assinante premium!<br /><br />
            Assine agora para ter acesso a todos os vídeos de treinos e desbloquear conteúdo exclusivo.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onAssinar}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Assinar Agora
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-2xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
