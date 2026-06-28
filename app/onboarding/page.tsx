"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Importe os componentes
import StepStrategy from "@/components/onboarding/StepStrategy";
import StepFinancial from "@/components/onboarding/StepFinancial";
import StepNavigation from "@/components/onboarding/StepNavigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // Reduzido para 2 etapas
  
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  const [formData, setFormData] = useState({
    currency: "BRL",
    initialBalance: "",
    riskProfile: "",
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
      // Extrai o token gravado pelo seu AuthPage
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('planwise_auth_token='))
        ?.split('=')[1];

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // Dispara as requisições para os módulos independentes
      const [userResponse, walletResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/profile`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ financialProfile: formData.riskProfile })
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets/setup`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: "Carteira Principal",
            initialBalance: parseFloat(formData.initialBalance || "0"),
            currency: formData.currency
          })
        })
      ]);

      if (!userResponse.ok || !walletResponse.ok) {
        throw new Error("Erro de integração ao salvar dados do onboarding.");
      }
      
      // Mantém a tela de loading por 1.5s para UX de processamento antes do sucesso
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

  // Telas de Loading e Sucesso
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
                Configurando suas instâncias financeiras iniciais...
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
      {/* Progresso Lateral Minimalista */}
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
              (currentStep === 2 && !formData.initialBalance)
            }
          />
        </div>
      </main>
    </div>
  );
}