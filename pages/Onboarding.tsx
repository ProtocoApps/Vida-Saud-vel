
import React, { useState } from 'react';

interface OnboardingProps {
  onFinish: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Encontre seu Equilíbrio",
      description: "Uma jornada guiada para alinhar seu corpo, emoções e consciência.",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
      cta: "Próximo"
    },
    {
      title: "Sua Rotina Consciente",
      description: "Ferramentas práticas para transformar seus dias e nutrir sua alma.",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
      cta: "Começar Agora"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-dark relative">
      <div className="absolute top-6 right-6 z-20">
        <button onClick={onFinish} className="text-gold-600 font-semibold text-sm">Pular</button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div 
          className="w-full aspect-[16/9] rounded-2xl bg-cover bg-center shadow-lg transition-all duration-700"
          style={{ backgroundImage: `url(${steps[step].imageUrl})` }}
        >
          <div className="h-full w-full bg-primary/5 rounded-2xl" />
        </div>

        <div className="mt-8 text-center px-6 flex flex-col justify-center items-center flex-1">
          <h1 className="font-serif text-3xl font-bold mb-4 dark:text-white">{steps[step].title}</h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg max-w-xs">{steps[step].description}</p>
        </div>

        <div className="pb-12 px-6 space-y-8">
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all duration-300 rounded-full ${i === step ? 'w-6 bg-gold-500' : 'w-1.5 bg-gray-200'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg"
          >
            {steps[step].cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
