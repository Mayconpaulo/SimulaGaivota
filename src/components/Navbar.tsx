import React from 'react';

interface NavbarProps {
  activeTab: 'simulados' | 'flashcards' | 'materiais' | 'desempenho';
  onSelectTab: (tab: 'simulados' | 'flashcards' | 'materiais' | 'desempenho') => void;
  onOpenStudySetup: () => void;
  onOpenInstallModal: () => void;
  totalGaivotasEarned: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenStudySetup,
  onOpenInstallModal,
  totalGaivotasEarned,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full liquid-glass-dock border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark (Single text element with iOS Glass badge) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('simulados')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl p-1 transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3.5 13.5 L8.5 19 L20.5 5.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                SimulaGaivota
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Nav links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => onSelectTab('simulados')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'simulados'
                ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Simulado
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('flashcards')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Cards
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('materiais')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'materiais'
                ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Subir Arquivos
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('desempenho')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'desempenho'
                ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Gaivotas ({totalGaivotasEarned} ✓)
          </button>
        </nav>

        {/* Zone 3: Primary Action + Baixar no Celular CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Install on Mobile App button */}
          <button
            type="button"
            onClick={onOpenInstallModal}
            title="Instalar e baixar aplicativo no celular"
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">Baixar no Celular</span>
            <span className="sm:hidden">Instalar</span>
          </button>

          {/* New study session CTA */}
          <button
            type="button"
            onClick={onOpenStudySetup}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Novo Estudo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
