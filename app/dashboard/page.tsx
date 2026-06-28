export default function DashboardOverview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-60">
      <div className="w-16 h-16 mb-4 rounded-2xl border border-surface-border bg-surface-card flex items-center justify-center text-surface-border">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Área de Trabalho</h2>
      <p className="text-sm text-text-secondary max-w-sm">
        O layout base está configurado. O conteúdo dos relatórios preditivos será renderizado aqui.
      </p>
    </div>
  );
}