import React from 'react';
import { useGlobalUser } from '../contexts/GlobalUserContext';

interface PagamentoModalProps {
  onClose: () => void;
}

const PagamentoModal: React.FC<PagamentoModalProps> = ({ onClose }) => {
  const { userData } = useGlobalUser();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-dark p-8 rounded-3xl text-center max-w-sm mx-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
        </div>
        <h3 className="text-2xl font-bold dark:text-white mb-2">Parabéns!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sua assinatura Vida Alinhada foi ativada com sucesso!<br/>
          Aproveite 30 dias de acesso total.
        </p>
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl text-white text-sm mb-4">
          <p className="font-semibold mb-2">O que está desbloqueado:</p>
          <div className="text-left space-y-1">
            <p>✓ Todas as meditações guiadas</p>
            <p>✓ Treinos personalizados</p>
            <p>✓ Diário emocional completo</p>
            <p>✓ Conteúdo exclusivo</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
        >
          Começar Agora
        </button>
      </div>
    </div>
  );
};

export default PagamentoModal;
