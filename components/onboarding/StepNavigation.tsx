interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isNextDisabled: boolean;
  isLoading?: boolean;
}

export default function StepNavigation({ currentStep, totalSteps, onNext, onPrev, isNextDisabled, isLoading }: NavigationProps) {
  return (
    <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
      <button
        onClick={onPrev}
        className={`flex items-center gap-2 text-sm font-semibold transition-all ${
          currentStep === 1 ? "opacity-0 pointer-events-none" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
        Voltar
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className="flex items-center gap-2 px-8 py-3.5 bg-brand-base text-white rounded-xl font-bold text-sm transition-all hover:bg-brand-light hover:shadow-lg hover:shadow-brand-base/20 disabled:opacity-40 disabled:pointer-events-none"
      >
        {isLoading ? (
          "Processando..."
        ) : currentStep === totalSteps ? (
          "Finalizar Setup"
        ) : (
          <>
            Continuar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </>
        )}
      </button>
    </div>
  );
}