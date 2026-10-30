/**
 * Motor de Criptografia Militar e Sistemas de Autenticação do Exército Brasileiro
 * Baseado no Manual de Campanha de Criptografia e na apostila Q-402 / 13º Pel Com (Páginas 1 a 44).
 */

export type CryptoTaskType = 'criptografar' | 'descriptografar' | 'autenticacao';

export type PreparationMethod = 'insercao' | 'bissecao' | 'direto';

export type KeyType = 'simples' | 'dupla';

export interface RadiogramHeader {
  precedence: string; // Ex: "OPERACIONAL (O)"
  gdh: string; // Grupo Data-Hora, Ex: "231400P OUT 26"
  from: string; // Ex: "C21 (13º PEL COM)"
  to: string; // Ex: "C10 (POSTO DE COMANDO)"
  adv: string; // Linha de ADV com o código e a regra de extração
}

export interface AdvPositionRule {
  wordNum: number; // 1-based índice da palavra (grupo de 5 letras): ex 3 (3ª palavra)
  letterPos: number; // 1-based posição da letra no grupo: ex 1 (1ª letra)
  wordLabel: string; // Ex: "3ª palavra"
  letterLabel: string; // Ex: "1ª letra"
  absoluteIdx: number; // 0-based índice absoluto na transmissão (ex: 10)
}

export interface CryptoMission {
  id: string;
  taskType: 'criptografar' | 'descriptografar';
  title: string;
  scenario: string;
  processIndicator: string; // Código extraído do ADV (Ex: "IN", "SO", "AO")
  advRule: string; // Regra explicativa (Ex: "1ª letra da 3ª palavra e 4ª letra da 2ª palavra")
  advCode: string; // Código resultante no ADV (exatamente 2 letras)
  advPos1: AdvPositionRule; // Posição prescrita do 1º elemento
  advPos2: AdvPositionRule; // Posição prescrita do 2º elemento
  radiogram: RadiogramHeader;
  prepMethod: PreparationMethod;
  keyType: KeyType;
  keyDisplayMode: 'word' | 'order'; // Varia entre exibir a palavra OU a ordem numérica (nunca os dois juntos na questão)
  key1: string; // Chave 1 (Horizontal)
  key1Order: number[]; // Ordem numérica das colunas: ex [5, 3, 2, 1, 4, ...]
  key2?: string; // Chave 2 (Vertical, se chave dupla)
  key2Order?: number[]; // Ordem numérica das linhas (se chave dupla)
  horizontalKey: string;
  horizontalKeyOrder: number[];
  verticalKey?: string;
  verticalKeyOrder?: number[];
  deadLetter: string; // Letra morta convencionada: ex "X", "Z", "K"
  deadLettersAdded: number; // Quantidade EXATA de letras mortas adicionadas para atingir 5k - 2
  clearText: string; // Mensagem em claro limpa com espaços
  originalWords: string[]; // Palavras originais da mensagem
  preparedText: string; // Mensagem após aplicação do método de preparo e padding
  unpaddedPreparedText: string; // Mensagem preparada antes do padding de 5k - 2
  continuousClean: string; // Mensagem original contínua sem espaços (sem X entre as palavras)
  decoyStart?: string; // Palavra nula inicial (no método por inserção)
  decoyEnd?: string; // Palavra nula final (no método por inserção)
  bisectionMarker?: string; // Sequência de 5 letras iguais (no método por bisseção)
  bisectionPart1?: string; // Bloco 1 da bisseção
  bisectionPart2?: string; // Bloco 2 da bisseção
  cipherText: string; // Mensagem cifrada da matriz (T posições, sempre 5k - 2, ex: 48 letras)
  cipherWithAuth: string; // Mensagem cifrada com os 2 autenticadores nas posições prescritas pela regra (5k posições, ex: 50 letras)
  cipherVariantB?: string;
  cipherVariantBWithAuth?: string;
  cipherTextGrouped: string; // Mensagem cifrada completa em grupos de 5 letras
  matrixCols: number;
  matrixRows: number;
  matrixGrid: string[][]; // Matriz visual preenchida
  lastRowFilledCols: number; // Quantidade de colunas preenchidas na última linha
  unfilledCells: number; // Casas não preenchidas no quadro (deixadas vagas para sobrar 2 espaços para os autenticadores)
  targetLength: number; // Comprimento T da mensagem na matriz (sempre 5k - 2)
  stepByStepExplanation: string[];
}

export interface AuthMission {
  id: string;
  system: 'um_alfabeto' | 'dois_alfabetos' | 'alfabeto_retangular';
  title: string;
  dayOfWeek: string;
  rawMessage: string;
  radiogram: RadiogramHeader;
  advRule: string;
  testElement1: string;
  testElement2: string;
  ruleExplanation: string;
  expectedResult: string; // Ex: "XX" ou "QQ" ou "13"
  announcedCallout: string; // Ex: "ZNB XX" ou "ZNB 13"
  calculationDetails: string[];
}

/**
 * Deriva a numeração das colunas de uma chave alfabética (1-based),
 * conforme a regra da criptografia militar por transposição.
 * Exemplo: "BRASIL" -> A(1), B(2), I(3), L(4), R(5), S(6)
 */
export function deriveKeyOrder(key: string): number[] {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  const charsWithIdx = cleanKey.split('').map((char, originalIdx) => ({ char, originalIdx }));

  charsWithIdx.sort((a, b) => {
    if (a.char === b.char) return a.originalIdx - b.originalIdx;
    return a.char.localeCompare(b.char);
  });

  const orderResult = new Array<number>(cleanKey.length);
  charsWithIdx.forEach((item, sortedRank) => {
    orderResult[item.originalIdx] = sortedRank + 1; // 1-based rank
  });

  return orderResult;
}

export interface PrepareMessageResult {
  prepared: string;
  continuousClean: string;
  log: string;
  decoyStart?: string;
  decoyEnd?: string;
  bisectionMarker?: string;
  part1?: string;
  part2?: string;
}

export const DECOY_WORDS = [
  'ALFA',
  'BRAVO',
  'DELTA',
  'FORTE',
  'LIMA',
  'SELVA',
  'TANGO',
  'ZULU',
  'PATRIA',
  'BRASIL',
];

/**
 * Aplica o método militar regulamentar de preparo da mensagem:
 * - 'direto': texto contínuo em maiúsculas sem espaços e sem alterações.
 * - 'bissecao' (bisserção): corta-se a mensagem no meio (2 metades) e invertem-se suas posições,
 *   adicionando ENTRE elas uma sequência de 5 letras iguais para identificação da divisão/emenda.
 *   NENHUMA letra X é intercalada entre as palavras originais.
 * - 'insercao': uma palavra nula no início e uma no final da mensagem.
 *   No início, a palavra inserida é sucedida/procedida de 2 letras iguais para sinalizar sua existência (ex: ALFAXX).
 *   No final, a palavra inserida é precedida de 2 letras iguais para indicar sua existência (ex: XXBRAVO).
 *   As palavras originais no miolo permanecem limpas e contínuas, sem nenhuma letra X entre elas!
 */
export function prepareMessageText(
  input: string[] | string,
  method: PreparationMethod,
  deadLetter: string
): PrepareMessageResult {
  let cleanWords: string[] = [];
  if (Array.isArray(input)) {
    cleanWords = input
      .map((w) =>
        w
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z]/g, '')
      )
      .filter(Boolean);
  } else {
    cleanWords = input
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Z]/g, ''))
      .filter(Boolean);
  }

  // A mensagem em claro contínua não possui nenhuma letra X entre as palavras!
  const continuous = cleanWords.join('');

  if (method === 'bissecao') {
    // DOUTRINA MILITAR DO EXÉRCITO BRASILEIRO (13º Pel Com / Q-402):
    // Na bisseção, NUNCA se divide uma palavra no meio.
    // O corte é feito estritamente na fronteira entre palavras inteiras.
    // Não tem problema uma parte ter mais palavras ou letras que outra,
    // desde que todas as palavras permaneçam 100% íntegras.
    let part1Words: string[] = [];
    let part2Words: string[] = [];

    if (cleanWords.length <= 1) {
      part1Words = cleanWords;
      part2Words = [];
    } else {
      // Encontra a melhor fronteira k (1 <= k < cleanWords.length) que divide entre palavras inteiras,
      // buscando a divisão mais equilibrada em caracteres sem quebrar nenhuma palavra ao meio.
      const totalChars = cleanWords.reduce((sum, w) => sum + w.length, 0);
      let bestK = 1;
      let minDiff = Infinity;

      for (let k = 1; k < cleanWords.length; k++) {
        const len1 = cleanWords.slice(0, k).reduce((sum, w) => sum + w.length, 0);
        const len2 = totalChars - len1;
        const diff = Math.abs(len1 - len2);
        if (diff < minDiff) {
          minDiff = diff;
          bestK = k;
        }
      }

      part1Words = cleanWords.slice(0, bestK);
      part2Words = cleanWords.slice(bestK);
    }

    const part1 = part1Words.join('');
    const part2 = part2Words.join('');
    const seamMarker = deadLetter.repeat(5); // 5 letras iguais regulamentares (ex: XXXXX)
    const prepared = part2 + seamMarker + part1;

    const part1Human = part1Words.join(' ');
    const part2Human = part2Words.join(' ');

    return {
      prepared,
      continuousClean: continuous,
      part1,
      part2,
      bisectionMarker: seamMarker,
      log: `Bisseção regulamentar militar: A mensagem foi dividida estritamente na fronteira entre palavras inteiras (sem cortar nenhuma palavra ao meio). Bloco 1 ("${part1Human}" -> "${part1}", ${part1.length} letras) e Bloco 2 ("${part2Human}" -> "${part2}", ${part2.length} letras). Inverteram-se as posições adicionando entre eles o marcador regulamentar de 5 letras iguais ("${seamMarker}"): Bloco 2 + ${seamMarker} + Bloco 1 = "${prepared}".`,
    };
  }

  if (method === 'insercao') {
    const decoy1 = DECOY_WORDS[Math.floor(Math.random() * DECOY_WORDS.length)];
    let decoy2 = DECOY_WORDS[Math.floor(Math.random() * DECOY_WORDS.length)];
    while (decoy2 === decoy1) {
      decoy2 = DECOY_WORDS[Math.floor(Math.random() * DECOY_WORDS.length)];
    }

    const doubleDead = deadLetter.repeat(2); // 2 letras iguais regulamentares (ex: XX)
    const prefix = decoy1 + doubleDead; // Palavra inicial sucedida de 2 letras iguais
    const suffix = doubleDead + decoy2; // Palavra final precedida de 2 letras iguais
    const prepared = prefix + continuous + suffix;

    return {
      prepared,
      continuousClean: continuous,
      decoyStart: decoy1,
      decoyEnd: decoy2,
      log: `Inserção regulamentar: Inserida a palavra nula "${decoy1}" no início seguida de 2 letras iguais ("${doubleDead}"), e a palavra nula "${decoy2}" no final precedida de 2 letras iguais ("${doubleDead}"). A mensagem no miolo permanece contínua ("${continuous}"), sem nenhuma letra X entre as palavras. Texto preparado: "${prepared}".`,
    };
  }

  return {
    prepared: continuous,
    continuousClean: continuous,
    log: `Preparo direto: Mensagem em claro contínua sem espaços e sem alterações ("${continuous}"). Nenhuma letra X entre as palavras.`,
  };
}

