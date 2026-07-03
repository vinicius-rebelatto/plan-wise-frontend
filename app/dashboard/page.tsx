"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Brush // <-- Importação do componente de Zoom/Timeline
} from "recharts";

interface DashboardSummary {
  currentBalance: number;
  projectedEndMonthBalance: number;
  totalIncomesThisMonth: number;
  totalExpensesThisMonth: number;
  commitmentRate: number;
}

interface CashFlowProjection {
  period: string;
  incomes: number;
  expenses: number;
  accumulatedBalance: number;
}

interface TransactionDistribution {
  name: string;
  value: number;
}

const NATURE_LABELS: Record<string, string> = {
  VARIABLE_EXPENSE: "Custo Variável",
  CONTINUOUS_CONTRACT: "Contrato Fixo",
  INSTALLMENT_PLAN: "Parcelamento",
  FIXED_BUDGET: "Orçamento Fechado"
};

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowProjection[]>([]);
  const [expenseDistribution, setExpenseDistribution] = useState<TransactionDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // Controle de intervalo de tempo (6, 12, 24 meses)
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('planwise_auth_token='))
      ?.split('=')[1];
  };

  // Separei a busca geral da busca específica do gráfico para não recarregar os KPIs à toa
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${getAuthToken()}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [summaryRes, distributionRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/dashboard/summary`, { headers }),
        fetch(`${baseUrl}/api/v1/dashboard/distribution?type=EXPENSE`, { headers })
      ]);

      if (summaryRes.ok && distributionRes.ok) {
        setSummary(await summaryRes.json());
        
        const distData: TransactionDistribution[] = await distributionRes.json();
        const formattedDist = distData.map(d => ({
          ...d,
          name: NATURE_LABELS[d.name] || d.name
        }));
        setExpenseDistribution(formattedDist);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCashFlowData = useCallback(async () => {
    setIsChartLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${getAuthToken()}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const res = await fetch(`${baseUrl}/api/v1/dashboard/cash-flow?months=${projectionMonths}`, { headers });
      if (res.ok) {
        setCashFlow(await res.json());
      }
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error);
    } finally {
      setIsChartLoading(false);
    }
  }, [projectionMonths]);

  // Carrega KPIs na montagem
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Carrega Gráfico sempre que os meses mudarem
  useEffect(() => {
    fetchCashFlowData();
  }, [fetchCashFlowData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatMonth = (periodStr: string) => {
    if (!periodStr) return "";
    const [year, month] = periodStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto p-6 lg:p-10 animate-in fade-in duration-500 space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhamento e projeção estratégica do seu fluxo de caixa.</p>
      </div>

      {/* Grid de KPIs - 1 Linha com 4 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Saldo Consolidado */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Consolidado</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{formatCurrency(summary?.currentBalance ?? 0)}</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            </div>
          </div>
        </div>
        
        {/* Card 2: Projeção Fim do Mês */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${(summary?.projectedEndMonthBalance ?? 0) >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projeção Fim do Mês</p>
              <h3 className={`text-2xl font-extrabold ${(summary?.projectedEndMonthBalance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.projectedEndMonthBalance ?? 0)}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${(summary?.projectedEndMonthBalance ?? 0) >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
        </div>

        {/* Card 3: Balanço do Mês */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Movimentações do Mês</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                  {formatCurrency(summary?.totalIncomesThisMonth ?? 0)}
                </span>
                <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  {formatCurrency(summary?.totalExpensesThisMonth ?? 0)}
                </span>
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
          </div>
        </div>

        {/* Card 4: Taxa de Comprometimento */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comprometimento</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{summary?.commitmentRate?.toFixed(1) ?? 0}%</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">Receita vs Custos Fixos</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Gráfico Principal */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Projeção de Fluxo de Caixa</h3>
              <p className="text-xs text-slate-400 mt-1">Evolução do saldo ao longo do tempo</p>
            </div>
            
            {/* Seletor de Horizonte de Tempo */}
            <select
              value={projectionMonths}
              onChange={(e) => setProjectionMonths(Number(e.target.value))}
              disabled={isChartLoading}
              className="bg-slate-50 border border-slate-200 text-sm text-slate-700 font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value={6}>6 Meses</option>
              <option value={12}>12 Meses</option>
              <option value={24}>24 Meses</option>
            </select>
          </div>
          
          <div className="w-full h-[360px] relative">
            {isChartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-lg">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  tickFormatter={formatMonth}
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                  labelFormatter={formatMonth}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" verticalAlign="top" />
                
                <Bar yAxisId="left" dataKey="incomes" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar yAxisId="left" dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="accumulatedBalance" 
                  name="Saldo Acumulado" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
                {/* O componente Brush cria a linha do tempo com zoom/arraste */}
                <Brush 
                  dataKey="period" 
                  height={30} 
                  stroke="#94a3b8" 
                  fill="#f8fafc" 
                  tickFormatter={formatMonth} 
                  startIndex={0}
                  endIndex={projectionMonths <= 6 ? projectionMonths - 1 : 5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Secundário */}
        <div className="xl:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-4 text-center xl:text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Despesas por Natureza</h3>
            <p className="text-xs text-slate-400 mt-1">Distribuição do mês atual</p>
          </div>
          
          <div className="flex-1 w-full h-[300px] flex items-center justify-center relative">
            {expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '13px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center" 
                    wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 opacity-60">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p className="text-sm">Nenhuma despesa registrada.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}