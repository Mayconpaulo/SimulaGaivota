import React, { useState } from 'react';
import { Criterion, Question, StudentAnswer } from '../types/exam';
import { GaivotaIcon } from './GaivotaIcon';

interface DiscursiveEvaluationModalProps {
  question: Question;
  studentAnswer: StudentAnswer;
  onClose: () => void;
  onUpdateAnswer: (updatedAnswer: StudentAnswer) => void;
}

export const DiscursiveEvaluationModal: React.FC<DiscursiveEvaluationModalProps> = ({
  question,
  studentAnswer,
  onClose,
  onUpdateAnswer,
}) => {
  // Local state initialized with evaluated criteria or base question criteria
  const [criteria, setCriteria] = useState<Criterion[]>(() => {
    if (studentAnswer.evaluatedCriteria && studentAnswer.evaluatedCriteria.length > 0) {
      return studentAnswer.evaluatedCriteria;
    }
    return (
      question.criteria?.map((c) => ({
        ...c,
        met: false,
        justification: 'Pendente de avaliação.',
      })) || []
    );
  });

  const totalGaivotasAwarded = criteria.reduce(
    (acc, c) => acc + (c.met ? c.gaivotas : 0),
    0
  );
  const totalMaxGaivotas = question.totalGaivotas || criteria.length;

  // Toggle criterion by student (manual adjustment)
  const handleToggleCriterion = (criterionId: string) => {
    const updated = criteria.map((c) => {
      if (c.id === criterionId) {
        const nextMet = !c.met;
        return {
          ...c,
          met: nextMet,
          manualOverride: true,
          justification: nextMet
            ? 'Gaivota concedida manualmente na revisão pelo aluno.'
            : 'Gaivota desmarcada manualmente pelo aluno.',
        };
      }
      return c;
    });

    setCriteria(updated);
    const newAwarded = updated.reduce(
      (acc, c) => acc + (c.met ? c.gaivotas : 0),
      0
    );

    onUpdateAnswer({
      ...studentAnswer,
      isEvaluated: true,
      gaivotasAwarded: newAwarded,
      evaluatedCriteria: updated,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl liquid-glass-dark border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Questão {question.number} Discursiva · CFST
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-medium text-slate-300">
                {question.subject}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Espelho de Correção & Avaliação por Gaivotas
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Score Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M3.5 13.5 L8.5 19 L20.5 5.5" />
              </svg>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">
                Placar de Gaivotas Conquistadas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                  {totalGaivotasAwarded}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  de {totalMaxGaivotas} gaivotas ({Math.round((totalGaivotasAwarded / (totalMaxGaivotas || 1)) * 100)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">
              Nota Proporcional da Questão
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {((totalGaivotasAwarded / (totalMaxGaivotas || 1)) * 10).toFixed(1)} / 10.0
            </span>
          </div>
        </div>

        {/* Enunciado */}
        <div className="mt-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enunciado Oficial
          </h3>
          <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
            {question.prompt}
          </p>
        </div>

        {/* Split Answers: Aluno vs Espelho */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Resposta Redigida pelo Aluno
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {studentAnswer.textAnswer ? `${studentAnswer.textAnswer.length} caracteres` : 'Sem resposta'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 min-h-[140px] max-h-[220px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {studentAnswer.textAnswer || (
                <span className="italic text-slate-400">Nenhum texto redigido.</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Espelho Oficial do Examinador (Gabarito)
            </span>
            <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 text-sm text-slate-800 dark:text-slate-200 min-h-[140px] max-h-[220px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {question.modelAnswer}
            </div>
          </div>
        </div>

        {/* Critérios de Gaivotas Detalhados com Ajuste Manual */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Critérios Oficiais de Gaivotas (Clique no visto para ajustar manualmente)
            </h3>
            <span className="text-[11px] text-slate-400 italic hidden sm:inline">
              Toque na gaivota para conceder ou retirar o visto
            </span>
          </div>

          <div className="space-y-2.5">
            {criteria.map((crit, idx) => (
              <div
                key={crit.id}
                onClick={() => handleToggleCriterion(crit.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  crit.met
                    ? 'border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                {/* Gaivota interactive button */}
                <div className="pt-0.5">
                  <GaivotaIcon
                    status={crit.met ? 'earned' : 'unearned'}
                    interactive
                    size="md"
                    onClick={(e?: any) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      handleToggleCriterion(crit.id);
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Critério {idx + 1} ({crit.gaivotas} {crit.gaivotas === 1 ? 'Gaivota' : 'Gaivotas'})
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        crit.met
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {crit.met ? 'Conquistada ✓' : 'Não Atendida'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-normal font-medium">
                    {crit.description}
                  </p>

                  {crit.justification && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="font-semibold">Parecer: </span>
                      {crit.justification}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Feedback / Improvements */}
        {(studentAnswer.generalFeedback || studentAnswer.improvements?.length) && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Parecer Geral do Examinador
            </h4>
            {studentAnswer.generalFeedback && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {studentAnswer.generalFeedback}
              </p>
            )}
            {studentAnswer.improvements && studentAnswer.improvements.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  Recomendações para gabaritar na próxima:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {studentAnswer.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Concluir Revisão das Gaivotas
          </button>
        </div>
      </div>
    </div>
  );
};