/**
 * Executa uma transposição colunar militar dada uma chave e uma mensagem preparada.
 * REGRA DOUTRINÁRIA MILITAR (13º Pel Com / Q-402):
 * - A transmissão final por rádio é agrupada em blocos de 5 letras (5k).
 * - O último grupo de 5 letras termina SEMPRE com os 2 caracteres do autenticador / indicador de processo do ADV!
 * - Portanto, a mensagem no quadro/matriz NUNCA pode fechar um múltiplo de 5 redondo.
 *   Ela deve ocupar estritamente T = 5k - 2 posições (ex: 18, 23, 28, 33, 38, 43, 48...),
 *   sobrando exatamente 2 espaços antes de fechar o múltiplo de 5 para a inclusão dos autenticadores.
 * - Caso o quadro tenha 49 espaços (ex: 7x7) e T = 48, preenchem-se APENAS 48 espaços,
 *   deixando a última casa do quadro vazia (não completando todas as colunas).
 */
export function executeColumnarTransposition(
  prepared: string,
  key: string,
  deadLetter: string
): {
  cipherContinuous: string;
  grid: string[][];
  cols: number;
  rows: number;
  paddedPrepared: string;
  deadLettersAdded: number;
  targetLength: number;
  lastRowFilledCols: number;
  unfilledCells: number;
  cipherVariantB: string;
} {
  const cleanPrepared = prepared.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanDeadLetter = (deadLetter.toUpperCase().replace(/[^A-Z]/g, '') || 'X')[0];
  const cols = cleanKey.length;
  const keyOrder = deriveKeyOrder(cleanKey);

  // Calcula estritamente o necessário para que o total de letras seja T = 5k - 2 (sobrando 2 espaços para os autenticadores)
  // (T + 2) % 5 === 0  =>  T % 5 === 3
  const L = cleanPrepared.length;
  const deadLettersAdded = (3 - (L % 5) + 5) % 5;
  const targetLength = L + deadLettersAdded;
  const padded = cleanPrepared + cleanDeadLetter.repeat(deadLettersAdded);

  const rows = Math.ceil(targetLength / cols);
  const remainder = targetLength % cols;
  const lastRowFilledCols = remainder === 0 ? cols : remainder;
  const unfilledCells = rows * cols - targetLength;

  // Montagem da matriz (quadro)
  const grid: string[][] = Array.from({ length: rows }, () => new Array<string>(cols).fill(''));

  // Inscrição nas colunas na ordem numérica da chave (1, 2, 3...)
  // conforme a doutrina militar do EB e instrução do 13º Pel Com:
  // Coluna de ordem 1 (colIndex = keyOrder.indexOf(1)) recebe a 1ª sequência de letras (de cima para baixo).
  // Coluna de ordem 2 (colIndex = keyOrder.indexOf(2)) recebe a 2ª sequência, e assim por diante.
  let charIdx = 0;
  for (let rank = 1; rank <= cols; rank++) {
    const colIndex = keyOrder.indexOf(rank);
    if (colIndex !== -1) {
      const colLen = colIndex < lastRowFilledCols ? rows : rows - 1;
      for (let r = 0; r < colLen; r++) {
        if (charIdx < padded.length) {
          grid[r][colIndex] = padded[charIdx++];
        }
      }
    }
  }

  // Leitura do criptograma linha por linha (L1, L2, L3...)
  let cipherContinuous = '';
  for (let r = 0; r < rows; r++) {
    const colsInThisRow = r === rows - 1 ? lastRowFilledCols : cols;
    for (let c = 0; c < colsInThisRow; c++) {
      if (grid[r][c]) {
        cipherContinuous += grid[r][c];
      }
    }
  }

  // Variante B (dual: preenchimento por linhas e leitura por colunas 1, 2, 3...)
  const altGrid: string[][] = Array.from({ length: rows }, () => new Array<string>(cols).fill(''));
  let altIdx = 0;
  for (let r = 0; r < rows; r++) {
    const colsInThisRow = r === rows - 1 ? lastRowFilledCols : cols;
    for (let c = 0; c < colsInThisRow; c++) {
      if (altIdx < padded.length) {
        altGrid[r][c] = padded[altIdx++];
      }
    }
  }
  let cipherVariantB = '';
  for (let rank = 1; rank <= cols; rank++) {
    const colIndex = keyOrder.indexOf(rank);
    if (colIndex !== -1) {
      const colLen = colIndex < lastRowFilledCols ? rows : rows - 1;
      for (let r = 0; r < colLen; r++) {
        if (altGrid[r][colIndex]) {
          cipherVariantB += altGrid[r][colIndex];
        }
      }
    }
  }

  return {
    cipherContinuous,
    grid,
    cols,
    rows,
    paddedPrepared: padded,
    deadLettersAdded,
    targetLength,
    lastRowFilledCols,
    unfilledCells,
    cipherVariantB,
  };
}

/**
 * Reverte a transposição colunar militar.
 * Aceita tanto o criptograma de T letras (5k - 2) quanto a transmissão de 5k letras com os 2 autenticadores.
 */
export function reverseColumnarTransposition(
  cipherInput: string,
  key: string
): {
  reconstructedGrid: string[][];
  rows: number;
  cols: number;
  reconstructedPrepared: string;
  lastRowFilledCols: number;
  unfilledCells: number;
} {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  const cols = cleanKey.length;
  const keyOrder = deriveKeyOrder(cleanKey);

  // Se o criptograma veio completo com os 2 autenticadores no final (múltiplo de 5 redondo),
  // separamos os 2 autenticadores para obter as T letras da matriz
  let cleanCipher = cipherInput.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanCipher.length % 5 === 0 && cleanCipher.length >= 5) {
    cleanCipher = cleanCipher.slice(0, cleanCipher.length - 2);
  }

  const T = cleanCipher.length;
  const rows = Math.ceil(T / cols);
  const remainder = T % cols;
  const lastRowFilledCols = remainder === 0 ? cols : remainder;
  const unfilledCells = rows * cols - T;

  const grid: string[][] = Array.from({ length: rows }, () => new Array<string>(cols).fill(''));

  // Preenche a matriz linha por linha com o criptograma recebido (extraído horizontalmente)
  let cipherIdx = 0;
  for (let r = 0; r < rows; r++) {
    const colsInThisRow = r === rows - 1 ? lastRowFilledCols : cols;
    for (let c = 0; c < colsInThisRow; c++) {
      if (cipherIdx < cleanCipher.length) {
        grid[r][c] = cleanCipher[cipherIdx++];
      }
    }
  }

  // Lê coluna por coluna na ordem numérica da chave (1, 2, 3...)
  let reconstructedPrepared = '';
  for (let rank = 1; rank <= cols; rank++) {
    const colIndex = keyOrder.indexOf(rank);
    if (colIndex !== -1) {
      const colLen = colIndex < lastRowFilledCols ? rows : rows - 1;
      for (let r = 0; r < colLen; r++) {
        if (grid[r][colIndex]) {
          reconstructedPrepared += grid[r][colIndex];
        }
      }
    }
  }

  return {
    reconstructedGrid: grid,
    rows,
    cols,
    reconstructedPrepared,
    lastRowFilledCols,
    unfilledCells,
  };
}

/**
 * Executa a transposição por CHAVE DUPLA com matriz de coordenadas cruzadas (Horizontal x Vertical),
 * conforme a doutrina militar do Exército Brasileiro:
 * - A primeira palavra (Chave Horizontal) fica no topo, gerando a ordem das colunas (1 a C).
 * - A segunda palavra (Chave Vertical) fica à esquerda, gerando a ordem das linhas (1 a R).
 * - O posicionamento das letras no quadro segue estritamente a combinação cruzada:
 *   Começa na horizontal do número 1 e cruza com a vertical do número 1 (H=1, V=1) para a 1ª letra.
 *   Continuando no número 1 da horizontal, avança para a vertical número 2 (H=1, V=2), 3 (H=1, V=3)...
 *   Terminada a coluna de ordem 1, avança para o número 2 da horizontal com a vertical 1, 2, 3...
 * - A extração do criptograma da matriz é realizada linha a linha (L1, L2, L3...).
 */
