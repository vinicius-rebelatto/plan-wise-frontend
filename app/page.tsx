import Link from "next/link";
import { Header } from "@/components/landing/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-bg relative selection:bg-brand-light/30">
      <Header />

      {/* Seção: Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-125 bg-brand-light/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-light/30 bg-white/60 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-brand-base shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-base opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-base"></span>
            </span>
            Motor de Projeção v1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text-primary mb-8 leading-[1.1]">
            A engenharia por trás do seu <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)]">
              futuro financeiro
            </span>.
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            Muito além de registrar gastos. O Plan-Wise projeta seu fluxo de caixa em tempo real, gerencia contratos e garante previsibilidade absoluta sobre o seu dinheiro.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/auth?mode=register"
              className="w-full sm:w-auto rounded-xl bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-base/20 transition-all hover:scale-105 hover:shadow-brand-base/40 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto rounded-xl border border-surface-border bg-white/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-text-primary transition-all hover:bg-white hover:shadow-sm"
            >
              Ver recursos
            </Link>
          </div>
        </div>

        <div className="relative mt-20 w-full max-w-6xl mx-auto z-20">
          <div className="absolute -inset-1 rounded-3xl bg-brand-light/30 blur-2xl opacity-50"></div>
          <div className="relative rounded-2xl border border-surface-border/80 bg-surface-card/90 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-surface-border bg-surface-bg/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="mx-auto h-5 w-48 rounded-md bg-surface-border/50"></div>
            </div>

            <div className="p-8 h-125 flex gap-6 bg-surface-bg">
              <div className="w-48 hidden md:flex flex-col gap-4">
                <div className="h-8 w-full rounded bg-surface-card border border-surface-border"></div>
                <div className="h-4 w-3/4 rounded bg-surface-border/50"></div>
                <div className="h-4 w-5/6 rounded bg-surface-border/50"></div>
                <div className="h-4 w-2/3 rounded bg-surface-border/50"></div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="h-24 rounded-xl bg-surface-card border border-surface-border p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-4 w-1/2 rounded bg-surface-border/60"></div>
                      <div className="h-8 w-3/4 rounded bg-status-in/80"></div>
                   </div>
                   <div className="h-24 rounded-xl bg-surface-card border border-surface-border p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-4 w-1/2 rounded bg-surface-border/60"></div>
                      <div className="h-8 w-3/4 rounded bg-status-out/80"></div>
                   </div>
                   <div className="h-24 rounded-xl bg-surface-card border border-surface-border p-4 flex flex-col justify-between shadow-sm">
                      <div className="h-4 w-1/2 rounded bg-surface-border/60"></div>
                      <div className="h-8 w-3/4 rounded bg-status-pending/80"></div>
                   </div>
                </div>

                <div className="flex-1 rounded-xl bg-surface-card border border-surface-border relative overflow-hidden flex items-end p-0 shadow-sm">
                    <div className="absolute inset-0 bg-brand-light/5"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-20">
                       <div className="border-b border-surface-border w-full"></div>
                       <div className="border-b border-surface-border w-full"></div>
                       <div className="border-b border-surface-border w-full"></div>
                       <div className="border-b border-surface-border w-full"></div>
                    </div>
                    <div className="w-full h-1/2 bg-linear-to-t from-brand-light/20 to-transparent absolute bottom-0 rounded-t-[100%] shadow-[0_-2px_0_var(--color-brand-light)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-12 top-32 hidden lg:flex flex-col gap-2 rounded-xl border border-surface-border/80 bg-white/80 backdrop-blur-xl p-4 shadow-2xl animate-[bounce_4s_infinite]">
             <div className="text-xs font-semibold text-text-secondary">Saldo Previsto</div>
             <div className="text-xl font-bold text-status-in">+ R$ 12.450,00</div>
          </div>

          <div className="absolute -right-8 bottom-32 hidden lg:flex items-center gap-3 rounded-xl border border-surface-border/80 bg-white/80 backdrop-blur-xl p-4 shadow-2xl animate-[bounce_5s_infinite_reverse]">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light/10 text-brand-base">✓</div>
             <div className="flex flex-col">
                <div className="text-xs font-semibold text-text-secondary">Contrato mensal</div>
                <div className="text-sm font-bold text-text-primary">Lançado com sucesso</div>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-surface-bg to-transparent z-30 pointer-events-none"></div>
      </section>

      {/* Seção: Sobre (Contexto do Problema) */}
      <section id="sobre" className="relative py-24 px-6 bg-surface-card border-y border-surface-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Pare de olhar pelo retrovisor.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-12">
            A maioria dos aplicativos financeiros apenas registra o que já aconteceu. O Plan-Wise muda essa lógica: utilizamos os seus contratos atuais, assinaturas e parcelamentos para simular matematicamente o seu saldo meses à frente. Antecipe cenários e tome decisões baseadas em dados consolidados.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-surface-border pt-12">
            <div>
              <div className="text-3xl font-extrabold text-brand-base mb-2">01.</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Configure o Baseline</h3>
              <p className="text-sm text-text-secondary">Insira seus saldos atuais em contas e carteiras. Este é o marco zero da projeção.</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-base mb-2">02.</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Mapeie Regras</h3>
              <p className="text-sm text-text-secondary">Cadastre entradas fixas, despesas recorrentes e pagamentos parcelados.</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-base mb-2">03.</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Projete o Futuro</h3>
              <p className="text-sm text-text-secondary">O motor calcula e gera as instâncias de movimentação de caixa automaticamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Produto (Bento Grid) */}
      <section id="produto" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">Arquitetura de Funcionalidades</h2>
            <p className="text-text-secondary text-lg">Projetado para lidar com finanças pessoais, familiares e empresariais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            
            {/* Bento Card 1 - Motor de Projeção (Destaque Largo) */}
            <div className="md:col-span-2 rounded-3xl border border-surface-border bg-surface-card p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Forecast Engine</h3>
                <p className="text-text-secondary max-w-md">Simulação algorítmica de fluxo de caixa baseada em contratos e instâncias transacionais.</p>
              </div>
              {/* Abstract Graphic */}
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-linear-to-tl from-brand-light/10 to-transparent rounded-tl-full border-t border-l border-brand-light/20 transition-transform group-hover:scale-105"></div>
            </div>

            {/* Bento Card 2 - Workspaces */}
            <div className="rounded-3xl border border-surface-border bg-surface-card p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-text-primary mb-2">Multi-Workspaces</h3>
                <p className="text-sm text-text-secondary">Alterne entre ambientes pessoais e corporativos. Controle de acesso (RBAC) via membros.</p>
              </div>
              <div className="mt-8 flex flex-col gap-2 relative z-10">
                <div className="h-8 w-full rounded bg-surface-bg border border-surface-border flex items-center px-3 text-xs text-text-primary font-medium">🏢 Business Corp</div>
                <div className="h-8 w-full rounded bg-brand-base/10 border border-brand-base/30 flex items-center px-3 text-xs text-brand-base font-bold">👤 Personal</div>
              </div>
            </div>

            {/* Bento Card 3 - Gestão de Contratos */}
            <div className="rounded-3xl border border-surface-border bg-surface-card p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Transaction Rules</h3>
                <p className="text-sm text-text-secondary">Não recrie transações. Defina regras para ocorrências únicas, mensais ou parcelamentos fixos.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface-bg border border-surface-border p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary uppercase">Tipo</span>
                  <span className="text-sm font-semibold text-text-primary">Parcelado</span>
                </div>
                <div className="rounded-lg bg-surface-bg border border-surface-border p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary uppercase">Frequência</span>
                  <span className="text-sm font-semibold text-text-primary">12x Fixas</span>
                </div>
              </div>
            </div>

            {/* Bento Card 4 - Extrato Preditivo (Destaque Largo) */}
            <div className="md:col-span-2 rounded-3xl border border-surface-border bg-[linear-gradient(135deg,var(--color-surface-card)_0%,#F1F5F9_100%)] p-8 flex items-center justify-between overflow-hidden relative">
              <div className="w-1/2 relative z-10">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Extrato Preditivo</h3>
                <p className="text-text-secondary">As instâncias (Transaction Instances) geram um calendário antecipado. Pague, cancele ou ajuste faturas com precisão atômica.</p>
              </div>
              {/* Graphic Mockup */}
              <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-1/2 rotate-[-5deg] bg-white border border-surface-border rounded-xl shadow-xl p-4 flex flex-col gap-3">
                 <div className="h-10 border-b border-surface-border flex justify-between items-center">
                    <span className="text-xs text-text-secondary">05/07/2026</span>
                    <span className="text-xs font-bold text-status-in bg-status-in-bg px-2 py-1 rounded">PAGO</span>
                 </div>
                 <div className="h-10 border-b border-surface-border flex justify-between items-center">
                    <span className="text-xs text-text-secondary">10/07/2026</span>
                    <span className="text-xs font-bold text-status-pending bg-status-pending/20 px-2 py-1 rounded">PENDENTE</span>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Seção: Pricing */}
      <section id="pricing" className="relative py-32 px-6 border-t border-surface-border overflow-hidden">
        
        {/* Efeito Blur de Fundo (Glow Roxo) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 bg-brand-light/15 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
              Previsibilidade em todos os níveis.
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Escolha a arquitetura ideal para o seu volume de dados. Assinatura mensal sem fidelidade.
            </p>
            
            {/* Toggle Mensal/Anual */}
            <div className="mt-8 inline-flex bg-surface-card border border-surface-border rounded-full p-1 relative shadow-sm">
              <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-brand-base rounded-full shadow-md"></div>
              <button className="relative z-10 px-6 py-2 text-sm font-medium text-white w-32 transition-colors">Mensal</button>
              <button className="relative z-10 px-6 py-2 text-sm font-medium text-text-secondary w-32 transition-colors hover:text-text-primary">Anual (-20%)</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Plano: Individual */}
            <div className="group rounded-3xl bg-surface-card border border-surface-border p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-brand-light/30 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-text-primary mb-2">Individual</h3>
              <p className="text-sm text-text-secondary mb-6 h-10">Controle de caixa base para finanças pessoais.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">Grátis</span>
              </div>
              <Link href="/auth?mode=register" className="block w-full py-3 px-4 bg-surface-bg border border-surface-border rounded-xl text-center font-semibold text-text-primary transition-all duration-300 group-hover:bg-brand-base group-hover:text-white group-hover:border-brand-base group-hover:shadow-lg mb-8">
                Começar agora
              </Link>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  1 Workspace Pessoal
                </li>
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Motor de Projeção (Até 6 meses)
                </li>
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Regras de Transação Ilimitadas
                </li>
                <li className="flex gap-3 items-center opacity-40 grayscale">
                  <div className="p-1 rounded-full bg-surface-border text-text-secondary">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  Sem suporte a Membros
                </li>
              </ul>
            </div>

            {/* Plano: Familiar (Destaque Central) */}
            <div className="relative rounded-3xl p-0.5 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] shadow-2xl shadow-brand-base/20 md:scale-105 z-20 transition-transform duration-500 hover:scale-[1.08]">
              {/* Badge Recomendado */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg z-30">
                Recomendado
              </div>
              
              {/* Corpo do Card */}
              <div className="bg-surface-card rounded-[22px] p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-xl font-semibold text-text-primary mb-2 relative z-10">Familiar</h3>
                <p className="text-sm text-text-secondary mb-6 h-10 relative z-10">Gestão colaborativa para residências e casais.</p>
                <div className="mb-6 flex items-baseline gap-1 relative z-10">
                  <span className="text-4xl font-extrabold text-text-primary">R$ 29</span>
                  <span className="text-sm text-text-secondary font-medium">/mês</span>
                </div>
                <Link href="/auth?mode=register" className="relative z-10 block w-full py-3 px-4 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] rounded-xl text-center font-bold text-white transition-all hover:shadow-lg hover:shadow-brand-base/40 mb-8">
                  Assinar Familiar
                </Link>
                <ul className="space-y-4 text-sm text-text-primary font-medium relative z-10">
                  <li className="flex gap-3 items-center">
                    <div className="p-1 rounded-full bg-brand-base text-white shadow-sm">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    Até 3 Workspaces Familiares
                  </li>
                  <li className="flex gap-3 items-center">
                    <div className="p-1 rounded-full bg-brand-base text-white shadow-sm">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    Até 5 Membros por Workspace
                  </li>
                  <li className="flex gap-3 items-center">
                    <div className="p-1 rounded-full bg-brand-base text-white shadow-sm">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    Motor de Projeção (Até 24 meses)
                  </li>
                  <li className="flex gap-3 items-center">
                    <div className="p-1 rounded-full bg-brand-base text-white shadow-sm">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    Controle de Permissões (RBAC)
                  </li>
                </ul>
              </div>
            </div>

            {/* Plano: Empresarial */}
            <div className="group rounded-3xl bg-surface-card border border-surface-border p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-brand-light/30 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-text-primary mb-2">Empresarial</h3>
              <p className="text-sm text-text-secondary mb-6 h-10">Controle financeiro avançado para PMEs.</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-text-primary">R$ 89</span>
                <span className="text-sm text-text-secondary font-medium">/mês</span>
              </div>
              <Link href="/auth?mode=register" className="block w-full py-3 px-4 bg-surface-bg border border-surface-border rounded-xl text-center font-semibold text-text-primary transition-all duration-300 group-hover:bg-brand-base group-hover:text-white group-hover:border-brand-base group-hover:shadow-lg mb-8">
                Assinar Empresarial
              </Link>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Workspaces Empresariais Ilimitados
                </li>
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Membros Ilimitados
                </li>
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Motor de Projeção Infinito
                </li>
                <li className="flex gap-3 items-center">
                  <div className="p-1 rounded-full bg-brand-light/10 text-brand-base">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Exportação de Dados e API
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Seção: Contato */}
      <section id="contato" className="relative py-32 px-6 bg-surface-bg border-t border-surface-border overflow-hidden">
        
        {/* Efeito Blur de Fundo */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-150 h-150 bg-brand-light/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Lado Esquerdo: Textos e Informações */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-4 py-1.5 text-sm font-medium text-text-primary shadow-sm">
              <svg className="w-4 h-4 text-brand-base" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              Suporte Dedicado
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
              Pronto para transformar sua gestão?
            </h2>
            
            <p className="text-lg text-text-secondary mb-10 leading-relaxed max-w-md">
              Seja para dúvidas técnicas sobre a integração de contratos ou para alinhar planos empresariais, nossa equipe está à disposição para ajudar.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-card border border-surface-border shadow-sm">
                  <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">Email direto</p>
                  <p className="text-base font-semibold text-text-primary">contato@plan-wise.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário de Contato */}
          <div className="relative">
            {/* Sombra em gradiente projetada atrás do formulário */}
            <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-xl opacity-20 transform rotate-1 scale-105"></div>

            <form className="relative bg-surface-card border border-surface-border rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium text-text-primary block">Nome completo</label>
                  <input 
                    type="text" 
                    id="nome" 
                    placeholder="Seu nome" 
                    className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-text-primary block">Email corporativo</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="seu@email.com" 
                    className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label htmlFor="assunto" className="text-sm font-medium text-text-primary block">Assunto</label>
                <select 
                  id="assunto" 
                  defaultValue=""
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecione o motivo do contato</option>
                  <option value="duvida">Dúvida técnica</option>
                  <option value="planos">Planos empresariais</option>
                  <option value="parceria">Parcerias</option>
                </select>
              </div>

              <div className="space-y-2 mb-8">
                <label htmlFor="mensagem" className="text-sm font-medium text-text-primary block">Sua mensagem</label>
                <textarea 
                  id="mensagem" 
                  rows={4} 
                  placeholder="Como podemos ajudar?" 
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-base/50 focus:border-brand-base transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="button" 
                className="w-full py-4 bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] rounded-xl text-white font-bold transition-all hover:shadow-lg hover:shadow-brand-base/40 hover:-translate-y-0.5 flex justify-center items-center gap-2"
              >
                Enviar Mensagem
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
          
        </div>
      </section>

      {/* Footer Simplificado */}
      <footer className="bg-surface-bg border-t border-surface-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Esquerda: Logo e Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary tracking-tight">Plan Wise</span>
            </Link>
            <span className="hidden md:block text-text-secondary/30">|</span>
            <span className="text-sm text-text-secondary">
              © {new Date().getFullYear()} Plan Wise. Todos os direitos reservados.
            </span>
          </div>

          {/* Centro: Links de Navegação */}
          <nav className="flex items-center gap-6">
            <Link href="/termos" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Termos</Link>
            <Link href="/privacidade" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Privacidade</Link>
            <Link href="#contato" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Contato</Link>
          </nav>

          {/* Direita: Redes Sociais */}
          <div className="flex items-center gap-5 text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="hover:text-text-primary transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="#" className="hover:text-text-primary transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
          
        </div>
      </footer>

    </main>
  );
}