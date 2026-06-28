export default function StepName({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="max-w-2xl">
      <span className="text-brand-base font-bold text-[11px] tracking-[0.2em] uppercase mb-8 block">
        Identidade
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.1] mb-4 tracking-tight">
        Como você quer ser <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)]">chamado(a)</span>?
      </h1>
      <p className="text-text-secondary text-lg mb-12 leading-relaxed">
        Este será o nome associado ao seu Workspace principal e relatórios preditivos.
      </p>

      <div className="relative group max-w-lg">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite seu nome ou apelido"
          className="w-full bg-surface-card border border-surface-border rounded-2xl px-6 py-5 text-text-primary outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all shadow-sm"
          autoFocus
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-brand-base/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  );
}