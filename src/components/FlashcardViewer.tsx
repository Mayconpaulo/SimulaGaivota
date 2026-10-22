import React, { useState, useMemo } from 'react';
import { Question, StudentAnswer } from '../types/exam';
import { isGibberishOrLetterList, normalizeQuestion } from '../utils/questionNormalizer';

interface FlashcardViewerProps {
  questions: Question[];
  onFinishSession?: () => void;
  savedAnswers?: Record<string, StudentAnswer>;
  onUpdateAnswer?: (questionId: string, answer: StudentAnswer) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  questions: rawQuestions,
  onFinishSession,
  savedAnswers = {},
  onUpdateAnswer,
}) => {
  // Normalize all incoming questions to guarantee consistent IDs, subTypes, and eliminate corrupted letter lists
  const questions = useMemo(() => {
    return (rawQuestions || []).map((q, idx) => normalizeQuestion(q, idx, 'fc'));
  }, [rawQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDirectMode, setIsDirectMode] = useState(true);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>(savedAnswers);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white/5 border border-white/10 rounded-3xl shadow-sm text-white">
        <h3 className="text-lg font-bold text-white">
          Nenhum cartão disponível neste filtro
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Ajuste as opções de matéria ou nível de dificuldade para gerar novos cartões.
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];

  // Helper to extract direct punchy fact for flashcard memorization
  const getDirectFact = (q: Question) => {
    // 1. Direct front
    let front = q.prompt;
    if (q.subType === 'fill_in_blank' && q.blanksSentence) {
      front = `Complete a lacuna: ${q.blanksSentence}`;
    } else if (q.cardDirectFact?.frontPrompt && q.cardDirectFact.frontPrompt.trim().length > 8) {
      front = q.cardDirectFact.frontPrompt;
    } else if (q.prompt.length > 130) {
      const sentences = q.prompt.split(/[.?!]/).filter(Boolean);
      const last = sentences[sentences.length - 1]?.trim();
      if (last && last.length > 15) {
        front = last + (last.endsWith('?') ? '' : '?');
      }
    }

    // 2. Direct back: strictly reject letter lists like "A, B, C, D"
    let back = '';
    let completedSentence: string | undefined = undefined;

    // Check if cardDirectFact has a valid, non-letter substantive answer
    const hasValidDirectFact =
      q.cardDirectFact?.backAnswer &&
      !isGibberishOrLetterList(q.cardDirectFact.backAnswer) &&
      (q.subType === 'true_false' || !/^[VF\s\-,–—.]+$/i.test(q.cardDirectFact.backAnswer));

    if (hasValidDirectFact) {
      back = q.cardDirectFact!.backAnswer;
    }

    // If back is still missing or bad, resolve from the correct option text
    const correctLetter = (q.correctOption || 'A').toString().trim().toUpperCase().slice(0, 1) || 'A';
    const opt = (q.options || []).find((o) => o.letter.toUpperCase() === correctLetter) || q.options?.[0];

    if (!back || isGibberishOrLetterList(back)) {
      if (opt && !isGibberishOrLetterList(opt.text) && (q.subType === 'true_false' || !/^[VF\s\-,–—.]+$/i.test(opt.text))) {
        if (q.subType === 'fill_in_blank') {
          back = `${opt.letter}) ${opt.text}`;
        } else if (q.subType === 'column_match') {
          back = `Sequência correta (${opt.letter}): ${opt.text}`;
        } else if (q.subType === 'true_false') {
          back = `Gabarito (${opt.letter}): ${opt.text}`;
        } else {
          back = `${opt.letter}) ${opt.text}`;
        }
      } else if (q.modelAnswer && !isGibberishOrLetterList(q.modelAnswer) && (q.subType === 'true_false' || !/^[VF\s\-,–—.]+$/i.test(q.modelAnswer))) {
        back = q.modelAnswer;
      } else if (q.explanation && !isGibberishOrLetterList(q.explanation)) {
        back = q.explanation;
      } else {
        back = 'Conforme determinação da doutrina militar oficial.';
      }
    }

    // For fill-in-the-blank questions: build the complete doctrine sentence with lacunas resolved
    if (q.subType === 'fill_in_blank' && q.blanksSentence) {
      const optText = (opt && !isGibberishOrLetterList(opt.text) && !/^[VF\s\-,–—.]+$/i.test(opt.text))
        ? opt.text
        : (back && !isGibberishOrLetterList(back) ? back.replace(/^[A-E]\)\s*/i, '') : '');

      if (optText) {
        const parts = optText.split(/[\/,;]+/).map((p) => p.trim()).filter(Boolean);
        let filled = q.blanksSentence;
        if (parts.length >= 2) {
          filled = filled
            .replace(/\[\s*_{2,}\s*\(1\)\s*_{2,}\s*\]/g, `[ ${parts[0]} ]`)
            .replace(/\[\s*_{2,}\s*\(2\)\s*_{2,}\s*\]/g, `[ ${parts[1]} ]`);
          if (parts.length >= 3) {
            filled = filled.replace(/\[\s*_{2,}\s*\(3\)\s*_{2,}\s*\]/g, `[ ${parts[2]} ]`);
          }
        } else if (parts.length === 1) {
          filled = filled.replace(/\[\s*_{2,}\s*\(1\)\s*_{2,}\s*\]/g, `[ ${parts[0]} ]`);
        }
        if (filled !== q.blanksSentence) {
          completedSentence = filled;
        }
      }
    }

    return { front, back, completedSentence };
  };

  const directFact = getDirectFact(currentQ);

  const handleRateAnswer = (didGetRight: boolean) => {
    const updated: StudentAnswer = {
      questionId: currentQ.id,
      textAnswer: didGetRight ? 'Respondido verbalmente (Correto)' : 'Respondido verbalmente (Incorreto)',
      isEvaluated: true,
      gaivotasAwarded: didGetRight ? (currentQ.type === 'discursive' ? (currentQ.totalGaivotas || 3) : 1) : 0,
      retentionRating: didGetRight ? 'bom' : 'errei',
      evaluatedCriteria: currentQ.criteria?.map((c) => ({
        ...c,
        met: didGetRight,
      })),
    };

    setAnswers((prev) => ({ ...prev, [currentQ.id]: updated }));
    if (onUpdateAnswer) onUpdateAnswer(currentQ.id, updated);

    // Dynamic pa-pum advance
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 200);
    } else {
      if (onFinishSession) onFinishSession();
    }
  };

  const handleNextCard = () => {
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 150);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((i) => i - 1);
      }, 150);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls & Progress Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 liquid-glass-card border border-white/10 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Card {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-xs font-medium text-slate-300">
            {currentQ.subject}
          </span>
          {/* Direct Mode Toggle Switch */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setIsDirectMode(true)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                isDirectMode
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Modo Direto (Pá-Pum)
            </button>
            <button
              type="button"
              onClick={() => setIsDirectMode(false)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                !isDirectMode
                  ? 'bg-white/20 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Enunciado Completo
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div className="w-full min-h-[440px] perspective-[1200px]">
        <div
          className={`relative w-full h-full min-h-[440px] transition-transform duration-500 rounded-3xl transform-style-preserve-3d shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= CARD FRONT ================= */}
          <div
            onClick={() => setIsFlipped(true)}
            className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/15 text-white flex flex-col justify-between backface-hidden shadow-2xl cursor-pointer hover:border-emerald-400/40 transition-colors ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              {/* Question Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  {isDirectMode ? (
                    <>
                      <span>⚡</span>
                      <span>Card Rápido (Memorização Direta)</span>
                    </>
                  ) : (
                    <span>Enunciado Completo da Prova</span>
                  )}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Toque para ver a resposta ↷
                </span>
              </div>

              {/* Direct Mode: Punchy Short Question */}
              {isDirectMode ? (
                <div className="mt-6 sm:mt-10 space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-emerald-400/30 shadow-inner">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-2">
                      Pergunta Direta:
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                      {directFact.front}
                    </h3>
                  </div>
                  {currentQ.subType === 'fill_in_blank' && (
                    <p className="text-xs text-slate-400 italic">
                      Dica: Identifique os termos exatos que completam as lacunas (1) e (2).
                    </p>
                  )}
                  {currentQ.subType === 'true_false' && (
                    <p className="text-xs text-slate-400 italic">
                      Dica: Julgue a veracidade doutrinária das afirmativas.
                    </p>
                  )}
                </div>
              ) : (
                /* Full Mode: Full Prompt, Subtype Elements & Options */
                <div className="mt-5 space-y-4">
                  {currentQ.contextScenario && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs italic">
                      "{currentQ.contextScenario}"
                    </div>
                  )}

                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQ.prompt}
                  </h3>

                  {/* Fill-in-the-blank Sentence Box */}
                  {currentQ.blanksSentence && (
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-400/30 text-emerald-200 text-sm leading-relaxed font-mono">
                      {currentQ.blanksSentence}
                    </div>
                  )}

                  {/* True/False Statements */}
                  {currentQ.tfStatements && currentQ.tfStatements.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {currentQ.tfStatements.map((item) => (
                        <div
                          key={item.numeral}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-3"
                        >
                          <span className="font-mono font-bold text-emerald-400 shrink-0">
                            {item.numeral}.
                          </span>
                          <span>{item.statement}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Columns */}
                  {currentQ.columnA && currentQ.columnA.length > 0 && currentQ.columnB && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <span className="font-bold text-emerald-400 block mb-1">Coluna I</span>
                        {currentQ.columnA.map((item) => (
                          <div key={item.key} className="text-slate-300">
                            <strong className="text-white">({item.key})</strong> {item.text}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <span className="font-bold text-emerald-400 block mb-1">Coluna II</span>
                        {currentQ.columnB.map((item) => (
                          <div key={item.key} className="text-slate-300">
                            <strong className="text-white">( &nbsp; )</strong> {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Options List */}
                  {currentQ.options && currentQ.options.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {currentQ.options.map((opt) => (
                        <div
                          key={opt.letter}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5"
                        >
                          <span className="font-mono font-bold text-emerald-400">
                            {opt.letter})
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom prompt note & Flip Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                💬 Responda mentalmente ou em voz alta
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="px-5 py-2.5 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>Ver Resposta</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div
            className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl liquid-glass-dark border-2 border-emerald-400/40 text-white flex flex-col justify-between overflow-y-auto shadow-2xl ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="space-y-4">
              {/* Back Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  {isDirectMode ? '⚡ Resposta Direta (Pá-Pum)' : 'Gabarito Oficial / Espelho'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Voltar à Pergunta ↺
                </button>
              </div>

              {/* Direct Mode: Clear Substantive Answer (NEVER "A, B, C, D") */}
              {isDirectMode ? (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 bg-emerald-500/20 rounded-2xl border border-emerald-400/50 shadow-inner">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                      {currentQ.subType === 'fill_in_blank'
                        ? '✓ Termos Oficiais da Lacuna:'
                        : currentQ.subType === 'true_false'
                        ? '✓ Gabarito da Sequência:'
                        : '✓ Resposta Rápida:'}
                    </span>
                    <p className="text-lg sm:text-xl text-white font-bold leading-relaxed">
                      {directFact.back}
                    </p>
                  </div>

                  {/* Render the full doctrine sentence with lacunas resolved */}
                  {directFact.completedSentence && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/30 text-emerald-100 text-sm leading-relaxed">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                        Texto Oficial Integral Preenchido:
                      </span>
                      <p className="font-semibold">{directFact.completedSentence}</p>
                    </div>
                  )}

                  {currentQ.explanation && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-400 block mb-1">Nota Doutrinária:</span>
                      {currentQ.explanation}
                    </div>
                  )}
                </div>
              ) : (
                /* Full Mode: Complete Official Mirror */
                <div className="space-y-4">
                  {currentQ.type === 'objective' && (
                    <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-400/40">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                        Alternativa Correta / Termos Oficiais:
                      </span>
                      <p className="text-base sm:text-lg text-white font-bold">
                        {directFact.back}
                      </p>
                    </div>
                  )}

                  {directFact.completedSentence && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/30 text-emerald-100 text-sm leading-relaxed">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                        Texto Integral Preenchido:
                      </span>
                      <p className="font-semibold">{directFact.completedSentence}</p>
                    </div>
                  )}

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Espelho Doutrinário:
                    </span>
                    <p className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                      {currentQ.modelAnswer && !isGibberishOrLetterList(currentQ.modelAnswer)
                        ? currentQ.modelAnswer
                        : currentQ.explanation || 'Conforme instrução doutrinária militar oficial.'}
                    </p>
                    {currentQ.explanation && currentQ.explanation !== currentQ.modelAnswer && (
                      <p className="text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-white/10">
                        {currentQ.explanation}
                      </p>
                    )}
                  </div>

                  {/* Criteria breakdown if discursive */}
                  {currentQ.criteria && currentQ.criteria.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Pontos-Chave (Gaivotas em Disputa):
                      </span>
                      <div className="space-y-1.5">
                        {currentQ.criteria.map((c, idx) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2"
                          >
                            <span className="font-mono text-emerald-400 font-bold shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{c.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom: Dynamic Pa-Pum Self Rating */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-400 text-center block">
                Você acertou a resposta?
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRateAnswer(false)}
                  className="py-3 px-4 rounded-2xl font-bold text-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/40"
                >
                  <span className="text-lg leading-none">✕</span>
                  <span>Errei</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRateAnswer(true)}
                  className="py-3 px-4 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span className="text-lg leading-none">✓</span>
                  <span>Acertei</span>
                </button>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrevCard}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  ← Anterior
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextCard}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    Pular Card →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onFinishSession}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Concluir Treino
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
