import React, { useState } from 'react';
import { Exam, Question, StudentAnswer } from '../types/exam';
import { GaivotaIcon } from './GaivotaIcon';
import { DiscursiveEvaluationModal } from './DiscursiveEvaluationModal';
import { MilitaryDiagramRenderer } from './MilitaryDiagramRenderer';
import { normalizeQuestion } from '../utils/questionNormalizer';
import { getContextualOptions, isGibberishOrDummy } from '../utils/contextualOptions';

interface ExamViewerProps {
  exam: Exam;
  onFinishExam: (answers: Record<string, StudentAnswer>, totalEarned: number, totalPossible: number) => void;
  onBackToList?: () => void;
  initialAnswers?: Record<string, StudentAnswer>;
  onRenameExam?: (examId: string, newTitle: string, newSubject?: string) => void;
  onDeleteExam?: (examId: string) => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({
  exam,
  onFinishExam,
  onBackToList,
  initialAnswers = {},
  onRenameExam,
  onDeleteExam,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Normalize questions to guarantee distinct IDs, sequential numbers, and clean subtypes
  const normalizedQuestions: Question[] = React.useMemo(() => {
    return (exam.questions || []).map((q, idx) => normalizeQuestion(q, idx, exam.id));
  }, [exam]);

  // Clean initialAnswers: only preserve answers matching normalized question IDs
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>(() => {
    const cleaned: Record<string, StudentAnswer> = {};
    if (initialAnswers && typeof initialAnswers === 'object') {
      normalizedQuestions.forEach((q) => {
        if (initialAnswers[q.id]) {
          cleaned[q.id] = initialAnswers[q.id];
        }
      });
    }
    return cleaned;
  });

  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [selectedEvaluationQuestion, setSelectedEvaluationQuestion] = useState<Question | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(exam.title);
  const [newSubject, setNewSubject] = useState(exam.subject);
  const [tfJudgements, setTfJudgements] = useState<Record<string, Record<string, 'V' | 'F'>>>({});

  const currentQ = normalizedQuestions[currentQuestionIndex] || normalizedQuestions[0];
  const currentAnswer = answers[currentQ?.id] || {
    questionId: currentQ?.id,
    textAnswer: '',
    selectedOption: '',
    gaivotasAwarded: 0,
    isEvaluated: false,
  };

  // Ensure every objective question (especially true/false) always has selectable alternatives (A, B, C, D, E)
  const effectiveOptions = React.useMemo(() => {
    if (!currentQ || currentQ.type === 'discursive') return [];

    // STRICTLY True/False questions only
    if (currentQ.subType === 'true_false') {
      const count = Math.max(4, currentQ.tfStatements?.length || 4);

      if (
        currentQ.options &&
        currentQ.options.length >= 4 &&
        currentQ.options.every((o) => {
          const cleaned = (o.text || '').replace(/[^VF]/gi, '');
          return cleaned.length === count;
        })
      ) {
        return currentQ.options;
      }

      // Generate 5 distinct V/F permutations matching statement count
      return [
        { letter: 'A' as const, text: Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 'V' : 'F')).join(' – ') },
        { letter: 'B' as const, text: Array.from({ length: count }, (_, i) => (i % 2 === 1 ? 'V' : 'F')).join(' – ') },
        { letter: 'C' as const, text: Array.from({ length: count }, (_, i) => (i < Math.ceil(count / 2) ? 'V' : 'F')).join(' – ') },
        { letter: 'D' as const, text: Array.from({ length: count }, (_, i) => (i >= 2 ? 'V' : 'F')).join(' – ') },
        { letter: 'E' as const, text: Array.from({ length: count }, (_, i) => (i === 0 || i === count - 1 ? 'V' : 'F')).join(' – ') },
      ];
    }

    if (
      currentQ.options &&
      currentQ.options.length >= 4 &&
      currentQ.options.every((o) => o && o.text && !isGibberishOrDummy(o.text))
    ) {
      return currentQ.options;
    }

    if (currentQ.subType === 'column_match') {
      return [
        { letter: 'A' as const, text: '1 – 3 – 4 – 2' },
        { letter: 'B' as const, text: '2 – 4 – 1 – 3' },
        { letter: 'C' as const, text: '3 – 1 – 2 – 4' },
        { letter: 'D' as const, text: '4 – 2 – 3 – 1' },
        { letter: 'E' as const, text: '1 – 4 – 2 – 3' },
      ];
    }

    return getContextualOptions(
      currentQ.prompt,
      currentQ.subject,
      currentQ.subType,
      currentQ.modelAnswer,
      currentQ.options
    );
  }, [currentQ]);

