export default function StepFinancial({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  return (
    <div className="max-w-2xl">
      <span className="text-brand-base font-bold text-[11px] tracking-[0.2em] uppercase mb-8 block">
        Setup Inicial
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.1] mb-4 tracking-tight">
        Defina seu marco zero.
      </h1>
      <p className="text-text-secondary text-lg mb-10 leading-relaxed">
        Para que o motor calcule o futuro, precisamos saber seu saldo atual consolidado e a moeda base.
      </p>

      <div className="max-w-lg space-y-6">
        {/* Seleção de Moeda */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Moeda Principal</label>
          <div className="flex gap-3">
            {["BRL", "USD", "EUR"].map((cur) => (
              <button
                key={cur}
                onClick={() => onChange({ currency: cur })}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  data.currency === cur 
                    ? "bg-brand-base/10 border-brand-base text-brand-base ring-1 ring-brand-base/50" 
                    : "bg-surface-card border-surface-border text-text-secondary hover:border-text-secondary/30"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {/* Input de Saldo */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Saldo Atual Consolidado</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
              {data.currency === "BRL" ? "R$" : data.currency === "USD" ? "$" : "€"}
            </span>
            <input
              type="number"
              value={data.initialBalance}
              onChange={(e) => onChange({ initialBalance: e.target.value })}
              placeholder="0.00"
              className="w-full bg-surface-card border border-surface-border rounded-2xl pl-14 pr-6 py-5 text-text-primary text-lg font-medium outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Soma de todas as suas contas e carteiras atuais.
          </p>
        </div>
      </div>
    </div>
  );
}