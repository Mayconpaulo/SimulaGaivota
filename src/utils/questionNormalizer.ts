import { Option, Question } from '../types/exam';

export const isGibberishOrLetterList = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (trimmed.length === 0) return true;

  // Rejects sequences composed ONLY of letters A-E, spaces, and punctuation (e.g. "A, B, C, D", "A, B, C, D, E", "A, B", "A", "B", "A - B")
  const lettersOnly = trimmed.replace(/[\s,;–\-\.\/\(\)\[\]]+/g, '');
  if (/^[A-E]+$/i.test(lettersOnly) && lettersOnly.length <= 8) {
    return true;
  }

  // Rejects "Alternativa A", "Opção B", "Letra C" without substantive content
  if (/^(alternativa|op[çc][ãa]o|letra)\s+[A-E][.:\s-]*$/i.test(trimmed)) {
    return true;
  }

  return false;
};

export const normalizeQuestion = (q: Question, idx: number, examId: string = 'exam'): Question => {
  const qNum = idx + 1;
  const qId = q.id && q.id.startsWith(`q-${examId}-`) ? q.id : `q-${examId}-${qNum}`;
  const isObjective = q.type !== 'discursive';

  // 1. Determine clean subtype
  let subType = q.subType;
  if (!subType) {
    if (q.tfStatements && q.tfStatements.length >= 3) subType = 'true_false';
    else if (q.blanksSentence || (q.prompt && q.prompt.includes('_____'))) subType = 'fill_in_blank';
    else if (q.columnA && q.columnA.length > 0) subType = 'column_match';
    else if (q.contextScenario) subType = 'scenario';
    else subType = 'standard';
  }

  // 2. Subtype isolation: strictly strip fields belonging to other subtypes
  let tfStatements = subType === 'true_false' ? q.tfStatements : undefined;
  let blanksSentence = subType === 'fill_in_blank' ? (q.blanksSentence || (q.prompt.includes('_____') ? q.prompt : undefined)) : undefined;
  let columnA = subType === 'column_match' ? q.columnA : undefined;
  let columnB = subType === 'column_match' ? q.columnB : undefined;
  let prompt = q.prompt || 'Questão da doutrina militar:';

  // 3. Guarantee True/False integrity
  if (subType === 'true_false') {
    if (!Array.isArray(tfStatements) || tfStatements.length < 4) {
      const baseStatements = Array.isArray(tfStatements) ? [...tfStatements] : [];
      const numerals = ['I', 'II', 'III', 'IV', 'V'];
      while (baseStatements.length < 4) {
        const nextNum = numerals[baseStatements.length] || `Item ${baseStatements.length + 1}`;
        baseStatements.push({
          numeral: nextNum,
          statement: 'A correta observância das normas regulamentares e das ordens do escalão superior é indispensável.',
        });
      }
      tfStatements = baseStatements;
    }

    const promptLower = prompt.toLowerCase();
    const isCleanLeadIn =
      promptLower.includes('julgue') ||
      promptLower.includes('verdadeiro') ||
      promptLower.includes('afirmativ') ||
      promptLower.includes('sequência correta');

    if (!isCleanLeadIn) {
      const topic = (q.subject || 'Doutrina Militar').replace(/^Bizu\s+/i, '');
      prompt = `Quanto aos preceitos doutrinários de ${topic}, julgue as afirmativas a seguir em Verdadeiro (V) ou Falso (F) e assinale a alternativa que apresenta a sequência correta:`;
    }
  }

  // 4. Fill in blank prompt & sentence alignment
  if (subType === 'fill_in_blank') {
    if (blanksSentence && prompt.includes('_____') && prompt.length > blanksSentence.length) {
      blanksSentence = prompt;
      prompt = 'Assinale a alternativa que preenche corretamente as lacunas na sequência exata:';
    } else if (!blanksSentence && prompt.includes('_____')) {
      blanksSentence = prompt;
      prompt = 'Assinale a alternativa que preenche corretamente as lacunas na sequência exata:';
    } else if (!prompt || prompt.trim().length === 0) {
      prompt = 'Assinale a alternativa que preenche corretamente as lacunas na sequência exata:';
    }
  }

  // 5. Correct Option uppercase sanitize
  let correctOption = (q.correctOption || 'A').toString().trim().toUpperCase().slice(0, 1);
  if (!['A', 'B', 'C', 'D', 'E'].includes(correctOption)) {
    correctOption = 'A';
  }

  // 6. Options sanitization & auto-heal corrupted V/F or raw letter options
  let options = q.options;
  if (isObjective) {
    if (subType === 'true_false') {
      const statementCount = (tfStatements || []).length || 4;
      const hasProperTfOptions =
        Array.isArray(options) &&
        options.length >= 4 &&
        options.every((o) => {
          const cleaned = (o.text || '').replace(/[^VF]/gi, '');
          return cleaned.length === statementCount;
        });

      if (!hasProperTfOptions) {
        const patterns = [
          Array.from({ length: statementCount }, (_, i) => (i % 2 === 0 ? 'V' : 'F')),
          Array.from({ length: statementCount }, (_, i) => (i % 2 === 1 ? 'V' : 'F')),
          Array.from({ length: statementCount }, (_, i) => (i < Math.ceil(statementCount / 2) ? 'V' : 'F')),
          Array.from({ length: statementCount }, (_, i) => (i >= 2 ? 'V' : 'F')),
          Array.from({ length: statementCount }, (_, i) => (i === 0 || i === statementCount - 1 ? 'V' : 'F')),
        ];
        const letterList: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
        options = letterList.map((letter, i) => ({
          letter,
          text: patterns[i].join(' – '),
        }));
      }
    } else {
      // Non-true_false: ensure options are NOT V/F strings or meaningless letters
      const isCorruptedWithVf =
        Array.isArray(options) &&
        options.length > 0 &&
        options.every((o) => /^[VF\s\-,–—.]+$/i.test(o.text?.trim() || ''));

      const isJustLetters =
        Array.isArray(options) &&
        options.length > 0 &&
        options.every((o) => isGibberishOrLetterList(o.text));

      if (!options || options.length < 4 || isCorruptedWithVf || isJustLetters) {
        const fullPrompt = `${prompt} ${blanksSentence || ''} ${q.contextScenario || ''}`.toLowerCase();
        const isRevolverOrMotor =
          fullPrompt.includes('princípio motor') ||
          fullPrompt.includes('revólver') ||
          fullPrompt.includes('ação muscular');

        if (subType === 'fill_in_blank') {
          if (isRevolverOrMotor) {
            options = [
              { letter: 'A', text: 'força de expansão dos gases / repetição' },
              { letter: 'B', text: 'ação muscular do atirador / repetição' },
              { letter: 'C', text: 'recuo do cano / semiautomático' },
              { letter: 'D', text: 'massa inercial do ferrolho / automático' },
              { letter: 'E', text: 'ação mista / repetição' },
            ];
            correctOption = 'B';
          } else {
            options = [
              { letter: 'A', text: 'força de expansão dos gases / repetição' },
              { letter: 'B', text: 'ação muscular do atirador / repetição' },
              { letter: 'C', text: 'recuo curto do cano / semiautomático' },
              { letter: 'D', text: 'inércia das massas / automático' },
              { letter: 'E', text: 'pressão dos gases / repetição manual' },
            ];
          }
        } else if (subType === 'column_match') {
          options = [
            { letter: 'A', text: '1 – 3 – 4 – 2' },
            { letter: 'B', text: '2 – 4 – 1 – 3' },
            { letter: 'C', text: '3 – 1 – 2 – 4' },
            { letter: 'D', text: '4 – 2 – 3 – 1' },
            { letter: 'E', text: '1 – 4 – 2 – 3' },
          ];
        } else {
          options = [
            { letter: 'A', text: q.modelAnswer && !isGibberishOrLetterList(q.modelAnswer) ? q.modelAnswer : 'Alternativa A (Conforme preceito da doutrina militar)' },
            { letter: 'B', text: 'Alternativa B (Discrepante em relação aos manuais operacionais)' },
            { letter: 'C', text: 'Alternativa C (Incompleta quanto aos procedimentos regulamentares)' },
            { letter: 'D', text: 'Alternativa D (Incorreta segundo as normas do Exército)' },
            { letter: 'E', text: 'Alternativa E (Inaplicável ao contexto militar apresentado)' },
          ];
        }
      }
    }
  }

  // 7. cardDirectFact bulletproofing (strictly eliminates "A, B, C, D" on flashcards)
  let cardDirectFact = q.cardDirectFact;
  const isBackBad =
    !cardDirectFact ||
    !cardDirectFact.backAnswer ||
    isGibberishOrLetterList(cardDirectFact.backAnswer) ||
    (subType !== 'true_false' && /^[VF\s\-,–—.]+$/i.test(cardDirectFact.backAnswer));

  if (isBackBad || !cardDirectFact?.frontPrompt) {
    let front = cardDirectFact?.frontPrompt || prompt;
    if (subType === 'fill_in_blank' && blanksSentence) {
      front = `Complete a lacuna: ${blanksSentence}`;
    } else if (prompt.length > 120) {
      const sentences = prompt.split(/[.?!]/).filter((s) => s.trim().length > 10);
      const last = sentences[sentences.length - 1]?.trim();
      if (last) {
        front = last + (last.endsWith('?') ? '' : '?');
      }
    }

    let back = '';
    const chosenOpt = (options || []).find((o) => o.letter === correctOption) || options?.[0];

    if (chosenOpt && !isGibberishOrLetterList(chosenOpt.text) && (subType === 'true_false' || !/^[VF\s\-,–—.]+$/i.test(chosenOpt.text))) {
      if (subType === 'fill_in_blank') {
        back = `${chosenOpt.letter}) ${chosenOpt.text}`;
      } else if (subType === 'true_false') {
        back = `Gabarito (${chosenOpt.letter}): ${chosenOpt.text}`;
      } else if (subType === 'column_match') {
        back = `Sequência correta (${chosenOpt.letter}): ${chosenOpt.text}`;
      } else {
        back = `${chosenOpt.letter}) ${chosenOpt.text}`;
      }
    } else if (q.modelAnswer && !isGibberishOrLetterList(q.modelAnswer) && (subType === 'true_false' || !/^[VF\s\-,–—.]+$/i.test(q.modelAnswer))) {
      back = q.modelAnswer;
    } else if (q.explanation && !isGibberishOrLetterList(q.explanation)) {
      back = q.explanation;
    } else {
      back = 'Conforme prescrição doutrinária militar oficial.';
    }

    cardDirectFact = {
      frontPrompt: front,
      backAnswer: back,
    };
  }

  // 8. Gaivotas calculation: strictly 1 for objective questions
  const totalGaivotas = isObjective
    ? 1
    : (q.criteria && q.criteria.length > 0
        ? q.criteria.reduce((acc, c) => acc + (c.gaivotas || 1), 0)
        : Math.max(1, q.totalGaivotas || 3));

  return {
    ...q,
    id: qId,
    number: qNum,
    type: isObjective ? 'objective' : 'discursive',
    subType,
    subject: q.subject || 'Doutrina Militar',
    prompt,
    blanksSentence,
    tfStatements,
    columnA,
    columnB,
    options,
    correctOption,
    cardDirectFact,
    totalGaivotas,
  };
};
