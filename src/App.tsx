/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Exam, ExamAttempt, Question, StudentAnswer, StudyMode, StudySessionConfig } from './types/exam';
import { INITIAL_EXAMS } from './data/mockExams';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ExamViewer } from './components/ExamViewer';
import { FlashcardViewer } from './components/FlashcardViewer';
import { MaterialUploadHub } from './components/MaterialUploadHub';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { CryptographyModule } from './components/CryptographyModule';
import { StudyConfigModal } from './components/StudyConfigModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AutoUpdater } from './components/AutoUpdater';
import { generateQuestionsForCFST } from './data/questionGenerator';
import { normalizeQuestion } from './utils/questionNormalizer';

export default function App() {
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      // Clear legacy storage keys
      localStorage.removeItem('simulagaivota_exams');
      localStorage.removeItem('simulagaivota_custom_exams');
      localStorage.removeItem('simulagaivota_user_exams');

      // Load saved custom user notebooks
      const saved = localStorage.getItem('simulagaivota_notebooks_v4');
      const userCustomExams: Exam[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((e: Exam) => {
              if (e && e.id && !INITIAL_EXAMS.some((init) => init.id === e.id)) {
                userCustomExams.push({
                  ...e,
                  questions: (e.questions || []).map((q: Question, idx: number) =>
                    normalizeQuestion(q, idx, e.id)
                  ),
                });
              }
            });
          }
        } catch (err) {
          console.warn('Erro ao restaurar cadernos customizados:', err);
        }
      }

      // Normalize the official uploaded subjects
      const normalizedInitial = INITIAL_EXAMS.map((exam) => ({
        ...exam,
        questions: (exam.questions || []).map((q: Question, idx: number) =>
          normalizeQuestion(q, idx, exam.id)
        ),
      }));

      return [...normalizedInitial, ...userCustomExams];
    } catch (e) {
      console.warn('Erro ao inicializar cadernos:', e);
      return INITIAL_EXAMS;
    }
  });

  const [activeTab, setActiveTab] = useState<'simulados' | 'flashcards' | 'criptografia' | 'materiais' | 'desempenho'>(() => {
    return 'simulados';
  });

  const [activeExamId, setActiveExamId] = useState<string>(() => {
    return INITIAL_EXAMS[0]?.id || '';
  });

  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('simulagaivota_attempts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e);
    }
    return [];
  });

  const [isStudySetupOpen, setIsStudySetupOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isGeneratingAIExam, setIsGeneratingAIExam] = useState(false);
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState<'todos' | 'facil' | 'medio' | 'dificil'>('todos');
  const [savedAnswersByExam, setSavedAnswersByExam] = useState<Record<string, Record<string, StudentAnswer>>>({});

  // Persist exams & attempts
  useEffect(() => {
    try {
      localStorage.setItem('simulagaivota_notebooks_v4', JSON.stringify(exams));
    } catch (e) {
      console.warn(e);
    }
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem('simulagaivota_attempts', JSON.stringify(attempts));
    } catch (e) {
      console.warn(e);
    }
  }, [attempts]);

  const activeExam = exams.find((e) => e.id === activeExamId) || exams[0] || null;

  // Collect all questions across all exams
  const allQuestions = exams.flatMap((e) => e.questions);

  // Identify questions where user lost gaivotas in previous attempts (missed questions)
  const missedQuestionsMap: Record<string, Question> = {};
  attempts.forEach((att) => {
    Object.entries(att.answers).forEach(([qId, ans]) => {
      const q = allQuestions.find((item) => item.id === qId);
      if (q) {
        const earned = ans.gaivotasAwarded || 0;
        const max = q.totalGaivotas || 1;
        if (earned < max) {
          missedQuestionsMap[qId] = q;
        }
      }
    });
  });
  const missedQuestionsList = Object.values(missedQuestionsMap);

  // Collect all unique prompts seen across all exams to prevent duplicate questions
  const seenQuestionPrompts = Array.from(
    new Set(exams.flatMap((e) => e.questions.map((q) => q.prompt.trim())))
  );

  // Filter questions for active study view
  const filteredQuestions = activeExam?.questions
    ? activeExam.questions
        .map((q, idx) => normalizeQuestion(q, idx, activeExam.id))
        .filter((q) => {
          if (activeDifficultyFilter === 'todos') return true;
          return q.difficulty === activeDifficultyFilter;
        })
    : [];

  // Calculate total gaivotas conquered
  const totalGaivotasEarned = attempts.reduce(
    (acc, a) => acc + (a.totalGaivotasEarned || 0),
    0
  );

  // Available subjects for configuration
  const allSubjects = Array.from(new Set(exams.map((e) => e.subject)));

  // Handlers
  const handleExamGenerated = (newExam: Exam) => {
    const cleanExam: Exam = {
      ...newExam,
      questions: (newExam.questions || []).map((q, idx) =>
        normalizeQuestion(q, idx, newExam.id)
      ),
    };
    setExams((prev) => [cleanExam, ...prev]);
    setActiveExamId(cleanExam.id);
    setActiveTab('simulados');
  };

  const handleFinishExam = (
    answers: Record<string, StudentAnswer>,
    totalEarned: number,
    totalPossible: number
  ) => {
    if (!activeExam) return;
    const newAttempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: activeExam.id,
      mode: 'simulado',
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      answers,
      totalGaivotasEarned: totalEarned,
      totalGaivotasPossible: totalPossible,
      finalScorePercent:
        totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0,
    };

    setAttempts((prev) => [newAttempt, ...prev]);
    setSavedAnswersByExam((prev) => ({ ...prev, [activeExam.id]: answers }));
    setActiveTab('desempenho');
  };

  const handleAwardCryptoGaivota = (count: number) => {
    const newAttempt: ExamAttempt = {
      id: `crypto-${Date.now()}`,
      examId: 'criptografia-q402',
      mode: 'flashcards',
      startedAt: new Date(Date.now() - 60 * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      answers: {},
      totalGaivotasEarned: count,
      totalGaivotasPossible: count,
      finalScorePercent: 100,
    };
    setAttempts((prev) => [newAttempt, ...prev]);
  };

  // Handler to rename a study notebook / caderno
  const handleRenameExam = (examId: string, newTitle: string, newSubject?: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              title: newTitle.trim() || e.title,
              subject: newSubject !== undefined && newSubject.trim() ? newSubject.trim() : e.subject,
            }
          : e
      )
    );
  };

  // Handler to delete a single study notebook / caderno
  const handleDeleteExam = (examId: string) => {
    setExams((prev) => {
      const next = prev.filter((e) => e.id !== examId);
      if (activeExamId === examId) {
        setActiveExamId(next[0]?.id || '');
      }
      return next;
    });
    setSavedAnswersByExam((prev) => {
      const copy = { ...prev };
      delete copy[examId];
      return copy;
    });
  };

  // Handler to clear/reset study notebooks (cadernos)
  const handleResetCadernos = () => {
    if (window.confirm('Deseja realmente zerar todos os cadernos de estudo e reiniciar do zero?')) {
      localStorage.removeItem('simulagaivota_exams');
      localStorage.removeItem('simulagaivota_custom_exams');
      localStorage.removeItem('simulagaivota_user_exams');
      localStorage.removeItem('simulagaivota_notebooks_v4');
      localStorage.removeItem('simulagaivota_attempts');
      localStorage.removeItem('simulagaivota_answers');
      setExams(INITIAL_EXAMS);
      setActiveExamId(INITIAL_EXAMS[0]?.id || '');
      setAttempts([]);
      setSavedAnswersByExam({});
      setIsStudySetupOpen(false);
      setActiveTab('materiais');
    }
  };

  // Handler for study sessions configured by user
  const handleStartStudySession = async (config: StudySessionConfig) => {
    // If user chose nuvem (either single or multiple subjects selected)
    if (config.materialSource === 'nuvem') {
      const selectedIds = config.selectedCloudExamIds && config.selectedCloudExamIds.length > 0
        ? config.selectedCloudExamIds
        : config.selectedCloudExamId
        ? [config.selectedCloudExamId]
        : [];

      const targetExams = exams.filter((e) => selectedIds.includes(e.id));
      const baseCloudExam = targetExams[0] || exams[0] || activeExam;

      if (targetExams.length > 1) {
        // Multi-subject cloud exam
        let poolOfQuestions: Question[] = [];
        targetExams.forEach((ex) => {
          poolOfQuestions.push(...ex.questions);
        });

        // Ensure questions are diverse and generate extra if user requested a large question count
        if (config.questionCount && config.questionCount > poolOfQuestions.length) {
          const extraCount = config.questionCount - poolOfQuestions.length;
          const generatedExtra = generateQuestionsForCFST(
            extraCount,
            config.difficulty,
            targetExams.map((e) => e.title).join(' / '),
            config.avoidRepeatedQuestions !== false ? seenQuestionPrompts : [],
            config.enableSpacedRepetition ? missedQuestionsList : []
          );
          poolOfQuestions = [...poolOfQuestions, ...generatedExtra];
        }

        const shuffled = [...poolOfQuestions].sort(() => 0.5 - Math.random());
        const finalQuestions = shuffled.slice(0, config.questionCount || poolOfQuestions.length);

        const multiExam: Exam = {
          id: `cloud-multi-${Date.now()}`,
          title: `Simulado Nuvem (${targetExams.length} Matérias · ${finalQuestions.length} Questões)`,
          course: 'CFST',
          subject: targetExams.map((e) => e.title).slice(0, 3).join(' · '),
          institution: 'CFST 26/2',
          instructions: `Simulado com questões mescladas das matérias da nuvem: ${targetExams.map((e) => e.title).join(', ')}.`,
          questions: finalQuestions.map((q, idx) =>
            normalizeQuestion(q, idx, `cloud-multi-${Date.now()}`)
          ),
          totalTimeMinutes: finalQuestions.length * 12,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        setExams((prev) => [multiExam, ...prev]);
        setActiveExamId(multiExam.id);
        if (config.mode === 'simulado') setActiveTab('simulados');
        else if (config.mode === 'flashcards') setActiveTab('flashcards');
        return;
      } else if (baseCloudExam) {
        // Single cloud exam
        if (config.questionCount && config.questionCount > baseCloudExam.questions.length) {
          const generatedQuestions = generateQuestionsForCFST(
            config.questionCount,
            config.difficulty,
            baseCloudExam.title,
            config.avoidRepeatedQuestions !== false ? seenQuestionPrompts : [],
            config.enableSpacedRepetition ? missedQuestionsList : []
          );
          const dynId = `cloud-dynamic-${Date.now()}`;
          const dynamicExam: Exam = {
            ...baseCloudExam,
            id: dynId,
            title: `${baseCloudExam.title} (${config.questionCount} Questões)`,
            questions: generatedQuestions.map((q, idx) =>
              normalizeQuestion(q, idx, dynId)
            ),
            totalTimeMinutes: config.questionCount * 12,
          };
          setExams((prev) => [dynamicExam, ...prev]);
          setActiveExamId(dynamicExam.id);
        } else {
          setActiveExamId(baseCloudExam.id);
        }
      }
    } else if (config.materialSource === 'misto') {
      // Misto: Mix questions from selected cloud exams with new uploaded materials
      const selectedIds = config.selectedCloudExamIds && config.selectedCloudExamIds.length > 0
        ? config.selectedCloudExamIds
        : config.selectedCloudExamId
        ? [config.selectedCloudExamId]
        : [];

      const cloudSelectedExams = exams.filter((e) => selectedIds.includes(e.id));
      let cloudQuestionsPool: Question[] = [];
      cloudSelectedExams.forEach((ex) => cloudQuestionsPool.push(...ex.questions));

      let uploadQuestions: Question[] = [];
      if ((config.uploadedDocs && config.uploadedDocs.length > 0) || config.uploadedText) {
        setIsGeneratingAIExam(true);
        try {
          const sanitizedUploadDocs = (config.uploadedDocs || []).map((file) => {
            if (file.text && file.text.length > 20) {
              return {
                name: file.name,
                mimeType: file.mimeType,
                text: file.text,
                size: file.size,
              };
            }
            return file;
          });

          const desiredFromUpload = Math.max(2, Math.round((config.questionCount || 10) / 2));
          const res = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseType: 'CFST',
              subject: config.uploadedDocs && config.uploadedDocs.length > 0
                ? config.uploadedDocs.map((d) => d.name).slice(0, 2).join(' & ')
                : 'Novo Material',
              questionCount: desiredFromUpload,
              difficulty: config.difficulty,
              files: sanitizedUploadDocs,
              materialText: config.uploadedText || '',
              excludePrompts: config.avoidRepeatedQuestions !== false ? seenQuestionPrompts : [],
              missedQuestions: config.enableSpacedRepetition
                ? missedQuestionsList.map((q) => ({ id: q.id, prompt: q.prompt, subject: q.subject }))
                : [],
              avoidRepeatedQuestions: config.avoidRepeatedQuestions !== false,
              enableSpacedRepetition: Boolean(config.enableSpacedRepetition),
            }),
          });

          if (res.ok) {
            const examData = await res.json();
            if (examData.questions && Array.isArray(examData.questions)) {
              uploadQuestions = examData.questions;
            }
          }
        } catch (e) {
          console.warn('Erro ao processar novos arquivos no modo misto:', e);
        } finally {
          setIsGeneratingAIExam(false);
        }
      }

      // Mix and balance questions from both sources
      let mixedPool: Question[] = [...cloudQuestionsPool, ...uploadQuestions];

      // If we need more questions to meet user questionCount, generate extra
      if (config.questionCount && mixedPool.length < config.questionCount) {
        const extraCount = config.questionCount - mixedPool.length;
        const extraGenerated = generateQuestionsForCFST(
          extraCount,
          config.difficulty,
          cloudSelectedExams.map((e) => e.title).join(' / ') || 'CFST 26/2 Misto',
          config.avoidRepeatedQuestions !== false ? seenQuestionPrompts : [],
          config.enableSpacedRepetition ? missedQuestionsList : []
        );
        mixedPool = [...mixedPool, ...extraGenerated];
      }

      const shuffledMixed = [...mixedPool].sort(() => 0.5 - Math.random());
      const finalMixedQuestions = shuffledMixed.slice(0, config.questionCount || mixedPool.length);

      const mixedTitles = cloudSelectedExams.map((e) => e.title);
      const mixedId = `exam-misto-${Date.now()}`;
      const mixedExam: Exam = {
        id: mixedId,
        title: `Simulado Misto (${cloudSelectedExams.length} Matérias Nuvem + ${uploadQuestions.length > 0 ? 'Novos Arquivos' : 'Arquivos'})`,
        course: 'CFST',
        subject: `Misto: ${mixedTitles.slice(0, 2).join(', ')}${mixedTitles.length > 2 ? '...' : ''}`,
        institution: 'CFST 26/2',
        instructions: 'Simulado mesclando questões das matérias da nuvem com conteúdos dos novos arquivos anexados.',
        questions: finalMixedQuestions.map((q, idx) =>
          normalizeQuestion(q, idx, mixedId)
        ),
        totalTimeMinutes: finalMixedQuestions.length * 12,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setExams((prev) => [mixedExam, ...prev]);
      setActiveExamId(mixedExam.id);
      if (config.mode === 'simulado') setActiveTab('simulados');
      else if (config.mode === 'flashcards') setActiveTab('flashcards');
      return;
    } else if (config.materialSource === 'upload') {
      // If user uploaded docs or text, call the real AI endpoint
      if ((config.uploadedDocs && config.uploadedDocs.length > 0) || config.uploadedText) {
        setIsGeneratingAIExam(true);
        try {
          const sanitizedUploadDocs = (config.uploadedDocs || []).map((file) => {
            if (file.text && file.text.length > 20) {
              return {
                name: file.name,
                mimeType: file.mimeType,
                text: file.text,
                size: file.size,
              };
            }
            return file;
          });

          const res = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseType: 'CFST',
              subject: config.uploadedDocs && config.uploadedDocs.length > 0
                ? config.uploadedDocs.map((d) => d.name).slice(0, 2).join(' & ')
                : 'Material Próprio',
              questionCount: config.questionCount,
              difficulty: config.difficulty,
              files: sanitizedUploadDocs,
              materialText: config.uploadedText || '',
              excludePrompts: config.avoidRepeatedQuestions !== false ? seenQuestionPrompts : [],
              missedQuestions: config.enableSpacedRepetition
                ? missedQuestionsList.map((q) => ({ id: q.id, prompt: q.prompt, subject: q.subject }))
                : [],
              avoidRepeatedQuestions: config.avoidRepeatedQuestions !== false,
              enableSpacedRepetition: Boolean(config.enableSpacedRepetition),
            }),
          });

          if (res.ok) {
            const examData = await res.json();
            const aiExamId = `custom-exam-${Date.now()}`;
            const aiExam: Exam = {
              id: aiExamId,
              title: 'SIMULADO',
              course: 'CFST',
              subject: config.uploadedDocs && config.uploadedDocs.length > 0
                ? config.uploadedDocs.map((d) => d.name).slice(0, 2).join(' & ')
                : examData.subject || 'Material Próprio',
              institution: 'CFST 26/2',
              instructions:
                examData.instructions ||
                'Simulado formulado exclusivamente a partir dos arquivos fornecidos.',
              totalTimeMinutes: examData.totalTimeMinutes || config.questionCount * 15,
              questions: (examData.questions || []).map((q: any, idx: number) =>
                normalizeQuestion(q, idx, aiExamId)
              ),
              isCustom: true,
              createdAt: new Date().toISOString(),
            };

            setExams((prev) => [aiExam, ...prev]);
            setActiveExamId(aiExam.id);
            if (config.mode === 'simulado') setActiveTab('simulados');
            else if (config.mode === 'flashcards') setActiveTab('flashcards');
            setIsGeneratingAIExam(false);
            return;
          }
        } catch (e) {
          console.error('Erro ao gerar com IA a partir dos arquivos:', e);
        } finally {
          setIsGeneratingAIExam(false);
        }
      }

      // If generation could not proceed
      alert('Não foi possível gerar o simulado a partir dos arquivos. Por favor, verifique os arquivos anexados na aba de materiais.');
      setActiveTab('materiais');
      return;
    }

    if (config.mode === 'revisao_ativa') {
      // If user has missed questions, build a dedicated exam with them!
      let reviewQuestions = missedQuestionsList;
      if (reviewQuestions.length === 0) {
        if (activeExam?.questions) {
          reviewQuestions = activeExam.questions.filter((q) => q.difficulty !== 'facil');
          if (reviewQuestions.length === 0) reviewQuestions = activeExam.questions;
        }
      }

      const reviewExam: Exam = {
        id: `exam-revisao-ativa-${Date.now()}`,
        title: `Revisão Ativa · Gaivotas Pendentes (${reviewQuestions.length} Questões)`,
        course: config.course || 'CFST',
        subject: 'Caderno de Reforço - Erros Anteriores',
        institution: 'CFST 26/2',
        instructions:
          'Sessão focada exclusivamente nas questões onde você perdeu gaivotas ou errou anteriormente. Treine até conquistar todos os vistos.',
        totalTimeMinutes: reviewQuestions.length * 10,
        questions: reviewQuestions.slice(0, config.questionCount || reviewQuestions.length),
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setExams((prev) => [reviewExam, ...prev]);
      setActiveExamId(reviewExam.id);
      setActiveTab('flashcards');
      return;
    }

    if (config.mode === 'simulado') setActiveTab('simulados');
    else if (config.mode === 'flashcards') setActiveTab('flashcards');
    else if (config.mode === 'revisao') setActiveTab('desempenho');

    setActiveDifficultyFilter(config.difficulty);
  };

  const handleStartErrorReview = () => {
    handleStartStudySession({
      mode: 'revisao_ativa',
      course: 'CFST',
      subject: 'Todas as Matérias',
      difficulty: 'medio',
      questionCount: missedQuestionsList.length || 5,
    });
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-slate-100 flex flex-col font-sans transition-colors relative selection:bg-emerald-700/40 selection:text-emerald-200">
      {/* Tactical Military Background Shimmer (Verde Oliva + Azul Marinho Escurecido) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-24 w-96 h-96 bg-[#364d25]/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-[#0c182b]/35 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-[#293a1c]/20 rounded-full blur-[150px]" />
      </div>

      {/* Desktop & Tablet Top Bar (Liquid Glass) */}
      <div className="relative z-30">
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenStudySetup={() => setIsStudySetupOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          totalGaivotasEarned={totalGaivotasEarned}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pb-24 lg:pb-12 pt-2">

        {/* Tab 1: Simulado */}
        {activeTab === 'simulados' && (
          <div className="pt-2">
            {activeExam ? (
              <ExamViewer
                exam={activeExam}
                onFinishExam={handleFinishExam}
                initialAnswers={savedAnswersByExam[activeExam.id] || {}}
                onRenameExam={handleRenameExam}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 text-2xl shadow-inner">
                  📋
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Nenhum simulado ativo
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    O aplicativo inicia 100% zerado para você ter controle total. Envie seus arquivos na aba de materiais para gerar seu primeiro simulado com IA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('materiais')}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/50 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Subir Meus Arquivos Agora</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Flashcards 3D com Gaivotas */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 pt-3">
            {activeExam && filteredQuestions.length > 0 ? (
              <>
                {/* Filter Pill Strip */}
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 liquid-glass-card rounded-2xl text-xs">
                    {(['todos', 'facil', 'medio', 'dificil'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActiveDifficultyFilter(lvl)}
                        className={`px-3 py-1 font-semibold rounded-xl transition-all cursor-pointer ${
                          activeDifficultyFilter === lvl
                            ? 'bg-white/20 text-white font-bold border border-white/25 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl === 'todos' ? 'Todos os Níveis' : lvl.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-emerald-400/90 font-medium">
                    {filteredQuestions.length} cards com vistos ativos
                  </span>
                </div>

                <FlashcardViewer
                  questions={filteredQuestions}
                  onFinishSession={() => setActiveTab('desempenho')}
                  savedAnswers={savedAnswersByExam[activeExam.id] || {}}
                  onUpdateAnswer={(qId, ans) => {
                    setSavedAnswersByExam((prev) => ({
                      ...prev,
                      [activeExam.id]: {
                        ...(prev[activeExam.id] || {}),
                        [qId]: ans,
                      },
                    }));
                  }}
                />
              </>
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 text-2xl shadow-inner">
                  🃏
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Nenhum flashcard disponível
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Envie seus arquivos para que a IA crie os cards de fixação com gaivotas baseados no seu conteúdo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('materiais')}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/50 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Ir para Envio de Materiais</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Criptografia & Autenticação (Págs 1 a 44 Q-402) */}
        {activeTab === 'criptografia' && (
          <div className="pt-2">
            <CryptographyModule onAwardGaivota={handleAwardCryptoGaivota} />
          </div>
        )}

        {/* Tab 4: Subir Arquivos / Materiais */}
        {activeTab === 'materiais' && (
          <div className="pt-2">
            <MaterialUploadHub
              onExamGenerated={handleExamGenerated}
              onOpenExam={(exam) => {
                setActiveExamId(exam.id);
                setActiveTab('simulados');
              }}
              existingExams={exams}
              onResetCadernos={handleResetCadernos}
              onRenameExam={handleRenameExam}
              excludePrompts={seenQuestionPrompts}
              missedQuestions={missedQuestionsList.map((q) => ({ id: q.id, prompt: q.prompt, subject: q.subject }))}
            />
          </div>
        )}

        {/* Tab 5: Desempenho */}
        {activeTab === 'desempenho' && (
          <div className="pt-2">
            <PerformanceDashboard
              attempts={attempts}
              allQuestions={allQuestions}
              onStartErrorReview={handleStartErrorReview}
              onSelectExam={(examId) => {
                setActiveExamId(examId);
                setActiveTab('simulados');
              }}
              exams={exams}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (iOS Floating Dock) */}
      <div className="relative z-40">
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          totalGaivotasEarned={totalGaivotasEarned}
        />
      </div>

      {/* Study Config Modal */}
      <StudyConfigModal
        isOpen={isStudySetupOpen}
        onClose={() => setIsStudySetupOpen(false)}
        onStartSession={handleStartStudySession}
        missedQuestionsCount={missedQuestionsList.length}
        existingExams={exams}
        onResetCadernos={handleResetCadernos}
      />

      {/* AI Exam Generation Loading Overlay */}
      {isGeneratingAIExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="liquid-glass-dark border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Analisando Arquivos com a IA
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                A IA está lendo cada página dos seus arquivos para extrair questões e critérios de gaivotas exclusivamente deles...
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-emerald-300 font-mono">
              ✓ Garantia: 100% fiel aos seus documentos anexados
            </div>
          </div>
        </div>
      )}

      {/* PWA Mobile Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Auto Updater for instant client updates */}
      <AutoUpdater />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
