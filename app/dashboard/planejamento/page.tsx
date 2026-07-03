"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface Scenario {
  id: string;
  name: string;
  description: string;
}

interface CashFlowProjection {
  period: string;
  incomes: number;
  expenses: number;
  accumulatedBalance: number;
}

interface Wallet {
  id: string;
  name: string;
}

// Interface adicionada para a tabela de simulações
interface TransactionRule {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  nature: string;
  frequency: string;
  estimatedValue: number;
}

export default function PlanningPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  
  const [baseProjection, setBaseProjection] = useState<CashFlowProjection[]>([]);
  const [scenarioProjection, setScenarioProjection] = useState<CashFlowProjection[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // Modais
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scenarioRules, setScenarioRules] = useState<TransactionRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);

  // Formulários
  const [scenarioForm, setScenarioForm] = useState({ name: "", description: "" });
  const [txForm, setTxForm] = useState({
    title: "",
    type: "EXPENSE",
    nature: "INSTALLMENT_PLAN",
    frequency: "MONTHLY",
    totalInstallments: 12,
    amount: "",
    totalValue: "",
    startDate: new Date().toISOString().split("T")[0],
    walletId: ""
  });

  // Estados de Edição/Deleção de Cenário
  const [isEditScenarioModalOpen, setIsEditScenarioModalOpen] = useState(false);
  const [isDeleteScenarioModalOpen, setIsDeleteScenarioModalOpen] = useState(false);
  const [targetScenarioId, setTargetScenarioId] = useState<string | null>(null);

  // Estados de Edição/Deleção de Regra
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [isDeleteRuleModalOpen, setIsDeleteRuleModalOpen] = useState(false);
  const [targetRuleId, setTargetRuleId] = useState<string | null>(null);
  
  // O DTO do backend para RuleUpdate geralmente recebe title e amount
  const [editRuleForm, setEditRuleForm] = useState({ title: "", amount: "" });

  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('planwise_auth_token='))
      ?.split('=')[1];
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAuthToken()}`
  });

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const userRes = await fetch(`${baseUrl}/api/v1/users/me`, { headers: getHeaders() });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.workspaceId) {
          const walletsRes = await fetch(`${baseUrl}/api/v1/wallets/workspace/${userData.workspaceId}`, { headers: getHeaders() });
          if (walletsRes.ok) {
            const wData = await walletsRes.json();
            setWallets(wData);
            if (wData.length > 0) setTxForm(prev => ({ ...prev, walletId: wData[0].id }));
          }
        }
      }

      const scRes = await fetch(`${baseUrl}/api/v1/planning/scenarios`, { headers: getHeaders() });
      if (scRes.ok) {
        const scData = await scRes.json();
        setScenarios(scData);
        if (scData.length > 0) {
          setActiveScenarioId(scData[0].id);
        }
      }
    } catch (error) {
      console.error("Erro na carga inicial:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjections = useCallback(async () => {
    setIsChartLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const baseRes = await fetch(`${baseUrl}/api/v1/dashboard/cash-flow?months=${projectionMonths}`, { headers: getHeaders() });
      let baseData: CashFlowProjection[] = [];
      if (baseRes.ok) baseData = await baseRes.json();
      setBaseProjection(baseData);

      let scData: CashFlowProjection[] = [];
      if (activeScenarioId) {
        const scRes = await fetch(`${baseUrl}/api/v1/planning/scenarios/${activeScenarioId}/projection?months=${projectionMonths}`, { headers: getHeaders() });
        if (scRes.ok) scData = await scRes.json();
        setScenarioProjection(scData);
      } else {
        setScenarioProjection([]);
      }

      // 3. Mescla os dados para as 3 linhas (Soma de Matrizes)
      const merged = baseData.map(baseItem => {
        const scItem = scData.find(s => s.period === baseItem.period);
        
        const realBalance = baseItem.accumulatedBalance || 0;
        const simOnly = scItem ? scItem.accumulatedBalance : 0;
        const consolidated = realBalance + simOnly;
        
        return {
          period: baseItem.period,
          baseBalance: realBalance,          // Linha 1: Real (-12, -24...)
          simulationOnly: simOnly,           // Linha 2: Simulação (5, 10...)
          consolidatedBalance: consolidated  // Linha 3: Consolidado (-7, -14...)
        };
      });
      setMergedData(merged);

    } catch (error) {
      console.error("Erro ao buscar projeções:", error);
    } finally {
      setIsChartLoading(false);
    }
  }, [activeScenarioId, projectionMonths]);

  // Transformado em useCallback para evitar loops no useEffect
  const fetchScenarioRules = useCallback(async (scenarioId: string) => {
    setIsLoadingRules(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/scenario/${scenarioId}`, {
            headers: { "Authorization": `Bearer ${getAuthToken()}` }
        });
        if (res.ok) {
            setScenarioRules(await res.json());
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingRules(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);
  useEffect(() => { fetchProjections(); }, [fetchProjections]);
  
  // Gatilho automático para buscar a tabela quando o cenário mudar
  useEffect(() => {
    if (activeScenarioId) {
      fetchScenarioRules(activeScenarioId);
    }
  }, [activeScenarioId, fetchScenarioRules]);

  // Limpa os dados visuais imediatamente ao trocar de cenário para evitar vazamento visual
  useEffect(() => {
    setScenarioRules([]);
    setScenarioProjection([]);
    setMergedData([]);
  }, [activeScenarioId]);

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning/scenarios`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify(scenarioForm)
      });
      if (res.ok) {
        const newScen = await res.json();
        setScenarios([...scenarios, newScen]);
        setActiveScenarioId(newScen.id);
        setIsScenarioModalOpen(false);
        setScenarioForm({ name: "", description: "" });
      }
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  const handleCreateHypotheticalTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScenarioId) return;
    setIsSubmitting(true);
    try {
      const isFixedTerm = txForm.nature === "INSTALLMENT_PLAN";
      const payload = {
        ...txForm,
        amount: parseFloat(txForm.amount),
        totalInstallments: isFixedTerm ? txForm.totalInstallments : null,
        scenarioId: activeScenarioId
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsTxModalOpen(false);
        fetchProjections(); // Recarrega o gráfico
        fetchScenarioRules(activeScenarioId); // Recarrega a tabela de regras
        setTxForm(prev => ({ ...prev, title: "", amount: "" }));
      }
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  // Funções temporárias para ações na tabela
  const deleteSimulationRule = async (ruleId: string) => {
    if(!confirm("Deseja remover esta simulação do cenário?")) return;
    // Implementar a chamada para api/v1/transactions/rules/{ruleId}
  };

  const openModalForEditSimulation = (rule: TransactionRule) => {
    // Implementar lógica para abrir modal de edição
  };

  // --- AÇÕES DE CENÁRIO ---
  const handleUpdateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScenarioId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning/scenarios/${targetScenarioId}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify(scenarioForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setScenarios(scenarios.map(s => s.id === targetScenarioId ? updated : s));
        setIsEditScenarioModalOpen(false);
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleDeleteScenario = async () => {
    if (!targetScenarioId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/planning/scenarios/${targetScenarioId}`, {
        method: "DELETE", headers: getHeaders()
      });
      if (res.ok) {
        setScenarios(scenarios.filter(s => s.id !== targetScenarioId));
        if (activeScenarioId === targetScenarioId) setActiveScenarioId(null);
        setIsDeleteScenarioModalOpen(false);
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const openEditScenarioModal = (sc: Scenario) => {
    setTargetScenarioId(sc.id);
    setScenarioForm({ name: sc.name, description: sc.description });
    setIsEditScenarioModalOpen(true);
  };

  // --- AÇÕES DE REGRAS DA SIMULAÇÃO ---
  const handleDeleteRule = async () => {
    if (!targetRuleId || !activeScenarioId) return;
    setIsSubmitting(true);
    try {
      // Usa o endpoint de cancelar regra para remover todas as instâncias e a regra
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/${targetRuleId}/cancel`, {
        method: "DELETE", headers: getHeaders()
      });
      if (res.ok) {
        setIsDeleteRuleModalOpen(false);
        fetchScenarioRules(activeScenarioId);
        fetchProjections();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRuleId || !activeScenarioId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/${targetRuleId}`, {
        method: "PUT", headers: getHeaders(), 
        body: JSON.stringify({ title: editRuleForm.title, amount: parseFloat(editRuleForm.amount) })
      });
      if (res.ok) {
        setIsEditRuleModalOpen(false);
        fetchScenarioRules(activeScenarioId);
        fetchProjections();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const openEditRuleModal = (rule: TransactionRule) => {
    setTargetRuleId(rule.id);
    setEditRuleForm({ title: rule.title, amount: rule.estimatedValue.toString() });
    setIsEditRuleModalOpen(true);
  };

  // --- Formatadores ---
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const handleAmountChange = (val: string) => {
    const amt = parseFloat(val) || 0;
    const inst = txForm.totalInstallments || 1;
    setTxForm(prev => ({ ...prev, amount: val, totalValue: (amt * inst).toFixed(2) }));
  };

  const handleTotalValueChange = (val: string) => {
    const total = parseFloat(val) || 0;
    const inst = txForm.totalInstallments || 1;
    setTxForm(prev => ({ ...prev, totalValue: val, amount: (total / inst).toFixed(2) }));
  };

  const handleInstallmentsChange = (val: string) => {
    const inst = parseInt(val) || 1;
    // Quando o número de parcelas muda, mantemos o valor total travado e recalculamos a parcela
    const total = parseFloat(txForm.totalValue) || 0;
    setTxForm(prev => ({ 
      ...prev, 
      totalInstallments: inst, 
      amount: total > 0 ? (total / inst).toFixed(2) : prev.amount 
    }));
  };

  const handleFrequencyChange = (val: string) => {
    setTxForm(prev => {
      const isOnce = val === "ONCE";
      const inst = isOnce ? 1 : (prev.totalInstallments === 1 ? 12 : prev.totalInstallments);
      const total = parseFloat(prev.totalValue) || 0;
      
      return {
        ...prev,
        frequency: val,
        totalInstallments: inst,
        amount: total > 0 ? (total / inst).toFixed(2) : prev.amount
      };
    });
  };

  const handleNatureChange = (val: string) => {
    setTxForm(prev => {
      // Se mudar para contrato contínuo e estiver "Única", força para Mensal
      const newFreq = (val === "CONTINUOUS_CONTRACT" && prev.frequency === "ONCE") ? "MONTHLY" : prev.frequency;
      return {
        ...prev, 
        nature: val,
        amount: "",
        totalValue: "",
        totalInstallments: val === "CONTINUOUS_CONTRACT" ? 1 : (newFreq === "ONCE" ? 1 : 12),
        frequency: newFreq
      };
    });
  };

  return (
    <div className="max-w-[1400px] w-full mx-auto p-6 lg:p-10 animate-in fade-in duration-500 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Simulação de Cenários</h1>
          <p className="text-sm text-slate-500 mt-1">Crie cenários hipotéticos ("E se?") e compare o impacto no fluxo de caixa.</p>
        </div>
        <button 
          onClick={() => setIsScenarioModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-colors shrink-0"
        >
          + Novo Cenário
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Painel Lateral: Lista de Cenários */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-4 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seus Cenários</h3>
          {scenarios.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Nenhum cenário criado.</p>
          ) : (
            scenarios.map(sc => (
              <div key={sc.id} className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold transition-colors group ${
                  activeScenarioId === sc.id ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}>
                <button onClick={() => setActiveScenarioId(sc.id)} className="flex-1 text-left py-1 truncate">
                  {sc.name}
                </button>
                <button 
                  onClick={() => { setTargetScenarioId(sc.id); setIsDeleteScenarioModalOpen(true); }} 
                  className={`ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 ${activeScenarioId === sc.id && 'opacity-100'}`}
                  title="Excluir Cenário"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Painel Principal: Mesclado e Corrigido */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          {!activeScenarioId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-80 min-h-[400px]">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p>Selecione um cenário ao lado ou crie um novo.</p>
            </div>
          ) : (
            <>
              {/* Header do Cenário */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800">{activeScenario?.name}</h2>
                    <button onClick={() => openEditScenarioModal(activeScenario!)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Editar Cenário">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{activeScenario?.description || 'Sem descrição.'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={projectionMonths}
                    onChange={(e) => setProjectionMonths(Number(e.target.value))}
                    disabled={isChartLoading}
                    className="bg-slate-50 border border-slate-200 text-sm text-slate-700 font-bold rounded-lg px-3 py-2 outline-none"
                  >
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses</option>
                    <option value={24}>24 Meses</option>
                  </select>
                  <button 
                    onClick={() => setIsTxModalOpen(true)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    + Adicionar Simulação
                  </button>
                </div>
              </div>

              {/* Gráfico */}
              <div className="w-full h-[400px] relative mb-10 border-b border-slate-100 pb-8">
                {isChartLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" tickFormatter={formatMonth} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={formatMonth}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'baseBalance' ? 'Projeção Real' : 
                        name === 'simulationOnly' ? 'Apenas Simulação' : 'Consolidado'
                      ]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
                    
                    {/* Linha 1: Real (Tracejada, cor neutra) */}
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="baseBalance" 
                      name="Projeção Real" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    
                    {/* Linha 2: Simulação Isolada (Sólida, cor secundária) */}
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="simulationOnly" 
                      name="Apenas Simulação" 
                      stroke="#f59e0b" // Cor âmbar/laranja para diferenciar
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />

                    {/* Linha 3: Consolidado (Sólida, mais grossa, cor principal) */}
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="consolidatedBalance" 
                      name="Consolidado" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Tabela de Regras do Cenário */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Regras do Pacote de Simulação</h3>
                {isLoadingRules ? (
                  <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : scenarioRules.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-sm text-slate-500">Nenhuma regra configurada neste pacote.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 font-bold text-slate-700">Descrição da Simulação</th>
                          <th className="px-6 py-3 font-bold text-slate-700">Tipo</th>
                          <th className="px-6 py-3 font-bold text-slate-700">Frequência</th>
                          <th className="px-6 py-3 font-bold text-slate-700 text-right">Valor Projetado</th>
                          <th className="px-6 py-3 font-bold text-slate-700 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scenarioRules.map(rule => (
                          <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{rule.title}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${rule.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {rule.type === 'INCOME' ? 'Receita' : 'Despesa'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">
                              {rule.frequency === 'MONTHLY' ? 'Mensal' : rule.frequency === 'ANNUALLY' ? 'Anual' : 'Única'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                              {formatCurrency(rule.estimatedValue)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => openEditRuleModal(rule)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">Editar</button>
                                <button onClick={() => { setTargetRuleId(rule.id); setIsDeleteRuleModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">Excluir</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Novo Cenário */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Criar Cenário</h3>
              <button onClick={() => setIsScenarioModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleCreateScenario} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome da Simulação</label>
                <input required type="text" placeholder="Ex: Financiamento do Carro" value={scenarioForm.name} onChange={e => setScenarioForm({...scenarioForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Opcional)</label>
                <input type="text" value={scenarioForm.description} onChange={e => setScenarioForm({...scenarioForm, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 mt-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                Salvar Cenário
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cenário */}
      {isEditScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Editar Cenário</h3>
              <button onClick={() => setIsEditScenarioModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleUpdateScenario} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome da Simulação</label>
                <input required type="text" value={scenarioForm.name} onChange={e => setScenarioForm({...scenarioForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Opcional)</label>
                <input type="text" value={scenarioForm.description} onChange={e => setScenarioForm({...scenarioForm, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 mt-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Cenário */}
      {isDeleteScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Cenário?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação apagará permanentemente o cenário e todas as regras de simulação dentro dele. Não pode ser desfeita.</p>
            <div className="flex w-full gap-3">
              <button onClick={() => setIsDeleteScenarioModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleDeleteScenario} disabled={isSubmitting} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Regra */}
      {isEditRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Editar Simulação</h3>
              <button onClick={() => setIsEditRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleUpdateRule} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <input required type="text" value={editRuleForm.title} onChange={e => setEditRuleForm({...editRuleForm, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Valor Projetado</label>
                <input required type="number" step="0.01" value={editRuleForm.amount} onChange={e => setEditRuleForm({...editRuleForm, amount: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 mt-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Regra */}
      {isDeleteRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remover Simulação?</h3>
            <p className="text-sm text-slate-500 mb-6">A regra será retirada do seu pacote e o gráfico será recalculado automaticamente.</p>
            <div className="flex w-full gap-3">
              <button onClick={() => setIsDeleteRuleModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleDeleteRule} disabled={isSubmitting} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Transação Hipotética */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Nova Regra de Simulação</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateHypotheticalTx} className="p-6 space-y-5">
              {/* Linha 1: Tipo e Natureza */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                    <select value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-bold bg-white focus:border-indigo-500">
                      <option value="EXPENSE">Despesa</option>
                      <option value="INCOME">Receita</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Natureza</label>
                    <select value={txForm.nature} onChange={e => handleNatureChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                      <option value="INSTALLMENT_PLAN">Possui prazo final</option>
                      <option value="CONTINUOUS_CONTRACT">Não possui prazo final</option>
                    </select>
                </div>
              </div>
              
              {/* Linha 2: Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <input required type="text" placeholder="Ex: Contrato de Servidor, Projeção de Vendas..." value={txForm.title} onChange={e => setTxForm({...txForm, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>

              {/* Linha 3: Recorrência e Parcela/Valor Dinâmico */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Recorrência</label>
                    <select value={txForm.frequency} onChange={e => handleFrequencyChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                      {txForm.nature === "INSTALLMENT_PLAN" && <option value="ONCE">Única vez</option>}
                      <option value="MONTHLY">Mensal</option>
                      <option value="ANNUALLY">Anual</option>
                    </select>
                </div>

                {txForm.nature === "INSTALLMENT_PLAN" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nº de Parcelas</label>
                    <input required type="number" min="1" value={txForm.totalInstallments} onChange={e => handleInstallmentsChange(e.target.value)} disabled={txForm.frequency === 'ONCE'} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor da Ocorrência</label>
                    <input required type="number" step="0.01" value={txForm.amount} onChange={e => handleAmountChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                )}
              </div>

              {/* Linha 4 (Condicional): Valores Financeiros quando tem prazo */}
              {txForm.nature === "INSTALLMENT_PLAN" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor da Parcela</label>
                    <input required type="number" step="0.01" value={txForm.amount} onChange={e => handleAmountChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor Total</label>
                    <input required type="number" step="0.01" value={txForm.totalValue} onChange={e => handleTotalValueChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                </div>
              )}

              {/* Linha 5: Data e Carteira */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data Base Inicial</label>
                  <input required type="date" value={txForm.startDate} onChange={e => setTxForm({...txForm, startDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Carteira Simulada</label>
                  <select required value={txForm.walletId} onChange={e => setTxForm({...txForm, walletId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                    <option value="" disabled>Selecione...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                  {isSubmitting ? "Processando..." : "Adicionar Simulação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}