export function executeDoubleKeyTransposition(
  prepared: string,
  horizontalKey: string,
  verticalKey: string,
  deadLetter: string
): {
  cipherContinuous: string;
  grid: string[][];
  cols: number;
  rows: number;
  paddedPrepared: string;
  deadLettersAdded: number;
  targetLength: number;
  lastRowFilledCols: number;
  unfilledCells: number;
  hOrder: number[];
  vOrder: number[];
  cipherVariantB: string;
} {
  const cleanPrepared = prepared.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKeyH = horizontalKey.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKeyV = verticalKey.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanDeadLetter = (deadLetter.toUpperCase().replace(/[^A-Z]/g, '') || 'X')[0];
  const cols = cleanKeyH.length;
  const rows = cleanKeyV.length;
  const hOrder = deriveKeyOrder(cleanKeyH);
  const vOrder = deriveKeyOrder(cleanKeyV);

  // Calcula estritamente o necessário para que o total de letras seja T = 5k - 2 (sobrando 2 espaços para os autenticadores)
  const L = cleanPrepared.length;
  const deadLettersAdded = (3 - (L % 5) + 5) % 5;
  const targetLength = L + deadLettersAdded;
  const padded = cleanPrepared + cleanDeadLetter.repeat(deadLettersAdded);

  const remainder = targetLength % cols;
  const lastRowFilledCols = remainder === 0 ? cols : remainder;
  const unfilledCells = rows * cols - targetLength;

  // Verificação de célula válida no quadro militar
  const isCellValid = (r: number, c: number): boolean => {
    return (r * cols + c) < targetLength;
  };

  const grid: string[][] = Array.from({ length: rows }, () => new Array<string>(cols).fill(''));

  // 1. Inscrição da mensagem no quadro pelas coordenadas cruzadas:
  // Começa no número 1 horizontal com o número 1 vertical.
  // Continuando no 1 horizontal, a vertical avança para 2, 3...
  // Em seguida avança para o número 2 horizontal com o 1 vertical, 2, 3...
  let charIdx = 0;
  for (let h = 1; h <= cols; h++) {
    const c = hOrder.indexOf(h);
    if (c === -1) continue;
    for (let v = 1; v <= rows; v++) {
      const r = vOrder.indexOf(v);
      if (r === -1) continue;
      if (isCellValid(r, c) && charIdx < padded.length) {
        grid[r][c] = padded[charIdx++];
      }
    }
  }

  // 2. Extração do criptograma da matriz linha a linha horizontalmente (L1, L2, L3...):
  let cipherContinuous = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isCellValid(r, c) && grid[r][c]) {
        cipherContinuous += grid[r][c];
      }
    }
  }

  // Variante B (extração pelas coordenadas cruzadas):
  let cipherVariantB = '';
  for (let h = 1; h <= cols; h++) {
    const c = hOrder.indexOf(h);
    if (c === -1) continue;
    for (let v = 1; v <= rows; v++) {
      const r = vOrder.indexOf(v);
      if (r === -1) continue;
      if (isCellValid(r, c) && grid[r][c]) {
        cipherVariantB += grid[r][c];
      }
    }
  }

  return {
    cipherContinuous,
    grid,
    cols,
    rows,
    paddedPrepared: padded,
    deadLettersAdded,
    targetLength,
    lastRowFilledCols,
    unfilledCells,
    hOrder,
    vOrder,
    cipherVariantB,
  };
}

/**
 * Reverte a transposição de Chave Dupla (Horizontal x Vertical).
 */
export function reverseDoubleKeyTransposition(
  cipherInput: string,
  horizontalKey: string,
  verticalKey: string,
  targetLength: number,
  authIdx1?: number,
  authIdx2?: number
): {
  reconstructedGrid: string[][];
  reconstructedPrepared: string;
} {
  const cleanKeyH = horizontalKey.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanKeyV = verticalKey.toUpperCase().replace(/[^A-Z]/g, '');
  const cols = cleanKeyH.length;
  const rows = cleanKeyV.length;
  const hOrder = deriveKeyOrder(cleanKeyH);
  const vOrder = deriveKeyOrder(cleanKeyV);

  let cleanCipher = cipherInput.toUpperCase().replace(/[^A-Z]/g, '');
  if (authIdx1 !== undefined && authIdx2 !== undefined && cleanCipher.length > targetLength) {
    cleanCipher = extractAuthenticatorsAndMatrixCipher(cleanCipher, authIdx1, authIdx2).matrixCipher;
  } else if (cleanCipher.length % 5 === 0 && cleanCipher.length === targetLength + 2) {
    cleanCipher = cleanCipher.slice(0, targetLength);
  }

  const remainder = targetLength % cols;
  const lastRowFilledCols = remainder === 0 ? cols : remainder;
  const fullRows = Math.floor(targetLength / cols);

  const isCellValid = (r: number, c: number): boolean => {
    return (r * cols + c) < targetLength;
  };

  const grid: string[][] = Array.from({ length: rows }, () => new Array<string>(cols).fill(''));

  // 1. Inscrição linha por linha do criptograma recebido no quadro:
  let cipherIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isCellValid(r, c) && cipherIdx < cleanCipher.length) {
        grid[r][c] = cleanCipher[cipherIdx++];
      }
    }
  }

  // 2. Leitura da mensagem preparada pelas coordenadas cruzadas:
  // Começando em Horizontal 1 (v = 1, 2, 3...), depois Horizontal 2 (v = 1, 2, 3...):
  let reconstructedPrepared = '';
  for (let h = 1; h <= cols; h++) {
    const c = hOrder.indexOf(h);
    if (c === -1) continue;
    for (let v = 1; v <= rows; v++) {
      const r = vOrder.indexOf(v);
      if (r === -1) continue;
      if (isCellValid(r, c) && grid[r][c]) {
        reconstructedPrepared += grid[r][c];
      }
    }
  }

  return {
    reconstructedGrid: grid,
    reconstructedPrepared,
  };
}

/**
 * Formata texto contínuo em blocos militares regulamentares de 5 caracteres.
 */
export function formatInMilitaryGroups(text: string): string {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const groups: string[] = [];
  for (let i = 0; i < clean.length; i += 5) {
    groups.push(clean.slice(i, i + 5));
  }
  return groups.join(' ');
}

// -------------------------------------------------------------
// BANCO EXPANDIDO DE MENSAGENS E CHAVES REGULAMENTARES DO EB
// -------------------------------------------------------------

export const MILITARY_MESSAGES: string[] = [
  'ALUNOS DORMINDO INSTRUCAO VG FO NELES PT',
  'INIMIGO RECUOU PARA LINHA ALFA',
  'TROPA ABATIDA PELA ARTILHARIA INIMIGA',
  'AVANCAR PARA COTA CEM AO AMANHECER',
  'POSTO DE COMANDO DESLOCADO PARA BRAVO',
  'RECOLHER LINHA FIO WD1 IMEDIATAMENTE',
  'MANTENHAM SILENCIO RADIO ATE NOVA ORDEM',
  'TRANSMITIR RELATORIO DE SITUACAO SITREP',
  'TURMA DE TELEFONIA LIGAR CENTRAL SB22',
  'ESTABELECER POSTO DE VIGILANCIA CHARLIE',
  'INIMIGO ABANDONOU POSICAO NA LINHA CHARLIE',
  'REFORCO DE ARTILHARIA A CAMINHO DA COTA TREZENTOS',
  'COLUNA DE BLINDADOS AVANCA PELA ESTRADA PRINCIPAL',
  'ESQUADRAO DE CAVALARIA RECONHECEU A PONTE DO RIO',
  'PATRULHA DE EMBOSCADA AGUARDA ALVO NA CLAREIRA',
  'CENTRAL TELEFONICA LIGADA AO POSTO DE OBSERVACAO',
  'TURMA DO FIO LANCOU QUATRO QUILOMETROS DE CABO',
  'GONIOMETRIA INIMIGA ATIVA NA FAIXA DE VHF',
  'MUDAR PARA FREQUENCIA ALTERNATIVA PREVISTA NA IET',
  'DEPOSITAR SUPRIMENTOS NA ZONA DE REUNIAO DELTA',
  'EVACUAR FERIDOS PARA O POSTO DE SOCORRO IMEDIATAMENTE',
  'SUSPENDER FOGO DE ARTILHARIA ATE SEGUNDA ORDEM',
  'PELOTAO DE FUZILEIROS OCUPARA CRISTA TOPOGRAFICA',
  'ESTACAO REPETIDORA INSTALADA NO ALTO DO MORRO',
  'BATERIA DE MORTEIROS DISPARARA SALVA DE BALIZAMENTO',
  'TROPA INIMIGA TENTA ROMPER CERCO AO NORTE',
  'SILENCIO DE RADIO DETERMINADO PARA TODA A UNIDADE',
  'COMUNICACAO POR FIBRA OPTICA OPERACIONAL NO PC',
  'INTERCEPTAR TRANSMISSAO CLARA DO POSTO INIMIGO',
  'CONFIRMAR CHEGADA DO CONVOI COM MUNICAO NO PONTO ECO',
  'TURMA DE MANUTENCAO REPARAR GERADOR DE CAMPANHA',
  'MENSAGEM PRIORITARIA DO COMANDANTE DO BATALHAO',
  'OBSERVADORES AVANCADOS REGISTRARAM MOVIMENTO SUSPEITO',
  'LANCAR CORTINA DE FUMACA PARA ACOBERTAR A RETIRADA',
  'REORGANIZAR DISPOSITIVO DEFENSIVO ANTES DO ANOITECER',
  'PATRULHA DE CONTATO RETORNOU SEM NOVIDADES',
  'RADIACOES ELETROMAGNETICAS DETECTADAS NA REDE',
  'RESTABELECER ENLACE DE DADOS COM ESCALAO SUPERIOR',
  'APOIAR PROGRESSAO DO PRIMEIRO PELOTAO COM FOGO',
  'CAMINHOES DE MUNICAO CHEGANDO NA LINHA DE CONTATO',
  'TRANSMISSAO SEGURA CONCLUIDA COM SUCESSO',
  'BLOQUEIO ELETRONICO HOSTIL NA REGIAO DO COMBATE',
  'CENTRAL SB22 OPERANDO COM DEZ RAMAIS DE CAMPANHA',
  'ALERTA MAXIMO CONTRA DRONES E RECONHECIMENTO INIMIGO',
  'ESTRUTURAR PONTO FORTE NA COLINA QUINHENTOS E DEZ',
  'VERIFICAR MUNICAO DISPONIVEL NOS CARREGADORES DO FAL',
  'SELECAO DE FREQUENCIA CONFORME TABELA DIARIA',
  'RESPEITAR PROCEDIMENTO DE AUTENTICACAO REGULAMENTAR',
  'COMANDO DA BRIGADA AUTORIZOU AVANCO OPERACIONAL',
  'INFILTRACAO NOTURNA CONCLUIDA SEM DETECCAO',
  'PONTO DE CONTROLE ESTABELECIDO NO MAPA MILITAR',
  'ALVO LOCALIZADO NAS COORDENADAS DA CARTA TOPOGRAFICA',
  'DESLOCAMENTO MOTORIZADO INICIADO AO CREPUSCULO',
  'VERIFICAR TRAVAMENTO E ALIMENTACAO DA PISTOLA',
  'GARANTIR SIGILO TOTAL SOBRE A OPERACAO TÁTICA',
  'LIGACAO COM A BRIGADA ESTABELECIDA VIA SATELITE',
  'VIGILANCIA PERMANENTE NO POSTO DE BLOQUEIO',
  'TROPA DA GUARDA RENDIDA CONFORME O HORARIO',
  'CABO WD1 ROMPIDO POR ESTILHACOS NA COTA DUZENTOS',
  'OPERADOR DE RADIO EMITIR SINAL DE RECONHECIMENTO',
  'TRANSMISSOR VHF OPERANDO EM POTENCIA MINIMA TÁTICA',
  'DISCIPLINAR TRAFEGO NA PISTA DE FONIA REGULAMENTAR',
  'MANTENHAM VIGILANCIA EM TREZENTOS E SESSENTA GRAUS',
  'EMPREGAR ANTENA DIPOLO HORIZONTAL PARA ONDA NVIS',
  'BATERIA DE MORTEIRO PRONTA PARA TIRO DE EFICACIA',
];

