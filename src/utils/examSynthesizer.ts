import { Exam, Question, CourseType, DifficultyLevel } from '../types/exam';
import { OFFICIAL_EXAMS } from '../data/officialExams';

export interface FallbackExamParams {
  courseType?: string;
  subject?: string;
  materialText?: string;
  pastExamModel?: string;
  questionCount?: number;
  difficulty?: string;
  files?: Array<{ name: string; mimeType?: string; base64?: string; text?: string }>;
  excludePrompts?: string[];
  missedQuestions?: any[];
  avoidRepeatedQuestions?: boolean;
  enableSpacedRepetition?: boolean;
}

// Additional high-fidelity military questions pool across all 5 official CFST courses
const ADDITIONAL_MILITARY_QUESTIONS: Question[] = [
  // ==========================================
  // MATÉRIA 1: ARMAMENTO, MUNIÇÃO E TIRO
  // ==========================================
  {
    id: 'extra-armt-01',
    number: 1,
    type: 'objective',
    subType: 'fill_in_blank',
    difficulty: 'medio',
    subject: 'Armamento, Munição e Tiro',
    prompt: 'Assinale a alternativa que preenche corretamente a ordem regulamentar das Medidas Preliminares de Segurança do FAL 7,62 M964:',
    blanksSentence: 'Ao receber o armamento, o militar deve imediatamente executar as medidas preliminares na seguinte sequência estrita: 1º [ _____ (1) _____ ]; 2º [ _____ (2) _____ ]; 3º dar dois golpes de segurança e 4º [ _____ (3) _____ ].',
    options: [
      { letter: 'A', text: '(1) Travar a arma (RTS em S) · (2) Retirar o carregador · (3) Inspecionar visual e tactilmente a câmara' },
      { letter: 'B', text: '(1) Retirar o carregador · (2) Destravar a arma · (3) Pressionar a tecla do gatilho' },
      { letter: 'C', text: '(1) Dar o golpe de segurança · (2) Travar a arma · (3) Apontar para o alvo' },
      { letter: 'D', text: '(1) Abrir a caixa da culatra · (2) Retirar o percussor · (3) Verificar o obturador' },
      { letter: 'E', text: '(1) Inspecionar a câmara · (2) Colocar em automático · (3) Desmuniciar o carregador' },
    ],
    correctOption: 'A',
    modelAnswer: 'Sequência das Medidas Preliminares: 1º Travar a arma (RTS na posição "S"); 2º Retirar o carregador; 3º Dar dois golpes de segurança; 4º Inspecionar a câmara.',
    explanation: 'Conforme Manual EB60-ME-14.061: A segurança do atirador exige primeiramente travar a arma e retirar o carregador antes de qualquer manobra do ferrolho.',
    cardDirectFact: {
      frontPrompt: 'Primeira ação das Medidas Preliminares no FAL:',
      backAnswer: 'Travar a arma (colocar o registro de tiro e segurança na posição "S").',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-armt-02',
    number: 2,
    type: 'objective',
    subType: 'scenario',
    difficulty: 'medio',
    subject: 'Armamento, Munição e Tiro',
    prompt: 'Durante a sessão de tiro real do CFST, o atirador aciona o gatilho, ouve-se a percussão mas o tiro não parte. Como Comandante da Linha de Tiro, qual conduta imediata você deve exigir?',
    contextScenario: 'Você está atuando como Oficial/Sargento de Tiro no estande durante a execução do TIB com munição 7,62mm M1 real. Ocorre uma interrupção inesperada no alvo 4.',
    options: [
      { letter: 'A', text: 'Manter a arma apontada para o alvo por 30 segundos, não abrir a culatra imediatamente e aplicar o procedimento de incidente de tiro com cano apontado para a zona de segurança.' },
      { letter: 'B', text: 'Abrir a culatra imediatamente com força para ejetar o cartucho falhado sem aguardar.' },
      { letter: 'C', text: 'Bater com a coronha no chão para destravar as peças móveis e tentar novo disparo.' },
      { letter: 'D', text: 'Colocar o seletor em fogo automático "A" e acionar repetidamente o gatilho.' },
      { letter: 'E', text: 'Desmontar a caixa da culatra na própria linha de tiro sem retirar o carregador.' },
    ],
    correctOption: 'A',
    modelAnswer: 'Aguardar 30 segundos com a arma voltada para o alvo (para evitar o efeito do tiro retardado/hangfire), mantendo o cano na direção dos alvos, e só então realizar as medidas corretivas.',
    explanation: 'Regulamento de Tiro das Forças Armadas: Diante de falha na percussão, deve-se aguardar no mínimo 30 segundos com o cano apontado para o setor de tiro.',
    cardDirectFact: {
      frontPrompt: 'Tempo de espera obrigatório em caso de falha de percussão (tiro retardado):',
      backAnswer: '30 segundos mantendo a arma apontada para o alvo.',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-armt-03',
    number: 3,
    type: 'discursive',
    subType: 'standard',
    difficulty: 'dificil',
    subject: 'Armamento, Munição e Tiro',
    prompt: 'Descreva a sequência oficial de Desmontagem de 1º Escalão do Fuzil Automático Leve 7,62 M964 (FAL), citando as 4 etapas sucessivas das peças móveis e carcaça.',
    criteria: [
      { id: 'crit-armt-1', description: 'Citar a execução prévia das Medidas Preliminares (arma travada, sem carregador, câmara inspecionada).', gaivotas: 1 },
      { id: 'crit-armt-2', description: 'Citar a abertura do fuzil (acionamento do chaveta do trinco da armação e basculamento da caixa da culatra).', gaivotas: 1 },
      { id: 'crit-armt-3', description: 'Citar a retirada da tampa da caixa da culatra deslizando-a para a retaguarda.', gaivotas: 1 },
      { id: 'crit-armt-4', description: 'Citar a retirada do conjunto ferrolho-êmbolo da armação e a separação do ferrolho do seu êmbolo.', gaivotas: 1 },
    ],
    modelAnswer: '1. Executar as Medidas Preliminares (travar, retirar carregador, golpes de segurança, inspeção); 2. Bascular o fuzil acionando a chaveta do trinco da armação; 3. Retirar a tampa da caixa da culatra deslizando para trás; 4. Retirar o conjunto ferrolho e êmbolo da armação e separá-los.',
    totalGaivotas: 4,
    cardDirectFact: {
      frontPrompt: 'Peças retiradas na desmontagem de 1º escalão do FAL:',
      backAnswer: 'Tampa da caixa da culatra e conjunto ferrolho-êmbolo.',
    },
  },

  // ==========================================
  // MATÉRIA 2: EXPLORAÇÃO DAS COMUNICAÇÕES MILITARES
  // ==========================================
  {
    id: 'extra-com-01',
    number: 4,
    type: 'objective',
    subType: 'true_false',
    difficulty: 'medio',
    subject: 'Exploração das Comunicações',
    prompt: 'Quanto às características técnicas do Fio de Campanha WD-1/TT e procedimentos de lançamento de linha, julgue os itens a seguir:',
    tfStatements: [
      { numeral: 'I', statement: 'O fio de campanha WD-1/TT é composto por um par trançado de condutores, cada um com fios de cobre (para condução elétrica) e fios de aço (para resistência mecânica à tração).', isTrue: true },
      { numeral: 'II', statement: 'Nas emendas de campanha do fio WD-1/TT, os fios de cobre e aço devem ser unidos através de nós de tecelão/direito escalonados com isolamento em fita de borracha vulcanizada.', isTrue: true },
      { numeral: 'III', statement: 'Ao cruzar estradas ou itinerários de viaturas blindadas sobre lagartas, a linha de campanha deve ser deixada solta sobre o leito da via sem proteção.', isTrue: false },
      { numeral: 'IV', statement: 'A comunicação por fio possui como principal vantagem militar a imunidade a interferências intencionais (jamming) e o silêncio de rádio eletromagnético.', isTrue: true },
    ],
    options: [
      { letter: 'A', text: 'V – V – F – V' },
      { letter: 'B', text: 'V – F – V – F' },
      { letter: 'C', text: 'F – V – V – V' },
      { letter: 'D', text: 'V – V – V – F' },
      { letter: 'E', text: 'F – F – V – V' },
    ],
    correctOption: 'A',
    modelAnswer: 'V – V – F – V. O item III é FALSO: Ao cruzar itinerários de viaturas, a linha de campanha deve ser enterrada (trincheira) ou suspensa a altura regulamentar para evitar rompimento por blindados.',
    explanation: 'Manual de Campanha de Meios de Campanha: Fio WD-1/TT possui 4 condutores de cobre e 3 de aço por perna. Cruzamento de pistas exige suspensão ou enterramento.',
    cardDirectFact: {
      frontPrompt: 'Composição dos condutores do fio WD-1/TT:',
      backAnswer: 'Fios de cobre (condutibilidade) e fios de aço (resistência à tração).',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-com-02',
    number: 5,
    type: 'objective',
    subType: 'fill_in_blank',
    difficulty: 'medio',
    subject: 'Exploração das Comunicações',
    prompt: 'Preencha as lacunas com os três pilares da Guerra Eletrônica (GE) no âmbito da Força Terrestre:',
    blanksSentence: 'A Guerra Eletrônica militar divide-se doutrinariamente em: [ _____ (1) _____ ] (busca, interceptação e localização de emissões inimigas); [ _____ (2) _____ ] (ações ativas de interferência eletromagnética / jamming e destruição); e [ _____ (3) _____ ] (medidas para proteger as emissões amigas contra a GE adversária).',
    options: [
      { letter: 'A', text: '(1) MAGE (Medidas de Apoio à GE) · (2) MAE (Medidas de Ataque Eletrônico) · (3) MPE (Medidas de Proteção Eletrônica)' },
      { letter: 'B', text: '(1) MPE · (2) MAGE · (3) MAE' },
      { letter: 'C', text: '(1) Criptoanálise · (2) Radar de varredura · (3) Rádio escuta' },
      { letter: 'D', text: '(1) TRANSEC · (2) COMSEC · (3) INFOSEC' },
      { letter: 'E', text: '(1) Goniometria · (2) Radiodifusão · (3) Satélite Militar' },
    ],
    correctOption: 'A',
    modelAnswer: '(1) MAGE (Medidas de Apoio à Guerra Eletrônica); (2) MAE (Medidas de Ataque Eletrônico); (3) MPE (Medidas de Proteção Eletrônica).',
    explanation: 'Doutrina de Guerra Eletrônica do Exército Brasileiro: MAGE, MAE e MPE.',
    cardDirectFact: {
      frontPrompt: 'Os 3 pilares da Guerra Eletrônica do Exército:',
      backAnswer: 'MAGE (Apoio), MAE (Ataque) e MPE (Proteção Eletrônica).',
    },
    totalGaivotas: 1,
  },

  // ==========================================
  // MATÉRIA 3: EXPLORAÇÃO EM RADIOTELEFONIA (C 24-9)
  // ==========================================
  {
    id: 'extra-rad-01',
    number: 6,
    type: 'objective',
    subType: 'scenario',
    difficulty: 'medio',
    subject: 'Radiotelefonia Militar (C 24-9)',
    prompt: 'Durante a transmissão de uma mensagem na rede rádio do pelotão, o operador percebe que transmitiu uma coordenada incorreta. Qual é o procedimento estrito prescrito pelo Manual C 24-9?',
    contextScenario: 'Você é o operador do rádio do Pelotão de Cavalaria Mecanizado. Durante o relatório situacional, você falou "LINHA BRAVO", mas a posição correta é "LINHA CHARLIE".',
    options: [
      { letter: 'A', text: 'Transmitir a palavra de procedimento "CORREÇÃO", repetir a última palavra correta transmitida antes do erro e em seguida transmitir o termo correto.' },
      { letter: 'B', text: 'Dizer "Desculpe, houve um engano" e reiniciar toda a mensagem desde o cabeçalho.' },
      { letter: 'C', text: 'Transmitir "APAGO" e desligar o rádio por 5 minutos.' },
      { letter: 'D', text: 'Transmitir a palavra "CÂMBIO FINAL" e aguardar chamada da estação diretora.' },
      { letter: 'E', text: 'Utilizar a gíria "QSL com erro" e repetir apenas a letra inicial.' },
    ],
    correctOption: 'A',
    modelAnswer: 'Deve-se empregar imediatamente a expressão "CORREÇÃO", repetir a última palavra correta anterior ao engano e continuar a transmissão com a informação retificada.',
    explanation: 'Manual C 24-9: A palavra de procedimento para retificação em fonia é CORREÇÃO. O rádio militar não admite pedidos informais de desculpas.',
    cardDirectFact: {
      frontPrompt: 'Palavra de procedimento oficial para retificar erro de transmissão:',
      backAnswer: 'CORREÇÃO (retoma a partir da última palavra transmitida corretamente).',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-rad-02',
    number: 7,
    type: 'objective',
    subType: 'fill_in_blank',
    difficulty: 'facil',
    subject: 'Radiotelefonia Militar (C 24-9)',
    prompt: 'Complete a norma técnica de disciplina e operação do microfone no rádio militar:',
    blanksSentence: 'Ao pressionar o interruptor PTT (Push-To-Talk), o operador deve aguardar [ _____ (1) _____ ] segundo(s) antes de iniciar a fala para evitar corte da portadora, e manter suas transmissões no tempo máximo de [ _____ (2) _____ ] segundos para evitar a localização por goniometria inimiga.',
    options: [
      { letter: 'A', text: '(1) 1 (um) · (2) 20 (vinte)' },
      { letter: 'B', text: '(1) 5 (cinco) · (2) 60 (sessenta)' },
      { letter: 'C', text: '(1) 3 (três) · (2) 45 (quarenta e cinco)' },
      { letter: 'D', text: '(1) 0 (zero) · (2) 120 (cento e vinte)' },
      { letter: 'E', text: '(1) 10 (dez) · (2) 15 (quinze)' },
    ],
    correctOption: 'A',
    modelAnswer: '(1) 1 segundo de espera após acionar o PTT; (2) Transmissão máxima de 20 segundos.',
    explanation: 'Instrução Técnica C 24-9: 1 segundo garante abertura do canal sem cortar a primeira sílaba; teto de 20 segundos protege contra radiogoniometria e aquecimento do estágio de potência.',
    cardDirectFact: {
      frontPrompt: 'Tempo de espera ao apertar PTT e limite máximo de transmissão contínua:',
      backAnswer: 'Aguardar 1 segundo antes de falar; teto máximo de 20 segundos de transmissão.',
    },
    totalGaivotas: 1,
  },

  // ==========================================
  // MATÉRIA 4: SISTEMA RÁDIO DIGITAL TRONCALIZADO (SRDT)
  // ==========================================
  {
    id: 'extra-srdt-01',
    number: 8,
    type: 'objective',
    subType: 'scenario',
    difficulty: 'medio',
    subject: 'Rádios Digitais Troncalizados (SRDT)',
    prompt: 'Em uma operação em terreno montanhoso onde a tropa avança além da visada direta da torre repetidora do SRDT, qual recurso do rádio APX 2000 deve ser ativado para permitir a comunicação direta entre as viaturas na rede local?',
    contextScenario: 'A 1ª Companhia de Fuzileiros entrou em um desfiladeiro cego. O visor dos rádios portáteis indica perda de sinal com a repetidora troncalizada principal.',
    options: [
      { letter: 'A', text: 'Ativar a função "Talk Around" (comunicação direta rádio-a-rádio / simplex na frequência de saída da repetidora).' },
      { letter: 'B', text: 'Acionar o botão de emergência laranja repetidas vezes.' },
      { letter: 'C', text: 'Aumentar o volume do alto-falante para a potência de 35 Watts.' },
      { letter: 'D', text: 'Conectar o rádio ao cabo de rede do computador sem software CPS.' },
      { letter: 'E', text: 'Remover a antena durante a tentativa de transmissão para ampliar o ângulo.' },
    ],
    correctOption: 'A',
    modelAnswer: 'A função "Talk Around" permite contornar a repetidora, operando em canal simplex direto entre as estações rádio da fração dentro do alcance visual.',
    explanation: 'Manual do Rádio APX 2000 / EsCom: Talk Around permite enlace direto sem repetidora quando fora da cobertura.',
    cardDirectFact: {
      frontPrompt: 'Função do APX 2000 para falar direto sem repetidora quando fora de cobertura:',
      backAnswer: 'Função "Talk Around" (operação direta simplex).',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-srdt-02',
    number: 9,
    type: 'discursive',
    subType: 'standard',
    difficulty: 'dificil',
    subject: 'Rádios Digitais Troncalizados (SRDT)',
    prompt: 'Explique o que é o "Codeplug" nos rádios Motorola APX 2000 / APX 2500 e cite os cuidados regulamentares na reprogramação com o software CPS.',
    criteria: [
      { id: 'crit-srdt-1', description: 'Definir Codeplug como o arquivo de configuração e parâmetros armazenado na memória do rádio (canais, zonas, chaves de criptografia e IDs).', gaivotas: 1 },
      { id: 'crit-srdt-2', description: 'Citar que o software utilizado para ler e gravar o codeplug é o APX CPS.', gaivotas: 1 },
      { id: 'crit-srdt-3', description: 'Destacar a regra mandatória de que rádios programados com versão mais recente do CPS NÃO podem receber versões anteriores de software.', gaivotas: 1 },
    ],
    modelAnswer: 'O Codeplug é o arquivo de configuração gravado na memória não volátil do rádio contendo frequências, zonas, canais, IDs, grupos de conversação e perfis de áudio. É editado através do software APX CPS. Cuidados: nunca desligar o rádio durante a gravação; e nunca tentar reprogramar com versão anterior do CPS, pois rádios gravados com versão recente não aceitam downgrade.',
    totalGaivotas: 3,
    cardDirectFact: {
      frontPrompt: 'O que é o Codeplug do rádio APX 2000:',
      backAnswer: 'Arquivo de configuração com frequências, canais, IDs e parâmetros de rede gravados no rádio.',
    },
  },

  // ==========================================
  // MATÉRIA 5: LIDERANÇA MILITAR (C 20-10)
  // ==========================================
  {
    id: 'extra-lid-01',
    number: 10,
    type: 'objective',
    subType: 'column_match',
    difficulty: 'medio',
    subject: 'Liderança Militar',
    prompt: 'Relacione os três níveis doutrinários de liderança militar (Coluna I) com seus respectivos âmbitos de atuação e escalões no Exército Brasileiro (Coluna II):',
    columnA: [
      { key: '1', text: 'Liderança Direta' },
      { key: '2', text: 'Liderança Operacional' },
      { key: '3', text: 'Liderança Estratégica' },
    ],
    columnB: [
      { key: 'A', text: 'Exercida no âmbito dos Comandos Militares de Área, Divisões e Brigadas, articulando meios para cumprir objetivos de campanha' },
      { key: 'B', text: 'Exercida face a face no contato imediato diário com os subordinados (Pelotão, Seção, Grupo de Combate e Companhia)' },
      { key: 'C', text: 'Exercida no nível dos órgãos de direção geral e setorial (Estado-Maior do Exército e Comandante da Força), orientada para o futuro e visão nacional' },
    ],
    options: [
      { letter: 'A', text: '1-B / 2-A / 3-C' },
      { letter: 'B', text: '1-A / 2-B / 3-C' },
      { letter: 'C', text: '1-C / 2-A / 3-B' },
      { letter: 'D', text: '1-B / 2-C / 3-A' },
      { letter: 'E', text: '1-A / 2-C / 3-B' },
    ],
    correctOption: 'A',
    modelAnswer: '1-B (Direta: contato face a face em pequenas frações); 2-A (Operacional: Brigadas e Divisões articulando meios táticos); 3-C (Estratégica: EME e Comandante do Exército com visão institucional global).',
    explanation: 'Manual C 20-10: Níveis de Liderança: Direta (face a face), Operacional (médio escalão) e Estratégica (alto escalão da Força Terrestre).',
    cardDirectFact: {
      frontPrompt: 'Os 3 níveis doutrinários de Liderança Militar:',
      backAnswer: 'Liderança Direta (pequenas frações), Operacional (Brigadas/Divisões) e Estratégica (EME/Comando Geral).',
    },
    totalGaivotas: 1,
  },
  {
    id: 'extra-lid-02',
    number: 11,
    type: 'objective',
    subType: 'true_false',
    difficulty: 'medio',
    subject: 'Liderança Militar',
    prompt: 'Julgue os itens sobre os Atributos da Área Afetiva e Cognitiva exigidos do graduado na Força Terrestre:',
    tfStatements: [
      { numeral: 'I', statement: 'A Coragem Moral consiste na firmeza para defender a verdade, a justiça e as decisões corretas, mesmo sob risco de impopularidade ou contrariedade de superiores.', isTrue: true },
      { numeral: 'II', statement: 'A Empatia na liderança militar implica em condescendência com infrações disciplinares e dispensa do cumprimento estrito de ordens de serviço.', isTrue: false },
      { numeral: 'III', statement: 'A Iniciativa é a capacidade de agir prontamente e com discernimento na ausência de ordens imediatas ou diante de situações imprevistas, no sentido do cumprimento da intenção do comandante.', isTrue: true },
      { numeral: 'IV', statement: 'O princípio basilar de que "a palavra convence, o exemplo arrasta" reflete a indelegabilidade do dever de dar o exemplo pelo líder militar.', isTrue: true },
    ],
    options: [
      { letter: 'A', text: 'V – F – V – V' },
      { letter: 'B', text: 'V – V – F – F' },
      { letter: 'C', text: 'F – V – V – V' },
      { letter: 'D', text: 'V – F – F – V' },
      { letter: 'E', text: 'F – F – V – V' },
    ],
    correctOption: 'A',
    modelAnswer: 'V – F – V – V. O item II é FALSO: Empatia militar é compreender as necessidades e estado anímico da tropa para melhor liderá-la, jamais tolerar indisciplina ou descumprimento de missão.',
    explanation: 'Manual C 20-10: Atributos militares e Três Servidões Indelegáveis.',
    cardDirectFact: {
      frontPrompt: 'Significado de "Coragem Moral" na liderança militar:',
      backAnswer: 'Firmeza para defender a justiça e cumprir o dever ético, mesmo contra pressões.',
    },
    totalGaivotas: 1,
  },
];

// Helper to extract key sentences and synthesize question from user's custom document text
function synthesizeFromCustomText(customText: string, index: number): Question | null {
  if (!customText || customText.length < 100) return null;

  // Split into clean substantive sentences
  const sentences = customText
    .split(/[.?!;\n]+/)
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter((s) => s.length >= 40 && s.length <= 250 && !/^(slide|página|capítulo|sumário)/i.test(s));

  if (sentences.length === 0) return null;

  // Pick a sentence based on index
  const chosenSentence = sentences[index % sentences.length];

  // Try to find key technical terms
  const words = chosenSentence.split(' ').filter((w) => w.length > 5);
  if (words.length < 3) return null;

  const rawWord1 = words[Math.floor(words.length / 3)] || '';
  const rawWord2 = words[Math.floor((words.length * 2) / 3)] || '';
  const cleanWord1 = rawWord1.replace(/[^a-zA-Z0-9À-ÿ]/g, '');
  const cleanWord2 = rawWord2.replace(/[^a-zA-Z0-9À-ÿ]/g, '');
  if (cleanWord1.length < 3 || cleanWord2.length < 3) return null;

  let blanked = chosenSentence;
  const idx1 = blanked.toLowerCase().indexOf(cleanWord1.toLowerCase());
  if (idx1 !== -1) {
    blanked = blanked.slice(0, idx1) + '[ _____ (1) _____ ]' + blanked.slice(idx1 + cleanWord1.length);
  }
  const idx2 = blanked.toLowerCase().indexOf(cleanWord2.toLowerCase());
  if (idx2 !== -1) {
    blanked = blanked.slice(0, idx2) + '[ _____ (2) _____ ]' + blanked.slice(idx2 + cleanWord2.length);
  }

  if (!blanked.includes('[ _____ (1) _____ ]')) return null;

  return {
    id: `custom-synth-${index + 1}`,
    number: index + 1,
    type: 'objective',
    subType: 'fill_in_blank',
    difficulty: 'medio',
    subject: 'Matéria do Documento Anexado',
    prompt: 'Com base no documento militar fornecido, assinale a alternativa que preenche corretamente as lacunas:',
    blanksSentence: blanked,
    options: [
      { letter: 'A', text: `(1) ${cleanWord1} · (2) ${cleanWord2}` },
      { letter: 'B', text: `(1) procedimento regulamentar · (2) controle descentralizado` },
      { letter: 'C', text: `(1) diretriz secundária · (2) execução facultativa` },
      { letter: 'D', text: `(1) instrução geral · (2) verificação posterior` },
      { letter: 'E', text: `(1) meio alternativo · (2) autorização verbal` },
    ],
    correctOption: 'A',
    modelAnswer: `(1) ${cleanWord1} · (2) ${cleanWord2}. Conforme explicitado no texto do arquivo.`,
    explanation: `Trecho extraído do documento: "${chosenSentence}".`,
    cardDirectFact: {
      frontPrompt: `Conceito extraído do arquivo:`,
      backAnswer: `${cleanWord1} e ${cleanWord2}.`,
    },
    totalGaivotas: 1,
  };
}

export function generateExamFromMaterialsFallback(params: FallbackExamParams): Exam {
  const {
    courseType = 'CFST',
    subject = 'Matérias Gerais',
    materialText = '',
    pastExamModel = '',
    questionCount = 5,
    difficulty = 'medio',
    files = [],
    excludePrompts = [],
    missedQuestions = [],
  } = params;

  // 1. Gather all file texts and filenames
  const attachedFileNames = files.map((f) => (f.name || '').toLowerCase()).join(' ');
  const combinedFileText = [
    attachedFileNames,
    subject.toLowerCase(),
    materialText.toLowerCase(),
    ...files.map((f) => (f.text || '').toLowerCase().slice(0, 15000)),
  ].join(' ');

  // 2. Identify relevant subjects
  const isArmt =
    combinedFileText.includes('armamento') ||
    combinedFileText.includes('fal') ||
    combinedFileText.includes('tiro') ||
    combinedFileText.includes('pistola') ||
    combinedFileText.includes('bizu_armamento');

  const isCom =
    combinedFileText.includes('comunica') ||
    combinedFileText.includes('explora__o_das_comunica') ||
    combinedFileText.includes('meios de comunica') ||
    combinedFileText.includes('bescom') ||
    combinedFileText.includes('ebnet');

  const isRad =
    combinedFileText.includes('radiotelefonia') ||
    combinedFileText.includes('c 24-9') ||
    combinedFileText.includes('fonia') ||
    combinedFileText.includes('câmbio') ||
    combinedFileText.includes('tripé');

  const isSrdt =
    combinedFileText.includes('apx') ||
    combinedFileText.includes('srdt') ||
    combinedFileText.includes('troncalizado') ||
    combinedFileText.includes('srx1200') ||
    combinedFileText.includes('escom') ||
    combinedFileText.includes('codeplug');

  const isLid =
    combinedFileText.includes('lideran') ||
    combinedFileText.includes('c 20-10') ||
    combinedFileText.includes('servidões') ||
    combinedFileText.includes('ética');

  // 3. Pool questions from OFFICIAL_EXAMS and ADDITIONAL_MILITARY_QUESTIONS
  const candidatePool: Question[] = [];

  // Helper to test if a question matches matched subjects or if any subject is allowed
  const hasSubjectMatch = isArmt || isCom || isRad || isSrdt || isLid;

  const allAvailableExams = [...OFFICIAL_EXAMS];
  const allOfficialQuestions = allAvailableExams.flatMap((e) => e.questions);
  const combinedOfficialAndExtra = [...allOfficialQuestions, ...ADDITIONAL_MILITARY_QUESTIONS];

  for (const q of combinedOfficialAndExtra) {
    const qSub = (q.subject || '').toLowerCase();
    const qText = `${q.prompt} ${q.modelAnswer || ''}`.toLowerCase();

    let matched = false;
    if (!hasSubjectMatch) {
      matched = true;
    } else {
      if (isArmt && (qSub.includes('armamento') || qText.includes('fal') || qText.includes('tiro'))) matched = true;
      if (isCom && (qSub.includes('exploração das comunicações') || qText.includes('meios') || qText.includes('wd-1'))) matched = true;
      if (isRad && (qSub.includes('radiotelefonia') || qText.includes('c 24-9') || qText.includes('fonia') || qText.includes('câmbio'))) matched = true;
      if (isSrdt && (qSub.includes('srdt') || qText.includes('apx') || qText.includes('troncalizado') || qText.includes('codeplug'))) matched = true;
      if (isLid && (qSub.includes('liderança') || qText.includes('c 20-10') || qText.includes('servidões'))) matched = true;
    }

    if (matched) {
      candidatePool.push(q);
    }
  }

  // If pool still empty, take all questions
  if (candidatePool.length === 0) {
    candidatePool.push(...combinedOfficialAndExtra);
  }

  // 4. Try synthesizing 1-2 questions directly from custom uploaded text if text is substantial
  const allCustomText = [materialText, ...files.map((f) => f.text || '')].join('\n');
  if (allCustomText.length > 300) {
    for (let i = 0; i < 3; i++) {
      const synth = synthesizeFromCustomText(allCustomText, i);
      if (synth) candidatePool.unshift(synth);
    }
  }

  // 5. Exclude prompts in excludePrompts to guarantee fresh questions
  const cleanExcludeSet = new Set(
    (excludePrompts || []).map((p) => p.trim().toLowerCase().slice(0, 45))
  );

  let filteredPool = candidatePool.filter(
    (q) => !cleanExcludeSet.has((q.prompt || '').trim().toLowerCase().slice(0, 45))
  );

  // If filtering excluded too many, restore candidate pool
  if (filteredPool.length < questionCount) {
    filteredPool = [...candidatePool];
  }

  // 6. Shuffle deterministically/non-deterministically
  const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);

  // Prioritize spaced repetition concepts if provided
  if (missedQuestions && missedQuestions.length > 0) {
    const missedTopics = missedQuestions.map((m) => (m.prompt || m.subject || '').toLowerCase());
    shuffled.sort((a, b) => {
      const aMatches = missedTopics.some((t) => (a.prompt || '').toLowerCase().includes(t.slice(0, 20)));
      const bMatches = missedTopics.some((t) => (b.prompt || '').toLowerCase().includes(t.slice(0, 20)));
      return aMatches ? -1 : bMatches ? 1 : 0;
    });
  }

  // Slice or expand to requested questionCount (min 1, max requested)
  const targetCount = Math.max(1, questionCount);
  const selectedQuestions: Question[] = [];
  let currentIdx = 0;
  while (selectedQuestions.length < targetCount && shuffled.length > 0) {
    const baseQ = shuffled[currentIdx % shuffled.length];
    const qNum = selectedQuestions.length + 1;
    selectedQuestions.push({
      ...baseQ,
      id: `q-${qNum}-${Date.now()}`,
      number: qNum,
      totalGaivotas: baseQ.type === 'discursive' ? (baseQ.criteria?.length || baseQ.totalGaivotas || 3) : 1,
      correctOption: (baseQ.correctOption || 'A').toUpperCase().slice(0, 1),
    });
    currentIdx++;
  }

  // Build subject title
  let finalSubject = subject;
  if (files && files.length > 0) {
    finalSubject = files.map((f) => f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')).slice(0, 2).join(' & ');
  }

  return {
    id: `simulado-${Date.now()}`,
    title: 'SIMULADO',
    course: (courseType as CourseType) || 'CFST',
    subject: finalSubject || 'CFST 26/2 - Doutrina Militar',
    institution: 'Exército Brasileiro · CFST 26/2',
    instructions:
      'Simulado militar estruturado a partir dos documentos oficiais e diretrizes doutrinárias da Força Terrestre. Avaliação por critérios oficiais de gaivotas (✓).',
    totalTimeMinutes: Math.max(30, targetCount * 15),
    questions: selectedQuestions,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
}
