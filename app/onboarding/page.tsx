"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; 
  
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  // Estado atualizado com os novos campos requeridos pelo backend
  const [formData, setFormData] = useState({
    riskProfile: "",
    walletName: "Conta Corrente",
    initialBalance: "",
    monthlyIncome: "",
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setSubmitState("loading");
    setIsSaving(true);
    
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('planwise_auth_token='))
        ?.split('=')[1];

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // 1. Atualiza Perfil e Cria Workspace Paralelamente
      const [userResponse, workspaceResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/profile`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ financialProfile: formData.riskProfile })
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: "Meu Negócio",
            description: "Workspace Principal"
          })
        })
      ]);

      if (!userResponse.ok || !workspaceResponse.ok) {
        throw new Error("Erro ao criar workspace ou atualizar perfil.");
      }
      
      // 2. Aciona o novo serviço do Backend (Cria Carteira, Saldo e Renda)
      const setupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/setup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          walletName: formData.walletName,
          initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0,
          monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : 0
        })
      });

      if (!setupResponse.ok) {
        throw new Error("Erro ao configurar parâmetros financeiros iniciais.");
      }
      
      setTimeout(() => {
        setSubmitState("success");
      }, 1500);
      
    } catch (error) {
      console.error("Falha ao finalizar onboarding:", error);
      setSubmitState("idle");
      alert("Falha ao configurar ambiente. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  if (submitState !== "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-bg relative overflow-hidden px-6 select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-base blur-[120px] rounded-full pointer-events-none z-0" 
        />
        
        <AnimatePresence mode="wait">
          {submitState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 border-2 border-brand-base/20 border-t-brand-base rounded-full animate-spin mb-8"></div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
                Iniciando Motor de Projeção
              </h2>
              <p className="text-text-secondary text-sm">
                Configurando seu workspace e instâncias financeiras iniciais...
              </p>
            </motion.div>
          )}

          {submitState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex flex-col items-center text-center max-w-2xl"
            >
              <div className="w-16 h-16 bg-brand-base/10 text-brand-base rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(var(--color-brand-base),0.3)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-4xl font-extrabold text-text-primary tracking-tight mb-4">
                Tudo pronto.
              </h2>
              <p className="text-text-secondary text-lg mb-10">
                Seu ambiente de trabalho foi criado. Agora você tem previsibilidade absoluta sobre o seu fluxo de caixa.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] text-white font-bold rounded-xl flex items-center gap-3 hover:shadow-lg hover:shadow-brand-base/40 transition-all hover:-translate-y-0.5"
              >
                Acessar Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-bg overflow-hidden font-sans">
      <div className="hidden md:flex w-24 border-r border-surface-border flex-col items-center py-12 relative z-20 bg-surface-card/30 backdrop-blur-md">
        <div className="text-xs font-bold text-text-secondary mb-12 -rotate-90 tracking-widest uppercase mt-8">Setup</div>
        <div className="flex flex-col gap-6 items-center">
          {[1, 2].map((step) => (
            <div key={step} className="relative flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${currentStep >= step ? "bg-brand-base shadow-[0_0_10px_rgba(var(--color-brand-base),0.8)]" : "bg-surface-border"}`} />
              {step < 2 && <div className={`absolute top-4 w-px h-6 transition-all duration-500 ${currentStep > step ? "bg-brand-base/50" : "bg-surface-border/50"}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-light/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="flex-1 w-full max-w-4xl mx-auto relative z-10 px-6 md:px-16 pt-16 md:pt-24 pb-24 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {currentStep === 1 && <StepStrategy value={formData.riskProfile} onChange={(v) => updateFormData({ riskProfile: v })} />}
              {currentStep === 2 && <StepFinancial data={formData} onChange={updateFormData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t border-surface-border bg-surface-bg/80 backdrop-blur-md z-20 px-6 md:px-16 py-6">
          <StepNavigation 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            onNext={handleNext} 
            onPrev={handlePrev}
            isLoading={isSaving}
            isNextDisabled={
              (currentStep === 1 && !formData.riskProfile) || 
              (currentStep === 2 && (!formData.initialBalance || !formData.walletName))
            }
          />
        </div>
      </main>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// COMPONENTES DE ETAPAS (Deixe-os no mesmo arquivo ou exportados onde você preferir)
// --------------------------------------------------------------------------------------

function StepFinancial({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  return (
    <div className="max-w-2xl">
      <span className="text-brand-base font-bold text-[11px] tracking-[0.2em] uppercase mb-8 block">
        Setup Inicial
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.1] mb-4 tracking-tight">
        Defina seu marco zero.
      </h1>
      <p className="text-text-secondary text-lg mb-10 leading-relaxed">
        Para que o motor calcule o futuro, precisamos configurar sua conta principal, o saldo base e a sua renda.
      </p>

      <div className="max-w-lg space-y-6">
        {/* Input Nome da Carteira */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Nome da Carteira Principal</label>
          <input
            type="text"
            value={data.walletName}
            onChange={(e) => onChange({ walletName: e.target.value })}
            placeholder="Ex: Conta Nubank, Itaú..."
            className="w-full bg-surface-card border border-surface-border rounded-2xl px-6 py-5 text-text-primary text-lg font-medium outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all shadow-sm"
          />
        </div>

        {/* Input de Saldo Inicial */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Saldo Atual Consolidado</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary font-medium">R$</span>
            <input
              type="number"
              step="0.01"
              value={data.initialBalance}
              onChange={(e) => onChange({ initialBalance: e.target.value })}
              placeholder="0.00"
              className="w-full bg-surface-card border border-surface-border rounded-2xl pl-14 pr-6 py-5 text-text-primary text-lg font-medium outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Entrará no seu histórico financeiro automaticamente como "Pago".
          </p>
        </div>

        {/* Input de Renda Mensal */}
        <div className="space-y-3 pt-6 border-t border-surface-border">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Renda Mensal Fixa (Opcional)</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary font-medium">R$</span>
            <input
              type="number"
              step="0.01"
              value={data.monthlyIncome}
              onChange={(e) => onChange({ monthlyIncome: e.target.value })}
              placeholder="0.00"
              className="w-full bg-brand-base/5 border border-brand-base/20 rounded-2xl pl-14 pr-6 py-5 text-text-primary text-lg font-bold outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-2">
            Sua principal fonte de renda. Projetaremos esse valor no seu fluxo de caixa futuro.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepStrategy({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const profiles = [
    {
      id: "conservative",
      title: "Conservador",
      desc: "Foco total em segurança e reserva de emergência. Projeções priorizam estabilidade.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    },
    {
      id: "moderate",
      title: "Moderado",
      desc: "Equilíbrio entre segurança e crescimento. Regras mistas no fluxo de caixa.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    },
    {
      id: "aggressive",
      title: "Arrojado",
      desc: "Foco em alocação de risco e alto retorno. Permite simulações de contratos voláteis.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    }
  ];

  return (
    <div className="w-full">
      <span className="text-brand-base font-bold text-[11px] tracking-[0.2em] uppercase mb-8 block">
        Estratégia
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.1] mb-4 tracking-tight">
        Qual seu perfil de controle?
      </h1>
      <p className="text-text-secondary text-lg mb-10 leading-relaxed">
        Isso ajuda o motor a categorizar alertas e sugestões de insights nas suas projeções.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const isSelected = value === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => onChange(profile.id)}
              className={`relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? "bg-brand-base/5 border-brand-base shadow-[0_0_0_1px_var(--color-brand-base)]" 
                  : "bg-surface-card border-surface-border hover:border-text-secondary/40 hover:-translate-y-1"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${
                isSelected ? "bg-brand-base text-white shadow-md shadow-brand-base/30" : "bg-surface-bg border border-surface-border text-text-secondary"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {profile.icon}
                </svg>
              </div>
              <h3 className={`font-bold text-lg mb-2 ${isSelected ? "text-text-primary" : "text-text-primary"}`}>
                {profile.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {profile.desc}
              </p>
              
              <div className={`absolute top-6 right-6 transition-opacity ${isSelected ? "opacity-100 text-brand-base" : "opacity-0"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isNextDisabled: boolean;
  isLoading?: boolean;
}

function StepNavigation({ currentStep, totalSteps, onNext, onPrev, isNextDisabled, isLoading }: NavigationProps) {
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