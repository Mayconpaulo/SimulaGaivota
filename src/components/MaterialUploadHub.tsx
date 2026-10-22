import React, { useState } from 'react';
import { CourseType, DifficultyLevel, Exam, UploadedDoc } from '../types/exam';
import { readFileAsDoc } from '../utils/fileReader';

interface MaterialUploadHubProps {
  onExamGenerated: (exam: Exam) => void;
  onOpenExam: (exam: Exam) => void;
  existingExams: Exam[];
  onResetCadernos?: () => void;
  onRenameExam?: (examId: string, newTitle: string, newSubject?: string) => void;
  excludePrompts?: string[];
  missedQuestions?: Array<{ id?: string; prompt: string; subject?: string }>;
}

export const MaterialUploadHub: React.FC<MaterialUploadHubProps> = ({
  onExamGenerated,
  onOpenExam,
  existingExams,
  onResetCadernos,
  onRenameExam,
  excludePrompts = [],
  missedQuestions = [],
}) => {
  const courseType: CourseType = 'CFST';
  const [subject, setSubject] = useState('Matérias Gerais');
  const [materialText, setMaterialText] = useState('');
  const [pastExamModelText, setPastExamModelText] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medio');
  const [avoidRepeatedQuestions, setAvoidRepeatedQuestions] = useState(true);
  const [enableSpacedRepetition, setEnableSpacedRepetition] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<UploadedDoc[]>([]);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);
    setUploadProgress(`Preparando leitura de ${fileList.length} arquivo(s)...`);
    setFeedbackMsg(null);

    try {
      const readDocs: UploadedDoc[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`Processando arquivo [${i + 1}/${fileList.length}]: "${file.name}"... Extraindo texto e tópicos...`);
        const doc = await readFileAsDoc(file, (msg) => {
          setUploadProgress(`[${i + 1}/${fileList.length}] ${msg}`);
        });
        readDocs.push(doc);
      }

      setAttachedFiles((prev) => [...prev, ...readDocs]);
      setFeedbackMsg({
        type: 'success',
        text: `${readDocs.length} arquivo(s) carregados e processados com sucesso! Slides e textos foram extraídos e preparados para a geração do simulado.`,
      });
    } catch (err: any) {
      console.error('Erro ao ler arquivos:', err);
      setFeedbackMsg({
        type: 'error',
        text: `Erro ao processar arquivo: ${err.message || 'Tente novamente.'}`,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateExam = async () => {
    if (attachedFiles.length === 0 && !materialText.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Por favor, selecione ou anexe ao menos um arquivo (PowerPoint, PDF, Word, Excel, imagem ou texto) para que a IA possa extrair as questões.',
      });
      return;
    }

    setIsGenerating(true);
    setFeedbackMsg(null);
    setGenerationStep('Lendo e analisando os arquivos anexados...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 240s safety timeout for large multi-document batches

    try {
      setGenerationStep(`Analisando minuciosamente ${attachedFiles.length > 0 ? attachedFiles.length + ' arquivo(s)' : 'materiais'}... A IA está distribuindo as questões entre todos os documentos.`);

      // Sanitize files: Send only extracted text to keep the JSON payload ultralight (< 250 KB)
      const sanitizedFiles = attachedFiles.map((file) => {
        if (file.text && file.text.trim().length > 0) {
          return {
            name: file.name,
            mimeType: file.mimeType,
            text: file.text,
            size: file.size,
          };
        }
        if (file.fileCategory === 'image' && file.base64 && file.base64.length < 5 * 1024 * 1024) {
          return {
            name: file.name,
            mimeType: file.mimeType,
            base64: file.base64,
            size: file.size,
          };
        }
        return {
          name: file.name,
          mimeType: file.mimeType,
          text: `[DOCUMENTO MILITAR ANEXADO: "${file.name}" - O examinador deve formular questões sobre o tema desta instrução]`,
          size: file.size,
        };
      });

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          courseType,
          subject,
          materialText,
          pastExamModel: pastExamModelText,
          questionCount,
          difficulty,
          files: sanitizedFiles,
          excludePrompts: avoidRepeatedQuestions ? excludePrompts : [],
          missedQuestions: enableSpacedRepetition ? missedQuestions : [],
          avoidRepeatedQuestions,
          enableSpacedRepetition,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = 'Falha na geração do simulado.';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.details || errorMsg;
          } else {
            const rawText = await response.text();
            if (response.status === 413) {
              errorMsg = 'Arquivos muito volumosos para o canal de dados da nuvem. O sistema otimizou a leitura dos arquivos.';
            } else if (response.status === 504 || response.status === 502) {
              errorMsg = 'Tempo limite de resposta da IA excedido. Tente gerar com um número menor de questões por rodada.';
            } else {
              errorMsg = `Erro do servidor (${response.status}): ${rawText.slice(0, 100)}`;
            }
          }
        } catch {
          // fallback
        }
        throw new Error(errorMsg);
      }

      setGenerationStep('Formatando questões e critérios oficiais de gaivotas...');
      const examData = await response.json();

      const newExam: Exam = {
        id: `custom-exam-${Date.now()}`,
        title: 'SIMULADO',
        course: courseType,
        subject: attachedFiles.length > 0
          ? attachedFiles.map((f) => f.name).slice(0, 2).join(' & ')
          : examData.subject || subject,
        institution: 'CFST 26/2',
        instructions:
          examData.instructions ||
          'Simulado formulado exclusivamente a partir dos arquivos fornecidos. Avaliação com critérios de gaivotas (✓).',
        totalTimeMinutes: examData.totalTimeMinutes || questionCount * 15,
        questions: (examData.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: q.id || `q-${idx + 1}-${Date.now()}`,
          number: idx + 1,
          totalGaivotas: q.type === 'discursive' ? (q.totalGaivotas || q.criteria?.length || 3) : 1,
          correctOption: (q.correctOption || 'A').toString().trim().toUpperCase().slice(0, 1) || 'A',
        })),
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      onExamGenerated(newExam);
      onOpenExam(newExam);

      setFeedbackMsg({
        type: 'success',
        text: `SIMULADO com ${newExam.questions.length} questões extraídas dos arquivos anexados gerado com sucesso!`,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Erro ao gerar com IA:', err);
      let message = err.message || 'Verifique a conexão ou os arquivos anexados.';
      if (err.name === 'AbortError') {
        message = 'O processamento demorou mais que o esperado. Tente reduzir o número de questões ou anexar arquivos menores.';
      } else if (err.message === 'Failed to fetch') {
        message = 'Não foi possível conectar ao servidor. Verifique a conexão com a internet ou reduza o tamanho dos arquivos anexados.';
      }
      setFeedbackMsg({
        type: 'error',
        text: `Erro ao gerar questões a partir dos arquivos: ${message}`,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Strip (Liquid Glass) */}
      <div className="liquid-glass-dark border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-2 relative">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              CFST 26/2
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Subir Arquivos e Cadernos de Questões
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Envie seus materiais em PDF, DOCX ou texto para estruturar novas questões com o sistema de Gaivotas (✓).
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm shadow-lg ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
              : 'bg-rose-950/70 text-rose-200 border-rose-500/40 backdrop-blur-md'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Grid: Upload & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
            1. Enviar Matéria e Modelo de Prova
          </h2>

          {/* Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Anexar Arquivos (PowerPoint, PDFs, Word, Excel, Imagens ou Textos)
            </label>
            <div className="border-2 border-dashed border-white/20 hover:border-emerald-400 rounded-2xl p-6 text-center bg-white/5 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.pptx,.ppt,.ppsx,.docx,.doc,.xlsx,.xls,.odt,.odp,.ods,.txt,.md,.csv,.rtf,image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">
                  {isUploading ? 'Processando arquivos...' : 'Toque para selecionar arquivos do seu dispositivo'}
                </span>
                <span className="text-xs text-slate-300 max-w-md">
                  Suporta <strong>todos os formatos</strong>: PowerPoint (.pptx, .ppt), PDF, Word (.docx), Excel (.xlsx), Textos e Imagens. Selecione múltiplos de uma vez!
                </span>
              </label>
            </div>

            {/* Upload In-Progress Banner */}
            {isUploading && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3 shadow-lg">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-xs text-emerald-200 font-medium">{uploadProgress}</span>
              </div>
            )}

            {/* List of Attached Files */}
            {attachedFiles.length > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Arquivos preparados para análise ({attachedFiles.length}):
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-mono">
                    Distribuição balanceada entre todos os arquivos
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {attachedFiles.map((file, idx) => {
                    const lower = file.name.toLowerCase();
                    let badgeLabel = 'Documento';
                    let badgeColor = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                    let icon = '📄';

                    if (lower.endsWith('.pptx') || lower.endsWith('.ppt') || lower.endsWith('.ppsx') || file.fileCategory === 'powerpoint') {
                      badgeLabel = 'PowerPoint (.pptx)';
                      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      icon = '📊';
                    } else if (lower.endsWith('.docx') || lower.endsWith('.doc') || file.fileCategory === 'word') {
                      badgeLabel = 'Word (.docx)';
                      badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                      icon = '📝';
                    } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || file.fileCategory === 'excel') {
                      badgeLabel = 'Excel (.xlsx)';
                      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      icon = '📈';
                    } else if (lower.endsWith('.pdf') || file.fileCategory === 'pdf') {
                      badgeLabel = 'PDF';
                      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                      icon = '📕';
                    } else if (file.fileCategory === 'image' || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
                      badgeLabel = 'Imagem / Esquema';
                      badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                      icon = '🖼️';
                    } else if (file.fileCategory === 'text' || lower.endsWith('.txt') || lower.endsWith('.md')) {
                      badgeLabel = 'Texto';
                      badgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
                      icon = '📃';
                    }

                    const extractedChars = file.charCount || file.text?.length || 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-100 shadow-sm hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate max-w-[220px] sm:max-w-xs">{file.name}</span>
                              <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-md border font-bold ${badgeColor}`}>
                                {badgeLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>Tamanho: {file.size}</span>
                              {extractedChars > 0 && (
                                <span className="text-emerald-400 font-mono font-medium">
                                  ✓ {extractedChars.toLocaleString()} caracteres extraídos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer font-bold shrink-0 ml-2"
                          title="Remover arquivo"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-emerald-300/90 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-400/20">
                  ✓ Garantia CFST: Todas as questões e critérios de gaivotas serão extraídos <strong>exclusivamente</strong> destes arquivos com leitura balanceada entre todos eles.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2 italic">
                Nenhum arquivo anexado ainda. Anexe seus materiais acima para que a IA crie o simulado baseado exclusivamente neles.
              </p>
            )}
          </div>

          {/* Pasted Content Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Ou cole aqui o texto da matéria / apostilas:
              </label>
              <textarea
                value={materialText}
                onChange={(e) => setMaterialText(e.target.value)}
                placeholder="Exemplo: Cole trechos sobre Meios Rádio VHF/HF, Procedimentos em fonia (CÂMBIO, TERMINADO), Fio WD-1/TT..."
                rows={4}
                className="w-full p-3.5 text-xs sm:text-sm bg-black/30 border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Modelo da Prova do Exército (como as gaivotas são cobradas):
              </label>
              <textarea
                value={pastExamModelText}
                onChange={(e) => setPastExamModelText(e.target.value)}
                placeholder="Exemplo: 'Questão 1: Cite 3 vantagens do meio-fio em relação ao meio-rádio. (Valor: 3 gaivotas)'. A IA seguirá este formato exato."
                rows={3}
                className="w-full p-3.5 text-xs sm:text-sm bg-black/30 border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Generate CTA (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
            2. Parâmetros de Geração
          </h2>

          <div className="space-y-4">
            {/* Contexto Fixo Direto */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block font-mono">
                Padrão
              </span>
              <p className="text-sm font-bold text-white">
                CFST 26/2
              </p>
              <p className="text-xs text-slate-400">
                Geração estruturada com base nos arquivos anexados.
              </p>
            </div>

            {/* Nível de Dificuldade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nível de Cobrança
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['facil', 'medio', 'dificil', 'todos'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {lvl === 'todos' ? 'Todos' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade de Questões (Digitação livre) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Total de Questões
                </label>
                <span className="text-xs text-slate-400">Digite a quantidade desejada:</span>
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
                  placeholder="Ex: 100"
                />
                <button
                  type="button"
                  onClick={() => setQuestionCount((prev) => prev + 1)}
                  className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Sugestões rápidas:</span>
                {[5, 10, 20, 50, 100].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                      questionCount === n
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuração Anti-Repetição e Repetição Espaçada */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block font-mono">
              Controle de Ineditismo e Repetição Espaçada
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
                    A IA prioriza páginas e tópicos ainda não vistos, mas preserva a repetição estratégica dos conceitos vitais ("gaivotas certas") sob novos formatos.
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
                    Repetição Espaçada Inteligente (Reforço de Erros)
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    Revisita conceitos onde você perdeu gaivotas ou errou anteriormente, com nova roupagem para fixação.
                  </span>
                </div>
              </label>
            </div>
          </div>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateExam}
            className="w-full py-3.5 px-4 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm font-semibold">{generationStep || 'Analisando arquivos e gerando simulado...'}</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Gerar Simulado a partir dos Arquivos ({questionCount} Questões)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* List of Available Exams */}
      <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">
              Cadernos e Simulados Criados
            </h2>
            <p className="text-xs text-slate-400">
              Simulados gerados com base nos seus arquivos e estudos
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onResetCadernos && existingExams.length > 0 && (
              <button
                type="button"
                onClick={onResetCadernos}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Zerar todos os cadernos criados"
              >
                <span>🗑️</span>
                <span>Zerar Cadernos</span>
              </button>
            )}
            <span className="text-xs font-mono font-bold text-slate-400">
              {existingExams.length} {existingExams.length === 1 ? 'caderno' : 'cadernos'}
            </span>
          </div>
        </div>

        {existingExams.length === 0 ? (
          <div className="p-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-black/20">
            <span className="text-2xl block">📂</span>
            <p className="text-sm font-semibold text-white">Nenhum caderno salvo no momento</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ao gerar um simulado a partir dos seus arquivos acima, ele ficará disponível aqui para treino a qualquer momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingExams.map((exam) => {
              const totalGaivotas = exam.questions.reduce(
                (acc, q) => acc + (q.totalGaivotas || 1),
                0
              );
              const isEditing = editingExamId === exam.id;

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl border border-white/10 bg-black/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {exam.course}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {totalGaivotas} Gaivotas ✓
                        </span>
                        {onRenameExam && !isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExamId(exam.id);
                              setEditTitle(exam.title);
                              setEditSubject(exam.subject);
                            }}
                            className="text-xs text-slate-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                            title="Editar nome do caderno"
                          >
                            <span>✏️</span>
                            <span className="text-[10px]">Renomear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="p-3 rounded-xl bg-white/5 border border-emerald-500/40 space-y-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                            Título do Caderno:
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-900 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                            placeholder="Ex: Comunicações - Simulado 1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Matéria / Descrição:
                          </label>
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-white/20 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-400"
                            placeholder="Ex: Rádio VHF, Procedimentos de Fonia"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingExamId(null)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onRenameExam && editTitle.trim()) {
                                onRenameExam(exam.id, editTitle.trim(), editSubject.trim());
                              }
                              setEditingExamId(null);
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm cursor-pointer"
                          >
                            Salvar Nome
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-sm text-white flex items-center justify-between">
                          <span>{exam.title}</span>
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {exam.subject}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {exam.questions.length} questões
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenExam(exam)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Iniciar Prova
                    </button>
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
