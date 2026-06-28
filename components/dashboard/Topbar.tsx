"use client";

import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  
  // Lógica simples para extrair o título baseado na rota
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Visão geral";
    const segment = pathname.split("/").pop();
    if (segment) return segment.charAt(0).toUpperCase() + segment.slice(1);
    return "Dashboard";
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-surface-bg border-b border-surface-border z-10 sticky top-0">
      
      {/* Esquerda: Título da Página */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-text-primary">{getPageTitle()}</h1>
      </div>

      {/* Centro/Direita: Controles */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Input de Busca */}
        <div className="hidden md:flex relative group">
          <svg className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-brand-base transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Buscar transações, tags..." 
            className="w-64 bg-surface-card border border-surface-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <span className="text-[10px] font-mono border border-surface-border rounded px-1.5 py-0.5">Ctrl</span>
            <span className="text-[10px] font-mono border border-surface-border rounded px-1.5 py-0.5">K</span>
          </div>
        </div>

        {/* Separador Visual */}
        <div className="w-px h-6 bg-surface-border hidden md:block"></div>

        {/* Notificações */}
        <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-card">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {/* Badge ativo */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-base rounded-full ring-2 ring-surface-bg"></span>
        </button>

        {/* Ação Primária */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-brand-base/20 transition-all hover:-translate-y-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Nova Regra
        </button>
      </div>

    </header>
  );
}