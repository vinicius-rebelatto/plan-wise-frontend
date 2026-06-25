"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isLogin, setIsLogin] = useState(mode !== "register");
  const [prevMode, setPrevMode] = useState(mode);

  if (mode !== prevMode) {
    setPrevMode(mode);
    setIsLogin(mode !== "register");
  }

  return (
    <main className="w-screen h-screen relative bg-surface-card overflow-hidden flex select-none">
      
      {/* Botão Voltar (Dinâmico conforme o fundo) */}
      <Link 
        href="/" 
        className={`group absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-500 backdrop-blur-md border ${
          isLogin 
            ? "bg-surface-bg/60 border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:shadow-sm" 
            : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20 hover:shadow-lg"
        }`}
      >
        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Voltar
      </Link>

      {/* ================= PAINEL ESQUERDO: FORMULÁRIO DE LOGIN ================= */}
      <div 
        inert={!isLogin ? true : undefined} 
        className={`absolute left-0 top-0 w-full md:w-[40%] h-full flex flex-col justify-center p-8 sm:p-12 lg:p-20 transition-all duration-700 ease-in-out z-10 ${
          isLogin 
            ? "opacity-100 visible" 
            : "md:opacity-0 md:invisible pointer-events-none"
        }`}
      >
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
            Acessar Plan Wise
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            Insira suas credenciais para acessar o motor de projeção.
          </p>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                tabIndex={isLogin ? 0 : -1}
                placeholder="seu@email.com" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Senha</label>
                <a href="#" tabIndex={isLogin ? 0 : -1} className="text-xs font-semibold text-brand-base hover:underline">Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                tabIndex={isLogin ? 0 : -1}
                placeholder="••••••••" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
              />
            </div>
            <button 
              type="submit" 
              tabIndex={isLogin ? 0 : -1}
              className="w-full py-4 bg-brand-base hover:bg-brand-light text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-base/20 hover:shadow-brand-base/30"
            >
              Entrar na Plataforma
            </button>
          </form>

          {/* Separador OAuth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface-card px-4 text-text-secondary">ou continue com</span>
            </div>
          </div>

          {/* Botão Google */}
          <button 
            type="button" 
            tabIndex={isLogin ? 0 : -1}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-surface-bg border border-surface-border hover:bg-surface-hover rounded-xl text-sm font-bold text-text-primary transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <p className="mt-8 text-sm text-text-secondary text-center">
            Não tem uma conta?{" "}
            <button tabIndex={isLogin ? 0 : -1} onClick={() => setIsLogin(false)} className="text-brand-base font-bold hover:underline">
              Registre-se
            </button>
          </p>
        </div>
      </div>

      {/* ================= PAINEL DIREITO: FORMULÁRIO DE REGISTRO ================= */}
      <div 
        inert={isLogin ? true : undefined} 
        className={`absolute right-0 top-0 w-full md:w-[40%] h-full flex flex-col justify-center p-8 sm:p-12 lg:p-20 transition-all duration-700 ease-in-out z-10 ${
          !isLogin 
            ? "opacity-100 visible" 
            : "md:opacity-0 md:invisible pointer-events-none"
        }`}
      >
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
            Criar Conta
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            Comece a projetar sua previsibilidade financeira.
          </p>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Nome Completo</label>
              <input 
                type="text" 
                tabIndex={!isLogin ? 0 : -1}
                placeholder="Seu nome" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                tabIndex={!isLogin ? 0 : -1}
                placeholder="seu@email.com" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Senha</label>
              <input 
                type="password" 
                tabIndex={!isLogin ? 0 : -1}
                placeholder="••••••••" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
              />
            </div>
            <button 
              type="submit" 
              tabIndex={!isLogin ? 0 : -1}
              className="w-full py-4 bg-brand-base hover:bg-brand-light text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-base/20 hover:shadow-brand-base/30"
            >
              Concluir Cadastro
            </button>
          </form>

          {/* Separador OAuth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface-card px-4 text-text-secondary">ou continue com</span>
            </div>
          </div>

          {/* Botão Google */}
          <button 
            type="button" 
            tabIndex={!isLogin ? 0 : -1}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-surface-bg border border-surface-border hover:bg-surface-hover rounded-xl text-sm font-bold text-text-primary transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <p className="mt-8 text-sm text-text-secondary text-center">
            Já possui uma conta?{" "}
            <button tabIndex={!isLogin ? 0 : -1} onClick={() => setIsLogin(true)} className="text-brand-base font-bold hover:underline">
              Fazer Login
            </button>
          </p>
        </div>
      </div>

      {/* ================= PAINEL DESLIZANTE VISUAL ================= */}
      <div 
        className={`hidden md:flex absolute top-0 bottom-0 w-[60%] bg-linear-to-br from-brand-base to-brand-light transition-all duration-700 ease-in-out z-20 flex-col justify-center items-center text-white p-16 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.15)] ${
          isLogin 
            ? "left-[40%] rounded-l-[40px]" 
            : "left-0 rounded-r-[40px]"
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        <div className="absolute w-125 h-125 bg-white/10 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10 text-center max-w-md flex flex-col items-center">
          <Link href="/" className="text-3xl font-black tracking-tight mb-6 hover:opacity-90 transition-opacity">
            Plan Wise
          </Link>
          
          <div className="min-h-40 flex flex-col items-center justify-center">
            {isLogin ? (
              <div className="transition-all duration-500 justify-center items-center flex flex-col">
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Novo por aqui?</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-8 text-center">
                  Crie sua conta corporativa ou pessoal e comece a rodar simulações matemáticas preditivas para o seu fluxo de caixa.
                </p>
                <button 
                  onClick={() => setIsLogin(false)} 
                  className="border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-sm"
                >
                  Criar uma conta
                </button>
              </div>
            ) : (
              <div className="transition-all duration-500 justify-center items-center flex flex-col">
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Já possui cadastro?</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-8 text-center">
                  Acesse seu ambiente de trabalho para monitorar regras de transação ativa e gerenciar permissões de membros.
                </p>
                <button 
                  onClick={() => setIsLogin(true)} 
                  className="border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-sm"
                >
                  Efetuar Login
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-16 w-full h-32 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 relative overflow-hidden flex items-end p-4 shadow-inner">
            <div className="absolute inset-x-0 top-4 flex justify-between px-4 opacity-40 text-[10px] font-mono tracking-wider">
              <span>M1 PROJECTION</span>
              <span>RUNNING</span>
            </div>
            <div className="w-full h-2/3 bg-linear-to-t from-white/20 to-transparent rounded-t-full shadow-[0_-2px_0_rgba(255,255,255,0.7)]"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center bg-surface-bg">Carregando...</div>}>
      <AuthContent />
    </Suspense>
  );
}