const PROCEDURAL_FRACTIONS = [
  'PRIMEIRO PELOTAO',
  'SEGUNDO PELOTAO',
  'GRUPO DE COMBATE',
  'POSTO DE COMANDO',
  'PATRULHA DE RECON',
  'TURMA DE FIO',
  'ESQUADRAO BRAVO',
  'BATERIA DE MORTEIRO',
  'POSTO DE ESCUTA',
  'CENTRAL SB22',
  'TROPA DE GUARDA',
  'OBSERVADOR ALFA',
];

const PROCEDURAL_ACTIONS = [
  'AVANCAR PARA',
  'OCUPAR POSICAO NA',
  'RECUAR PARA',
  'MANTER VIGILANCIA NA',
  'ESTABELECER LIGACAO COM',
  'BLOQUEAR ACESSO A',
  'PROGREDIR ATE',
  'INSTALAR POSTO NA',
  'MONITORAR SETOR DE',
  'CONQUISTAR COTA NA',
];

const PROCEDURAL_LOCATIONS = [
  'COTA CEM',
  'LINHA ALFA',
  'CRISTA DA SERRA',
  'CABECA DE PONTE',
  'ESTRADA REAL',
  'COLINA SUL',
  'LINHA CHARLIE',
  'ZONA DELTA',
  'CURVA DO RIO',
  'BIFURCACAO NORTE',
  'MURALHA DE PEDRA',
  'REGIAO BRAVO',
];

/**
 * Gera uma mensagem militar única, variada e doutrinariamente autêntica,
 * garantindo infinita variedade para o operador treinar sem repetições.
 */
export function generateDiverseMilitaryMessage(): string {
  // 60% de chance de vir do banco pré-selecionado de 65 frases militares autênticas
  // 40% de chance de ser gerada proceduralmente combinando fração, ação e local
  if (Math.random() > 0.4) {
    return MILITARY_MESSAGES[Math.floor(Math.random() * MILITARY_MESSAGES.length)];
  }

  const frac = PROCEDURAL_FRACTIONS[Math.floor(Math.random() * PROCEDURAL_FRACTIONS.length)];
  const act = PROCEDURAL_ACTIONS[Math.floor(Math.random() * PROCEDURAL_ACTIONS.length)];
  const loc = PROCEDURAL_LOCATIONS[Math.floor(Math.random() * PROCEDURAL_LOCATIONS.length)];

  return `${frac} ${act} ${loc}`;
}

export const CRYPTO_KEYS = [
  'RONDON',
  'PELOTAO',
  'COMANDO',
  'DEFESA',
  'BRAVURA',
  'LANCADOR',
  'VICTORIA',
  'SENTINELA',
  'PATRONO',
  'EXERCITO',
  'BLINDADO',
  'INFANTE',
  'CAXIAS',
  'BRASIL',
  'GUERREIRO',
  'SELVA',
  'VANGUARDA',
  'ESQUADRAO',
  'BATALHAO',
  'REGIMENTO',
  'FRONTEIRA',
  'PANTANAL',
  'AMAZONIA',
  'COMBATENTE',
  'ESTRATEGIA',
  'OPERACAO',
  'PACIFICADOR',
  'GUARARAPES',
  'ARTILHARIA',
  'CAVALARIA',
  'ENGENHARIA',
];

const DEAD_LETTERS = ['X', 'Z', 'K'];

/**
 * Regra de extração e posicionamento dos elementos do Indicador de Processo no ADV.
 * A regra não é fixa: varia conforme cada documento operacional / IECom / radiograma militar,
 * especificando a posição exata de cada letra dentro das palavras (grupos de 5) do criptograma.
 * Exemplo: "1ª letra da 3ª palavra e 4ª letra da 2ª palavra".
 */
export interface DynamicAdvRuleResult {
  label: string;
  code: string;
  elt1: string;
  elt2: string;
  pos1: AdvPositionRule;
  pos2: AdvPositionRule;
  desc1: string;
  desc2: string;
}

export function generateDynamicAdvRule(
  arg1?: number | string[],
  arg2?: string | string[]
): DynamicAdvRuleResult {
  const totalGroups = typeof arg1 === 'number' ? arg1 : 10;
  const ADV_CODES = [
    'SO', 'IN', 'AO', 'RD', 'CP', 'EB', 'TG', 'AL', 'BR', 'OM',
    'CO', 'PL', 'FT', 'TR', 'OP', 'ST', 'MS', 'DC', 'PR', 'CM',
  ];
  const code =
    typeof arg2 === 'string' && arg2.length === 2
      ? arg2.toUpperCase()
      : ADV_CODES[Math.floor(Math.random() * ADV_CODES.length)];

  // Sorteia duas posições distintas dentro dos grupos de 5 letras (palavras da transmissão)
  const maxWord = Math.min(totalGroups, 6);
  let w1 = 1 + Math.floor(Math.random() * maxWord);
  let p1 = 1 + Math.floor(Math.random() * 5);

  let w2 = 1 + Math.floor(Math.random() * maxWord);
  let p2 = 1 + Math.floor(Math.random() * 5);

  while (w2 === w1 && p2 === p1) {
    w2 = 1 + Math.floor(Math.random() * maxWord);
    p2 = 1 + Math.floor(Math.random() * 5);
  }

  // Ordena estritamente por ordem cronológica de transmissão (w1 <= w2 e p1 < p2 se w1 == w2)
  // Isso garante que o 1º autenticador (code[0]) apareça sempre antes do 2º (code[1]) no texto
  let idx1 = (w1 - 1) * 5 + (p1 - 1);
  let idx2 = (w2 - 1) * 5 + (p2 - 1);

  if (idx1 > idx2) {
    const tmpW = w1; w1 = w2; w2 = tmpW;
    const tmpP = p1; p1 = p2; p2 = tmpP;
    const tmpIdx = idx1; idx1 = idx2; idx2 = tmpIdx;
  }

  const wordLabel1 = `${w1}ª palavra`;
  const wordLabel2 = `${w2}ª palavra`;
  const letterLabel1 = `${p1}ª letra`;
  const letterLabel2 = `${p2}ª letra`;

  const label = `${letterLabel1} da ${wordLabel1} e ${letterLabel2} da ${wordLabel2}`;

  return {
    label,
    code,
    elt1: code[0],
    elt2: code[1],
    pos1: {
      wordNum: w1,
      letterPos: p1,
      wordLabel: wordLabel1,
      letterLabel: letterLabel1,
      absoluteIdx: idx1,
    },
    pos2: {
      wordNum: w2,
      letterPos: p2,
      wordLabel: wordLabel2,
      letterLabel: letterLabel2,
      absoluteIdx: idx2,
    },
    desc1: `${letterLabel1} da ${wordLabel1} (${w1}º grupo de 5): '${code[0]}'`,
    desc2: `${letterLabel2} da ${wordLabel2} (${w2}º grupo de 5): '${code[1]}'`,
  };
}

