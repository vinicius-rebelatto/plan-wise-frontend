"use client";

import { useState, useEffect, useCallback } from "react";

interface Wallet {
  id: string;
  name: string;
  initialBalance: number | null;
  currency: string | null;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    initialBalance: "",
    currency: "BRL"
  });

  const getAuthToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('planwise_auth_token='))?.split('=')[1];
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAuthToken()}`
  });

  const fetchWallets = useCallback(async (currentWorkspaceId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets/workspace/${currentWorkspaceId}`, { 
        headers: getHeaders() 
      });
      if (res.ok) {
        setWallets(await res.json());
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

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
    } catch (error) { 
      console.error(error); 
      setIsLoading(false); 
    }
  }, [fetchWallets]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const formatCurrency = (value: number | null, currency: string | null | undefined) => {
    const safeValue = value || 0;
    const safeCurrency = currency || 'BRL';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: safeCurrency }).format(safeValue);
  };

  const openModalForCreate = () => {
    setEditingWallet(null);
    setFormData({ name: "", initialBalance: "", currency: "BRL" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      initialBalance: wallet.initialBalance != null ? wallet.initialBalance.toString() : "",
      currency: wallet.currency || "BRL"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        initialBalance: parseFloat(formData.initialBalance || "0"),
        currency: formData.currency,
        workspaceId: workspaceId
      };

      let response;
      if (editingWallet) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets/${editingWallet.id}`, {
          method: "PUT", headers: getHeaders(), body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets`, {
          method: "POST", headers: getHeaders(), body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setIsModalOpen(false);
        fetchWallets(workspaceId);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const confirmDeleteWallet = async () => {
    if (!walletToDelete || !workspaceId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wallets/${walletToDelete}`, { 
        method: "DELETE", headers: { "Authorization": `Bearer ${getAuthToken()}` } 
      });
      if (response.ok) fetchWallets(workspaceId);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setWalletToDelete(null); 
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carteiras e Contas</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie onde seu dinheiro está alocado fisicamente ou digitalmente.</p>
        </div>
        <button 
          onClick={openModalForCreate}
          disabled={!workspaceId}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Nova Carteira
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-transparent">
          <p className="text-sm text-slate-500 mb-4">Você ainda não registrou nenhuma carteira.</p>
          <button onClick={openModalForCreate} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg transition-colors hover:bg-indigo-100">
            Criar primeira carteira
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              className="relative rounded-3xl p-6 shadow-xl shadow-indigo-600/20 hover:shadow-2xl hover:shadow-indigo-600/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700"
            >
              {/* Elementos de Decoração do Background */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-start mb-8">
                {/* Ícone */}
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm ring-1 ring-white/30 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                
                {/* Ações (Aparecem no hover) */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModalForEdit(wallet)} className="p-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/30 rounded-lg backdrop-blur-sm" title="Editar Carteira">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button onClick={() => setWalletToDelete(wallet.id)} className="p-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-red-500/80 rounded-lg backdrop-blur-sm" title="Excluir Carteira">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm">{wallet.name}</h3>
                <p className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold mb-1">Saldo Consolidado ({wallet.currency || 'BRL'})</p>
                <p className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {formatCurrency(wallet.initialBalance, wallet.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingWallet ? "Editar Carteira" : "Nova Carteira"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Nubank, Itaú..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moeda</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="BRL">BRL (Real)</option>
                    <option value="USD">USD (Dólar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Inicial</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Carteira */}
      {walletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Carteira?</h3>
              <p className="text-sm text-slate-500">
                Tem certeza que deseja excluir esta carteira? As movimentações atreladas a ela podem ficar sem referência.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setWalletToDelete(null)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm">Voltar</button>
              <button onClick={confirmDeleteWallet} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-600 transition-colors">Excluir Carteira</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}