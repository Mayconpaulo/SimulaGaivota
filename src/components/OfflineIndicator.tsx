import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-slate-950 shadow-xl border border-amber-300 animate-bounce">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-950 animate-ping" />
      <span>Modo Offline Ativo — Utilizando cache PWA militar local</span>
    </div>
  );
};