/**
 * Insere os 2 autenticadores do processo nas posições prescritas pela questão,
 * intercalando com as letras resultantes da matriz de transposição.
 */
export function insertAuthenticatorsIntoGroups(
  matrixCipher: string,
  advCode: string,
  absIdx1: number,
  absIdx2: number,
  totalLen: number = 50
): string {
  const minIdx = Math.min(absIdx1, absIdx2);
  const maxIdx = Math.max(absIdx1, absIdx2);

  const chars = new Array<string>(totalLen);
  chars[minIdx] = advCode[0];
  chars[maxIdx] = advCode[1];

  let matrixIdx = 0;
  for (let i = 0; i < totalLen; i++) {
    if (i !== minIdx && i !== maxIdx) {
      chars[i] = matrixCipher[matrixIdx++];
    }
  }

  return chars.join('');
}

/**
 * Extrai os 2 autenticadores das posições prescritas e recupera as letras da matriz.
 */
export function extractAuthenticatorsAndMatrixCipher(
  fullTransmission: string,
  absIdx1: number,
  absIdx2: number
): { matrixCipher: string; extractedCode: string } {
  const clean = fullTransmission.toUpperCase().replace(/[^A-Z]/g, '');
  const minIdx = Math.min(absIdx1, absIdx2);
  const maxIdx = Math.max(absIdx1, absIdx2);

  const elt1 = clean[minIdx] || '';
  const elt2 = clean[maxIdx] || '';
  const extractedCode = `${elt1}${elt2}`;

  const remaining: string[] = [];
  for (let i = 0; i < clean.length; i++) {
    if (i !== minIdx && i !== maxIdx) {
      remaining.push(clean[i]);
    }
  }

  return {
    matrixCipher: remaining.join(''),
    extractedCode,
  };
}

/**
 * Gera uma missão individual de criptografia ou descriptografia.
 */
