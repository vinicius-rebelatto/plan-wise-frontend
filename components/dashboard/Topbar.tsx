"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mock de usuário (Substitua pela sua lógica de Auth se necessário)
  const user = { firstName: "Vinicius", lastName: "Rebelatto", photoUrl: "" };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Visão geral";
    if (pathname === "/workspace/novo") return "Novo Workspace";
    const segment = pathname.split("/").pop();
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Dashboard";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-white border-b border-surface-border z-50 sticky top-0">
      
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-text-primary">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Busca */}
        <div className="hidden md:flex relative group">
          <svg className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Buscar..." className="w-48 bg-surface-card border border-surface-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-base transition-all" />
        </div>

        {/* Notificações */}
        <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-card">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>

        {/* Menu Adicionar (OpenProject Style) */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="flex items-center gap-1 px-3 py-2 bg-brand-base text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-light transition-all"
          >
            <span className="text-lg">+</span>
            <svg className={`w-3 h-3 transition-transform ${isAddMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-card border border-surface-border rounded-xl shadow-xl py-1 z-50">
              <button onClick={() => { setIsAddMenuOpen(false); router.push("/workspace/novo"); }} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                <span className="font-bold text-brand-base">+</span> Workspace
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-hover flex items-center gap-2">
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Convidar membro
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-base flex items-center justify-center text-white font-bold text-xs shadow-inner cursor-pointer hover:opacity-90">
          {user.firstName[0]}{user.lastName[0]}
        </div>
      </div>
    </header>
  );
}