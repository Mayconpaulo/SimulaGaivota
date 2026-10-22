import React, { useState } from 'react';
import { DifficultyLevel, Exam, StudyMode, StudySessionConfig, UploadedDoc } from '../types/exam';
import { readFileAsDoc } from '../utils/fileReader';

interface StudyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: StudySessionConfig) => void;
  missedQuestionsCount?: number;
  existingExams: Exam[];
  onResetCadernos?: () => void;
}

export const StudyConfigModal: React.FC<StudyConfigModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  missedQuestionsCount = 0,
  existingExams = [],
  onResetCadernos,
}) => {
  const [mode, setMode] = useState<StudyMode>('simulado');
  const [materialSource, setMaterialSource] = useState<'nuvem' | 'upload'>(
    existingExams && existingExams.length > 0 ? 'nuvem' : 'upload'
  );
  const [selectedCloudExamId, setSelectedCloudExamId] = useState<string>(
    existingExams[0]?.id || ''
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medio');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [avoidRepeatedQuestions, setAvoidRepeatedQuestions] = useState(true);
  const [enableSpacedRepetition, setEnableSpacedRepetition] = useState(true);

  // Multi-file upload state inside modal
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadFeedback(`Preparando leitura de ${fileList.length} arquivo(s)...`);

    try {
      const readDocs: UploadedDoc[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadFeedback(`Processando [${i + 1}/${fileList.length}]: "${file.name}"...`);
        const doc = await readFileAsDoc(file, (msg) => {
          setUploadFeedback(`[${i + 1}/${fileList.length}] ${msg}`);
        });
        readDocs.push(doc);
      }

      setUploadedDocs((prev) => [...prev, ...readDocs]);
      setUploadFeedback(`${readDocs.length} arquivo(s) carregados e processados com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao ler arquivos:', err);
      setUploadFeedback(`Erro ao ler arquivos: ${err.message || 'Tente novamente.'}`);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveUploadedFile = (idx: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (materialSource === 'upload' && uploadedDocs.length === 0 && !uploadedText.trim()) {
      setUploadFeedback('Por favor, anexe ao menos um arquivo (PDF, imagens, documento) para que as questões sejam formuladas exclusivamente com base nele.');
      return;
    }

    if (materialSource === 'nuvem' && existingExams.length === 0) {
      setUploadFeedback('Nenhum caderno salvo no aplicativo. Mude para "Subir Meu Material" para anexar seus arquivos.');
      return;
    }

    onStartSession({
      mode,
      difficulty,
      questionCount,
      materialSource,
      selectedCloudExamId: materialSource === 'nuvem' ? selectedCloudExamId : undefined,
      uploadedFiles: materialSource === 'upload' ? uploadedDocs.map((d) => ({ name: d.name, size: d.size })) : undefined,
      uploadedDocs: materialSource === 'upload' ? uploadedDocs : undefined,
      uploadedText: materialSource === 'upload' ? uploadedText : undefined,
      course: 'CFST',
      subject: materialSource === 'nuvem'
        ? existingExams.find((ex) => ex.id === selectedCloudExamId)?.title || 'CFST 26/2'
        : uploadedDocs.length > 0
        ? `Material Próprio (${uploadedDocs.length} arquivos)`
        : 'Material Próprio CFST 26/2',
      avoidRepeatedQuestions,
      enableSpacedRepetition,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xl animate-fadeIn">
      {/* iPhone Liquid Glass Modal Container */}
      <div className="relative w-full max-w-xl liquid-glass-dark border border-white/15 rounded-3xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-white shadow-2xl">
        {/* Glow Spots */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/25">
                CFST 26/2
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Configurar Estudo
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Escolha a modalidade, selecione o material e defina o total de questões
            </p>
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

        <form onSubmit={handleSubmit} className="relative mt-5 space-y-5">
          {/* 1. Modalidade de Estudo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              1. Modalidade de Estudo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option A: Simulado */}
              <button
                type="button"
                onClick={() => setMode('simulado')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                  mode === 'simulado'
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Simulado</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                    Prova
                  </span>
                </div>
                <span className="text-xs text-slate-300">
                  Questões de múltipla escolha e discursivas para treinar.
                </span>
              </button>

              {/* Option B: Cards */}
              <button
                type="button"
                onClick={() => setMode('flashcards')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                  mode === 'flashcards'
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Cards</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                    Dinâmico
                  </span>
                </div>
                <span className="text-xs text-slate-300">
                  Responda verbalmente, vire o card e marque se acertou ou errou.
                </span>
              </button>

              {/* Option C: Revisão Ativa */}
              <button
                type="button"
                onClick={() => setMode('revisao_ativa')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer relative overflow-hidden ${
                  mode === 'revisao_ativa'
                    ? 'border-rose-400 bg-rose-500/25 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/60'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <span>Revisão Ativa</span>
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300">
                    Erros
                  </span>
                </div>
                <span className="text-xs text-slate-300">
                  Reforço com foco nas questões erradas anteriormente.
                </span>
                {missedQuestionsCount > 0 && (
                  <span className="text-[10px] font-mono font-bold text-rose-300 block">
                    {missedQuestionsCount} questões pendentes
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Origem do Material de Estudo (Nuvem ou Subir Arquivos) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Material de Estudo
            </label>

            {/* Selector: Nuvem vs Subir Arquivo */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/15 rounded-2xl">
              <button
                type="button"
                onClick={() => setMaterialSource('nuvem')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  materialSource === 'nuvem'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>☁️</span>
                <span>Material na Nuvem</span>
              </button>
              <button
                type="button"
                onClick={() => setMaterialSource('upload')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  materialSource === 'upload'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>📤</span>
                <span>Subir Meu Material</span>
              </button>
            </div>

            {/* Content for Nuvem Option */}
            {materialSource === 'nuvem' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 block">
                    Selecione o pacote ou simulado na nuvem:
                  </span>
                  {onResetCadernos && (
                    <button
                      type="button"
                      onClick={onResetCadernos}
                      className="text-[11px] text-rose-300 hover:text-rose-200 underline font-semibold cursor-pointer"
                      title="Zerar todos os cadernos criados"
                    >
                      🗑️ Zerar Cadernos
                    </button>
                  )}
                </div>

                {existingExams && existingExams.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {existingExams.map((ex) => (
                      <label
                        key={ex.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selectedCloudExamId === ex.id
                            ? 'border-emerald-500 bg-emerald-600/25 text-white'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="radio"
                            name="cloudExam"
                            checked={selectedCloudExamId === ex.id}
                            onChange={() => setSelectedCloudExamId(ex.id)}
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{ex.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{ex.subject}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300 font-bold shrink-0">
                          {ex.questions.length} questões
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2.5">
                    <p className="text-xs text-slate-300">
                      O aplicativo está zerado sem nenhum caderno anterior.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMaterialSource('upload')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                    >
                      <span>Subir Meus Arquivos Agora</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Content for Upload Option */
              <div className="space-y-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Suba seus arquivos (PowerPoint, PDF, Word, Excel, fotos):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Multi-formato</span>
                </div>

                <div className="border border-dashed border-white/20 hover:border-emerald-400 rounded-xl p-3 text-center bg-black/20 transition-colors">
                  <input
                    type="file"
                    id="modal-multi-upload"
                    multiple
                    accept=".pdf,.pptx,.ppt,.ppsx,.docx,.doc,.xlsx,.xls,.odt,.odp,.ods,.txt,.md,.csv,.rtf,image/*"
                    onChange={handleMultipleFiles}
                    className="hidden"
                  />
                  <label
                    htmlFor="modal-multi-upload"
                    className="cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <span className="text-xs font-bold text-emerald-300">
                      📁 Toque para selecionar arquivos (PowerPoint, PDF, Word, etc.)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Pode selecionar múltiplos arquivos de uma vez sem limite
                    </span>
                  </label>
                </div>

                {/* Uploaded Files Chips */}
                {uploadedDocs.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300">
                      Arquivos prontos ({uploadedDocs.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {uploadedDocs.map((file, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-200"
                        >
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedFile(idx)}
                            className="text-slate-400 hover:text-white font-bold ml-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadFeedback && (
                  <p className="text-[11px] text-emerald-400 font-medium">{uploadFeedback}</p>
                )}
              </div>
            )}
          </div>

          {/* 3. Grau de Dificuldade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              3. Grau de Cobrança Doutrinária
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['facil', 'medio', 'dificil', 'todos'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-2 rounded-xl border text-center font-medium text-xs transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {lvl === 'facil'
                    ? 'Fácil'
                    : lvl === 'medio'
                    ? 'Médio'
                    : lvl === 'dificil'
                    ? 'Difícil'
                    : 'Todos os Níveis'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Quantidade de Questões (Digitação direta sem limite) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Quantidade de Questões
              </label>
              <span className="text-xs text-emerald-400 font-medium">Múltipla Escolha e Discursiva</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuestionCount((prev) => Math.max(1, prev - 1))}
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setQuestionCount(isNaN(val) ? 1 : Math.max(1, val));
                }}
                className="flex-1 h-11 px-3 text-center text-lg font-mono font-bold bg-slate-900 border border-white/20 rounded-xl text-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                placeholder="Digite a quantidade (ex: 100)"
              />
              <button
                type="button"
                onClick={() => setQuestionCount((prev) => prev + 1)}
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            {/* Quick Chips with 50 and 100 */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Atalhos:</span>
              {[5, 10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                    questionCount === num
                      ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-400 shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Controle de Ineditismo e Repetição Espaçada */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
              Ineditismo e Fixação de Conteúdo
            </span>
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidRepeatedQuestions}
                  onChange={(e) => setAvoidRepeatedQuestions(e.target.checked)}
                  className="mt-0.5 accent-emerald-400 w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Garantir Questões Inéditas (com Reforço de Conceitos Capitais)
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    Prioriza páginas e tópicos ainda não vistos, preservando a fixação dos conceitos vitais ("gaivotas certas") sob novos formatos.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSpacedRepetition}
                  onChange={(e) => setEnableSpacedRepetition(e.target.checked)}
                  className="mt-0.5 accent-emerald-400 w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Repetição Espaçada Inteligente (Reforçar Erros)
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    Traz conceitos onde você perdeu gaivotas ou errou, com nova roupagem para memorização.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{mode === 'revisao_ativa' ? 'Iniciar Revisão Ativa' : 'Iniciar Estudo'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
