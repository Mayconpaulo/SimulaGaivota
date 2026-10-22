import React from 'react';

interface MobileBottomNavProps {
  activeTab: 'simulados' | 'flashcards' | 'materiais' | 'desempenho';
  onSelectTab: (tab: 'simulados' | 'flashcards' | 'materiais' | 'desempenho') => void;
  totalGaivotasEarned: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  totalGaivotasEarned,
}) => {
  return (
    <nav
      aria-label="Navegação Mobile iOS Dock"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 liquid-glass-dock pb-safe"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-1">
        {/* Tab 1: Simulados */}
        <button
          type="button"
          onClick={() => onSelectTab('simulados')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-all select-none active:scale-90 ${
            activeTab === 'simulados' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'simulados' ? 'bg-emerald-500/20' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate">Simulado</span>
        </button>

        {/* Tab 2: Cards */}
        <button
          type="button"
          onClick={() => onSelectTab('flashcards')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-all select-none active:scale-90 ${
            activeTab === 'flashcards' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'flashcards' ? 'bg-emerald-500/20' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate">Cards</span>
        </button>

        {/* Tab 4: Subir Arquivos */}
        <button
          type="button"
          onClick={() => onSelectTab('materiais')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-all select-none active:scale-90 ${
            activeTab === 'materiais' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'materiais' ? 'bg-emerald-500/20' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate">Arquivos</span>
        </button>

        {/* Tab 5: Desempenho / Gaivotas */}
        <button
          type="button"
          onClick={() => onSelectTab('desempenho')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-all select-none active:scale-90 ${
            activeTab === 'desempenho' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <div className={`p-1 rounded-xl transition-colors ${activeTab === 'desempenho' ? 'bg-emerald-500/20' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            {totalGaivotasEarned > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-400 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-sm">
                {totalGaivotasEarned}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 truncate">Placar</span>
        </button>
      </div>
    </nav>
  );
};
