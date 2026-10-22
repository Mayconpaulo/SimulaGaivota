import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Standalone Direct URL: dynamically use current origin or ais-dev
  const directAppUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-dev-tywng2bt746gj7vtjdu6au-202615807208.us-east1.run.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleOpenDirect = () => {
    window.open(directAppUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg liquid-glass-dark border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Subtle glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header with App Icon */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="SimulaGaivota"
              className="w-12 h-12 rounded-2xl shadow-md border border-white/20 shrink-0 bg-emerald-950/40 p-1"
            />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Como Baixar o SimulaGaivota
              </h3>
              <p className="text-xs text-emerald-400 font-medium font-mono">
                CFST 26/2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* IMPORTANT NOTICE: Why Chrome proposed Google Studio */}
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <span className="text-base">⚠️</span>
            <span>Por que apareceu "Google Studio" no Chrome?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Você está acessando a tela de visualização de dentro do site do <strong>Google AI Studio</strong>. Por isso, quando você abre o menu do Chrome, ele acha que você quer instalar o site do Google Studio e não a janela do app.
          </p>
          <p className="text-xs font-semibold text-emerald-300 pt-1">
            Solução simples: abra o <strong>Link Direto</strong> do aplicativo em uma nova aba comum do seu navegador!
          </p>
        </div>

        {/* Action: Copy or Open Direct Link */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Link Direto do SimulaGaivota:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directAppUrl}
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              {copied ? '✓ Copiado!' : 'Copiar Link'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenDirect}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Abrir em Nova Aba (Fora do Studio)</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>

        {/* Step-by-Step for Chrome & iPhone */}
        <div className="space-y-3 text-xs">
          {/* Android Chrome Step by Step */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center text-xs">
                ▶
              </span>
              <span>Passo a passo no Google Chrome (Android):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
              <li>Copie o link acima ou abra em uma nova aba comum do Chrome.</li>
              <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
              <li>Agora aparecerá: <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong> com o nome <em>SimulaGaivota</em>.</li>
              <li>Toque em <strong>Instalar</strong>. Pronto! O ícone com o visto do exército ficará na tela inicial do seu celular.</li>
            </ol>

            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full mt-2 py-2.5 px-4 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Instalar Agora Direto</span>
              </button>
            )}
          </div>

          {/* iPhone Safari Step by Step */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
              <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                
              </span>
              <span>No iPhone (Safari):</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-1">
              Cole o link direto no <strong>Safari</strong> do iPhone, toque no botão de <strong>Compartilhar</strong> (quadrado com seta ⎋) e escolha <strong>"Adicionar à Tela de Início"</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>✓ Funciona em tela cheia como aplicativo nativo</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-white hover:underline cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
