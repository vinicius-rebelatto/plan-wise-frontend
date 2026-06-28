"use client";

import { useState, useEffect, useRef } from "react";

interface NotificationState {
  type: "success" | "error" | null;
  message: string;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);


  
  // Estado para gerenciar notificações inline atrativas
  const [notification, setNotification] = useState<NotificationState>({
    type: null,
    message: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photoUrl: "",
    theme: "system",
    notifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const getAuthToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("planwise_auth_token="))
      ?.split("=")[1];
  };

  // Função para disparar a notificação que some após 4 segundos
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 4000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            photoUrl: data.photoURL || "",
            theme: data.theme || "system",
            notifications: data.notifications ?? true,
          });
        } else {
          showToast("error", "Falha ao carregar dados do usuário.");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
        showToast("error", "Erro de conexão com o servidor.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Salvar alterações do perfil com validação estrita
  const handleSaveProfile = async () => {
    // Verificação se os campos estão nulos ou vazios (removendo espaços em branco)
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast("error", "Os campos Nome e Sobrenome não podem ficar vazios.");
      return;
    }

    setIsSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        }),
      });

      if (response.ok) {
        showToast("success", "Perfil atualizado com sucesso!");
      } else {
        showToast("error", "Erro ao atualizar o perfil no servidor.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast("error", "Erro ao conectar com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar senha com validação estrita
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast("error", "Todos os campos de senha devem ser preenchidos.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("error", "A nova senha deve conter pelo menos 6 caracteres.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("error", "A nova senha e a confirmação não coincidem.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showToast("success", "Senha atualizada com sucesso!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast("error", "Erro ao atualizar a senha. Verifique sua senha atual.");
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      showToast("error", "Erro na requisição de alteração de senha.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "A imagem deve ter no máximo 2MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Não inclua o Content-Type. O fetch gerencia o multipart/form-data automaticamente.
        },
        body: uploadData,
      });

      if (response.ok) {
        // O backend retorna a URL da imagem em formato string
        const avatarUrl = await response.text(); 
        setFormData((prev) => ({ ...prev, photoUrl: avatarUrl }));
        showToast("success", "Foto atualizada com sucesso!");
      } else {
        showToast("error", "Erro ao atualizar a foto.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showToast("error", "Erro de conexão ao enviar a foto.");
    } finally {
      setIsUploadingAvatar(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente, se necessário
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!formData.photoUrl) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me/avatar`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFormData((prev) => ({ ...prev, photoUrl: "" }));
        showToast("success", "Foto removida com sucesso!");
      } else {
        showToast("error", "Erro ao remover a foto.");
      }
    } catch (error) {
      showToast("error", "Erro de conexão.");
    }
  };

  const handleLogout = () => {
  // Remove o cookie do token de autenticação definindo uma data de expiração no passado
  document.cookie = "planwise_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Redireciona para a página de login
  window.location.href = "/auth";
};

  if (isLoading) {
    return (
      <div className="max-w-4xl w-full mx-auto pb-12 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-brand-base/20 border-t-brand-base rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto pb-12 relative">
      
      {/* Banner de Notificação Flutuante / Fixo no topo da página */}
      {notification.type && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg max-w-md animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {notification.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header da Página */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Meu Perfil</h1>
        <p className="text-sm text-text-secondary">
          Gerencie suas informações pessoais, preferências de interface e segurança da conta.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Cartão 1: Informações Pessoais */}
        <section className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-surface-border">
            <h2 className="text-base font-semibold text-text-primary">Informações Pessoais</h2>
            <p className="text-xs text-text-secondary mt-1">Atualize sua foto e dados de contato básicos.</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,var(--color-brand-base)_0%,var(--color-brand-light)_100%)] flex items-center justify-center text-white font-bold text-2xl shadow-inner overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <>{formData.firstName?.[0] || ""}{formData.lastName?.[0] || ""}</>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleAvatarUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-4 py-2 bg-surface-bg border border-surface-border hover:bg-surface-hover rounded-lg text-sm font-medium text-text-primary transition-all shadow-sm disabled:opacity-50"
                  >
                    {isUploadingAvatar ? "Enviando..." : "Alterar foto"}
                  </button>
                  <button 
  onClick={handleRemoveAvatar}
  disabled={!formData.photoUrl}
  className="px-4 py-2 text-sm font-medium text-status-out hover:bg-status-out/10 rounded-lg transition-all disabled:opacity-50"
>
  Remover
</button>
                </div>
                <p className="text-[11px] text-text-secondary">JPG, GIF ou PNG. Tamanho máximo de 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Nome</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Sobrenome</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-surface-bg/50 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-surface-bg border-t border-surface-border flex justify-end">
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-brand-base text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-light transition-all disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </section>

        {/* Cartão 2: Preferências */}
        <section className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-surface-border">
            <h2 className="text-base font-semibold text-text-primary">Preferências do Sistema</h2>
            <p className="text-xs text-text-secondary mt-1">Personalize como o Plan Wise se comporta para você.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Tema da Interface</label>
                <p className="text-xs text-text-secondary">Escolha entre o modo claro, escuro ou sincronizado com o sistema.</p>
              </div>
              <select 
                value={formData.theme}
                onChange={(e) => setFormData({...formData, theme: e.target.value})}
                className="bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base cursor-pointer"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <div className="w-full h-px bg-surface-border"></div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1">Notificações por E-mail</label>
                <p className="text-xs text-text-secondary">Receba resumos semanais de projeções e alertas de faturas pendentes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.notifications}
                  onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-base"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Cartão 3: Segurança */}
        <section className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-surface-border">
            <h2 className="text-base font-semibold text-text-primary">Segurança</h2>
            <p className="text-xs text-text-secondary mt-1">Mantenha sua conta segura alterando sua senha regularmente.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Senha Atual</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full md:w-1/2 bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Nova Senha</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-surface-bg border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-base focus:border-brand-base transition-all" 
                />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-surface-bg border-t border-surface-border flex justify-end">
            <button 
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 bg-surface-card border border-surface-border text-text-primary rounded-lg text-sm font-bold shadow-sm hover:bg-surface-hover transition-all disabled:opacity-50"
            >
              {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </div>
        </section>

        {/* Cartão de Ações da Conta */}
<section className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm mt-6">
  <div className="p-6 border-b border-surface-border">
    <h2 className="text-base font-semibold text-text-primary">Conta</h2>
  </div>
  <div className="p-6">
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      Sair da conta
    </button>
  </div>
</section>

      </div>
    </div>
  );
}