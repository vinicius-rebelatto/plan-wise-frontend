"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isLogin, setIsLogin] = useState(mode !== "register");
  const [prevMode, setPrevMode] = useState(mode);

  // Estados dos Formulários
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Novo estado

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setErrorMessage("");
  }, [isLogin]);

  if (mode !== prevMode) {
    setPrevMode(mode);
    setIsLogin(mode !== "register");
    setErrorMessage("");
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "E-mail ou senha incorretos.");
      }

      const data = await response.json();
      document.cookie = `planwise_auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        // Tratamento específico para o HTTP 409 Conflict
        if (response.status === 409) {
          throw new Error("Uma conta com esse e-mail já existe.");
        }
        
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao criar conta. Tente novamente.");
      }

      const data = await response.json();
      document.cookie = `planwise_auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/onboarding");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen h-screen relative bg-surface-card overflow-hidden flex select-none">
      
      {/* Botão Voltar */}
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
          
          {errorMessage && isLogin && (
            <div className="mb-4 p-3 rounded-lg bg-status-out/10 border border-status-out/20 text-status-out text-sm text-center">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                tabIndex={isLogin ? 0 : -1}
                placeholder="seu@email.com" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Senha</label>
                <a href="#" tabIndex={isLogin ? 0 : -1} className="text-xs font-semibold text-brand-base hover:underline">Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                tabIndex={isLogin ? 0 : -1}
                placeholder="••••••••" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              tabIndex={isLogin ? 0 : -1}
              className="w-full flex justify-center py-4 bg-brand-base hover:bg-brand-light text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-base/20 hover:shadow-brand-base/30 disabled:opacity-50"
            >
              {isLoading ? "Acessando..." : "Entrar na Plataforma"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface-card px-4 text-text-secondary">ou</span>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary text-center">
            Não tem uma conta?{" "}
            <button tabIndex={isLogin ? 0 : -1} onClick={() => {setIsLogin(false); setErrorMessage("");}} className="text-brand-base font-bold hover:underline">
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

          {errorMessage && !isLogin && (
            <div className="mb-4 p-3 rounded-lg bg-status-out/10 border border-status-out/20 text-status-out text-sm text-center">
              {errorMessage}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Nome</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  tabIndex={!isLogin ? 0 : -1}
                  placeholder="Nome" 
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  required
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Sobrenome</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  tabIndex={!isLogin ? 0 : -1}
                  placeholder="Sobrenome" 
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                tabIndex={!isLogin ? 0 : -1}
                placeholder="seu@email.com" 
                className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                required
              />
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  tabIndex={!isLogin ? 0 : -1}
                  placeholder="••••••••" 
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Confirmar</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  tabIndex={!isLogin ? 0 : -1}
                  placeholder="••••••••" 
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              tabIndex={!isLogin ? 0 : -1}
              className="w-full flex justify-center py-4 bg-brand-base hover:bg-brand-light text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-base/20 hover:shadow-brand-base/30 disabled:opacity-50"
            >
              {isLoading ? "Registrando..." : "Concluir Cadastro"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface-card px-4 text-text-secondary">ou</span>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary text-center">
            Já possui uma conta?{" "}
            <button tabIndex={!isLogin ? 0 : -1} onClick={() => {setIsLogin(true); setErrorMessage("");}} className="text-brand-base font-bold hover:underline">
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