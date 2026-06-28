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

export default function StepStrategy({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
              
              {/* Checkmark indicator */}
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