export function generateCryptoMission(forcedType?: 'criptografar' | 'descriptografar'): CryptoMission {
  const taskType = forcedType || (Math.random() > 0.5 ? 'criptografar' : 'descriptografar');
  const rawMsg = generateDiverseMilitaryMessage();
  const cleanWords = rawMsg
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const clearRaw = cleanWords.join(' ');
  const keyDisplayMode: 'word' | 'order' = Math.random() > 0.5 ? 'word' : 'order';
  const deadLetter = DEAD_LETTERS[Math.floor(Math.random() * DEAD_LETTERS.length)];
  // Doutrina EB: Todas as missões utilizam obrigatoriamente Bisseção ou Inserção (nunca direto)
  const prepMethods: PreparationMethod[] = ['bissecao', 'insercao'];
  const prepMethod = prepMethods[Math.floor(Math.random() * prepMethods.length)];
  const keyType: KeyType = Math.random() > 0.5 ? 'dupla' : 'simples';

  // 1. Preparo da mensagem (palavras íntegras, sem X aleatórios dentro das palavras)
  const prepResult = prepareMessageText(cleanWords, prepMethod, deadLetter);
  const prepared = prepResult.prepared;
  const prepLog = prepResult.log;

  // Calcula o targetLength T = 5k - 2
  const L = prepared.length;
  const deadLettersAddedTarget = (3 - (L % 5) + 5) % 5;
  const neededTargetLen = L + deadLettersAddedTarget;

  const PAIRS_CHAVE_DUPLA = [
    { h: 'PATRONO', v: 'PELOTAO' }, // 7 x 7 = 49
    { h: 'COMANDO', v: 'PATRONO' }, // 7 x 7 = 49
    { h: 'LANCADOR', v: 'PELOTAO' }, // 8 x 7 = 56
    { h: 'PELOTAO', v: 'COMANDO' }, // 7 x 7 = 49
    { h: 'EXERCITO', v: 'PATRONO' }, // 8 x 7 = 56
    { h: 'SENTINELA', v: 'RONDON' }, // 9 x 6 = 54
    { h: 'BRAVURA', v: 'DEFESA' }, // 7 x 6 = 42
    { h: 'PATRONO', v: 'DEFESA' }, // 7 x 6 = 42
    { h: 'BLINDADO', v: 'INFANTE' }, // 8 x 7 = 56
    { h: 'GUERREIRO', v: 'RONDON' }, // 9 x 6 = 54
    { h: 'ESQUADRAO', v: 'BATALHAO' }, // 9 x 8 = 72
    { h: 'VANGUARDA', v: 'CAXIAS' }, // 9 x 6 = 54
    { h: 'ESTRATEGIA', v: 'DEFESA' }, // 10 x 6 = 60
    { h: 'PACIFICADOR', v: 'PELOTAO' }, // 11 x 7 = 77
    { h: 'ARTILHARIA', v: 'PATRONO' }, // 10 x 7 = 70
    { h: 'CAVALARIA', v: 'BRAVURA' }, // 9 x 7 = 63
    { h: 'ENGENHARIA', v: 'COMANDO' }, // 10 x 7 = 70
    { h: 'SENTINELA', v: 'DEFESA' }, // 9 x 6 = 54
    { h: 'FRONTEIRA', v: 'RONDON' }, // 9 x 6 = 54
    { h: 'PANTANAL', v: 'PELOTAO' }, // 8 x 7 = 56
    { h: 'AMAZONIA', v: 'BRAVURA' }, // 8 x 7 = 56
    { h: 'RECONHECIMENTO', v: 'BATALHAO' }, // 14 x 8 = 112
    { h: 'ESTRATEGISTA', v: 'COMUNICACAO' }, // 12 x 11 = 132
    { h: 'PATRULHAMENTO', v: 'OPERACIONAL' }, // 13 x 11 = 143
    { h: 'INTERCEPTACAO', v: 'ESTRATEGIA' }, // 13 x 10 = 130
    { h: 'COMUNICACOES', v: 'TRANSCEIVER' }, // 12 x 11 = 132
  ];

  let key1 = 'PATRONO';
  let key1Order: number[] = [];
  let key2: string | undefined = undefined;
  let key2Order: number[] | undefined = undefined;

  let finalCipher = '';
  let cipherVariantB: string | undefined = undefined;
  let t2Grid: string[][] = [];
  let t2Cols = 0;
  let t2Rows = 0;
  let totalDeadLetters = 0;
  let targetLen = 0;
  let lastRowCols = 0;
  let unfilled = 0;
  let paddedPrep = '';

  if (keyType === 'dupla') {
    let validPairs = PAIRS_CHAVE_DUPLA.filter((p) => p.h.length * p.v.length >= neededTargetLen);
    if (validPairs.length === 0) {
      const sortedByCap = [...PAIRS_CHAVE_DUPLA].sort((a, b) => b.h.length * b.v.length - a.h.length * a.v.length);
      validPairs = [sortedByCap[0]];
    }
    const chosenPair = validPairs[Math.floor(Math.random() * validPairs.length)];
    key1 = chosenPair.h;
    key2 = chosenPair.v;
    key1Order = deriveKeyOrder(key1);
    key2Order = deriveKeyOrder(key2);

    const doubleRes = executeDoubleKeyTransposition(prepared, key1, key2, deadLetter);
    finalCipher = doubleRes.cipherContinuous;
    cipherVariantB = doubleRes.cipherVariantB;
    t2Grid = doubleRes.grid;
    t2Cols = doubleRes.cols;
    t2Rows = doubleRes.rows;
    totalDeadLetters = doubleRes.deadLettersAdded;
    targetLen = doubleRes.targetLength;
    lastRowCols = doubleRes.lastRowFilledCols;
    unfilled = doubleRes.unfilledCells;
    paddedPrep = doubleRes.paddedPrepared;
  } else {
    key1 = CRYPTO_KEYS[Math.floor(Math.random() * CRYPTO_KEYS.length)];
    key1Order = deriveKeyOrder(key1);
    const singleRes = executeColumnarTransposition(prepared, key1, deadLetter);
    finalCipher = singleRes.cipherContinuous;
    t2Grid = singleRes.grid;
    t2Cols = singleRes.cols;
    t2Rows = singleRes.rows;
    totalDeadLetters = singleRes.deadLettersAdded;
    targetLen = singleRes.targetLength;
    lastRowCols = singleRes.lastRowFilledCols;
    unfilled = singleRes.unfilledCells;
    paddedPrep = singleRes.paddedPrepared;
  }

  // 4. Inclusão dos 2 autenticadores do processo NAS POSIÇÕES EXATAS prescritas pela regra
  const totalTransmittedLen = targetLen + 2;
  const totalGroups = totalTransmittedLen / 5;

  const dynamicAdv = generateDynamicAdvRule(totalGroups);
  const advCode = dynamicAdv.code;
  const advRuleLabel = dynamicAdv.label;

  const cipherWithAuth = insertAuthenticatorsIntoGroups(
    finalCipher,
    advCode,
    dynamicAdv.pos1.absoluteIdx,
    dynamicAdv.pos2.absoluteIdx,
    totalTransmittedLen
  );
  const cipherTextGrouped = formatInMilitaryGroups(cipherWithAuth);

  let cipherVariantBWithAuth: string | undefined = undefined;
  if (cipherVariantB) {
    cipherVariantBWithAuth = insertAuthenticatorsIntoGroups(
      cipherVariantB,
      advCode,
      dynamicAdv.pos1.absoluteIdx,
      dynamicAdv.pos2.absoluteIdx,
      totalTransmittedLen
    );
  }

  // Montagem do Radiograma Militar Oficial
  const gdhHour = String(Math.floor(10 + Math.random() * 12)).padStart(2, '0');
  const gdhMin = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const radiogram: RadiogramHeader = {
    precedence: 'OPERACIONAL (O)',
    gdh: `23${gdhHour}${gdhMin}P OUT 26`,
    from: 'C21 (13º PEL COM)',
    to: 'C10 (POSTO DE COMANDO)',
    adv: advCode,
  };

  const deadLetterText =
    totalDeadLetters > 0
      ? `A mensagem preparada tem ${prepared.length} letras. Pela doutrina militar de transmissões do EB, o criptograma na matriz nunca fecha múltiplo de 5 redondo, pois devem sobrar exatamente 2 espaços para os autenticadores do processo. Por isso, a matriz foi completada até ${targetLen} letras (5k - 2, onde ${targetLen} + 2 = ${targetLen + 2}), inserindo ${totalDeadLetters} letra(s) morta(s) "${deadLetter}" ao final.`
      : `A mensagem preparada tem ${prepared.length} letras, que já atinge exatamente ${targetLen} posições (5k - 2, onde ${targetLen} + 2 = ${targetLen + 2}), sobrando os 2 espaços para os autenticadores sem necessidade de letras mortas adicionais.`;

  const matrixLayoutText =
    unfilled > 0
      ? `O quadro sob a chave possui dimensão de ${t2Rows} linhas × ${t2Cols} colunas (${t2Rows * t2Cols} casas). Preenchem-se estritamente ${targetLen} casas (a última linha recebe apenas ${lastRowCols} letras, deixando propositalmente ${unfilled} casa(s) vazia(s) no quadro, já que não se pode completar todas as colunas para manter a sobra dos 2 espaços dos autenticadores).`
      : `O quadro sob a chave possui dimensão de ${t2Rows} linhas × ${t2Cols} colunas (${t2Rows * t2Cols} casas), totalmente preenchido.`;

  const encryptionExplanation =
    keyType === 'dupla' && key2 && key2Order
      ? [
          `1. Indicador de Processo (ADV): Código "${advCode}" regulamentar de 2 letras. Regra de Posicionamento no Criptograma: ${advRuleLabel}.`,
          `2. Posições Prescritas na Transmissão: A letra "${advCode[0]}" fica na ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel}; a letra "${advCode[1]}" fica na ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel} (não ficam no final, mas sim rigorosamente nessas posições).`,
          `3. Método de Preparo Utilizado: ${prepMethod.toUpperCase()} (${prepLog}). Palavras mantidas íntegras, sem letras X entre elas.`,
          `4. Chave Dupla (Matriz de Coordenadas Cruzadas Horizontal "${key1}" × Vertical "${key2}"):`,
          `   - Chave 1 (Horizontal - Colunas): "${key1}" (Ordem numérica: ${key1Order.join(' - ')}).`,
          `   - Chave 2 (Vertical - Linhas): "${key2}" (Ordem numérica: ${key2Order.join(' - ')}).`,
          `5. Regra de Sobra de 2 Espaços (5k - 2) e Letras Mortas: "${deadLetter}". ${deadLetterText}`,
          `6. Inscrição na Matriz por Coordenadas Cruzadas:`,
          `   - Começa na horizontal do número 1 e cruza com a vertical do número 1 (H=1, V=1) para a 1ª letra.`,
          `   - Continuando no número 1 da horizontal, avança para a vertical número 2 (H=1, V=2), 3 (H=1, V=3)...`,
          `   - Terminadas as linhas da coluna de ordem 1, avança para o número 2 da horizontal com a vertical 1, 2, 3... e assim por diante. ${matrixLayoutText}`,
          `7. Leitura Criptográfica da Matriz: A leitura do criptograma da matriz é realizada linha a linha horizontalmente (L1, L2, L3...), da esquerda para a direita.`,
          `8. Disposição Final nos Grupos de 5: As ${targetLen} letras da matriz são dispostas nos grupos de 5 letras, reservando EXATAMENTE a ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel} para "${advCode[0]}" e a ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel} para "${advCode[1]}". Criptograma oficial transmitido: "${cipherTextGrouped}".`,
        ]
      : [
          `1. Indicador de Processo (ADV): Código "${advCode}" regulamentar de 2 letras. Regra de Posicionamento no Criptograma: ${advRuleLabel}.`,
          `2. Posições Prescritas na Transmissão: A letra "${advCode[0]}" fica na ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel}; a letra "${advCode[1]}" fica na ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel} (não ficam no final, mas sim rigorosamente nessas posições).`,
          `3. Método de Preparo Utilizado: ${prepMethod.toUpperCase()} (${prepLog}). Palavras mantidas íntegras, sem letras X entre elas.`,
          `4. Chave Criptográfica 1: "${key1}" (ordem numérica das colunas: ${key1Order.join(' - ')}).`,
          `5. Letra Morta Convencionada e Regra de Sobra de 2 Espaços: "${deadLetter}". ${deadLetterText}`,
          `6. Inscrição na Matriz na Ordem Numérica das Colunas: As letras do texto preparado são inseridas nas colunas na ordem numérica (1, 2, 3...). A coluna de número 1 recebe a primeira sequência de letras (de cima para baixo); a coluna de número 2 recebe a próxima sequência, e assim sucessivamente. ${matrixLayoutText}`,
          `7. Leitura Criptográfica da Matriz: O criptograma é colhido linha por linha horizontalmente (L1, L2, L3...), da esquerda para a direita, gerando as ${targetLen} letras da matriz.`,
          `8. Disposição Final nos Grupos de 5: As ${targetLen} letras da matriz são dispostas nos grupos de 5 letras, reservando EXATAMENTE a ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel} para "${advCode[0]}" e a ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel} para "${advCode[1]}". Criptograma oficial transmitido: "${cipherTextGrouped}".`,
        ];

  const decryptionExplanation =
    keyType === 'dupla' && key2 && key2Order
      ? [
          `1. Indicativo de Processo no ADV: Código "${advCode}" (2 letras). Regra de Posicionamento/Extração: ${advRuleLabel}.`,
          `2. Extração dos Autenticadores na Transmissão: Retira-se a 1ª letra "${advCode[0]}" da ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel} e a 2ª letra "${advCode[1]}" da ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel}. Isolam-se as ${targetLen} letras originárias da matriz de transposição.`,
          `3. Montagem da Matriz de Decifração sob a Chave Dupla (Horizontal "${key1}" × Vertical "${key2}"):`,
          `   - O criptograma da matriz é inscrito linha por linha (L1, L2, L3...) no quadro.`,
          `   - A leitura da mensagem decifrada é feita seguindo a combinação cruzada das coordenadas:`,
          `   - Começa no Horizontal 1 com Vertical 1 (H=1, V=1) para colher a 1ª letra da mensagem.`,
          `   - Continuando no Horizontal 1, avança para Vertical 2 (H=1, V=2), 3 (H=1, V=3)...`,
          `   - Depois Horizontal 2 com Vertical 1, 2, 3... reconstituindo todo o texto preparado com padding (${targetLen} letras): "${paddedPrep}".`,
          `4. Descarte de Letras Mortas de Padding: Descartam-se as ${totalDeadLetters} letra(s) morta(s) "${deadLetter}" do final (adicionadas para a regra de sobra de 2 espaços / 5k - 2), recuperando o texto preparado original (${prepared.length} letras): "${prepared}".`,
          `5. Reversão do Método de Preparo (${prepMethod.toUpperCase()}): ${
            prepMethod === 'bissecao'
              ? `Localiza-se a sequência de 5 letras iguais de identificação ("${prepResult.bisectionMarker}"). O trecho anterior é o Bloco 2 ("${prepResult.part2}") e o trecho posterior é o Bloco 1 ("${prepResult.part1}"). Invertendo as posições (Bloco 1 + Bloco 2), reconstitui-se o texto contínuo: "${prepResult.continuousClean}". Não há nenhuma letra X entre as palavras.`
              : prepMethod === 'insercao'
              ? `Localizam-se as duas letras iguais do início ("${deadLetter.repeat(2)}") e do final ("${deadLetter.repeat(2)}"). Eliminam-se a palavra nula inicial ("${prepResult.decoyStart}") e a final ("${prepResult.decoyEnd}") com seus marcadores duplos. O miolo limpo isolado é: "${prepResult.continuousClean}". Não há nenhuma letra X entre as palavras.`
              : `Preparo direto: o texto já é contínuo sem alterações ("${prepResult.continuousClean}").`
          }`,
          `6. Mensagem em Claro Decifrada Final: "${clearRaw}".`,
        ]
      : [
          `1. Indicativo de Processo no ADV: Código "${advCode}" (2 letras). Regra de Posicionamento/Extração: ${advRuleLabel}.`,
          `2. Extração dos Autenticadores na Transmissão: Retira-se a 1ª letra "${advCode[0]}" da ${dynamicAdv.pos1.letterLabel} da ${dynamicAdv.pos1.wordLabel} e a 2ª letra "${advCode[1]}" da ${dynamicAdv.pos2.letterLabel} da ${dynamicAdv.pos2.wordLabel}. Isolam-se as ${targetLen} letras originárias da matriz de transposição.`,
          `3. Montagem da Matriz de Decifração sob a Chave "${key1}": As ${targetLen} letras são inscritas linha por linha no quadro (L1, L2, L3...).`,
          `4. Leitura do Texto Decifrado nas Colunas em Ordem Numérica: Lê-se coluna por coluna na ordem numérica da chave (1, 2, 3...) de cima para baixo, recuperando o texto preparado com padding (${targetLen} letras): "${paddedPrep}".`,
          `5. Descarte de Letras Mortas de Padding: Descartam-se as ${totalDeadLetters} letra(s) morta(s) "${deadLetter}" do final (adicionadas para a regra de sobra de 2 espaços / 5k - 2), recuperando o texto preparado original (${prepared.length} letras): "${prepared}".`,
          `6. Reversão do Método de Preparo (${prepMethod.toUpperCase()}): ${
            prepMethod === 'bissecao'
              ? `Localiza-se a sequência de 5 letras iguais de identificação ("${prepResult.bisectionMarker}"). O trecho anterior é o Bloco 2 ("${prepResult.part2}") e o trecho posterior é o Bloco 1 ("${prepResult.part1}"). Invertendo as posições (Bloco 1 + Bloco 2), reconstitui-se o texto contínuo: "${prepResult.continuousClean}". Não há nenhuma letra X entre as palavras.`
              : prepMethod === 'insercao'
              ? `Localizam-se as duas letras iguais do início ("${deadLetter.repeat(2)}") e do final ("${deadLetter.repeat(2)}"). Eliminam-se a palavra nula inicial ("${prepResult.decoyStart}") e a final ("${prepResult.decoyEnd}") com seus marcadores duplos. O miolo limpo isolado é: "${prepResult.continuousClean}". Não há nenhuma letra X entre as palavras.`
              : `Preparo direto: o texto já é contínuo sem alterações ("${prepResult.continuousClean}").`
          }`,
          `7. Mensagem em Claro Decifrada Final: "${clearRaw}".`,
        ];

  const stepByStepExplanation = taskType === 'criptografar' ? encryptionExplanation : decryptionExplanation;

  return {
    id: `crypto-miss-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    taskType,
    title: taskType === 'criptografar' ? 'Missão de Cifragem Militar' : 'Missão de Decifração Militar',
    scenario:
      taskType === 'criptografar'
        ? `O Oficial de Comunicações do 13º Pel Com expediu a mensagem abaixo. Aplique os procedimentos regulamentares sob a chave prescrita respeitando a sobra de 2 espaços e disponha os autenticadores exatamente na ${advRuleLabel}.`
        : `A estação rádio interceptou o radiograma cifrado abaixo. Com base na chave e no indicativo de processo do ADV (${advRuleLabel}), extraia as 2 letras do autenticador, monte a matriz de decifração, recupere o texto e desfaça o preparo para obter a mensagem original em claro.`,
    processIndicator: advCode,
    advRule: advRuleLabel,
    advCode,
    advPos1: dynamicAdv.pos1,
    advPos2: dynamicAdv.pos2,
    radiogram,
    prepMethod,
    keyType,
    keyDisplayMode,
    key1,
    key1Order,
    key2,
    key2Order,
    horizontalKey: key1,
    horizontalKeyOrder: key1Order,
    verticalKey: key2,
    verticalKeyOrder: key2Order,
    deadLetter,
    deadLettersAdded: totalDeadLetters,
    clearText: clearRaw,
    originalWords: cleanWords,
    preparedText: paddedPrep,
    unpaddedPreparedText: prepared,
    continuousClean: prepResult.continuousClean,
    decoyStart: prepResult.decoyStart,
    decoyEnd: prepResult.decoyEnd,
    bisectionMarker: prepResult.bisectionMarker,
    bisectionPart1: prepResult.part1,
    bisectionPart2: prepResult.part2,
    cipherText: finalCipher,
    cipherWithAuth,
    cipherVariantB,
    cipherVariantBWithAuth,
    cipherTextGrouped,
    matrixCols: t2Cols,
    matrixRows: t2Rows,
    matrixGrid: t2Grid,
    lastRowFilledCols: lastRowCols,
    unfilledCells: unfilled,
    targetLength: targetLen,
    stepByStepExplanation,
  };
}

// -------------------------------------------------------------
// SISTEMAS DE AUTENTICAÇÃO DO 13º PEL COM (PÁGINAS 1 A 44)
// -------------------------------------------------------------

// Matriz oficial do Alfabeto Retangular (Slide 31)
export const RECTANGULAR_AUTH_GRID = [
  [
    { letters: ['B', 'Y'], value: 3 },
    { letters: ['R', 'A'], value: 7 },
    { letters: ['V', 'U'], value: 5 },
    { letters: ['O'], value: 8 },
    { letters: ['S'], value: 2 },
  ],
  [
    { letters: ['C'], value: 9 },
    { letters: ['D'], value: 1 },
    { letters: ['E'], value: 6 },
    { letters: ['F'], value: 4 },
    { letters: ['G'], value: 8 },
  ],
  [
    { letters: ['H'], value: 2 },
    { letters: ['I'], value: 7 },
    { letters: ['J'], value: 3 },
    { letters: ['L'], value: 9 },
    { letters: ['M'], value: 5 },
  ],
  [
    { letters: ['N'], value: 4 },
    { letters: ['P'], value: 6 },
    { letters: ['Q'], value: 1 },
    { letters: ['T'], value: 8 },
    { letters: ['X'], value: 2 },
  ],
  [
    { letters: ['Z'], value: 9 },
    { letters: ['K'], value: 3 },
    { letters: ['W'], value: 7 },
    { letters: ['A'], value: 4 },
    { letters: ['U'], value: 5 },
  ],
];

// Alfabeto do Sistema de Um Alfabeto (Slide 18)
export const ONE_ALPHABET_SYSTEM = {
  keyword: 'RONDON',
  alphabet: [
    'R', 'O', 'N', 'D', 'A', 'B', 'C', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M',
    'P', 'Q', 'S', 'T', 'U', 'V', 'X', 'Z', 'K', 'W', 'Y',
  ],
  values: [
    6, 4, 2, 1, 3, 5, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8,
  ],
};

// Alfabetos do Sistema de Dois Alfabetos (Slide 22)
export const TWO_ALPHABETS_SYSTEM = {
  alphabet1: [
    { char: 'A', value: 9 },
    { char: 'B', value: 7 },
    { char: 'C', value: 4 },
    { char: 'D', value: 5 },
    { char: 'E', value: 1 },
    { char: 'F', value: 2 },
    { char: 'G', value: 8 },
    { char: 'H', value: 4 },
    { char: 'I', value: 6 },
    { char: 'J', value: 2 },
    { char: 'K', value: 6 },
    { char: 'L', value: 8 },
    { char: 'M', value: 1 },
    { char: 'N', value: 3 },
    { char: 'O', value: 1 },
    { char: 'P', value: 4 },
    { char: 'Q', value: 5 },
    { char: 'R', value: 6 },
    { char: 'S', value: 7 },
    { char: 'T', value: 5 },
    { char: 'U', value: 7 },
    { char: 'V', value: 2 },
    { char: 'W', value: 9 },
    { char: 'X', value: 3 },
    { char: 'Y', value: 3 },
    { char: 'Z', value: 8 },
  ],
  alphabet2: [
    { num: 1, char: 'U' },
    { num: 2, char: 'S' },
    { num: 3, char: 'Z' },
    { num: 4, char: 'O' },
    { num: 5, char: 'A' },
    { num: 6, char: 'V' },
    { num: 7, char: 'W' },
    { num: 8, char: 'N' },
    { num: 9, char: 'H' },
    { num: 10, char: 'C' },
    { num: 11, char: 'T' },
    { num: 12, char: 'Y' },
    { num: 13, char: 'Q' },
    { num: 14, char: 'K' },
    { num: 15, char: 'E' },
    { num: 16, char: 'R' },
    { num: 17, char: 'X' },
    { num: 18, char: 'P' },
  ],
};

/**
 * Gera uma missão prática de autenticação fiel às páginas 1 a 44 do PDF.
 */
export function generateAuthMission(): AuthMission {
  const systems: Array<'um_alfabeto' | 'dois_alfabetos' | 'alfabeto_retangular'> = [
    'um_alfabeto',
    'dois_alfabetos',
    'alfabeto_retangular',
  ];
  const system = systems[Math.floor(Math.random() * systems.length)];

  const rawMsg = MILITARY_MESSAGES[Math.floor(Math.random() * MILITARY_MESSAGES.length)];
  const dynamicAdv = generateDynamicAdvRule();

  const gdhHour = String(Math.floor(10 + Math.random() * 12)).padStart(2, '0');
  const gdhMin = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const radiogram: RadiogramHeader = {
    precedence: 'OPERACIONAL (O)',
    gdh: `23${gdhHour}${gdhMin}P OUT 26`,
    from: 'C21 (13º PEL COM)',
    to: 'C10 (POSTO DE COMANDO)',
    adv: dynamicAdv.code,
  };

  if (system === 'alfabeto_retangular') {
    const r1 = Math.floor(Math.random() * 5);
    let r2 = Math.floor(Math.random() * 5);
    while (r2 === r1) r2 = Math.floor(Math.random() * 5);

    const c1 = Math.floor(Math.random() * 5);
    let c2 = Math.floor(Math.random() * 5);
    while (c2 === c1) c2 = Math.floor(Math.random() * 5);

    const cellDiag1A = RECTANGULAR_AUTH_GRID[r1][c1];
    const cellDiag1B = RECTANGULAR_AUTH_GRID[r2][c2];

    const test1 = cellDiag1A.letters[0];
    const test2 = cellDiag1B.letters[0];

    // Extremidades da outra diagonal: (r1, c2) e (r2, c1)
    const otherCorner1 = RECTANGULAR_AUTH_GRID[r1][c2];
    const otherCorner2 = RECTANGULAR_AUTH_GRID[r2][c1];

    const sumVal = otherCorner1.value + otherCorner2.value;
    const expectedResult = sumVal < 10 ? `0${sumVal}` : `${sumVal}`;
    const announcedCallout = `ZNB ${expectedResult}`;

    return {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      system: 'alfabeto_retangular',
      title: 'Sistema do Alfabeto Retangular (Slide 31 a 44)',
      dayOfWeek: 'TERÇA-FEIRA (IECom Elt)',
      rawMessage: rawMsg,
      radiogram,
      advRule: dynamicAdv.label,
      testElement1: test1,
      testElement2: test2,
      ruleExplanation: `No Sistema do Alfabeto Retangular (retângulo de 25 casas), os dois elementos-teste (${test1} e ${test2}) formam as extremidades de uma diagonal. O autenticador é um número de dois algarismos igual à soma dos valores das letras nas outras duas extremidades da diagonal.`,
      expectedResult,
      announcedCallout,
      calculationDetails: [
        `1. Elementos-teste localizados no retângulo: "${test1}" (Linha ${r1 + 1}, Coluna ${c1 + 1}) e "${test2}" (Linha ${r2 + 1}, Coluna ${c2 + 1}).`,
        `2. As outras duas extremidades da diagonal imaginária são: "${otherCorner1.letters.join('/')}" (valor ${otherCorner1.value}) e "${otherCorner2.letters.join('/')}" (valor ${otherCorner2.value}).`,
        `3. Soma das extremidades: ${otherCorner1.value} + ${otherCorner2.value} = ${expectedResult}.`,
        `4. Autenticador gerado: ${expectedResult} (anunciado no procedimento fonia como "${announcedCallout}").`,
        `OBSERVAÇÃO DOUTRINÁRIA (Slide 42): O Sistema de Alfabeto Retangular é o ÚNICO método cujo resultado final é um NÚMERO.`,
      ],
    };
  }

  if (system === 'dois_alfabetos') {
    let test1 = 'S';
    let test2 = 'O';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    let val1 = 0;
    let val2 = 0;
    let sum = 0;

    for (let attempts = 0; attempts < 100; attempts++) {
      test1 = letters[Math.floor(Math.random() * letters.length)];
      test2 = letters[Math.floor(Math.random() * letters.length)];
      val1 = TWO_ALPHABETS_SYSTEM.alphabet1.find((item) => item.char === test1)?.value || 1;
      val2 = TWO_ALPHABETS_SYSTEM.alphabet1.find((item) => item.char === test2)?.value || 1;
      sum = val1 + val2;
      if (sum >= 1 && sum <= 18) break;
    }

    const authEntry = TWO_ALPHABETS_SYSTEM.alphabet2.find((item) => item.num === sum);
    const expectedLetter = authEntry?.char || 'Q';
    const expectedResult = `${expectedLetter}${expectedLetter}`;
    const announcedCallout = `ZNB ${expectedResult}`;

    return {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      system: 'dois_alfabetos',
      title: 'Sistema de Dois Alfabetos (Slide 22 a 30)',
      dayOfWeek: 'SEGUNDA, QUINTA E DOMINGO (Slide 12 / IECom)',
      rawMessage: rawMsg,
      radiogram,
      advRule: dynamicAdv.label,
      testElement1: test1,
      testElement2: test2,
      ruleExplanation: `Localizam-se os 2 elementos-teste no 1º alfabeto para obter seus valores numéricos (1 a 9). Somam-se os valores. A soma indica o número no 2º alfabeto (1 a 18). A letra encontrada duplicada é o autenticador.`,
      expectedResult,
      announcedCallout,
      calculationDetails: [
        `1. Localização no 1º Alfabeto: "${test1}" tem valor ${val1}, e "${test2}" tem valor ${val2}.`,
        `2. Soma dos valores numéricos: ${val1} + ${val2} = ${sum}.`,
        `3. Procura no 2º Alfabeto: a posição ${sum} corresponde à letra "${expectedLetter}".`,
        `4. Autenticador oficial regulamentar: "${expectedResult}" (transmitido como "${announcedCallout}").`,
      ],
    };
  }

  // um_alfabeto (Slide 18 a 21)
  const alphaLen = ONE_ALPHABET_SYSTEM.alphabet.length;
  const idx1 = Math.floor(Math.random() * alphaLen);
  let idx2 = Math.floor(Math.random() * alphaLen);
  while (idx2 === idx1) idx2 = Math.floor(Math.random() * alphaLen);

  const test1 = ONE_ALPHABET_SYSTEM.alphabet[idx1];
  const test2 = ONE_ALPHABET_SYSTEM.alphabet[idx2];
  const val1 = ONE_ALPHABET_SYSTEM.values[idx1];
  const val2 = ONE_ALPHABET_SYSTEM.values[idx2];
  const sum = val1 + val2;

  const targetIdx = (idx2 + sum) % alphaLen;
  const authLetter = ONE_ALPHABET_SYSTEM.alphabet[targetIdx];
  const expectedResult = `${authLetter}${authLetter}`;
  const announcedCallout = `ZNB ${expectedResult}`;

  return {
    id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    system: 'um_alfabeto',
    title: 'Sistema de Um Alfabeto (Slide 14 a 21)',
    dayOfWeek: 'QUARTA E SÁBADO (Slide 12 / IECom)',
    rawMessage: rawMsg,
    radiogram,
    advRule: dynamicAdv.label,
    testElement1: test1,
    testElement2: test2,
    ruleExplanation: `Procuram-se os valores numéricos dos dois elementos-teste no alfabeto. Somam-se os valores. A partir do 2º elemento-teste, contam-se tantas letras quantas forem o valor da soma. A letra correspondente duplicada é o autenticador.`,
    expectedResult,
    announcedCallout,
    calculationDetails: [
      `1. No alfabeto desordenado: "${test1}" = ${val1} e "${test2}" = ${val2}.`,
      `2. Soma dos valores dos dois elementos-teste: ${val1} + ${val2} = ${sum}.`,
      `3. Contando ${sum} posições a partir do 2º elemento-teste ("${test2}"), atinge-se a letra "${authLetter}".`,
      `4. Autenticador regulamentar: "${expectedResult}" (transmitido na fonia como "${announcedCallout}").`,
    ],
  };
}

/**
 * Autovalidação Permanente de Invariantes Doutrinárias do Exército Brasileiro:
 * Trava as regras matemáticas e operacionais contra regressões em alterações futuras:
 * 1. Chave Simples: Inscrição estritamente nas colunas em ordem numérica (1, 2, 3...) e leitura linha por linha.
 * 2. Chave Dupla: Combinação cruzada H1xV1, H1xV2... e leitura linha por linha.
 * 3. Reversibilidade: As funções de decifração revertem 100% o texto preparado com padding.
 * 4. Sobra de 2 Espaços: targetLength é sempre 5k - 2, fechando múltiplo de 5 com os 2 autenticadores.
 */
export function assertDoctrineInvariants(): boolean {
  try {
    const testMsg = 'INIMIGO RECUOU PARA LINHA ALFA';
    const deadL = 'X';

    // 1. Chave Simples Invariante
    const single = executeColumnarTransposition(testMsg, 'EXERCITO', deadL);
    if ((single.targetLength + 2) % 5 !== 0) {
      console.error('[INVARIANTE ERRO] Regra 5k-2 falhou na Chave Simples!');
      return false;
    }
    const revSingle = reverseColumnarTransposition(single.cipherContinuous, 'EXERCITO');
    if (revSingle.reconstructedPrepared !== single.paddedPrepared) {
      console.error('[INVARIANTE ERRO] Reversão da Chave Simples não coincidiu!');
      return false;
    }

    // 2. Chave Dupla Invariante
    const double = executeDoubleKeyTransposition(testMsg, 'SENTINELA', 'RONDON', deadL);
    if ((double.targetLength + 2) % 5 !== 0) {
      console.error('[INVARIANTE ERRO] Regra 5k-2 falhou na Chave Dupla!');
      return false;
    }
    const revDouble = reverseDoubleKeyTransposition(
      double.cipherContinuous,
      'SENTINELA',
      'RONDON',
      double.targetLength
    );
    if (revDouble.reconstructedPrepared !== double.paddedPrepared) {
      console.error('[INVARIANTE ERRO] Reversão da Chave Dupla não coincidiu!');
      return false;
    }

    // 3. Invariante da Bisseção: NUNCA dividir palavras no meio
    const testPhrases = [
      'INIMIGO RECUOU PARA LINHA ALFA',
      'PELOTAO CAVEIRA AVANCAR PARA SETOR BRAVO',
      'POSTO COMANDO DETERMINA SILENCIO RADIO AGORA',
      'COMBATENTE MANTER OBSERVACAO DISCIPLINADA',
    ];

    for (const phrase of testPhrases) {
      const prep = prepareMessageText(phrase, 'bissecao', 'X');
      const words = phrase.split(' ');
      const p1 = prep.part1 || '';
      const p2 = prep.part2 || '';

      // Verifica se a reconstrução (p1 + p2) recupera o texto limpo contínuo
      if (p1 + p2 !== prep.continuousClean) {
        console.error('[INVARIANTE ERRO] Bisseção não reconstituiu o texto original!');
        return false;
      }

      // Verifica se nenhuma palavra foi cortada no meio:
      // Cada palavra da frase original deve estar inteira em p1 ou inteira em p2
      let cursor = 0;
      for (const w of words) {
        if (p1.slice(cursor, cursor + w.length) === w) {
          cursor += w.length;
        } else {
          // Se saiu de p1, deve começar no início de p2
          break;
        }
      }
      // O restante das palavras deve bater exatamente com p2
      const wordsInP2 = words.slice(words.findIndex((w) => p2.startsWith(w)));
      if (wordsInP2.join('') !== p2) {
        console.error('[INVARIANTE ERRO] Bisseção dividiu uma palavra no meio na frase: ' + phrase);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('[INVARIANTE EXCECAO]', err);
    return false;
  }
}

// Execução imediata no carregamento do módulo
assertDoctrineInvariants();

