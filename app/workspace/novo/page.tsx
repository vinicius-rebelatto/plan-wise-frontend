"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import localFont from 'next/font/local';
import Link from "next/link";
import Image from "next/image";

const nourd = localFont({
  src: '../../../fonts/nourd_regular.ttf',
  weight: '400',
});

const TEMPLATES = [
  {
    id: "blank",
    title: "Em Branco",
    description: "Comece do zero. Nenhuma categoria ou carteira pré-configurada.",
  },
  {
    id: "personal",
    title: "Pessoal Básico",
    description: "Ideal para controle de custo de vida com categorias essenciais e carteiras comuns.",
  },
  {
    id: "freelancer",
    title: "Autônomo / MEI",
    description: "Estrutura para fluxo de caixa de serviços, recebimentos e despesas operacionais.",
  },
  {
    id: "projects",
    title: "Projetos de Software",
    description: "Otimizado para monitorar custos de infraestrutura, APIs e desenvolvimento.",
  },
];

export default function CreateWorkspacePage() {
  const router = useRouter(); // 1. Inicializa o router
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    templateId: "",
    name: "",
    description: "",
  });

  const handleNext = () => {
    if (!formData.templateId) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1); // 3. Ação que permite voltar da etapa 2 para a 1
  };

const handleFinish = async () => {
  if (!formData.name.trim()) return;
  
  setIsSubmitting(true);

  try {
    // Exemplo de como recuperar seu token (ajuste conforme sua implementação real)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('planwise_auth_token='))
      ?.split('=')[1];

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/workspaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        templateId: formData.templateId
      })
    });

    if (!response.ok) {
      throw new Error("Falha ao criar workspace");
    }

    const data = await response.json();
    console.log("Workspace criado:", data);
    
    // Navega para a visão geral após sucesso
    router.push("/dashboard");

  } catch (error) {
    console.error("Erro na criação:", error);
    alert("Erro ao criar o workspace. Tente novamente.");
  } finally {
    setIsSubmitting(false);
  }
};

  const pathname = usePathname();
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
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header Fixo */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-surface-bg border-b border-surface-border z-50 sticky top-0">
      
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/icon.png"
            alt="Plan Wise Logo"
            width={40}
            height={40}
            quality={100}
            className="h-7 w-auto object-contain"
            priority
          />
          <span className={`text-xl text-text-primary tracking-tight ${nourd.className}`}>
            Plan Wise
          </span>
        </Link>
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

      {/* Container Principal */}
      <div className="max-w-4xl w-full mx-auto pb-12 pt-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Criar ambiente de trabalho</h2>
            <p className="text-sm text-text-secondary mt-1">
              {step === 1 
                ? "Selecione um modelo de workspace para começar com as regras e categorias mais ideais para você." 
                : "Defina o nome e uma breve descrição para o seu novo ambiente de trabalho."}
            </p>
          </div>
          <button 
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => router.push("/dashboard")} // 1. Navegação para dashboard no Cancelar
          >
            Cancelar
          </button>
        </div>

        {/* Etapa 1: Seleção de Template (2. Centralizado com mx-auto max-w-3xl) */}
        {step === 1 && (
          <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <label 
                  key={template.id} 
                  className={`relative flex flex-col p-6 cursor-pointer border rounded-2xl transition-all ${
                    formData.templateId === template.id 
                      ? "bg-brand-base/5 border-brand-base" 
                      : "bg-surface-card border-surface-border hover:border-text-secondary/30"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="workspace-template" 
                    value={template.id}
                    checked={formData.templateId === template.id}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.templateId === template.id ? "border-brand-base" : "border-surface-border"
                    }`}>
                      {formData.templateId === template.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-base"></div>
                      )}
                    </div>
                    <h3 className="font-semibold text-text-primary">{template.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary ml-8">{template.description}</p>
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-border">
              <button 
                onClick={handleNext}
                disabled={!formData.templateId}
                className="px-6 py-2.5 bg-brand-base text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2: Detalhes do Workspace */}
        {step === 2 && (
          <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 bg-surface-card border border-surface-border rounded-2xl p-6 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Nome do Workspace</label>
              <input 
                type="text" 
                placeholder="Ex: Finanças Pessoais"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Descrição (Opcional)</label>
              <textarea 
                rows={3}
                placeholder="Para que servirá este workspace?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all resize-none"
              />
            </div>

            <div className="flex justify-between pt-6 mt-6 border-t border-surface-border">
              {/* 3. Botão Voltar para retornar à etapa 1 */}
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-surface-bg border border-surface-border text-text-primary rounded-lg text-sm font-bold hover:bg-surface-hover transition-all"
              >
                Voltar
              </button>
              <button 
                onClick={handleFinish}
                disabled={!formData.name.trim() || isSubmitting}
                className="px-6 py-2.5 bg-brand-base text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Criando..." : "Criar Workspace"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}