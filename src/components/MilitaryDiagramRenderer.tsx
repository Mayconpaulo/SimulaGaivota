import React from 'react';
import { DiagramData } from '../types/exam';

interface MilitaryDiagramRendererProps {
  diagram: DiagramData;
}

export const MilitaryDiagramRenderer: React.FC<MilitaryDiagramRendererProps> = ({ diagram }) => {
  const { title, type, caption, componentLabels = [] } = diagram;

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-[#060e14] p-4 sm:p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ESQUEMA TÉCNICO
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {title || 'Identificação de Componente'}
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Doutrina Militar
        </span>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="w-full flex items-center justify-center p-3 rounded-xl bg-[#020508] border border-white/10 overflow-hidden">
        {type === 'radio_panel' ? (
          <svg viewBox="0 0 600 240" className="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="lcdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            {/* Radio Chassis */}
            <rect x="20" y="20" width="560" height="200" rx="16" fill="url(#metalGrad)" stroke="#334155" strokeWidth="3" />
            <rect x="30" y="30" width="540" height="180" rx="10" fill="#09101d" stroke="#1e293b" strokeWidth="2" />

            {/* Carrying handles */}
            <rect x="6" y="50" width="12" height="140" rx="6" fill="#475569" stroke="#64748b" />
            <rect x="582" y="50" width="12" height="140" rx="6" fill="#475569" stroke="#64748b" />

            {/* Component A: LCD Display */}
            <g transform="translate(60, 50)">
              <rect width="180" height="70" rx="8" fill="url(#lcdGrad)" stroke="#10b981" strokeWidth="2" />
              <text x="15" y="30" fill="#34d399" fontFamily="monospace" fontSize="16" fontWeight="bold">CH: 08 | VHF-FM</text>
              <text x="15" y="55" fill="#a7f3d0" fontFamily="monospace" fontSize="20" fontWeight="bold">52.450 MHz</text>
              <circle cx="160" cy="25" r="4" fill="#34d399" />
              {/* Badge Marker A */}
              <circle cx="-10" cy="35" r="14" fill="#10b981" />
              <text x="-14" y="40" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">A</text>
            </g>

            {/* Component B: Frequency / Channel Selector Knob */}
            <g transform="translate(290, 85)">
              <circle cx="25" cy="0" r="32" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
              <circle cx="25" cy="0" r="22" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
              <line x1="25" y1="-22" x2="25" y2="-5" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
              {/* Badge Marker B */}
              <circle cx="25" cy="-45" r="14" fill="#38bdf8" />
              <text x="20" y="-40" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">B</text>
            </g>

            {/* Component C: Power / Volume / Squelch Knob */}
            <g transform="translate(390, 85)">
              <circle cx="25" cy="0" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
              <circle cx="25" cy="0" r="18" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
              <line x1="25" y1="0" x2="38" y2="10" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              {/* Badge Marker C */}
              <circle cx="25" cy="-45" r="14" fill="#f59e0b" />
              <text x="20" y="-40" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">C</text>
            </g>

            {/* Component D: BNC Antenna Connector */}
            <g transform="translate(490, 85)">
              <circle cx="25" cy="0" r="24" fill="#64748b" stroke="#cbd5e1" strokeWidth="3" />
              <circle cx="25" cy="0" r="12" fill="#334155" />
              <circle cx="25" cy="0" r="4" fill="#e2e8f0" />
              {/* Badge Marker D */}
              <circle cx="25" cy="-45" r="14" fill="#ec4899" />
              <text x="20" y="-40" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">D</text>
            </g>

            {/* Component E: Handset / PTT Multi-pin Connector */}
            <g transform="translate(130, 160)">
              <rect x="0" y="0" width="100" height="35" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="20" cy="17" r="4" fill="#94a3b8" />
              <circle cx="35" cy="17" r="4" fill="#94a3b8" />
              <circle cx="50" cy="17" r="4" fill="#94a3b8" />
              <circle cx="65" cy="17" r="4" fill="#94a3b8" />
              <circle cx="80" cy="17" r="4" fill="#94a3b8" />
              {/* Badge Marker E */}
              <circle cx="-15" cy="17" r="14" fill="#a855f7" />
              <text x="-20" y="22" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">E</text>
            </g>

            {/* Bottom model tag */}
            <text x="320" y="180" fill="#64748b" fontFamily="monospace" fontSize="12">TRANSCEPTOR TÁTICO MILITAR PX-2000 / EB</text>
          </svg>
        ) : type === 'antenna_schematic' ? (
          <svg viewBox="0 0 600 240" className="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {/* Mast and Dipole */}
            <line x1="300" y1="30" x2="300" y2="105" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <line x1="300" y1="135" x2="300" y2="210" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="300" cy="120" r="16" fill="#1e293b" stroke="#e2e8f0" strokeWidth="3" />

            {/* Coaxial feed line */}
            <path d="M 315 120 Q 380 140 450 180" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 4" />

            {/* Marker A: Elemento irradiante superior */}
            <circle cx="240" cy="65" r="14" fill="#38bdf8" />
            <text x="235" y="70" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">A</text>
            <line x1="260" y1="65" x2="290" y2="65" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <text x="140" y="70" fill="#93c5fd" fontFamily="sans-serif" fontSize="12">Haste λ/4</text>

            {/* Marker B: Isolador central / Balun */}
            <circle cx="360" cy="120" r="14" fill="#10b981" />
            <text x="355" y="125" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">B</text>

            {/* Marker C: Elemento inferior / contra-peso */}
            <circle cx="240" cy="175" r="14" fill="#a855f7" />
            <text x="235" y="180" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">C</text>
            <line x1="260" y1="175" x2="290" y2="175" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
            <text x="120" y="180" fill="#d8b4fe" fontFamily="sans-serif" fontSize="12">Contra-peso λ/4</text>

            {/* Marker D: Cabo coaxial 50 Ohms */}
            <circle cx="475" cy="180" r="14" fill="#f59e0b" />
            <text x="470" y="185" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">D</text>

            <text x="300" y="230" textAnchor="middle" fill="#94a3b8" fontFamily="sans-serif" fontSize="12">
              ANTENA DIPOLO DE MEIA-ONDA (λ/2)
            </text>
          </svg>
        ) : type === 'wire_splice' ? (
          <svg viewBox="0 0 600 220" className="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {/* Wire Pair WD-1/TT */}
            <line x1="50" y1="90" x2="200" y2="90" stroke="#4ade80" strokeWidth="6" />
            <line x1="50" y1="130" x2="260" y2="130" stroke="#fbbf24" strokeWidth="6" />

            <line x1="380" y1="90" x2="550" y2="90" stroke="#4ade80" strokeWidth="6" />
            <line x1="440" y1="130" x2="550" y2="130" stroke="#fbbf24" strokeWidth="6" />

            {/* Staggered splices */}
            <rect x="200" y="80" width="180" height="20" rx="6" fill="#15803d" stroke="#86efac" strokeWidth="2" />
            <rect x="260" y="120" width="180" height="20" rx="6" fill="#b45309" stroke="#fde047" strokeWidth="2" />

            {/* Marker A: Escalonamento para evitar curto-circuito */}
            <circle cx="290" cy="50" r="14" fill="#38bdf8" />
            <text x="285" y="55" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">A</text>
            <text x="210" y="30" fill="#38bdf8" fontFamily="sans-serif" fontSize="11">Escalonamento das Emendas (distância de segurança)</text>

            {/* Marker B: Condutores trançados 4 Cobre + 3 Aço */}
            <circle cx="100" cy="170" r="14" fill="#10b981" />
            <text x="95" y="175" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">B</text>
            <text x="125" y="175" fill="#a7f3d0" fontFamily="sans-serif" fontSize="11">Fio WD-1/TT: 4 Cu + 3 Aço</text>

            {/* Marker C: Isolamento de borracha vulcanizada */}
            <circle cx="480" cy="170" r="14" fill="#f59e0b" />
            <text x="475" y="175" fill="#000" fontFamily="sans-serif" fontSize="14" fontWeight="bold">C</text>
            <text x="400" y="195" fill="#fde68a" fontFamily="sans-serif" fontSize="11">Isolamento com Fita de Auto-Fusão</text>
          </svg>
        ) : (
          /* Frequency Spectrum & Propagation */
          <svg viewBox="0 0 600 220" className="w-full max-w-lg h-auto select-none" xmlns="http://www.w3.org/2000/svg">
            {/* Earth curve and ionosphere */}
            <path d="M 50 180 Q 300 130 550 180" fill="none" stroke="#3b82f6" strokeWidth="4" />
            <text x="300" y="170" textAnchor="middle" fill="#93c5fd" fontSize="12">Superfície Terrestre</text>

            <path d="M 50 50 Q 300 20 550 50" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="6 4" />
            <text x="300" y="35" textAnchor="middle" fill="#d8b4fe" fontSize="12">Camada Ionosférica (Reflexão HF)</text>

            {/* Wave 1: Ground wave */}
            <path d="M 120 160 Q 220 145 320 160" fill="none" stroke="#22c55e" strokeWidth="3" />
            <circle cx="210" cy="135" r="14" fill="#22c55e" />
            <text x="205" y="140" fill="#000" fontSize="14" fontWeight="bold">A</text>

            {/* Wave 2: Sky wave */}
            <path d="M 120 160 L 290 35 L 480 160" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 3" />
            <circle cx="290" cy="65" r="14" fill="#f59e0b" />
            <text x="285" y="70" fill="#000" fontSize="14" fontWeight="bold">B</text>

            {/* Transmitter and Receiver */}
            <rect x="100" y="150" width="30" height="20" rx="3" fill="#e2e8f0" />
            <rect x="470" y="150" width="30" height="20" rx="3" fill="#e2e8f0" />
            <text x="115" y="190" textAnchor="middle" fill="#cbd5e1" fontSize="11">Transmissor</text>
            <text x="485" y="190" textAnchor="middle" fill="#cbd5e1" fontSize="11">Receptor</text>
          </svg>
        )}
      </div>

      {caption && (
        <p className="text-xs text-slate-300 italic text-center">
          {caption}
        </p>
      )}

      {/* Component Reference Index if provided */}
      {componentLabels && componentLabels.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Legenda de Referência do Esquema:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {componentLabels.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-mono font-bold shrink-0">
                  {item.code}
                </span>
                <div>
                  <span className="font-semibold text-white block">{item.name}</span>
                  {item.functionDesc && (
                    <span className="text-[11px] text-slate-400 block">{item.functionDesc}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
