import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-bg overflow-hidden font-sans selection:bg-brand-light/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Glow de fundo abstrato herdado da identidade visual */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-light/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}