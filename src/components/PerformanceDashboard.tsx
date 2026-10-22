import React from 'react';
import { Exam, ExamAttempt, Question } from '../types/exam';

interface PerformanceDashboardProps {
  attempts: ExamAttempt[];
  allQuestions: Question[];
  onStartErrorReview: () => void;
  onSelectExam: (examId: string) => void;
  exams: Exam[];
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  attempts,
  allQuestions,
  onStartErrorReview,
  onSelectExam,
  exams,
}) => {
  // Aggregate stats
  const totalGaivotasEarned = attempts.reduce(
    (acc, a) => acc + (a.totalGaivotasEarned || 0),
    0
  );
  const totalGaivotasPossible = attempts.reduce(
    (acc, a) => acc + (a.totalGaivotasPossible || 0),
    0
  );

  const averagePercentage =
    totalGaivotasPossible > 0
      ? Math.round((totalGaivotasEarned / totalGaivotasPossible) * 100)
      : 0;

  // Identify questions with missing gaivotas (caderno de erros)
  const missedQuestionsMap: Record<string, { question: Question; earned: number; max: number }> = {};
  attempts.forEach((att) => {
    Object.entries(att.answers).forEach(([qId, ans]) => {
      const q = allQuestions.find((item) => item.id === qId);
      if (q) {
        const earned = ans.gaivotasAwarded || 0;
        const max = q.totalGaivotas || 1;
        if (earned < max) {
          missedQuestionsMap[qId] = { question: q, earned, max };
        }
      }
    });
  });

  const missedQuestionsList = Object.values(missedQuestionsMap);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Overview Cards (Liquid Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gaivotas */}
        <div className="p-5 rounded-3xl liquid-glass-card border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total de Gaivotas (✓)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {totalGaivotasEarned}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {totalGaivotasPossible || 0} disputadas
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Vistos de acerto conquistados nas provas
          </span>
        </div>

        {/* Card 2: Aproveitamento Médio */}
        <div className="p-5 rounded-3xl liquid-glass-card border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Aproveitamento Geral
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold">
              %
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {averagePercentage}%
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              {averagePercentage >= 70 ? 'Apto (Aprovado)' : 'Em Preparação'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Índice de acerto doutrinário do CFST
          </span>
        </div>

        {/* Card 3: Sessões / Simulados Realizados */}
        <div className="p-5 rounded-3xl liquid-glass-card border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Sessões Realizadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {attempts.length}
            </span>
            <span className="text-xs text-slate-400">
              {attempts.length === 1 ? 'treino' : 'treinos'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Simulados, Flashcards e Drills executados
          </span>
        </div>

        {/* Card 4: Gaivotas Pendentes (Erros) */}
        <div className="p-5 rounded-3xl liquid-glass-card border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Caderno de Reforço
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              !
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-400 tabular-nums">
              {missedQuestionsList.length}
            </span>
            <span className="text-xs text-slate-400">
              itens a revisar
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Questões com gaivotas não alcançadas
          </span>
        </div>
      </div>

      {/* Caderno de Erros Banner (Liquid Glass) */}
      {missedQuestionsList.length > 0 && (
        <div className="p-6 rounded-3xl liquid-glass-card border border-rose-500/30 bg-rose-500/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Repetição Espaçada Militar
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-semibold text-rose-300">
                {missedQuestionsList.length} questões com gaivotas pendentes
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Praticar agora as questões onde você perdeu gaivotas?
            </h3>
            <p className="text-xs text-slate-300">
              O modo de Revisão Ativa foca a repetição nos pontos fracos até que 100% dos vistos do CFST sejam conquistados.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartErrorReview}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-2xl shadow-lg shadow-rose-600/30 transition-all whitespace-nowrap cursor-pointer"
          >
            Iniciar Revisão Ativa (Erros)
          </button>
        </div>
      )}

      {/* Attempts History (Liquid Glass) */}
      <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Histórico Recente de Treinamentos
        </h2>

        {attempts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhum simulado finalizado ainda. Inicie um simulado ou treino de flashcards para visualizar seu histórico.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attempts.map((att) => {
              const matchedExam = exams.find((e) => e.id === att.examId);
              const dateStr = new Date(att.startedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={att.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {att.mode.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {dateStr}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {matchedExam?.title || 'Sessão de Estudo CFST'}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {matchedExam?.subject || 'CFST 26/2'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">
                        Gaivotas
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {att.totalGaivotasEarned} / {att.totalGaivotasPossible} ✓
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">
                        Aproveitamento
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {att.finalScorePercent}%
                      </span>
                    </div>

                    {matchedExam && (
                      <button
                        type="button"
                        onClick={() => onSelectExam(matchedExam.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      >
                        Refazer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
