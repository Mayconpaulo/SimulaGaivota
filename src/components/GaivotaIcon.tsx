import React from 'react';

interface GaivotaIconProps {
  status?: 'earned' | 'unearned' | 'lost' | 'pending';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  count?: number; // Optional number of gaivotas, e.g. 1
  label?: string;
  as?: 'button' | 'span';
}

export const GaivotaIcon: React.FC<GaivotaIconProps> = ({
  status = 'earned',
  size = 'md',
  interactive = false,
  onClick,
  className = '',
  count,
  label,
  as,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base',
    xl: 'w-12 h-12 text-lg',
  };

  const svgSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
    xl: 'w-7 h-7',
  };

  const getColors = () => {
    switch (status) {
      case 'earned':
        return 'bg-emerald-700/15 text-emerald-800 border-emerald-600/40 hover:bg-emerald-700/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40';
      case 'lost':
        return 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40';
      case 'unearned':
      default:
        return 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700';
    }
  };

  const titleText =
    status === 'earned'
      ? 'Gaivota Conquistada (Critério Atendido ✓)'
      : status === 'lost'
      ? 'Gaivota Não Concedida'
      : 'Gaivota Pendente de Avaliação';

  const content = (
    <>
      {/* Authentic Military Seen/Gaivota check mark stroke */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={status === 'earned' ? '3' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${svgSizeMap[size]} transition-transform ${
          status === 'earned' ? 'scale-105' : 'opacity-60'
        }`}
      >
        {/* Brazilian military seen / gaivota shape */}
        <path d="M3.5 13.5 L8.5 19 L20.5 5.5" />
      </svg>
      {count !== undefined && count > 1 && (
        <span className="text-[11px] font-mono font-bold leading-none tabular-nums">
          ×{count}
        </span>
      )}
    </>
  );

  const baseClasses = `inline-flex items-center justify-center gap-1 font-semibold rounded-md border transition-all duration-150 select-none ${
    sizeMap[size]
  } ${getColors()} ${interactive && onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${className}`;

  // Only render a <button> if explicitly requested or when interactive with an onClick handler.
  // Otherwise, ALWAYS render a <span> to avoid invalid nesting in parent buttons.
  const shouldRenderButton = as === 'button' || (!as && interactive && Boolean(onClick));

  if (shouldRenderButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label || `Gaivota ${status}`}
        className={baseClasses}
        title={titleText}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      role="img"
      aria-label={label || `Gaivota ${status}`}
      className={baseClasses}
      title={titleText}
    >
      {content}
    </span>
  );
};
