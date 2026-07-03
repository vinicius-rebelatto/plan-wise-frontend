"use client";

import { useState, useEffect, useCallback } from "react";

interface Wallet {
  id: string;
  name: string;
}

interface TransactionInstance {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  dueDate: string;
  status: string;
  installmentNumber: number;
  totalInstallments: number;
  walletName: string;
}

interface TransactionRule {
  id: string;
  title: string;
  type: "INCOME" | "EXPENSE";
  nature: string;
  frequency: string;
  totalInstallments: number | null;
  estimatedValue: number;
  totalValue: number | null;
  startDate: string;
}

type RulesSortKey = "title" | "startDate" | "estimatedValue";
type SortDirection = "asc" | "desc";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"RULES" | "INSTANCES">("RULES");
  
  const [transactions, setTransactions] = useState<TransactionInstance[]>([]);
  const [rules, setRules] = useState<TransactionRule[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de Múltipla Seleção
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  // Controles de Ordenação da Tabela de Regras
  const [rulesSortKey, setRulesSortKey] = useState<RulesSortKey>("startDate");
  const [rulesSortDir, setRulesSortDir] = useState<SortDirection>("desc");

  // Controles de Paginação e Filtros para Instâncias
  const [txPage, setTxPage] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRuleFilter, setActiveRuleFilter] = useState<{id: string, name: string} | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("upcoming");

  // Controles de Paginação para Regras
  const [rulesPage, setRulesPage] = useState(0);
  const [rulesTotalPages, setRulesTotalPages] = useState(1);
  
  // Controle de Modais de Confirmação Customizados (Substitutos do alert/confirm)
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [ruleToCancel, setRuleToCancel] = useState<string | null>(null);
  const [isBulkTxDeleteOpen, setIsBulkTxDeleteOpen] = useState(false);
  const [isBulkRuleCancelOpen, setIsBulkRuleCancelOpen] = useState(false);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Formulários e Modais de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRuleEditModalOpen, setIsRuleEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionInstance | null>(null);
  const [editingRule, setEditingRule] = useState<TransactionRule | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "EXPENSE",
    nature: "INSTALLMENT_PLAN",
    frequency: "MONTHLY",
    totalInstallments: 12,
    amount: "",
    totalValue: "", // Propriedade necessária para o cálculo bidirecional
    startDate: new Date().toISOString().split("T")[0],
    walletId: ""
  });

  const [ruleEditData, setRuleEditData] = useState({ title: "", amount: "" });

  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('planwise_auth_token='))?.split('=')[1];
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAuthToken()}`
  });

  const fetchWallets = useCallback(async (currentWorkspaceId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets/workspace/${currentWorkspaceId}`, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setWallets(data);
        if (data.length > 0 && !formData.walletId) {
          setFormData(prev => ({ ...prev, walletId: data[0].id }));
        }
      }
    } catch (e) { console.error(e); }
  }, [formData.walletId]);

  const fetchTransactions = useCallback(async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions?page=${txPage}&size=10`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (activeRuleFilter) url += `&ruleId=${activeRuleFilter.id}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;

      const today = new Date().toISOString().split("T")[0];
      if (sortOption === "upcoming") {
        url += `&startDate=${today}&sortBy=dueDate&sortDir=asc`;
      } else if (sortOption === "recent") {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        url += `&endDate=${yesterday.toISOString().split("T")[0]}&sortBy=dueDate&sortDir=desc`;
      } else {
        const [sortBy, sortDir] = sortOption.split(",");
        url += `&sortBy=${sortBy}&sortDir=${sortDir}`;
      }

      const res = await fetch(url, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (res.ok) {
        const pageData = await res.json();
        setTransactions(pageData.content);
        setTxTotalPages(pageData.totalPages);
        setSelectedTxIds([]); // Reseta seleção ao mudar dados/página
      }
    } catch (e) { console.error(e); }
  }, [txPage, searchTerm, activeRuleFilter, sortOption, statusFilter]);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules?page=${rulesPage}&size=10`, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (res.ok) {
        const pageData = await res.json();
        setRules(pageData.content);
        setRulesTotalPages(pageData.totalPages);
        setSelectedRuleIds([]); // Reseta seleção ao mudar página
      }
    } catch (e) { console.error(e); }
  }, [rulesPage]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        headers: { "Authorization": `Bearer ${getAuthToken()}` }
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.workspaceId) {
          setWorkspaceId(profileData.workspaceId);
          await fetchWallets(profileData.workspaceId);
        }
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, [fetchWallets]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);
  useEffect(() => { if (workspaceId) fetchTransactions(); }, [workspaceId, fetchTransactions, txPage, activeRuleFilter, sortOption, statusFilter]);
  
// 1. Efeito para buscar transações quando filtros ou página mudam
useEffect(() => { 
  if (workspaceId) {
    fetchTransactions();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [workspaceId, txPage, activeRuleFilter, sortOption, statusFilter]);

// 2. Efeito específico para busca (Debounce)
useEffect(() => {
  if (!workspaceId) return;
  
  const timer = setTimeout(() => { 
    setTxPage(0); 
    fetchTransactions(); 
  }, 500);
  
  return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, workspaceId]); 

// 3. Efeito para carregar regras
useEffect(() => {
  if (workspaceId) fetchRules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [workspaceId, rulesPage]);

  // Limpa seleções ao alternar abas
  useEffect(() => {
    setSelectedTxIds([]);
    setSelectedRuleIds([]);
  }, [activeTab]);

  // Lógica de Seleção de Elementos (Checkboxes)
  const handleSelectTx = (id: string) => {
    setSelectedTxIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllTxs = () => {
    if (selectedTxIds.length === transactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(transactions.map(t => t.id));
    }
  };

  const handleSelectRule = (id: string) => {
    setSelectedRuleIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllRules = () => {
    const currentSortedRules = getSortedRules();
    if (selectedRuleIds.length === currentSortedRules.length) {
      setSelectedRuleIds([]);
    } else {
      setSelectedRuleIds(currentSortedRules.map(r => r.id));
    }
  };

  const handleRulesSort = (key: RulesSortKey) => {
    if (rulesSortKey === key) {
      setRulesSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setRulesSortKey(key);
      setRulesSortDir("asc");
    }
  };

  const getSortedRules = () => {
    return [...rules].sort((a, b) => {
      let valA = a[rulesSortKey];
      let valB = b[rulesSortKey];
      if (typeof valA === "string" && typeof valB === "string") {
        return rulesSortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = valA ?? 0; valB = valB ?? 0;
      return rulesSortDir === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  };

  const viewTransactionsForRule = (rule: TransactionRule) => {
    setActiveRuleFilter({ id: rule.id, name: rule.title });
    setSortOption("dueDate,asc");
    setTxPage(0);
    setActiveTab("INSTANCES");
  };

  // Execuções de Exclusão e Cancelamento individuais e em lote
  const confirmDeleteInstance = async () => {
    if (!txToDelete) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/${txToDelete}`, { method: "DELETE", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (response.ok) fetchTransactions();
    } catch (error) { console.error(error); } finally { setTxToDelete(null); }
  };

  const confirmBulkDeleteInstances = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/bulk-delete`, {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify(selectedTxIds)
      });
      if (response.ok) { fetchTransactions(); setSelectedTxIds([]); }
    } catch (error) { console.error(error); } finally { setIsBulkTxDeleteOpen(false); }
  };

  const confirmCancelRule = async () => {
    if (!ruleToCancel) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/${ruleToCancel}/cancel`, { method: "DELETE", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (response.ok) { fetchRules(); fetchTransactions(); }
    } catch (error) { console.error(error); } finally { setRuleToCancel(null); }
  };

  const confirmBulkCancelRules = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/bulk-cancel`, {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify(selectedRuleIds)
      });
      if (response.ok) { fetchRules(); fetchTransactions(); setSelectedRuleIds([]); }
    } catch (error) { console.error(error); } finally { setIsBulkRuleCancelOpen(false); }
  };

  // Controle de Alteração de Status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/${id}/status?status=${newStatus}`, { method: "PATCH", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      if (response.ok) fetchTransactions();
    } catch (error) { console.error(error); }
  };

  const openModalForCreate = () => {
    setEditingTransaction(null);
    setFormData({
      title: "", type: "EXPENSE", nature: "CONTINUOUS_CONTRACT", frequency: "MONTHLY",
      totalInstallments: 1, amount: "", totalAmount: "", installmentAmount: "",
      startDate: new Date().toISOString().split("T")[0], walletId: wallets.length > 0 ? wallets[0].id : ""
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (tx: TransactionInstance) => {
    setEditingTransaction(tx);
    const matchedWalletId = wallets.find(w => w.name === tx.walletName)?.id || (wallets.length > 0 ? wallets[0].id : "");
    const isFixed = tx.totalInstallments && tx.totalInstallments > 1;
    setFormData({
      title: tx.title, type: tx.type, nature: isFixed ? "INSTALLMENT_PLAN" : "CONTINUOUS_CONTRACT", frequency: "MONTHLY",       
      totalInstallments: tx.totalInstallments || 1, amount: tx.amount.toString(),
      totalAmount: isFixed ? (tx.amount * tx.totalInstallments).toFixed(2) : "", installmentAmount: tx.amount.toString(),
      startDate: tx.dueDate, walletId: matchedWalletId
    });
    setIsModalOpen(true);
  };

  const openModalForEditRule = (rule: TransactionRule) => {
    setEditingRule(rule);
    setRuleEditData({ title: rule.title, amount: rule.estimatedValue.toString() });
    setIsRuleEditModalOpen(true);
  };

  const handleRuleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/rules/${editingRule.id}`, {
        method: "PUT", headers: getHeaders(),
        body: JSON.stringify({ title: ruleEditData.title, amount: parseFloat(ruleEditData.amount) })
      });
      if (response.ok) { setIsRuleEditModalOpen(false); fetchRules(); fetchTransactions(); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);
    try {
      const isFixedTerm = formData.nature === "INSTALLMENT_PLAN" && formData.frequency !== "ONCE";
      const amountToSend = isFixedTerm ? parseFloat(formData.installmentAmount) : parseFloat(formData.amount);
      if (editingTransaction) {
        const payload = { amount: amountToSend, dueDate: formData.startDate, status: editingTransaction.status, walletId: formData.walletId };
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions/${editingTransaction.id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(payload) });
        if (response.ok) { setIsModalOpen(false); fetchTransactions(); }
      } else {
        const payload = {
          title: formData.title, type: formData.type, nature: formData.nature, frequency: formData.frequency,
          amount: amountToSend, totalInstallments: isFixedTerm ? formData.totalInstallments : null, startDate: formData.startDate, walletId: formData.walletId
        };
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transactions`, { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) });
        if (response.ok) { setIsModalOpen(false); fetchTransactions(); fetchRules(); }
      }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };
  const translateNature = (nature: string) => {
    if (nature === "VARIABLE_EXPENSE") return "Variável";
    if (nature === "CONTINUOUS_CONTRACT") return "Contínuo";
    if (nature === "INSTALLMENT_PLAN") return "Parcelado";
    if (nature === "FIXED_BUDGET") return "Orçamento";
    return nature;
  };
  const renderSortIcon = (key: RulesSortKey) => {
    if (rulesSortKey !== key) return "↕";
    return rulesSortDir === "asc" ? "↑" : "↓";
  };

  const handleAmountChange = (val: string) => {
    const amt = parseFloat(val) || 0;
    const inst = formData.totalInstallments || 1;
    setFormData(prev => ({ ...prev, amount: val, totalValue: (amt * inst).toFixed(2) }));
  };

  const handleTotalValueChange = (val: string) => {
    const total = parseFloat(val) || 0;
    const inst = formData.totalInstallments || 1;
    setFormData(prev => ({ ...prev, totalValue: val, amount: (total / inst).toFixed(2) }));
  };

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const inst = parseInt(val) || 1;
    const total = parseFloat(formData.totalValue) || 0;
    setFormData(prev => ({ 
      ...prev, 
      totalInstallments: inst, 
      amount: total > 0 ? (total / inst).toFixed(2) : prev.amount 
    }));
  };

  const handleFrequencyChange = (val: string) => {
    setFormData(prev => {
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
    setFormData(prev => {
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
    <div className="max-w-[1400px] w-full mx-auto p-6 lg:p-10 animate-in fade-in duration-500 relative">
      
      {/* Cabeçalho principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Movimentações</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie seus contratos fixos e listagem de receitas/despesas.</p>
        </div>
        <button 
          onClick={openModalForCreate}
          disabled={!workspaceId || wallets.length === 0}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Nova Movimentação
        </button>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => setActiveTab("RULES")} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "RULES" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          Regras & Contratos
        </button>
        <button onClick={() => setActiveTab("INSTANCES")} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "INSTANCES" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          Listagem Histórica/Futura
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === "RULES" ? (
        
        /* TAB REGRAS & CONTRATOS */
        rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-sm text-slate-500 mb-4">Nenhuma regra ou contrato ativo cadastrado.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            
            {/* Barra de Ação em Lote (Regras) */}
            {selectedRuleIds.length > 0 && (
              <div className="bg-indigo-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-4 duration-200">
                <span className="text-sm text-indigo-700 font-bold">{selectedRuleIds.length} selecionados</span>
                <button onClick={() => setIsBulkRuleCancelOpen(true)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-colors">
                  Cancelar em Lote
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 select-none">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input type="checkbox" checked={selectedRuleIds.length === rules.length && rules.length > 0} onChange={handleSelectAllRules} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                    </th>
                    <th onClick={() => handleRulesSort("startDate")} className="px-4 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      Data Base <span className="ml-1 text-xs text-slate-400">{renderSortIcon("startDate")}</span>
                    </th>
                    <th onClick={() => handleRulesSort("title")} className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      Contrato / Regra <span className="ml-1 text-xs text-slate-400">{renderSortIcon("title")}</span>
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700">Frequência</th>
                    <th onClick={() => handleRulesSort("estimatedValue")} className="px-6 py-4 font-bold text-slate-700 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                      Valor Projetado <span className="ml-1 text-xs text-slate-400">{renderSortIcon("estimatedValue")}</span>
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getSortedRules().map((rule) => (
                    <tr key={rule.id} className={`hover:bg-slate-50/50 transition-colors ${selectedRuleIds.includes(rule.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedRuleIds.includes(rule.id)} onChange={() => handleSelectRule(rule.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                      </td>
                      <td className="px-4 py-4 text-slate-500 font-medium">{formatDate(rule.startDate)}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{rule.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rule.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{rule.type === 'INCOME' ? 'Receita' : 'Despesa'}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{translateNature(rule.nature)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {rule.frequency === 'MONTHLY' ? 'Mensal' : rule.frequency === 'ANNUALLY' ? 'Anual' : 'Única'}
                        {rule.totalInstallments && ` (${rule.totalInstallments}x)`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(rule.estimatedValue)}</p>
                        {rule.totalValue && <p className="text-xs text-slate-400 mt-0.5">Total: {formatCurrency(rule.totalValue)}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => viewTransactionsForRule(rule)} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-md transition-colors">Ver Parcelas</button>
                          <button onClick={() => openModalForEditRule(rule)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button onClick={() => setRuleToCancel(rule.id)} className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-md transition-colors">Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto">
              <button disabled={rulesPage === 0} onClick={() => setRulesPage(p => p - 1)} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors">Anterior</button>
              <span className="text-sm text-slate-500 font-medium">Página {rulesPage + 1} de {rulesTotalPages || 1}</span>
              <button type="button" disabled={rulesPage >= rulesTotalPages - 1} onClick={() => setRulesPage(p => p + 1)} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors">Próxima</button>
            </div>
          </div>
        )
      ) : (
        
        /* TAB LISTAGEM DE MOVIMENTAÇÕES (INSTÂNCIAS) */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div className="w-full md:w-1/2 flex gap-2 items-center">
              <input type="text" placeholder="Buscar movimentações..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500" />
              {activeRuleFilter && (
                <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold truncate">
                  <span>Regra: {activeRuleFilter.name}</span>
                  <button onClick={() => setActiveRuleFilter(null)} className="hover:text-indigo-900">X</button>
                </div>
              )}
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTxPage(0); }} className="w-full sm:w-auto border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none font-medium text-slate-700">
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Pendentes</option>
                <option value="PAID">Pagos</option>
              </select>
              <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setTxPage(0); }} className="w-full sm:w-auto border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none font-medium text-slate-700">
                <option value="upcoming">Próximas movimentações</option>
                <option value="recent">Mais recentes</option>
                <option value="dueDate,desc">Data: Todas (Mais novas)</option>
                <option value="dueDate,asc">Data: Todas (Mais antigas)</option>
                <option value="amount,desc">Valor: Maior para menor</option>
                <option value="amount,asc">Valor: Menor para maior</option>
              </select>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
              <p className="text-sm text-slate-500 mb-4">Nenhuma movimentação encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Barra de Ação em Lote (Movimentações) */}
              {selectedTxIds.length > 0 && (
                <div className="bg-indigo-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-4 duration-200">
                  <span className="text-sm text-indigo-700 font-bold">{selectedTxIds.length} selecionados</span>
                  <button onClick={() => setIsBulkTxDeleteOpen(true)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-colors">
                    Excluir Selecionados
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-12 px-6 py-4">
                        <input type="checkbox" checked={selectedTxIds.length === transactions.length && transactions.length > 0} onChange={handleSelectAllTxs} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                      </th>
                      <th className="px-4 py-4 font-bold text-slate-700">Data</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Descrição</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Carteira</th>
                      <th className="px-6 py-4 font-bold text-slate-700">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-700 text-right">Valor</th>
                      <th className="px-6 py-4 font-bold text-slate-700 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className={`hover:bg-slate-50/50 transition-colors ${selectedTxIds.includes(tx.id) ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedTxIds.includes(tx.id)} onChange={() => handleSelectTx(tx.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                        </td>
                        <td className="px-4 py-4 text-slate-500 font-medium">{formatDate(tx.dueDate)}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{tx.title}</p>
                          {tx.totalInstallments && tx.totalInstallments > 1 && (
                            <p className="text-xs text-slate-400 mt-0.5">Parcela {tx.installmentNumber} de {tx.totalInstallments}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{tx.walletName}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleToggleStatus(tx.id, tx.status)} className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                            {tx.status === 'PAID' ? 'Pago' : 'Pendente'}
                          </button>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}>
                          {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openModalForEdit(tx)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onClick={() => setTxToDelete(tx.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto">
                <button disabled={txPage === 0} onClick={() => setTxPage(p => p - 1)} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors">Anterior</button>
                <span className="text-sm text-slate-500 font-medium">Página {txPage + 1} de {txTotalPages || 1}</span>
                <button disabled={txPage >= txTotalPages - 1} onClick={() => setTxPage(p => p + 1)} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors">Próxima</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Exclusão Individual de Instância (Substitui o confirm) */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Movimentação?</h3>
              <p className="text-sm text-slate-500">Essa ação removerá permanentemente este registro do seu fluxo financeiro.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setTxToDelete(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">Voltar</button>
              <button onClick={confirmDeleteInstance} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">Excluir Registro</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Exclusão em Lote de Instâncias */}
      {isBulkTxDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir movimentações em lote?</h3>
              <p className="text-sm text-slate-500">Você está prestes a excluir permanentemente as <strong>{selectedTxIds.length}</strong> movimentações selecionadas.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsBulkTxDeleteOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">Voltar</button>
              <button onClick={confirmBulkDeleteInstances} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">Confirmar Exclusão em Lote</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancelamento Individual de Contrato/Regra */}
      {ruleToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Cancelar Contrato?</h3>
              <p className="text-sm text-slate-500">Isso excluirá permanentemente todas as parcelas futuras que possuem status pendente. Parcelas pagas continuarão registradas.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setRuleToCancel(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">Voltar</button>
              <button onClick={confirmCancelRule} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">Confirmar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancelamento em Lote de Contratos/Regras */}
      {isBulkRuleCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Cancelar contratos em lote?</h3>
              <p className="text-sm text-slate-500">Isso arquivará as <strong>{selectedRuleIds.length}</strong> regras selecionadas e removerá todas as suas respectivas projeções e parcelas pendentes futuras.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsBulkRuleCancelOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">Voltar</button>
              <button onClick={confirmBulkCancelRules} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">Confirmar Cancelamento em Lote</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Editar Contrato / Regra */}
      {isRuleEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Editar Contrato</h3>
              <button onClick={() => setIsRuleEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleRuleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Contrato / Regra</label>
                <input type="text" required value={ruleEditData.title} onChange={e => setRuleEditData({ ...ruleEditData, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Novo Valor das Parcelas Futuras</label>
                <input type="number" step="0.01" required value={ruleEditData.amount} onChange={e => setRuleEditData({ ...ruleEditData, amount: e.target.value })} className="w-full border border-slate-200 bg-indigo-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500" />
                <p className="text-[10px] text-slate-400 leading-tight">Esta alteração afetará apenas parcelas com status Pendente a partir de hoje.</p>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRuleEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">{isSubmitting ? "Salvando..." : "Atualizar Contrato"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Criar / Editar Instâncias Individuais */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingTransaction ? "Editar Movimentação" : "Registrar Movimentação"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo da Operação</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 p-1 bg-slate-50">
                  <button type="button" disabled={!!editingTransaction} onClick={() => setFormData({ ...formData, type: "INCOME" })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:text-slate-700"} disabled:opacity-50`}>Entrada</button>
                  <button type="button" disabled={!!editingTransaction} onClick={() => setFormData({ ...formData, type: "EXPENSE" })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.type === "EXPENSE" ? "bg-red-100 text-red-700" : "text-slate-500 hover:text-slate-700"} disabled:opacity-50`}>Saída</button>
                </div>
              </div>

              {!editingTransaction && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prazo da Operação</label>
                    <select value={formData.nature} onChange={(e) => setFormData({ ...formData, nature: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors">
                      <option value="CONTINUOUS_CONTRACT">Não possui prazo final (Indeterminado)</option>
                      <option value="INSTALLMENT_PLAN">Possui prazo final (Determinado / Parcelado)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col justify-end space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequência</label>
                      <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors">
                        <option value="ONCE">Única</option>
                        <option value="MONTHLY">Mensal</option>
                        <option value="ANNUALLY">Anual</option>
                      </select>
                    </div>
                    {formData.nature === "INSTALLMENT_PLAN" && formData.frequency !== "ONCE" && (
                      <div className="flex flex-col justify-end space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nº de Parcelas</label>
                        <input type="number" min="2" required value={formData.totalInstallments} onChange={handleInstallmentsChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"/>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                  <input type="text" required placeholder="Ex: Aluguel..." value={formData.title} disabled={!!editingTransaction} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"/>
                </div>

                {formData.nature === "INSTALLMENT_PLAN" && formData.frequency !== "ONCE" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col justify-end space-y-1.5">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider truncate">Total</label>
                      <input type="number" step="0.01" required value={formData.totalValue} onChange={e => handleTotalValueChange(e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"/>
                    </div>
                    <div className="flex flex-col justify-end space-y-1.5">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider truncate">Parcela</label>
                      <input type="number" step="0.01" required value={formData.amount} onChange={e => handleAmountChange(e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"/>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-end space-y-1.5">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Valor</label>
                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"/>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Início</label>
                  <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"/>
                </div>
                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carteira</label>
                  <select required value={formData.walletId} onChange={(e) => setFormData({ ...formData, walletId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors">
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50">{isSubmitting ? "Salvando..." : "Salvar Operação"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Movimentação */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Nova Movimentação</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-bold bg-white focus:border-indigo-500">
                      <option value="EXPENSE">Despesa</option>
                      <option value="INCOME">Receita</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Natureza</label>
                    <select value={formData.nature} onChange={e => handleNatureChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                      <option value="INSTALLMENT_PLAN">Possui prazo final</option>
                      <option value="CONTINUOUS_CONTRACT">Não possui prazo final</option>
                    </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <input required type="text" placeholder="Ex: Financiamento, Assinatura, Salário..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Recorrência</label>
                    <select value={formData.frequency} onChange={e => handleFrequencyChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                      {formData.nature === "INSTALLMENT_PLAN" && <option value="ONCE">Única vez</option>}
                      <option value="MONTHLY">Mensal</option>
                      <option value="ANNUALLY">Anual</option>
                    </select>
                </div>

                {formData.nature === "INSTALLMENT_PLAN" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nº de Parcelas</label>
                    <input required type="number" min="1" value={formData.totalInstallments} onChange={handleInstallmentsChange} disabled={formData.frequency === 'ONCE'} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor da Ocorrência</label>
                    <input required type="number" step="0.01" value={formData.amount} onChange={e => handleAmountChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                )}
              </div>

              {formData.nature === "INSTALLMENT_PLAN" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor da Parcela</label>
                    <input required type="number" step="0.01" value={formData.amount} onChange={e => handleAmountChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Valor Total</label>
                    <input required type="number" step="0.01" value={formData.totalValue} onChange={e => handleTotalValueChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-indigo-50/50 font-bold text-indigo-700" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data Base Inicial</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Carteira</label>
                  <select required value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-indigo-500">
                    <option value="" disabled>Selecione...</option>
                    {wallets.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                  {isSubmitting ? "Processando..." : "Adicionar Movimentação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}