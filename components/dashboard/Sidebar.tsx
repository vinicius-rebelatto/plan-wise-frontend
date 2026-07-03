"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import localFont from 'next/font/local';
import { useEffect, useState } from "react";

// Ajuste o caminho src conforme o local exato do seu arquivo de fonte
const nourd = localFont({
  src: '../../fonts/nourd_regular.ttf',
  weight: '400',
});


const mainNavigation = [
  { name: "Visão geral", href: "/dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
  { name: "Planejamento", href: "/dashboard/planejamento", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
  { name: "Movimentações", href: "/dashboard/movimentacoes", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /> },
  { name: "Carteiras", href: "/dashboard/carteiras", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
];

const configNavigation = [
  { name: "Categorias", href: "/dashboard/categorias" },
  { name: "Membros", href: "/dashboard/membros" },
  { name: "Perfil", href: "/dashboard/perfil" },
  { name: "Workspace", href: "/dashboard/workspace" },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // Verifica se alguma rota de configuração está ativa para manter o menu aberto por padrão
  const isConfigActive = configNavigation.some(item => pathname === item.href);
  const [isConfigOpen, setIsConfigOpen] = useState(isConfigActive);

  useEffect(() => {
    if (isConfigActive) setIsConfigOpen(true);
  }, [pathname, isConfigActive]);

  return (
    <aside className="w-64 h-full bg-surface-card border-r border-surface-border flex flex-col relative z-20 hidden md:flex">
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/icon.png"
            alt="Finatto Logo"
            width={32}
            height={32}
            quality={100}
            className="h-7 w-auto object-contain"
            priority
          />
          <span className={`text-xl text-text-primary tracking-tight ${nourd.className}`}>
            Finatto
          </span>
        </Link>
      </div>
        
{/* Workspace Selector */}
      <div className="px-4 py-6 border-b border-surface-border/50">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-surface-bg border border-surface-border rounded-lg hover:border-text-secondary/30 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-base/20 text-brand-base flex items-center justify-center text-xs font-bold">
              B
            </div>
            <span className="text-sm font-semibold text-text-primary">Business Corp</span>
          </div>
          <svg className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
        
        {/* Main Nav */}
        <nav className="flex flex-col gap-1.5">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-brand-base/10 text-brand-base" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="w-full h-px bg-surface-border/50 my-2"></div>

        {/* Config Nav (Accordion) */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isConfigActive || isConfigOpen
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Configurações
            </div>
            <svg className={`w-4 h-4 transition-transform duration-300 ${isConfigOpen ? "rotate-180 text-brand-base" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {/* Wrapper animado para a lista */}
          <div className={`grid transition-all duration-300 ease-in-out ${isConfigOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <nav className="flex flex-col gap-1 relative pt-1">
                <div className="absolute left-[21px] top-1 bottom-3 w-px bg-surface-border z-0"></div>
                
                {configNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative z-10 flex items-center gap-3 pl-[42px] pr-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "text-brand-base bg-surface-bg/50" 
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-bg/30"
                      }`}
                    >
                      <div className={`absolute left-[19px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full ring-4 ring-surface-card transition-colors ${isActive ? "bg-brand-base" : "bg-surface-border group-hover:bg-text-secondary"}`}></div>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-surface-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-bg transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            VR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Vinicius Rebelatto</p>
            <p className="text-xs text-text-secondary truncate">Plano Pro</p>
          </div>
        </button>
      </div>

    </aside>
  );
}