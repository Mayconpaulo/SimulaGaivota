import React, { useState } from 'react';
import {
  AuthMission,
  CryptoMission,
  generateAuthMission,
  generateCryptoMission,
  ONE_ALPHABET_SYSTEM,
  RECTANGULAR_AUTH_GRID,
  TWO_ALPHABETS_SYSTEM,
} from '../utils/cryptoEngine';

interface CryptographyModuleProps {
  onAwardGaivota?: (count: number) => void;
}

export const CryptographyModule: React.FC<CryptographyModuleProps> = ({ onAwardGaivota }) => {
  const [activeSubMode, setActiveSubMode] = useState<'cripto' | 'autenticacao'>('cripto');

  // Estado da Missão de Criptografia
  const [cryptoMission, setCryptoMission] = useState<CryptoMission>(() => generateCryptoMission());
  const [studentCryptoInput, setStudentCryptoInput] = useState('');
  const [cryptoFeedback, setCryptoFeedback] = useState<{ isChecked: boolean; isCorrect: boolean; message: string } | null>(null);
  const [showCryptoSolution, setShowCryptoSolution] = useState(false);
  const [showMatrixDraft, setShowMatrixDraft] = useState(false);

  // Estado da Missão de Autenticação (Páginas 1 a 44)
  const [authMission, setAuthMission] = useState<AuthMission>(() => generateAuthMission());
  const [studentAuthInput, setStudentAuthInput] = useState('');
  const [authFeedback, setAuthFeedback] = useState<{ isChecked: boolean; isCorrect: boolean; message: string } | null>(null);
  const [showAuthSolution, setShowAuthSolution] = useState(false);

  // Placar local do módulo
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Handlers para Criptografia
  const handleGenerateNextCrypto = (forcedType?: 'criptografar' | 'descriptografar') => {
    setCryptoMission(generateCryptoMission(forcedType));
    setStudentCryptoInput('');
    setCryptoFeedback(null);
    setShowCryptoSolution(false);
    setShowMatrixDraft(false);
  };

  const handleVerifyCryptoAnswer = () => {
    if (!studentCryptoInput.trim()) {
      alert('Por favor, digite sua resposta no campo antes de verificar.');
      return;
    }

    const cleanInput = studentCryptoInput.toUpperCase().replace(/[^A-Z]/g, '');
    let isCorrect = false;

    if (cryptoMission.taskType === 'criptografar') {
      const cleanExpected = cryptoMission.cipherText.replace(/[^A-Z]/g, '');
      const cleanWithAuth = cryptoMission.cipherWithAuth.replace(/[^A-Z]/g, '');
      const cleanVarB = (cryptoMission.cipherVariantB || '').replace(/[^A-Z]/g, '');
      const cleanVarBAuth = (cryptoMission.cipherVariantBWithAuth || '').replace(/[^A-Z]/g, '');
      isCorrect =
        cleanInput === cleanExpected ||
        cleanInput === cleanWithAuth ||
        (cleanVarB.length > 0 && cleanInput === cleanVarB) ||
        (cleanVarBAuth.length > 0 && cleanInput === cleanVarBAuth);
    } else {
      const cleanExpected = cryptoMission.clearText.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
      const cleanWords = cryptoMission.originalWords.join('').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
      const cleanContinuous = (cryptoMission.continuousClean || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, '');
      const cleanPadded = cryptoMission.preparedText.toUpperCase().replace(/[^A-Z]/g, '');
      const cleanUnpadded = (cryptoMission.unpaddedPreparedText || '').toUpperCase().replace(/[^A-Z]/g, '');

      // Aceita também a inversão das duas metades da bisseção (Bloco 1 + Bloco 2 ou Bloco 2 + Bloco 1)
      const bisectionReversed =
        cryptoMission.bisectionPart2 && cryptoMission.bisectionPart1
          ? (cryptoMission.bisectionPart2 + cryptoMission.bisectionPart1).toUpperCase().replace(/[^A-Z]/g, '')
          : '';

      isCorrect =
        cleanInput === cleanExpected ||
        cleanInput === cleanWords ||
        cleanInput === cleanContinuous ||
        cleanInput === cleanPadded ||
        cleanInput === cleanUnpadded ||
        (bisectionReversed.length > 0 && cleanInput === bisectionReversed);
    }

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      if (onAwardGaivota) onAwardGaivota(1);
      setCryptoFeedback({
        isChecked: true,
        isCorrect: true,
        message:
          cryptoMission.taskType === 'criptografar'
            ? `Excelente, combatente! Resposta 100% exata com a doutrina militar do EB (autenticadores posicionados com precisão na ${cryptoMission.advRule} e matriz com sobra de 2 espaços). Visto / Gaivota conquistada!`
            : 'Excelente, combatente! Mensagem em claro recuperada com perfeição doutrinária militar. Visto / Gaivota conquistada!',
      });
    } else {
      setCryptoFeedback({
        isChecked: true,
        isCorrect: false,
        message:
          `Atenção ao preenchimento da matriz ou ao posicionamento dos autenticadores na ${cryptoMission.advRule}. Revise as colunas da chave e tente novamente ou abra o espelho oficial.`,
      });
    }
  };

  // Handlers para Autenticação
  const handleGenerateNextAuth = () => {
    setAuthMission(generateAuthMission());
    setStudentAuthInput('');
    setAuthFeedback(null);
    setShowAuthSolution(false);
  };

  const handleVerifyAuthAnswer = () => {
    if (!studentAuthInput.trim()) {
      alert('Digite o autenticador calculado antes de verificar.');
      return;
    }

    const cleanInput = studentAuthInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanExpected = authMission.expectedResult.replace(/[^A-Z0-9]/g, '');
    const isCorrect = cleanInput === cleanExpected;

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      if (onAwardGaivota) onAwardGaivota(1);
      setAuthFeedback({
        isChecked: true,
        isCorrect: true,
        message: `Autenticador exato! Transmissão autenticada com sucesso (${authMission.announcedCallout}). Gaivota conquistada!`,
      });
    } else {
      setAuthFeedback({
        isChecked: true,
        isCorrect: false,
        message: `Autenticador incorreto. Revise a posição dos elementos-teste na tabela do dia e a regra de cálculo correspondente.`,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-white">
      {/* Header do Módulo */}
      <div className="liquid-glass-card border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner font-bold">
                🔐
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Módulo de Criptografia & Autenticação
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Instrução e Treinamento Prático Individual · 13º Pelotão de Comunicações (Páginas 1 a 44)
                </p>
              </div>
            </div>
          </div>

          {/* Sub-mode Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveSubMode('cripto')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeSubMode === 'cripto'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔒 Criptografia (Transposição)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubMode('autenticacao')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeSubMode === 'autenticacao'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📡 Autenticação (Págs 1 a 44)
            </button>
          </div>
        </div>

        {/* Score Pill */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Desempenho nesta sessão:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
              {score.correct} acertos de {score.total} missões
            </span>
          </div>
          <span className="text-slate-400 italic">
            Questões individuais por vez · Doutrina de comunicações do EB.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: CRIPTOGRAFIA / DESCRIPTOGRAFIA (TRANSPOSIÇÃO, BISSEÇÃO, INSERÇÃO) */}
      {/* ========================================================================= */}
      {activeSubMode === 'cripto' && (
        <div className="space-y-6">
          {/* Missão Card */}
          <div className="liquid-glass-dark border-2 border-amber-400/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header da Missão */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-black tracking-wider uppercase border ${
                    cryptoMission.taskType === 'criptografar'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                  }`}
                >
                  {cryptoMission.taskType === 'criptografar' ? '⚡ MISSÃO: CRIPTOGRAFAR' : '🔍 MISSÃO: DESCRIPTOGRAFAR'}
                </span>
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <span>Indicador de Processo:</span>
                  <strong className="text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded font-mono font-black text-sm tracking-widest border border-amber-400/40">
                    {cryptoMission.processIndicator}
                  </strong>
                  <span className="text-[10px] text-amber-400/80 font-normal">(2 letras)</span>
                </span>
              </div>

              {/* Botões para forçar o tipo se o usuário quiser escolher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateNextCrypto('criptografar')}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  Nova de Criptografar
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateNextCrypto('descriptografar')}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  Nova de Descriptografar
                </button>
              </div>
            </div>

            {/* RADIOGRAMA MILITAR OFICIAL (CABEÇALHO COM LINHA ADV REGULAMENTAR) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-400/40 space-y-2.5 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📻</span> RADIOGRAMA MILITAR DE CAMPANHA (13º PEL COM)
                </span>
                <span>GDH: <strong className="text-white">{cryptoMission.radiogram.gdh}</strong></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>PRECEDÊNCIA: <strong className="text-emerald-400">{cryptoMission.radiogram.precedence}</strong></div>
                <div>DE: <strong className="text-white">{cryptoMission.radiogram.from}</strong> → PARA: <strong className="text-white">{cryptoMission.radiogram.to}</strong></div>
              </div>

              {/* LINHA DE ADV (ADVERTÊNCIA / INSTRUÇÃO) */}
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                    Linha de ADV do Radiograma:
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/30 font-mono">
                    Indicador de 2 Letras
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-black/70 text-amber-300 font-mono font-black text-base tracking-widest border border-amber-400/60 shadow-sm">
                    ADV: {cryptoMission.processIndicator}
                  </span>
                  <span className="text-xs text-amber-100">
                    (Regra de extração: <em>{cryptoMission.advRule}</em>)
                  </span>
                </div>
              </div>
            </div>

            {/* Contexto da Situação Tática */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed italic">
              "{cryptoMission.scenario}"
            </div>

            {/* FICHA TÉCNICA CRIPTOGRÁFICA REGULAMENTAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Método de Preparo */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  1. Método de Preparo
                </span>
                <span className="text-sm font-extrabold text-amber-300 block uppercase tracking-wider">
                  {cryptoMission.taskType === 'criptografar'
                    ? cryptoMission.prepMethod === 'bissecao'
                      ? 'Bisseção (5k)'
                      : 'Inserção (Nulas)'
                    : 'Normas de Campanha'}
                </span>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {cryptoMission.taskType === 'criptografar'
                    ? cryptoMission.prepMethod === 'bissecao'
                      ? `Bisseção regulamentar: dividir a mensagem na fronteira entre palavras inteiras (sem partir nenhuma palavra ao meio), inverter as 2 partes e colocar 5 letras mortas ("${cryptoMission.deadLetter.repeat(5)}") na emenda.`
                      : `Inserção regulamentar: palavra nula "${cryptoMission.decoyStart}" + "${cryptoMission.deadLetter.repeat(2)}" no início, e "${cryptoMission.deadLetter.repeat(2)}" + "${cryptoMission.decoyEnd}" no final.`
                    : 'Identificar pela mensagem: deduzir o método regulamentar (bisseção ou inserção) ao analisar o texto recuperado do quadro.'}
                </p>
              </div>

              {/* Card 2: Chave Criptográfica (Varia entre Palavra OU Ordem Numérica, nunca os dois juntos) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    2. Chave Criptográfica
                  </span>
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30 font-mono">
                    {cryptoMission.keyType === 'dupla' ? 'Chave Dupla' : 'Chave Simples'}
                  </span>
                </div>

                {cryptoMission.keyDisplayMode === 'word' ? (
                  <>
                    <span className="text-base font-extrabold text-white block">
                      {cryptoMission.keyType === 'dupla' && cryptoMission.verticalKey ? (
                        <span className="text-sm sm:text-base">
                          <span className="text-amber-300 font-mono">H:</span> {cryptoMission.horizontalKey}{' '}
                          <span className="text-cyan-300 font-mono ml-1">V:</span> {cryptoMission.verticalKey}
                        </span>
                      ) : (
                        cryptoMission.key1
                      )}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {cryptoMission.keyType === 'dupla'
                        ? 'Chave Horizontal (colunas) e Vertical (linhas). A ordem numérica deve ser derivada pelo operador.'
                        : 'A numeração alfabética das colunas deve ser calculada pelo operador.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-mono font-bold text-amber-200">
                      {cryptoMission.keyType === 'dupla' && cryptoMission.verticalKeyOrder ? (
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-amber-400">Ordem H:</span> {cryptoMission.horizontalKeyOrder.join(' - ')}
                          </div>
                          <div>
                            <span className="text-cyan-300">Ordem V:</span> {cryptoMission.verticalKeyOrder.join(' - ')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-amber-400">Ordem:</span> {cryptoMission.key1Order.join(' - ')}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {cryptoMission.keyType === 'dupla'
                        ? 'Numeração horizontal (colunas) × vertical (linhas) para cruzamento no quadro.'
                        : 'Ordem numérica das colunas sob a matriz de transposição.'}
                    </p>
                  </>
                )}
              </div>

              {/* Card 3: Regra de Sobra de 2 Espaços e Letra Morta */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  3. Regra 5k - 2 & Letra Morta
                </span>
                <span className="text-base font-extrabold text-white block font-mono">
                  {cryptoMission.targetLength} Casas Preenchidas
                </span>
                <div className="text-[11px] text-slate-300 leading-tight">
                  {cryptoMission.taskType === 'criptografar'
                    ? `Letra morta da IECom: "${cryptoMission.deadLetter}". Preencher até ${cryptoMission.targetLength} casas (${cryptoMission.deadLettersAdded} letra(s) morta(s) ao final), garantindo que sobrem 2 espaços (${cryptoMission.targetLength} + 2 = ${cryptoMission.targetLength + 2}).`
                    : `Preenchem-se estritamente ${cryptoMission.targetLength} casas para garantir que sobrem 2 espaços antes do múltiplo de 5 (${cryptoMission.targetLength} + 2 = ${cryptoMission.targetLength + 2}).`}
                </div>
                <div className="text-[10px] text-amber-300/90 pt-1 border-t border-white/5 font-mono">
                  Sobra regulamentar: {cryptoMission.targetLength} + 2 = {cryptoMission.targetLength + 2} (múltiplo de 5)
                </div>
              </div>

              {/* Card 4: Indicador de Processo (exatamente 2 letras) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    4. Indicador de Processo (ADV)
                  </span>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30 font-mono">
                    2 Letras
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-black text-2xl tracking-widest">
                    {cryptoMission.processIndicator}
                  </span>
                  <span className="text-[11px] text-slate-300 leading-tight">
                    Posicionados na <strong>{cryptoMission.advRule}</strong> do criptograma.
                  </span>
                </div>
                <span className="text-[10px] text-amber-300/90 block leading-tight pt-1 border-t border-white/5 font-mono">
                  '{cryptoMission.processIndicator[0]}' na {cryptoMission.advPos1?.letterLabel} da {cryptoMission.advPos1?.wordLabel} · '{cryptoMission.processIndicator[1]}' na {cryptoMission.advPos2?.letterLabel} da {cryptoMission.advPos2?.wordLabel}
                </span>
              </div>
            </div>

            {/* DADOS FORNECIDOS DA QUESTÃO */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/15 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
                {cryptoMission.taskType === 'criptografar'
                  ? 'Texto em Claro Fornecido para Criptografar:'
                  : 'Criptograma Fornecido para Descriptografar (Grupos Militares de 5 Letras):'}
              </span>

              {cryptoMission.taskType === 'criptografar' ? (
                <div className="p-4 rounded-xl bg-black/60 border border-amber-400/30 text-amber-200 font-mono text-base sm:text-xl font-bold tracking-wider">
                  {cryptoMission.clearText}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/60 border border-cyan-400/30 text-cyan-200 font-mono text-base sm:text-xl font-bold tracking-widest">
                  {cryptoMission.cipherTextGrouped}
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                {cryptoMission.taskType === 'criptografar'
                  ? `Aplique o método de preparo por ${cryptoMission.prepMethod === 'bissecao' ? 'BISSEÇÃO (dividindo na fronteira de palavras inteiras, sem cortar palavras ao meio)' : 'INSERÇÃO'} (utilizando a letra morta regulamentar "${cryptoMission.deadLetter}"${cryptoMission.prepMethod === 'insercao' ? ` e as palavras nulas "${cryptoMission.decoyStart}" no início e "${cryptoMission.decoyEnd}" no final` : ''}), monte o quadro sob a chave preenchendo até ${cryptoMission.targetLength} letras (5k - 2, sobrando 2 espaços no total). Retire as colunas da matriz e disponha nos grupos de 5 letras posicionando os 2 autenticadores EXATAMENTE na ${cryptoMission.advRule} (a letra "${cryptoMission.processIndicator[0]}" fica na ${cryptoMission.advPos1?.letterLabel} da ${cryptoMission.advPos1?.wordLabel} e "${cryptoMission.processIndicator[1]}" na ${cryptoMission.advPos2?.letterLabel} da ${cryptoMission.advPos2?.wordLabel}, e NÃO no final).`
                  : cryptoMission.keyType === 'dupla'
                  ? `Localize os 2 autenticadores do processo na ${cryptoMission.advRule} (que formam "${cryptoMission.processIndicator}"). Retire essas 2 letras das suas posições para isolar as ${cryptoMission.targetLength} letras da matriz. Monte o quadro cruzando as coordenadas Horizontal × Vertical (H1×V1, H1×V2...), leia as linhas do quadro na ordem numérica da chave vertical, descarte a(s) letra(s) morta(s) final(is) e reverta o método de preparo para recuperar a mensagem original em claro.`
                  : `Localize os 2 autenticadores do processo na ${cryptoMission.advRule} (que formam "${cryptoMission.processIndicator}"). Retire essas 2 letras das suas posições para isolar as ${cryptoMission.targetLength} letras da matriz. Preencha as colunas do quadro na ordem numérica da chave (1, 2, 3...), leia linha por linha horizontalmente, descarte a(s) letra(s) morta(s) final(is) e reverta o método de preparo para recuperar a mensagem original em claro.`}
              </p>
            </div>

            {/* Botão de Rascunho / Matriz Interativa */}
            <div>
              <button
                type="button"
                onClick={() => setShowMatrixDraft(!showMatrixDraft)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{showMatrixDraft ? '▼ Esconder Matriz de Apoio' : '► Exibir Matriz de Apoio / Rascunho'}</span>
              </button>

              {showMatrixDraft && (
                <div className="mt-4 p-5 rounded-2xl bg-black/50 border border-white/15 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                      {cryptoMission.keyType === 'dupla'
                        ? `Matriz de Coordenadas Cruzadas: Horizontal ("${cryptoMission.horizontalKey}") × Vertical ("${cryptoMission.verticalKey}"):`
                        : `Matriz de Transposição da Chave ("${cryptoMission.key1}"):`}
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Quadro: {cryptoMission.matrixRows} linhas × {cryptoMission.matrixCols} colunas ({cryptoMission.matrixRows * cryptoMission.matrixCols} casas) · {cryptoMission.targetLength} preenchidas · {cryptoMission.unfilledCells} vaga(s)
                    </span>
                  </div>

                  {/* Render da Matriz com Cabeçalhos */}
                  <div className="overflow-x-auto">
                    <table className="border-collapse mx-auto font-mono text-xs sm:text-sm">
                      <thead>
                        {/* Linha das Letras da Chave Horizontal */}
                        <tr className="bg-amber-500/20 text-amber-300">
                          <th
                            colSpan={cryptoMission.keyType === 'dupla' ? 2 : 1}
                            className="p-2 border border-white/20 text-[10px] uppercase font-mono text-slate-400 text-center"
                          >
                            {cryptoMission.keyType === 'dupla' ? 'Chaves' : 'Chave'}
                          </th>
                          {cryptoMission.horizontalKey.split('').map((letter, idx) => (
                            <th key={idx} className="p-2.5 border border-white/20 text-center font-bold">
                              {letter}
                            </th>
                          ))}
                        </tr>
                        {/* Linha da Ordem Numérica da Chave Horizontal */}
                        <tr className="bg-amber-500/30 text-amber-200">
                          <th
                            colSpan={cryptoMission.keyType === 'dupla' ? 2 : 1}
                            className="p-1.5 border border-white/20 text-[10px] uppercase font-mono text-slate-400 text-center"
                          >
                            {cryptoMission.keyType === 'dupla' ? 'Ordem H' : 'Ordem'}
                          </th>
                          {cryptoMission.horizontalKeyOrder.map((colNum, idx) => (
                            <th key={idx} className="p-1.5 border border-white/20 text-center font-black">
                              {colNum}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoMission.matrixGrid.map((row, rIdx) => {
                          const vLetter = cryptoMission.verticalKey?.[rIdx] || `L${rIdx + 1}`;
                          const vOrderNum = cryptoMission.verticalKeyOrder?.[rIdx] || (rIdx + 1);

                          return (
                            <tr key={rIdx} className="hover:bg-white/5">
                              {cryptoMission.keyType === 'dupla' ? (
                                <>
                                  <td className="p-2 border border-white/20 text-cyan-300 text-center font-bold text-xs bg-cyan-950/30">
                                    {vLetter}
                                  </td>
                                  <td className="p-2 border border-white/20 text-amber-300 text-center font-black text-xs bg-amber-950/30">
                                    {vOrderNum}
                                  </td>
                                </>
                              ) : (
                                <td className="p-2 border border-white/20 text-slate-400 text-center text-[10px] font-mono">
                                  L{rIdx + 1}
                                </td>
                              )}

                              {row.map((cell, cIdx) => {
                                const fullRows = Math.floor(cryptoMission.targetLength / cryptoMission.matrixCols);
                                const remCols = cryptoMission.targetLength % cryptoMission.matrixCols;
                                const lastRowCols = remCols === 0 ? cryptoMission.matrixCols : remCols;

                                const isUnfilled = !cell || cell.trim() === '';
                                const isDeadLetter =
                                  !isUnfilled &&
                                  cell === cryptoMission.deadLetter &&
                                  cryptoMission.deadLettersAdded > 0;

                                if (isUnfilled) {
                                  return (
                                    <td
                                      key={cIdx}
                                      className="p-2.5 border border-dashed border-amber-400/40 bg-amber-500/10 text-amber-300/60 text-center font-mono text-xs min-w-[38px]"
                                      title="Casa deixada vazia no quadro para sobrar 2 espaços antes do múltiplo de 5"
                                    >
                                      —
                                    </td>
                                  );
                                }

                                return (
                                  <td
                                    key={cIdx}
                                    className={`p-2.5 border border-white/20 text-center font-bold min-w-[38px] ${
                                      isDeadLetter
                                        ? 'bg-rose-500/25 text-rose-300 font-black'
                                        : 'bg-white/5 text-white'
                                    }`}
                                    title={
                                      cryptoMission.keyType === 'dupla'
                                        ? `Cruzamento: H=${cryptoMission.horizontalKeyOrder[cIdx]} (Col ${cIdx + 1}), V=${vOrderNum} (Linha ${rIdx + 1})`
                                        : isDeadLetter
                                        ? 'Letra morta (padding para 5k-2)'
                                        : 'Letra da mensagem'
                                    }
                                  >
                                    {cell}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Legenda explicativa da doutrina militar */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-white/20 border border-white/30 inline-block" />
                      <span>Texto preparado</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-rose-500/30 border border-rose-400/40 inline-block" />
                      <span>Letra morta ({cryptoMission.deadLettersAdded} letra(s) para atingir {cryptoMission.targetLength})</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-dashed border-amber-400/50 inline-block text-amber-300 text-[10px] text-center leading-3">—</span>
                      <span>Casa não preenchida ({cryptoMission.unfilledCells} vaga(s), garantindo que sobrem 2 espaços para os autenticadores)</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 text-center italic leading-relaxed">
                    {cryptoMission.keyType === 'dupla'
                      ? `Doutrina do EB (Chave Dupla): Chave Horizontal ("${cryptoMission.horizontalKey}") no topo e Chave Vertical ("${cryptoMission.verticalKey}") na lateral. As letras foram dispostas lincando o número horizontal com o número vertical, pulando posições não existentes no quadro. Somando os 2 autenticadores ("${cryptoMission.processIndicator}"), a transmissão fecha em ${cryptoMission.targetLength + 2} letras (múltiplo de 5).`
                      : `Doutrina do EB: O quadro tem ${cryptoMission.matrixRows * cryptoMission.matrixCols} casas. Preenchem-se estritamente ${cryptoMission.targetLength} casas (terminando em ${cryptoMission.lastRowFilledCols} letras na última linha). Somando os 2 autenticadores ("${cryptoMission.processIndicator}"), a transmissão fecha perfeitamente em ${cryptoMission.targetLength + 2} letras (múltiplo de 5).`}
                  </p>
                </div>
              )}
            </div>

            {/* Campo de Resposta do Aluno */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {cryptoMission.taskType === 'criptografar'
                  ? 'Sua Resposta: Digite o Criptograma (em grupos de 5 ou contínuo):'
                  : 'Sua Resposta: Digite o Texto em Claro Decifrado:'}
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={studentCryptoInput}
                  onChange={(e) => setStudentCryptoInput(e.target.value)}
                  placeholder={
                    cryptoMission.taskType === 'criptografar'
                      ? 'Ex: ABCDE FGHIJ KLMNO...'
                      : 'Ex: AVANCAR PARA COTA CEM...'
                  }
                  className="flex-1 p-4 rounded-2xl bg-black/50 border border-white/20 text-white font-mono text-base focus:outline-none focus:border-amber-400 uppercase tracking-widest"
                />

                <button
                  type="button"
                  onClick={handleVerifyCryptoAnswer}
                  className="px-6 py-4 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all shadow-lg shadow-amber-950/40 cursor-pointer shrink-0"
                >
                  Verificar Resposta (Gaivota ✓)
                </button>
              </div>
            </div>

            {/* Feedback da Verificação */}
            {cryptoFeedback && (
              <div
                className={`p-4 rounded-2xl border text-sm leading-relaxed flex items-start gap-3 ${
                  cryptoFeedback.isCorrect
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400/40 text-rose-100'
                }`}
              >
                <span className="text-xl leading-none">{cryptoFeedback.isCorrect ? '✓' : '✕'}</span>
                <div>
                  <strong className="block font-bold">
                    {cryptoFeedback.isCorrect ? 'Visto Conquistado!' : 'Resposta Divergente:'}
                  </strong>
                  <span>{cryptoFeedback.message}</span>
                </div>
              </div>
            )}

            {/* Botões de Ação Inferiores */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowCryptoSolution(!showCryptoSolution)}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                {showCryptoSolution ? 'Ocultar Espelho da Operação' : '📖 Espelho Oficial da Operação (Passo a Passo)'}
              </button>

              <button
                type="button"
                onClick={() => handleGenerateNextCrypto()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Próxima Missão de Criptografia →</span>
              </button>
            </div>

            {/* Espelho / Resolução Completa */}
            {showCryptoSolution && (
              <div className="p-6 rounded-2xl bg-black/60 border border-amber-400/30 space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 block border-b border-white/10 pb-2">
                  Espelho da Operação e Resolução Doutrinária:
                </span>

                <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {cryptoMission.stepByStepExplanation.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {step}
                    </div>
                  ))}
                </div>

                {/* Visualização dos Grupos de 5 destacando as posições dos Autenticadores */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                      Transmissão Oficial em Grupos de 5 Letras (Posicionamento dos Autenticadores):
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono">
                      Regra: {cryptoMission.advRule}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 font-mono text-sm sm:text-base">
                    {cryptoMission.cipherTextGrouped.split(' ').map((group, gIdx) => {
                      const groupNum = gIdx + 1;
                      return (
                        <div
                          key={gIdx}
                          className="flex items-center p-1.5 rounded-xl bg-white/5 border border-white/10 relative"
                          title={`${groupNum}ª palavra (${groupNum}º grupo de 5)`}
                        >
                          <span className="text-[9px] text-slate-500 absolute -top-2 left-1.5 bg-black px-1 rounded">
                            P{groupNum}
                          </span>
                          {group.split('').map((char, cIdx) => {
                            const absIdx = gIdx * 5 + cIdx;
                            const isAuth1 = absIdx === cryptoMission.advPos1?.absoluteIdx;
                            const isAuth2 = absIdx === cryptoMission.advPos2?.absoluteIdx;
                            const isAuth = isAuth1 || isAuth2;

                            return (
                              <span
                                key={cIdx}
                                className={`w-6 h-7 flex items-center justify-center rounded font-bold transition-all ${
                                  isAuth
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 font-black shadow-xs shadow-emerald-500/30 scale-105'
                                    : 'text-slate-200'
                                }`}
                                title={
                                  isAuth1
                                    ? `1º Autenticador ('${cryptoMission.processIndicator[0]}') na ${cryptoMission.advPos1?.letterLabel} da ${cryptoMission.advPos1?.wordLabel}`
                                    : isAuth2
                                    ? `2º Autenticador ('${cryptoMission.processIndicator[1]}') na ${cryptoMission.advPos2?.letterLabel} da ${cryptoMission.advPos2?.wordLabel}`
                                    : `Letra ${cIdx + 1} da palavra ${groupNum}`
                                }
                              >
                                {char}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400 inline-block" />
                      <span>
                        Autenticador do processo ('{cryptoMission.processIndicator[0]}' na {cryptoMission.advPos1?.letterLabel} da {cryptoMission.advPos1?.wordLabel} e '{cryptoMission.processIndicator[1]}' na {cryptoMission.advPos2?.letterLabel} da {cryptoMission.advPos2?.wordLabel})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white/10 border border-white/20 inline-block" />
                      <span>Letras da matriz de transposição (48 letras)</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                    <span className="text-slate-400 block text-[10px]">Texto em Claro Oficial:</span>
                    <strong className="text-emerald-300 text-sm break-all">{cryptoMission.clearText}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                    <span className="text-slate-400 block text-[10px]">
                      Saída da Matriz ({cryptoMission.targetLength} letras, 5k - 2):
                    </span>
                    <strong className="text-cyan-200 text-sm break-all">{cryptoMission.cipherText}</strong>
                    <span className="text-[10px] text-cyan-300/70 block mt-1">Sobra de 2 espaços mantida</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30">
                    <span className="text-slate-400 block text-[10px]">
                      Transmissão Completa (50 letras):
                    </span>
                    <strong className="text-amber-200 text-sm break-all">{cryptoMission.cipherTextGrouped}</strong>
                    <span className="text-[10px] text-emerald-300/90 block mt-1">
                      '{cryptoMission.processIndicator[0]}' e '{cryptoMission.processIndicator[1]}' na {cryptoMission.advRule}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: SISTEMAS DE AUTENTICAÇÃO MILITAR (PÁGINAS 1 A 44 DO PDF DO 13º PEL COM) */}
      {/* ========================================================================= */}
      {activeSubMode === 'autenticacao' && (
        <div className="space-y-6">
          <div className="liquid-glass-dark border-2 border-emerald-400/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header da Autenticação */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  AUTENTICAÇÃO MILITAR
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {authMission.title}
                </span>
              </div>

              <span className="text-xs font-mono text-amber-300 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-400/30">
                Dia: {authMission.dayOfWeek}
              </span>
            </div>

            {/* RADIOGRAMA MILITAR DE AUTENTICAÇÃO COM LINHA DE ADV */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-emerald-400/40 space-y-2 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-slate-400">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>📻</span> RADIOGRAMA RECEBIDO PARA AUTENTICAÇÃO
                </span>
                <span>GDH: <strong className="text-white">{authMission.radiogram.gdh}</strong></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>PRECEDÊNCIA: <strong className="text-emerald-400">{authMission.radiogram.precedence}</strong></div>
                <div>DE: <strong className="text-white">{authMission.radiogram.from}</strong> → PARA: <strong className="text-white">{authMission.radiogram.to}</strong></div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">
                    Linha de ADV do Radiograma:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                    2 Letras
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-black/70 text-emerald-300 font-mono font-black text-base tracking-widest border border-emerald-400/60 shadow-sm">
                    ADV: {authMission.radiogram.adv}
                  </span>
                  <span className="text-xs text-emerald-100">
                    (Regra de extração: <em>{authMission.advRule}</em>)
                  </span>
                </div>
              </div>
              <div className="pt-2 text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Texto da Mensagem:</span>
                <div className="p-2.5 rounded-lg bg-black/50 text-white font-bold text-xs sm:text-sm tracking-wide mt-1">
                  {authMission.rawMessage}
                </div>
              </div>
            </div>

            {/* Explicação da Doutrina Oficial */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">Doutrina e Procedimento (IECom Elt):</strong>
              {authMission.ruleExplanation}
            </div>

            {/* TABELA VISUAL OFICIAL DO SLIDE (Fidedigna às Páginas 1 a 44) */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/15 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase block text-center">
                Tabela Oficial de Autenticação em Vigor no Escalão Batalhão e Inferiores
              </span>

              {/* Caso A: Alfabeto Retangular (Páginas 31 a 44) */}
              {authMission.system === 'alfabeto_retangular' && (
                <div className="overflow-x-auto">
                  <table className="border-collapse mx-auto font-mono text-xs sm:text-sm">
                    <tbody>
                      {RECTANGULAR_AUTH_GRID.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => {
                            const isTest1 = cell.letters.includes(authMission.testElement1);
                            const isTest2 = cell.letters.includes(authMission.testElement2);
                            return (
                              <td
                                key={cIdx}
                                className={`p-3.5 sm:p-4 border border-white/20 text-center font-bold min-w-[54px] sm:min-w-[65px] transition-all ${
                                  isTest1 || isTest2
                                    ? 'bg-amber-500/40 text-amber-200 border-amber-400 scale-105 shadow-md'
                                    : 'bg-white/5 text-slate-200'
                                }`}
                              >
                                <div className="text-xs sm:text-base font-extrabold">{cell.letters.join('-')}</div>
                                <div className="text-[11px] text-emerald-400 font-mono">{cell.value}</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Caso B: Um Alfabeto (Páginas 14 a 21) */}
              {authMission.system === 'um_alfabeto' && (
                <div className="overflow-x-auto">
                  <table className="border-collapse mx-auto font-mono text-xs">
                    <thead>
                      <tr className="bg-emerald-500/20 text-emerald-300">
                        {ONE_ALPHABET_SYSTEM.values.map((v, idx) => (
                          <th key={idx} className="p-1.5 border border-white/20 text-center font-black">
                            {v}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white/5 text-white">
                        {ONE_ALPHABET_SYSTEM.alphabet.map((char, idx) => {
                          const isTest1 = char === authMission.testElement1;
                          const isTest2 = char === authMission.testElement2;
                          return (
                            <td
                              key={idx}
                              className={`p-2 border border-white/20 text-center font-bold ${
                                isTest1 || isTest2 ? 'bg-amber-500/40 text-amber-200' : ''
                              }`}
                            >
                              {char}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Caso C: Dois Alfabetos (Páginas 22 a 30) */}
              {authMission.system === 'dois_alfabetos' && (
                <div className="space-y-4 overflow-x-auto">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      1º Alfabeto Completo (Valores de 1 a 9):
                    </span>
                    <table className="border-collapse font-mono text-xs mx-auto">
                      <thead>
                        <tr className="bg-white/10 text-slate-300">
                          {TWO_ALPHABETS_SYSTEM.alphabet1.map((item, idx) => (
                            <th key={idx} className="p-1 border border-white/20 text-[10px]">
                              {item.char}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/5 text-emerald-300 font-bold">
                          {TWO_ALPHABETS_SYSTEM.alphabet1.map((item, idx) => {
                            const isTest1 = item.char === authMission.testElement1;
                            const isTest2 = item.char === authMission.testElement2;
                            return (
                              <td
                                key={idx}
                                className={`p-1 border border-white/20 text-center ${
                                  isTest1 || isTest2 ? 'bg-amber-500/40 text-amber-200 font-black' : ''
                                }`}
                              >
                                {item.value}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      2º Alfabeto Incompleto (18 Posições de 1 a 18):
                    </span>
                    <table className="border-collapse font-mono text-xs mx-auto">
                      <thead>
                        <tr className="bg-emerald-500/20 text-emerald-300">
                          {TWO_ALPHABETS_SYSTEM.alphabet2.map((item, idx) => (
                            <th key={idx} className="p-1.5 border border-white/20 text-center font-bold">
                              {item.num}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/5 text-white font-extrabold">
                          {TWO_ALPHABETS_SYSTEM.alphabet2.map((item, idx) => (
                            <td key={idx} className="p-1.5 border border-white/20 text-center">
                              {item.char}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Elementos Teste da Fonia */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase block">
                  Elementos-Teste Fornecidos:
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-black text-xl">
                    1º Elt: {authMission.testElement1}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-black text-xl">
                    2º Elt: {authMission.testElement2}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 uppercase block">
                  Formato Esperado:
                </span>
                <span className="text-xs text-emerald-300 font-mono font-bold block mt-1">
                  {authMission.system === 'alfabeto_retangular'
                    ? 'Número de 2 algarismos (ex: 09, 13, 16)'
                    : 'Par de letras idênticas (ex: QQ, XX, ZZ)'}
                </span>
              </div>
            </div>

            {/* Input do Aluno */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Sua Resposta: Digite o Autenticador Obtido:
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={studentAuthInput}
                  onChange={(e) => setStudentAuthInput(e.target.value)}
                  placeholder={
                    authMission.system === 'alfabeto_retangular' ? 'Ex: 13' : 'Ex: QQ'
                  }
                  className="flex-1 p-4 rounded-2xl bg-black/50 border border-white/20 text-white font-mono text-base focus:outline-none focus:border-emerald-400 uppercase tracking-widest"
                />

                <button
                  type="button"
                  onClick={handleVerifyAuthAnswer}
                  className="px-6 py-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer shrink-0"
                >
                  Verificar Autenticador (Gaivota ✓)
                </button>
              </div>
            </div>

            {/* Feedback da Verificação */}
            {authFeedback && (
              <div
                className={`p-4 rounded-2xl border text-sm leading-relaxed flex items-start gap-3 ${
                  authFeedback.isCorrect
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400/40 text-rose-100'
                }`}
              >
                <span className="text-xl leading-none">{authFeedback.isCorrect ? '✓' : '✕'}</span>
                <div>
                  <strong className="block font-bold">
                    {authFeedback.isCorrect ? 'Gaivota Conquistada!' : 'Autenticação Incorreta:'}
                  </strong>
                  <span>{authFeedback.message}</span>
                </div>
              </div>
            )}

            {/* Botões Inferiores */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAuthSolution(!showAuthSolution)}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                {showAuthSolution ? 'Ocultar Resolução' : '📖 Espelho Oficial de Cálculo'}
              </button>

              <button
                type="button"
                onClick={handleGenerateNextAuth}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Próximo Desafio de Autenticação →</span>
              </button>
            </div>

            {/* Resolução Passo a Passo */}
            {showAuthSolution && (
              <div className="p-6 rounded-2xl bg-black/60 border border-emerald-400/30 space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 block border-b border-white/10 pb-2">
                  Memória de Cálculo Regulamentar:
                </span>

                <div className="space-y-2 text-xs sm:text-sm text-slate-200 font-mono">
                  {authMission.calculationDetails.map((det, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {det}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-300">Autenticador Regulamentar Oficial:</span>
                  <strong className="text-emerald-300 text-base">{authMission.expectedResult}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