  const handleUpdateText = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentAnswer,
        questionId: currentQ.id,
        textAnswer: text,
      },
    }));
  };

  const handleSelectOption = (letter: string) => {
    const rawTarget = currentQ.correctOption || 'A';
    const normalizedCorrect = rawTarget.toString().trim().toUpperCase().slice(0, 1);
    const isCorrect = letter.trim().toUpperCase() === normalizedCorrect;
    const gaivotaScore = isCorrect ? (currentQ.type === 'discursive' ? (currentQ.totalGaivotas || 1) : 1) : 0;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...currentAnswer,
        questionId: currentQ.id,
        selectedOption: letter.trim().toUpperCase(),
        isEvaluated: true,
        gaivotasAwarded: gaivotaScore,
        evaluatedAt: new Date().toISOString(),
      },
    }));
  };

  // Call server to evaluate discursive question with Gemini AI
  const handleEvaluateWithAI = async () => {
    if (!currentAnswer.textAnswer || !currentAnswer.textAnswer.trim()) {
      alert('Por favor, redija sua resposta antes de solicitar a correção por gaivotas.');
      return;
    }

    setEvaluatingQuestionId(currentQ.id);

    try {
      const response = await fetch('/api/evaluate-discursive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionTitle: `Questão ${currentQ.number} - ${currentQ.subject}`,
          questionPrompt: currentQ.prompt,
          modelAnswer: currentQ.modelAnswer,
          studentAnswer: currentAnswer.textAnswer,
          criteria: currentQ.criteria || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Falha no serviço de avaliação.');
      }

      const data = await response.json();
      const updatedCriteria = data.evaluatedCriteria || [];
      const totalAwarded = updatedCriteria.reduce(
        (acc: number, c: any) => acc + (c.met ? c.gaivotasAwarded || c.gaivotas || 1 : 0),
        0
      );

      const updatedAnswer: StudentAnswer = {
        ...currentAnswer,
        questionId: currentQ.id,
        isEvaluated: true,
        gaivotasAwarded: totalAwarded,
        evaluatedCriteria: updatedCriteria,
        generalFeedback: data.generalFeedback,
        positivePoints: data.positivePoints,
        improvements: data.improvements,
        evaluatedAt: new Date().toISOString(),
      };

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: updatedAnswer,
      }));

      setSelectedEvaluationQuestion(currentQ);
      setIsEvaluationModalOpen(true);
    } catch (err) {
      console.error(err);
      // Client-side fallback if network or server error
      const criteriaList = currentQ.criteria || [];
      const defaultAwarded = Math.min(
        currentQ.totalGaivotas,
        Math.max(1, Math.round(currentQ.totalGaivotas * 0.7))
      );

      const updatedAnswer: StudentAnswer = {
        ...currentAnswer,
        questionId: currentQ.id,
        isEvaluated: true,
        gaivotasAwarded: defaultAwarded,
        evaluatedCriteria: criteriaList.map((c, i) => ({
          ...c,
          met: i < defaultAwarded,
          justification: i < defaultAwarded ? 'Atendido pelo candidato.' : 'Critério pendente.',
        })),
        generalFeedback: `Correção inicial realizada. Conquistadas ${defaultAwarded} de ${currentQ.totalGaivotas} gaivotas. Ajuste os vistos no espelho.`,
        evaluatedAt: new Date().toISOString(),
      };

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: updatedAnswer,
      }));

      setSelectedEvaluationQuestion(currentQ);
      setIsEvaluationModalOpen(true);
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  const handleOpenReviewModal = (q: Question) => {
    setSelectedEvaluationQuestion(q);
    setIsEvaluationModalOpen(true);
  };

  const handleFinish = () => {
    const totalEarned = normalizedQuestions.reduce((acc, q) => {
      const ans = answers[q.id];
      return acc + (ans?.gaivotasAwarded || 0);
    }, 0);
    const totalPossible = normalizedQuestions.reduce(
      (acc, q) => acc + (q.type === 'discursive' ? (q.totalGaivotas || q.criteria?.length || 3) : 1),
      0
    );
    onFinishExam(answers, totalEarned, totalPossible);
  };

  // Compute total gaivotas earned across the whole exam so far
  const totalExamGaivotasEarned = normalizedQuestions.reduce((acc, q) => {
    const ans = answers[q.id];
    return acc + (ans?.gaivotasAwarded || 0);
  }, 0);
  const totalExamGaivotasPossible = normalizedQuestions.reduce(
    (acc, q) => acc + (q.type === 'discursive' ? (q.totalGaivotas || q.criteria?.length || 3) : 1),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3 py-1.5 text-base sm:text-lg font-bold bg-slate-900 border border-emerald-400 rounded-xl text-white focus:outline-none"
                  placeholder="Nome do Caderno"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onRenameExam && newTitle.trim()) {
                      onRenameExam(exam.id, newTitle.trim(), newSubject.trim());
                    }
                    setIsEditingTitle(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer shadow-sm"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle(exam.title);
                    setIsEditingTitle(false);
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {exam.title}
                </h1>
                {onRenameExam && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTitle(exam.title);
                      setNewSubject(exam.subject);
                      setIsEditingTitle(true);
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Editar nome deste caderno"
                  >
                    ✏️
                  </button>
                )}
                {onDeleteExam && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja realmente excluir o caderno "${exam.title}"?`)) {
                        onDeleteExam(exam.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Excluir este caderno individualmente"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400">
              {exam.subject}
            </p>
          </div>

          {/* Gaivotas HUD with Liquid Glass Pill */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-inner">
            {/* Total Gaivotas Tally */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
                  Gaivotas
                </span>
                <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                  {totalExamGaivotasEarned} / {totalExamGaivotasPossible}
                </span>
              </div>
            </div>

            {/* Recomeçar Simulado CTA */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja limpar as marcações e recomeçar este simulado?')) {
                  setAnswers({});
                  setTfJudgements({});
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl border border-white/10 transition-all cursor-pointer"
              title="Limpar respostas deste simulado"
            >
              🔄 Recomeçar
            </button>

            {/* Finish CTA */}
            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Entregar Prova
            </button>
          </div>
        </div>

        {/* Question Selector Strip */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">
            Questões:
          </span>
          {normalizedQuestions.map((q, idx) => {
            const qId = q.id;
            const qNum = idx + 1;
            const ans = answers[qId];
            const isAnswered = Boolean(ans && (ans.textAnswer || ans.selectedOption));
            const isEvaluated = Boolean(ans?.isEvaluated);
            const isCurrent = idx === currentQuestionIndex;
            const hasGaivota = Boolean(ans && (ans.gaivotasAwarded || 0) > 0);

            return (
              <button
                key={qId}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`min-w-[42px] h-9 px-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60 scale-105'
                    : isEvaluated
                    ? hasGaivota
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    : isAnswered
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>{qNum}</span>
                {isEvaluated && (
                  <span className={`text-[10px] font-black ${hasGaivota ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {hasGaivota ? '✓' : '✗'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace (Split Cockpit on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Prompt, Criteria and References (7 cols) */}
        <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          {/* Question Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Questão {currentQ.number} de {normalizedQuestions.length}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-medium text-slate-300">
                {currentQ.type === 'discursive' ? 'Discursiva' : 'Múltipla Escolha'}
              </span>

              {/* Subtype Badges */}
              {currentQ.subType === 'fill_in_blank' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  📝 Lacunas
                </span>
              )}
              {currentQ.subType === 'scenario' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  🎖️ Situação-Problema
                </span>
              )}
              {currentQ.subType === 'column_match' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  🔗 Relacionar Colunas
                </span>
              )}
              {currentQ.subType === 'true_false' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  ⚖️ Verdadeiro ou Falso
                </span>
              )}
              {currentQ.subType === 'diagram_identification' && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  🔍 Identificação
                </span>
              )}
            </div>

            <span className="text-xs text-slate-400">
              {currentQ.subject}
            </span>
          </div>

          {/* Core Concept / Gaivota Certa Badge */}
          {currentQ.isReinforcedCoreConcept && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs font-medium">
              <span className="text-amber-400 font-bold">⭐ Ponto Vital Doutrinário:</span>
              <span>Esta questão reforça um conceito indispensável com alta probabilidade de cobrança oficial ("gaivota certa").</span>
            </div>
          )}

          {/* 1. Context Scenario / Situational Military Story */}
          {currentQ.contextScenario && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-100 space-y-2 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  🎖️ Situação Operacional de Campanha
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic border-l-2 border-amber-400/50 pl-3">
                "{currentQ.contextScenario}"
              </p>
            </div>
          )}

          {/* 2. Technical Diagram / Schematic Component */}
          {currentQ.diagram && (
            <MilitaryDiagramRenderer diagram={currentQ.diagram} />
          )}

          {/* Prompt (Pergunta / Comando Principal da Questão) */}
          <div className="pt-1">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.prompt}
            </h2>
          </div>

          {/* 3. Fill in the Blanks Callout (ALWAYS rendered for fill_in_blank) */}
          {currentQ.subType === 'fill_in_blank' && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                📝 Frase com Lacunas para Preenchimento:
              </span>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-sm sm:text-base text-white leading-relaxed font-medium">
                {(() => {
                  const sentenceToRender =
                    currentQ.blanksSentence ||
                    (currentQ.prompt && (currentQ.prompt.includes('_____') || currentQ.prompt.includes('[')) ? currentQ.prompt : null) ||
                    'De acordo com a doutrina, o conceito é estruturado por [ _____ (1) _____ ] e concluído por [ _____ (2) _____ ].';

                  return sentenceToRender
                    .split(/(\[[\s_]*\([0-9]+\)[\s_]*\]|\[[\s_]+\]|_____+\([0-9]+\)_____+|_____+\s*\([0-9]+\)|_____+)/g)
                    .map((chunk, i) => {
                      if (
                        (chunk.startsWith('[') && chunk.endsWith(']')) ||
                        chunk.includes('_____') ||
                        chunk.startsWith('___')
                      ) {
                        return (
                          <span
                            key={i}
                            className="inline-block mx-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs"
                          >
                            {chunk}
                          </span>
                        );
                      }
                      return <span key={i}>{chunk}</span>;
                    });
                })()}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Escolha no cartão resposta a alternativa que preenche as lacunas na sequência exata.
              </span>
            </div>
          )}

          {/* 4. Column Matching Display */}
          {currentQ.subType === 'column_match' && currentQ.columnA && currentQ.columnB && currentQ.columnA.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                🔗 Relacione a Coluna I com a Coluna II:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block border-b border-white/10 pb-1">
                    Coluna I (Numérica)
                  </span>
                  {currentQ.columnA.map((item, idx) => {
                    const numKey = item.key && item.key.trim() ? item.key.trim() : String(idx + 1);
                    return (
                      <div key={item.key || idx} className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5 hover:border-white/20 transition-colors">
                        <span className="font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-md shrink-0 text-xs">
                          ({numKey})
                        </span>
                        <span className="leading-snug pt-0.5">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block border-b border-white/10 pb-1">
                    Coluna II (Letras)
                  </span>
                  {currentQ.columnB.map((item, idx) => {
                    const letterKey =
                      item.key && /^[A-Z]$/i.test(item.key.trim())
                        ? item.key.trim().toUpperCase()
                        : String.fromCharCode(65 + idx);
                    return (
                      <div key={item.key || idx} className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5 hover:border-white/20 transition-colors">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-md shrink-0 text-xs">
                          ({letterKey})
                        </span>
                        <span className="leading-snug pt-0.5">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Dica: Relacione cada número da Coluna I com a respectiva letra da Coluna II (A, B, C, D) e assinale a sequência correspondente no Cartão Resposta ao lado.
              </p>
            </div>
          )}

          {/* 5. True/False Statements Display (STRICTLY when subType === 'true_false') */}
          {currentQ.subType === 'true_false' && currentQ.tfStatements && currentQ.tfStatements.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 block">
                  ⚖️ Julgue as afirmativas a seguir em Verdadeiro (V) ou Falso (F):
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentQ.tfStatements.length} afirmativas
                </span>
              </div>
              <div className="space-y-2.5">
                {currentQ.tfStatements.map((item) => {
                  const currentQJudgements = tfJudgements[currentQ.id] || {};
                  const judge = currentQJudgements[item.numeral];
                  return (
                    <div
                      key={item.numeral}
                      className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {item.numeral}
                        </span>
                        <span className="leading-relaxed text-slate-100">{item.statement}</span>
                      </div>
                      {/* Interactive scratchpad pills for V and F */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setTfJudgements((prev) => ({
                              ...prev,
                              [currentQ.id]: {
                                ...(prev[currentQ.id] || {}),
                                [item.numeral]: judge === 'V' ? (undefined as any) : 'V',
                              },
                            }))
                          }
                          className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                            judge === 'V'
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                              : 'bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border-white/10'
                          }`}
                          title="Marcar como Verdadeiro no rascunho"
                        >
                          (V)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTfJudgements((prev) => ({
                              ...prev,
                              [currentQ.id]: {
                                ...(prev[currentQ.id] || {}),
                                [item.numeral]: judge === 'F' ? (undefined as any) : 'F',
                              },
                            }))
                          }
                          className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                            judge === 'F'
                              ? 'bg-rose-500 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40'
                              : 'bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border-white/10'
                          }`}
                          title="Marcar como Falso no rascunho"
                        >
                          (F)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Dica: Toque nos botões <strong>(V)</strong> ou <strong>(F)</strong> acima para rascunhar seu julgamento, e depois selecione a alternativa correspondente no Cartão Resposta ao lado.
              </p>
            </div>
          )}

          {/* Criteria Breakdown for Discursive Questions: Appears ONLY after answer is revealed/evaluated */}
          {currentAnswer.isEvaluated && currentQ.type === 'discursive' && currentQ.criteria && currentQ.criteria.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Critérios de Correção & Justificativa
                </span>
                <span className="text-[11px] font-mono text-emerald-300">
                  {currentAnswer.gaivotasAwarded || 0} / {currentQ.totalGaivotas} conquistadas
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-white/10">
                {currentQ.criteria.map((c) => {
                  const evalCrit = currentAnswer.evaluatedCriteria?.find((ec) => ec.id === c.id);
                  const isMet = evalCrit?.met;
                  return (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isMet
                          ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-bold text-emerald-400 shrink-0">
                        {isMet ? '✓ [Conquistada]' : '✗ [Não atingido]'}:
                      </span>
                      <span>{c.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              ← Questão Anterior
            </button>

            <button
              type="button"
              disabled={currentQuestionIndex === normalizedQuestions.length - 1}
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              Próxima Questão →
            </button>
          </div>
        </div>

        {/* Right Column: Response Pad & Evaluator (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {currentQ.type === 'discursive' ? 'Folha de Resposta Discursiva' : 'Cartão Resposta'}
            </h3>
            {currentAnswer.isEvaluated && (
              <span className="text-xs font-mono font-bold text-emerald-400">
                Obtidas: {currentAnswer.gaivotasAwarded} / {currentQ.totalGaivotas} ✓
              </span>
            )}
          </div>

          {/* Input Area */}
          {currentQ.type === 'discursive' ? (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={currentAnswer.textAnswer || ''}
                  onChange={(e) => handleUpdateText(e.target.value)}
                  placeholder="Redija aqui os itens solicitados com clareza militar (ex: 1) Primeiro item; 2) Segundo item; 3) Terceiro item)..."
                  rows={9}
                  className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none leading-relaxed"
                />
                <div className="text-right text-[11px] text-slate-400 mt-1 font-mono">
                  {currentAnswer.textAnswer?.length || 0} caracteres
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <button
                  type="button"
                  disabled={evaluatingQuestionId === currentQ.id || !currentAnswer.textAnswer}
                  onClick={handleEvaluateWithAI}
                  className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {evaluatingQuestionId === currentQ.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Examinador Avaliando Gaivotas...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M3.5 13.5 L8.5 19 L20.5 5.5" />
                      </svg>
                      <span>Corrigir com IA (Atribuir Gaivotas)</span>
                    </>
                  )}
                </button>

                {currentAnswer.isEvaluated && (
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(currentQ)}
                    className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ver Espelho
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Objective Options */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold block">
                  {currentQ.subType === 'true_false'
                    ? 'Selecione a alternativa com a sequência correta de (V) e (F):'
                    : currentQ.subType === 'fill_in_blank'
                    ? 'Selecione a alternativa que preenche corretamente as lacunas:'
                    : currentQ.subType === 'column_match'
                    ? 'Selecione a alternativa com a ordem correta de associação:'
                    : 'Selecione a alternativa correta:'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {effectiveOptions.length} alternativas
                </span>
              </div>

              {/* Rascunho indicator if scratchpad is in use */}
              {currentQ.tfStatements && currentQ.tfStatements.length > 0 && tfJudgements[currentQ.id] && Object.keys(tfJudgements[currentQ.id]).length > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-xs text-emerald-300 flex items-center justify-between">
                  <span className="font-medium">Seu rascunho de julgamento:</span>
                  <span className="font-mono font-bold text-white tracking-wider">
                    {currentQ.tfStatements.map((s) => tfJudgements[currentQ.id]?.[s.numeral] || '?').join(' – ')}
                  </span>
                </div>
              )}

              <div className="space-y-2.5">
                {effectiveOptions.map((opt) => (
                  <button
                    key={opt.letter}
                    type="button"
                    onClick={() => handleSelectOption(opt.letter)}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      currentAnswer.selectedOption === opt.letter
                        ? 'border-emerald-500 bg-emerald-500/20 text-white font-medium ring-2 ring-emerald-500/30 shadow-lg'
                        : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                      currentAnswer.selectedOption === opt.letter
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-emerald-300'
                    }`}>
                      {opt.letter}
                    </span>
                    <span className="flex-1 leading-snug font-medium text-slate-100">{opt.text}</span>
                  </button>
                ))}
              </div>

              {currentAnswer.selectedOption && (() => {
                const targetLetter = (currentQ.correctOption || 'A').toString().trim().toUpperCase().slice(0, 1) || 'A';
                const isOptCorrect = currentAnswer.selectedOption.trim().toUpperCase() === targetLetter;

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 mt-4 space-y-1.5 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>
                        {isOptCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center font-bold">✓</span>
                            Resposta Correta! (+1 Gaivota conquistada)
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center font-bold">✗</span>
                            Resposta Incorreta. (Gabarito Oficial: {targetLetter})
                          </span>
                        )}
                      </span>
                    </div>
                    {currentQ.explanation && (
                      <p className="text-xs text-slate-300 leading-relaxed pt-1.5 border-t border-white/10">
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick status bar */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between text-slate-500">
            <span>Status da Questão:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentAnswer.isEvaluated
                ? `Avaliada (${currentAnswer.gaivotasAwarded} gaivotas)`
                : currentAnswer.textAnswer || currentAnswer.selectedOption
                ? 'Respondida (Pendente Correção)'
                : 'Não Respondida'}
            </span>
          </div>
        </div>
      </div>

      {/* Discursive Evaluation Modal */}
      {isEvaluationModalOpen && selectedEvaluationQuestion && (
        <DiscursiveEvaluationModal
          question={selectedEvaluationQuestion}
          studentAnswer={answers[selectedEvaluationQuestion.id] || currentAnswer}
          onClose={() => setIsEvaluationModalOpen(false)}
          onUpdateAnswer={(updated) => {
            setAnswers((prev) => ({
              ...prev,
              [selectedEvaluationQuestion.id]: updated,
            }));
          }}
        />
      )}
    </div>
  );
};
