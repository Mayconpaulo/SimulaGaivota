import { ColumnItem, DiagramData, DifficultyLevel, Question, TrueFalseItem } from '../types/exam';

export interface QuestionTemplate {
  subject: string;
  type: 'discursive' | 'objective';
  subType?: 'fill_in_blank' | 'column_match' | 'true_false' | 'scenario' | 'diagram_identification' | 'standard';
  prompt: string;
  contextScenario?: string;
  blanksSentence?: string;
  columnA?: ColumnItem[];
  columnB?: ColumnItem[];
  tfStatements?: TrueFalseItem[];
  diagram?: DiagramData;
  cardDirectFact?: { frontPrompt: string; backAnswer: string };
  isReinforcedCoreConcept?: boolean;
  totalGaivotas: number;
  modelAnswer: string;
  difficulty: DifficultyLevel;
  drillTimerSeconds?: number;
  options?: Array<{ letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }>;
  correctOption?: string;
  explanation?: string;
  criteria?: Array<{ id: string; description: string; gaivotas: number }>;
}

export const BASE_QUESTION_TEMPLATES: QuestionTemplate[] = [
  // 1. Múltipla Escolha - Fio WD-1/TT
  {
    subject: 'Meios Fio de Campanha',
    type: 'objective',
    difficulty: 'medio',
    prompt: 'O fio de campanha WD-1/TT é composto por dois condutores trançados. Qual é a constituição metálica de cada um desses condutores para aliar resistência à tração e condutibilidade elétrica?',
    totalGaivotas: 1,
    drillTimerSeconds: 30,
    options: [
      { letter: 'A', text: '7 fios de cobre puro estanhado para máxima condução.' },
      { letter: 'B', text: '4 fios de cobre (condutibilidade) e 3 fios de aço (resistência à tração).' },
      { letter: 'C', text: '5 fios de alumínio e 2 fios de chumbo com isolamento térmico.' },
      { letter: 'D', text: '6 fios de tungstênio e 1 fio de bronze fosforoso.' },
      { letter: 'E', text: '3 fios de latão e 4 fios de náilon condutivo militar.' },
    ],
    correctOption: 'B',
    explanation: 'Cada condutor do fio WD-1/TT possui 4 fios de cobre (para excelente condução elétrica) e 3 fios de aço (para conferir alta resistência mecânica à tração durante o lançamento no terreno).',
    modelAnswer: 'A constituição é de 4 fios de cobre e 3 fios de aço.',
  },

  // 2. Discursiva - Procedimentos em Fonia
  {
    subject: 'Procedimentos Rádio em Fonia Militar',
    type: 'discursive',
    difficulty: 'medio',
    prompt: 'Na exploração rádio militar, o uso correto das palavras de procedimento garante rapidez e impede ambiguidades. Cite 3 palavras de procedimento padronizadas pelo Exército Brasileiro e explique a finalidade operacional de cada uma.',
    totalGaivotas: 3,
    drillTimerSeconds: 45,
    modelAnswer: '1) CÂMBIO: encerra a transmissão e aguarda réplica do interlocutor; 2) TERMINADO: encerra a transmissão definitiva sem aguardar resposta; 3) AQUI: precede o indicativo de chamada da estação transmissora; 4) REPITA: solicita nova transmissão da mensagem; 5) SILÊNCIO RÁDIO: ordem imediata de interrupção de transmissões.',
    criteria: [
      { id: 'crit-gen-fonia-1', description: '1ª Gaivota: Citar CÂMBIO (fim de fala com expectativa de resposta)', gaivotas: 1 },
      { id: 'crit-gen-fonia-2', description: '2ª Gaivota: Citar TERMINADO (fim da ligação sem resposta)', gaivotas: 1 },
      { id: 'crit-gen-fonia-3', description: '3ª Gaivota: Citar AQUI, REPITA ou SILÊNCIO RÁDIO com o significado operacional correto', gaivotas: 1 },
    ],
  },

  // 3. Múltipla Escolha - SEGCOM
  {
    subject: 'Segurança das Comunicações (SEGCOM)',
    type: 'objective',
    difficulty: 'facil',
    prompt: 'Em uma rede rádio tática sob ameaça de Guerra Eletrônica, qual das condutas a seguir viola gravemente as normas de Segurança das Comunicações (SEGCOM)?',
    totalGaivotas: 1,
    drillTimerSeconds: 25,
    options: [
      { letter: 'A', text: 'Utilizar mensagens pré-formatadas e códigos de autenticação.' },
      { letter: 'B', text: 'Manter transmissões curtas de menos de 15 segundos.' },
      { letter: 'C', text: 'Transmitir coordenadas e nomes de comandantes em linguagem clara.' },
      { letter: 'D', text: 'Acionar a potência mínima necessária para atingir o correspondente.' },
      { letter: 'E', text: 'Respeitar rigorosamente o silêncio rádio determinado pelo escalão superior.' },
    ],
    correctOption: 'C',
    explanation: 'A transmissão de coordenadas e nomes de comandantes em claro entrega a posição e o centro de gravidade da tropa à goniometria e escuta do inimigo.',
    modelAnswer: 'Transmitir coordenadas e nomes de comandantes em linguagem clara.',
  },

  // 4. Discursiva - Meios Rádio vs Meios Fio
  {
    subject: 'Comunicações no Posto de Comando',
    type: 'discursive',
    difficulty: 'medio',
    prompt: 'No desdobramento do Posto de Comando (PC), a fração de comunicações instala tanto meios fio quanto meios rádio. Cite 2 vantagens táticas do meio-fio em relação ao meio-rádio e 1 desvantagem.',
    totalGaivotas: 3,
    drillTimerSeconds: 40,
    modelAnswer: 'Vantagens: 1) Elevada segurança contra interceptação da Guerra Eletrônica inimiga (não emite sinal eletromagnético captável à distância); 2) Imunidade a bloqueios eletrônicos (jammers) e variações atmosféricas. Desvantagem: Baixa flexibilidade e mobilidade (linhas físicas sujeitas a rompimento por viaturas blindadas ou estilhaços de artilharia e tempo lento de lançamento/recolhimento).',
    criteria: [
      { id: 'crit-gen-pc-1', description: '1ª Gaivota: Citar maior sigilo/segurança das comunicações (ausência de irradiação detectável)', gaivotas: 1 },
      { id: 'crit-gen-pc-2', description: '2ª Gaivota: Citar imunidade a interferências e bloqueios eletrônicos inimigos', gaivotas: 1 },
      { id: 'crit-gen-pc-3', description: '3ª Gaivota: Citar vulnerabilidade física das linhas ou menor mobilidade da rede fio', gaivotas: 1 },
    ],
  },

  // 5. Múltipla Escolha - RDE Prazos
  {
    subject: 'Regulamento Disciplinar do Exército (RDE)',
    type: 'objective',
    difficulty: 'facil',
    prompt: 'No âmbito do processo disciplinar sumário do Exército (FATD), qual é o prazo legal para que o militar arrolado apresente por escrito as suas razões de defesa prévia?',
    totalGaivotas: 1,
    drillTimerSeconds: 20,
    options: [
      { letter: 'A', text: '24 horas contadas da notificação verbal.' },
      { letter: 'B', text: '3 (três) dias úteis a contar do recebimento do formulário.' },
      { letter: 'C', text: '5 (cinco) dias corridos impreteríveis.' },
      { letter: 'D', text: '8 (oito) dias úteis com efeito suspensivo.' },
      { letter: 'E', text: '10 (dez) dias úteis após audiência com o comandante.' },
    ],
    correctOption: 'B',
    explanation: 'Conforme preceitua o Regulamento Disciplinar do Exército, o prazo para apresentação das razões de defesa no FATD é de 3 dias úteis.',
    modelAnswer: '3 dias úteis.',
  },

  // 6. Discursiva - RDE Atenuantes e Agravantes
  {
    subject: 'RDE - Julgamento da Transgressão',
    type: 'discursive',
    difficulty: 'medio',
    prompt: 'Para a aplicação justa da penalidade disciplinar militar, a autoridade deve analisar atenuantes e agravantes. Cite 2 circunstâncias que atenuam a punição e 2 circunstâncias que agravam a punição disciplinar conforme o RDE.',
    totalGaivotas: 4,
    drillTimerSeconds: 50,
    modelAnswer: 'Atenuantes: 1) Bom ou ótimo comportamento anterior; 2) Ter sido cometida para evitar mal maior ou em legítima defesa; 3) Falta de prática do serviço (recruta/aluno). Agravantes: 1) Mau comportamento anterior; 2) Prática da falta em serviço de guarda ou situação de prontidão; 3) Conluio de duas ou mais pessoas; 4) Prática da falta na presença de tropa ou de subordinados.',
    criteria: [
      { id: 'crit-gen-rde-1', description: '1ª Gaivota: Citar 1ª circunstância atenuante (bom comportamento anterior ou evitar mal maior)', gaivotas: 1 },
      { id: 'crit-gen-rde-2', description: '2ª Gaivota: Citar 2ª circunstância atenuante (falta de prática de serviço ou legítima defesa)', gaivotas: 1 },
      { id: 'crit-gen-rde-3', description: '3ª Gaivota: Citar 1ª circunstância agravante (em serviço/guarda ou mau comportamento)', gaivotas: 1 },
      { id: 'crit-gen-rde-4', description: '4ª Gaivota: Citar 2ª circunstância agravante (conluio de pessoas ou na presença de subordinados)', gaivotas: 1 },
    ],
  },

  // 7. Múltipla Escolha - Armamento FAL 7,62
  {
    subject: 'Armamento Leve - FAL 7,62 M964',
    type: 'objective',
    difficulty: 'medio',
    prompt: 'Qual é o princípio de funcionamento automático do Fuzil 7,62 M964 (FAL), armamento regulamentar do combatente do Exército Brasileiro?',
    totalGaivotas: 1,
    drillTimerSeconds: 25,
    options: [
      { letter: 'A', text: 'Recuo direto dos gases sem tomada na parte média do cano.' },
      { letter: 'B', text: 'Ação indireta dos gases com tomada de gases regulável e êmbolo independente.' },
      { letter: 'C', text: 'Fechamento por ferrolho rotativo por inércia retardada de roletes.' },
      { letter: 'D', text: 'Recuo curto do cano acoplado à culatra basculante estriada.' },
      { letter: 'E', text: 'Pressão eletromecânica nos batentes da armação posterior.' },
    ],
    correctOption: 'B',
    explanation: 'O FAL funciona por tomada indireta de gases em orifício regulável no bloco do cilindro de gases, impulsionando o êmbolo e este o impulsor do ferrolho.',
    modelAnswer: 'Ação indireta dos gases com tomada de gases e êmbolo.',
  },

  // 8. Discursiva - Estatuto dos Militares
  {
    subject: 'Estatuto dos Militares (Lei 6.880/80)',
    type: 'discursive',
    difficulty: 'facil',
    prompt: 'Conforme o Estatuto dos Militares, quais são os dois pilares fundamentais sobre os quais repousam as Forças Armadas brasileiras? Defina sucintamente cada um desses conceitos doutrinários.',
    totalGaivotas: 2,
    drillTimerSeconds: 35,
    modelAnswer: 'Os dois pilares são: 1) Hierarquia: a ordenação da autoridade em diferentes níveis dentro da estrutura das Forças Armadas, crescendo do grau inferior para o superior. 2) Disciplina: a rigorosa observância e o acatamento integral das leis, regulamentos, normas e ordens militares por todos os integrantes da Força.',
    criteria: [
      { id: 'crit-gen-est-1', description: '1ª Gaivota: Citar Hierarquia e definir como escalonamento e ordenação da autoridade militar', gaivotas: 1 },
      { id: 'crit-gen-est-2', description: '2ª Gaivota: Citar Disciplina e definir como obediência e acatamento às ordens e regulamentos', gaivotas: 1 },
    ],
  },

  // 9. Múltipla Escolha - História e Tradições
  {
    subject: 'Tradições da Arma de Comunicações',
    type: 'objective',
    difficulty: 'facil',
    prompt: 'Quem é o Patrono da Arma de Comunicações do Exército Brasileiro e qual é o lema histórico associado ao espírito dessa arma combatente?',
    totalGaivotas: 1,
    drillTimerSeconds: 20,
    options: [
      { letter: 'A', text: 'Duque de Caxias - "Braço Forte, Mão Amiga"' },
      { letter: 'B', text: 'Marechal Manuel Luis Osorio - "A Nobre Arma da Cavalaria"' },
      { letter: 'C', text: 'Marechal Cândido Mariano da Silva Rondon - "A Arma do Comando"' },
      { letter: 'D', text: 'General Antônio de Sampaio - "A Rainha das Armas"' },
      { letter: 'E', text: 'Marechal Emílio Mallet - "Eles que venham, por aqui não passam"' },
    ],
    correctOption: 'C',
    explanation: 'O Marechal Rondon é o patrono da Arma de Comunicações (celebrado em 5 de maio), e as Comunicações são conhecidas tradicionalmente como "A Arma do Comando".',
    modelAnswer: 'Marechal Rondon - A Arma do Comando.',
  },

  // 10. Discursiva - Antenas e Propagação
  {
    subject: 'Sistemas Irradiantes e Antenas Táticas',
    type: 'discursive',
    difficulty: 'medio',
    prompt: 'Nas operações em terreno acidentado ou selva, o alcance das antenas verticais omnidirecionais (tipo chicote) pode ficar severamente degradado. Cite 2 providências técnicas de antenas ou posicionamento que a equipe de rádio de comunicações pode adotar para restabelecer a ligação com o escalão superior.',
    totalGaivotas: 2,
    drillTimerSeconds: 40,
    modelAnswer: 'Providências técnicas: 1) Instalar antena horizontal dipolo de meia onda ou antena de fio longo orientada na direção do correspondente; 2) Elevar a antena para cotas mais altas do terreno (deslocamento para crista topográfica ou topo de árvores); 3) Ajustar o acoplador de antena e selecionar frequência mais adequada para propagação por onda terrestre ou NVIS.',
    criteria: [
      { id: 'crit-gen-ant-1', description: '1ª Gaivota: Citar confecção/uso de antena dipolo de meia onda ou fio longo direcionado', gaivotas: 1 },
      { id: 'crit-gen-ant-2', description: '2ª Gaivota: Citar elevação da antena (ganho de cota/árvore) ou ajuste de frequência/acoplador', gaivotas: 1 },
    ],
  },

  // 11. Múltipla Escolha - Guerra Eletrônica MPE
  {
    subject: 'Guerra Eletrônica e MPE',
    type: 'objective',
    difficulty: 'medio',
    prompt: 'Durante a exploração rádio, o operador percebe ruído forte e contínuo característico de interferência eletrônica intencional (bloqueio/jammer inimigo). Qual é o procedimento IMEDIATO de Medida de Proteção Eletrônica (MPE)?',
    totalGaivotas: 1,
    drillTimerSeconds: 25,
    options: [
      { letter: 'A', text: 'Reclamar em claro na rede acusando a presença do inimigo.' },
      { letter: 'B', text: 'Permanecer transmitindo ininterruptamente para sobrepujar a potência do bloqueio.' },
      { letter: 'C', text: 'Autenticar com o escalão de controle, migrar para a frequência alternativa estabelecida nas IET e reportar a interferência por meio seguro.' },
      { letter: 'D', text: 'Desligar permanentemente todos os rádios e abandonar o posto de comunicações.' },
      { letter: 'E', text: 'Aumentar o volume do alto-falante e solicitar que a tropa grite no microfone.' },
    ],
    correctOption: 'C',
    explanation: 'Ao constatar interferência hostil, o operador militar deve cumprir o plano de salto de frequência ou frequência alternativa previsto nas Instruções de Exploração das Comunicações (IET), sem dialogar em claro.',
    modelAnswer: 'Migrar para frequência alternativa conforme previsto nas IET.',
  },

  // 12. Discursiva - Centrais Telefônicas de Campanha
  {
    subject: 'Centrais Telefônicas de Campanha (SB-22/PT)',
    type: 'discursive',
    difficulty: 'medio',
    prompt: 'A central telefônica de campanha SB-22/PT permite interligar diversos ramais telefônicos no Posto de Comando da Unidade. Cite 2 cuidados que o telefonista de comunicações deve observar na operação da mesa telefônica para evitar queda de ligações prioritárias.',
    totalGaivotas: 2,
    drillTimerSeconds: 35,
    modelAnswer: 'Cuidados na operação da SB-22/PT: 1) Monitorar os ramais de comando com prioridade máxima de tráfego (Comandante e Oficial de Operações S3); 2) Verificar o desabamento das palhetas chamadoras e desengatar prontamente os cordões assim que a conversação for concluída para liberar os circuitos; 3) Manter os bornes e cordões limpos e sem oxidação.',
    criteria: [
      { id: 'crit-gen-sb22-1', description: '1ª Gaivota: Citar prioridade de tráfego para linhas de comando e operações', gaivotas: 1 },
      { id: 'crit-gen-sb22-2', description: '2ª Gaivota: Citar desengate ágil de cordões ou conservação mecânica dos bornes/linhas', gaivotas: 1 },
    ],
  },

  // 9. Lacuna - Rádio VHF PX-2000
  {
    subject: 'Equipamentos Rádio VHF',
    type: 'objective',
    subType: 'fill_in_blank',
    difficulty: 'medio',
    prompt: 'Preencha as lacunas com os dados doutrinários corretos sobre a operação do transceptor tático:',
    blanksSentence: 'O transceptor militar de campanha [ _____ (1) _____ ] opera na faixa de VHF-FM de [ _____ (2) _____ ], permitindo a seleção de canais em passos padronizados.',
    totalGaivotas: 1,
    drillTimerSeconds: 30,
    options: [
      { letter: 'A', text: 'PX-2000 / 30 a 87.975 MHz' },
      { letter: 'B', text: 'PRC-1099 / 1.6 a 29.999 MHz' },
      { letter: 'C', text: 'ERC-320 / 100 a 400 MHz' },
      { letter: 'D', text: 'TRC-300 / 500 a 800 MHz' },
      { letter: 'E', text: 'EB-900 / 12 a 24 GHz' },
    ],
    correctOption: 'A',
    explanation: 'O transceptor tático VHF-FM PX-2000 opera na faixa militar de 30 a 87.975 MHz.',
    modelAnswer: 'PX-2000 / 30 a 87.975 MHz',
    cardDirectFact: {
      frontPrompt: 'Frequência de operação do Rádio PX 2000:',
      backAnswer: '30 a 87.975 MHz (Faixa VHF-FM militar)',
    },
    isReinforcedCoreConcept: true,
  },

  // 10. Situação-Problema / Cenário Operacional
  {
    subject: 'Emprego Tático das Comunicações',
    type: 'objective',
    subType: 'scenario',
    difficulty: 'dificil',
    contextScenario: 'Você é o Sargento Encarregado de Comunicações da 1ª Companhia de Fuzileiros Leve. Sua fração foi desdobrada a 45 km da Base de Operações em um vale cercado por elevações de 900 metros. A ligação em VHF direta está inoperante devido à falta de visada direta (sombra orográfica) e há necessidade urgente de contato com o escalão superior.',
    prompt: 'Considerando a topografia e a distância de 45 km, qual técnica e equipamento rádio militar você deve empregar para restabelecer a comunicação tática?',
    totalGaivotas: 1,
    drillTimerSeconds: 45,
    options: [
      { letter: 'A', text: 'Rádio HF operando na técnica NVIS (incidência quase vertical) com antena dipolo horizontal.' },
      { letter: 'B', text: 'Aumentar a potência do rádio VHF portátil com antena chicote vertical em direção à montanha.' },
      { letter: 'C', text: 'Lançar fio de campanha WD-1/TT por sobre as cristas sem isolamento.' },
      { letter: 'D', text: 'Empregar transceptor UHF em linha de visada apontado para o vale.' },
      { letter: 'E', text: 'Aguardar o período noturno para propagação por onda direta em VHF.' },
    ],
    correctOption: 'A',
    explanation: 'A propagação NVIS (Near Vertical Incidence Skywave) na faixa HF reflete os sinais na ionosfera em ângulos quase verticais (70° a 90°), cobrindo zonas de silêncio e contornando relevos acidentados em distâncias de 0 a 300 km.',
    modelAnswer: 'Rádio HF em modo NVIS com antena dipolo horizontal.',
    cardDirectFact: {
      frontPrompt: 'Melhor técnica rádio para ligar pontos a 45 km em terreno montanhoso sem visada:',
      backAnswer: 'Rádio HF com técnica NVIS (onda celeste vertical) e antena dipolo',
    },
    isReinforcedCoreConcept: true,
  },

  // 11. Relacionar Colunas - Meios e Procedimentos
  {
    subject: 'Sistemas e Meios de Comunicação',
    type: 'objective',
    subType: 'column_match',
    difficulty: 'medio',
    prompt: 'Relacione os meios e procedimentos de comunicações da Coluna I com as características operacionais da Coluna II:',
    columnA: [
      { key: '1', text: 'Meio Fio (WD-1/TT)' },
      { key: '2', text: 'Meio Rádio HF' },
      { key: '3', text: 'Palavra CÂMBIO' },
      { key: '4', text: 'Palavra TERMINADO' },
    ],
    columnB: [
      { key: 'a', text: 'Encerra a transmissão sem esperar qualquer réplica.' },
      { key: 'b', text: 'Alta imunidade à Guerra Eletrônica e escuta à distância.' },
      { key: 'c', text: 'Permite enlaces além do horizonte por reflexão ionosférica.' },
      { key: 'd', text: 'Passa a palavra ao correspondente e aguarda resposta imediata.' },
    ],
    totalGaivotas: 1,
    drillTimerSeconds: 40,
    options: [
      { letter: 'A', text: '4 - 1 - 2 - 3' },
      { letter: 'B', text: '1 - 2 - 3 - 4' },
      { letter: 'C', text: '3 - 2 - 4 - 1' },
      { letter: 'D', text: '2 - 4 - 1 - 3' },
      { letter: 'E', text: '4 - 3 - 2 - 1' },
    ],
    correctOption: 'A',
    explanation: 'Correspondência: (4) Palavra TERMINADO = encerra sem réplica; (1) Meio Fio = alta imunidade; (2) Meio HF = além do horizonte ionosférico; (3) Palavra CÂMBIO = aguarda resposta. Sequência: 4 - 1 - 2 - 3.',
    modelAnswer: 'Sequência correta: 4 - 1 - 2 - 3',
    cardDirectFact: {
      frontPrompt: 'Diferença entre CÂMBIO e TERMINADO em fonia:',
      backAnswer: 'CÂMBIO: aguarda resposta do outro; TERMINADO: encerra a ligação sem réplica',
    },
  },

  // 11b. Relacionar Colunas - Motores e Geradores
  {
    subject: 'Motores e Geradores',
    type: 'objective',
    subType: 'column_match',
    difficulty: 'medio',
    prompt: 'Relacione os dispositivos da Coluna I com suas respectivas funções e conceitos apresentados na Coluna II:',
    columnA: [
      { key: '1', text: 'Gerador Elétrico' },
      { key: '2', text: 'Motor Elétrico' },
      { key: '3', text: 'Estator' },
      { key: '4', text: 'Rotor' },
    ],
    columnB: [
      { key: 'A', text: 'Converte energia elétrica em mecânica.' },
      { key: 'B', text: 'Converte energia mecânica em eletricidade.' },
      { key: 'C', text: 'Haste com barras condutoras que interage com o campo magnético gerando torque.' },
      { key: 'D', text: 'Anel de metal com fendas que prendem bobinas para produzir campo magnético rotativo.' },
    ],
    totalGaivotas: 1,
    drillTimerSeconds: 40,
    options: [
      { letter: 'A', text: '1 - A / 2 - B / 3 - C / 4 - D' },
      { letter: 'B', text: '1 - B / 2 - A / 3 - D / 4 - C' },
      { letter: 'C', text: '1 - B / 2 - C / 3 - A / 4 - D' },
      { letter: 'D', text: '1 - A / 2 - D / 3 - B / 4 - C' },
      { letter: 'E', text: '1 - D / 2 - C / 3 - B / 4 - A' },
    ],
    correctOption: 'B',
    explanation:
      'Gabarito Oficial: Alternativa B (1-B / 2-A / 3-D / 4-C).\n' +
      'Associações oficiais corretas:\n' +
      '1 — B: Gerador Elétrico → Converte energia mecânica em eletricidade.\n' +
      '2 — A: Motor Elétrico → Converte energia elétrica em mecânica.\n' +
      '3 — D: Estator → Anel de metal com fendas que prendem bobinas para produzir campo magnético rotativo.\n' +
      '4 — C: Rotor → Haste com barras condutoras que interage com o campo magnético, gerando torque.',
    modelAnswer: '1-B / 2-A / 3-D / 4-C',
    cardDirectFact: {
      frontPrompt: 'Diferença entre Gerador e Motor Elétrico:',
      backAnswer: 'Gerador converte mecânica em eletricidade (1-B); Motor converte elétrica em mecânica (2-A).',
    },
  },

  // 12. Julgamento Verdadeiro ou Falso
  {
    subject: 'Doutrina de Comunicações e SEGCOM',
    type: 'objective',
    subType: 'true_false',
    difficulty: 'medio',
    prompt: 'Julgue as afirmativas doutrinárias em Verdadeiro (V) ou Falso (F) e assinale a alternativa que traz a sequência correta:',
    tfStatements: [
      { numeral: 'I', statement: 'Cada condutor do fio WD-1/TT é constituído por 4 fios de cobre e 3 fios de aço trançados.' },
      { numeral: 'II', statement: 'Em caso de ameaça de Guerra Eletrônica, é permitido transmitir coordenadas em claro se a mensagem for curta.' },
      { numeral: 'III', statement: 'A antena dipolo de meia-onda para HF deve ser cortada de acordo com o cálculo λ/2 = 142.5 / f(MHz).' },
      { numeral: 'IV', statement: 'A disciplina de luz e som é dispensável na instalação do posto de rádio noturno.' },
    ],
    totalGaivotas: 1,
    drillTimerSeconds: 35,
    options: [
      { letter: 'A', text: 'V - F - V - F' },
      { letter: 'B', text: 'V - V - F - F' },
      { letter: 'C', text: 'F - V - V - F' },
      { letter: 'D', text: 'V - F - F - V' },
      { letter: 'E', text: 'F - F - V - V' },
    ],
    correctOption: 'A',
    explanation: 'I é Verdadeira (4 Cu + 3 Aço); II é Falsa (SEGCOM proíbe terminantemente coordenadas em claro); III é Verdadeira (fórmula padrão de dipolo meia-onda); IV é Falsa (disciplina de luz e som é obrigatória e rigorosa).',
    modelAnswer: 'V - F - V - F',
    cardDirectFact: {
      frontPrompt: 'Fórmula aproximada de comprimento do dipolo meia-onda HF (λ/2):',
      backAnswer: 'Comprimento total (m) = 142.5 / f (MHz)',
    },
  },

  // 13. Identificação de Componente com Esquema Técnico
  {
    subject: 'Componentes do Transceptor PX-2000',
    type: 'objective',
    subType: 'diagram_identification',
    difficulty: 'medio',
    prompt: 'Observe o esquema do painel frontal do transceptor tático PX-2000 apresentado. Qual componente operacional está indicado pelo marcador "D"?',
    diagram: {
      title: 'Painel Frontal do Transceptor PX-2000',
      type: 'radio_panel',
      caption: 'Esquema técnico dos controles, interfaces e conectores de radiofrequência.',
      componentLabels: [
        { code: 'A', name: 'Display Alfanumérico LCD', functionDesc: 'Exibição de canal, frequência e estado da bateria' },
        { code: 'B', name: 'Seletor de Canais e Modos', functionDesc: 'Comutação rápida entre os 8 canais programados' },
        { code: 'C', name: 'Controle Liga/Desliga e Volume', functionDesc: 'Potenciômetro comutador de alimentação' },
        { code: 'D', name: 'Conector de Antena BNC (50 Ω)', functionDesc: 'Saída/entrada de radiofrequência para antena chicote ou cabo coaxial' },
        { code: 'E', name: 'Conector Multivias do Microtelefone', functionDesc: 'Interface para PTT, microfone e fone de ouvido' },
      ],
    },
    totalGaivotas: 1,
    drillTimerSeconds: 30,
    options: [
      { letter: 'A', text: 'Conector coaxial de antena padrão BNC de 50 Ohms.' },
      { letter: 'B', text: 'Display alfanumérico iluminado de cristal líquido.' },
      { letter: 'C', text: 'Chave seletora rotativa de canais predefinidos.' },
      { letter: 'D', text: 'Conector de alimentação externa de 24 Volts CC.' },
      { letter: 'E', text: 'Interruptor de zeramento criptográfico (Zeroize).' },
    ],
    correctOption: 'A',
    explanation: 'O marcador "D" no painel frontal indica o conector de antena coaxial BNC (50 Ω), utilizado para acoplar tanto a antena chicote quanto a descida de cabo coaxial da antena dipolo.',
    modelAnswer: 'Conector coaxial de antena padrão BNC de 50 Ohms.',
    cardDirectFact: {
      frontPrompt: 'Tipo de conector de antena do transceptor militar PX-2000:',
      backAnswer: 'Conector coaxial BNC fêmea de 50 Ohms',
    },
  },
];

/**
 * Rigorously validates and guarantees that every question has a non-empty prompt/body,
 * complete options (for objective, multiple choice, and matching questions), and consistent
 * subtype fields before returning to the UI.
 */
export function validateAndEnsureQuestionIntegrity(q: Question, idx: number = 0): Question {
  const questionNumber = q.number || idx + 1;
  const isObjective = q.type !== 'discursive';

  // 1. Ensure Body/Prompt is present and non-empty
  let prompt = (q.prompt || '').trim();
  let blanksSentence = q.blanksSentence?.trim();
  let columnA = Array.isArray(q.columnA) ? [...q.columnA] : undefined;
  let columnB = Array.isArray(q.columnB) ? [...q.columnB] : undefined;
  let tfStatements = Array.isArray(q.tfStatements) ? [...q.tfStatements] : undefined;
  let subType = q.subType || 'standard';

  // Auto-detect subtype if not explicitly set
  if (!q.subType) {
    if (tfStatements && tfStatements.length >= 3) subType = 'true_false';
    else if (blanksSentence || prompt.includes('_____')) subType = 'fill_in_blank';
    else if (columnA && columnA.length > 0) subType = 'column_match';
    else if (q.contextScenario) subType = 'scenario';
    else subType = 'standard';
  }

  // Fallback prompt if completely blank or omitted
  if (!prompt) {
    const topic = (q.subject || 'Doutrina Militar').replace(/^Bizu\s+/i, '');
    if (subType === 'column_match') {
      prompt = `Relacione os elementos da Coluna I com as características operacionais da Coluna II quanto a ${topic}:`;
    } else if (subType === 'true_false') {
      prompt = `Quanto aos preceitos doutrinários de ${topic}, julgue as afirmativas a seguir em Verdadeiro (V) ou Falso (F) e assinale a sequência correta:`;
    } else if (subType === 'fill_in_blank') {
      prompt = 'Assinale a alternativa que preenche corretamente as lacunas na sequência exata:';
    } else if (q.contextScenario) {
      prompt = 'Com base na situação militar operacional descrita acima, assinale a alternativa correta:';
    } else {
      prompt = `Considerando as normas regulamentares e a doutrina do Exército Brasileiro sobre ${topic}, assinale a alternativa correta:`;
    }
  }

  // 2. Subtype-specific structural guarantees
  if (subType === 'fill_in_blank') {
    if (!blanksSentence) {
      if (prompt.includes('_____')) {
        blanksSentence = prompt;
        prompt = 'Assinale a alternativa que preenche corretamente as lacunas na sequência exata:';
      } else {
        blanksSentence = 'O militar do Exército Brasileiro deve observar rigorosamente a [ _____ (1) _____ ] e pautar sua conduta operacional pela [ _____ (2) _____ ].';
      }
    }
  } else if (subType === 'column_match') {
    // Relationship questions: Ensure Column I and Column II have at least 3-4 valid items with non-empty text
    const hasValidColA = columnA && columnA.length >= 2 && columnA.every((c) => c.text && c.text.trim().length > 0);
    const hasValidColB = columnB && columnB.length >= 2 && columnB.every((c) => c.text && c.text.trim().length > 0);

    if (!hasValidColA || !hasValidColB) {
      const topicLower = `${q.subject || ''} ${prompt}`.toLowerCase();
      if (topicLower.includes('armamento') || topicLower.includes('fuzil') || topicLower.includes('tiro')) {
        columnA = [
          { key: '1', text: 'Revólver .38' },
          { key: '2', text: 'Fuzil 7,62 FAL' },
          { key: '3', text: 'Pistola 9mm Beretta' },
          { key: '4', text: 'Morteiro 81mm' },
        ];
        columnB = [
          { key: 'A', text: 'Funcionamento por ação indireta dos gases com tomada regulável.' },
          { key: 'B', text: 'Princípio motor por força muscular do atirador, funcionamento de repetição.' },
          { key: 'C', text: 'Armamento de tiro curvo com carregamento pelo cano (ante-carga).' },
          { key: 'D', text: 'Princípio motor por curto recuo do cano, tiro semiautomático.' },
        ];
      } else {
        columnA = [
          { key: '1', text: 'Meio Fio de Campanha (WD-1/TT)' },
          { key: '2', text: 'Palavra de Procedimento CÂMBIO' },
          { key: '3', text: 'Palavra de Procedimento TERMINADO' },
          { key: '4', text: 'Processo Disciplinar (FATD)' },
        ];
        columnB = [
          { key: 'A', text: 'Encerra a transmissão própria e aguarda réplica do interlocutor.' },
          { key: 'B', text: 'Composto por 4 fios de cobre e 3 fios de aço para condutibilidade e tração.' },
          { key: 'C', text: 'Encerra a ligação definitivamente sem expectativa de resposta.' },
          { key: 'D', text: 'Prazo legal sumário de 3 dias úteis para apresentação de razões de defesa prévia.' },
        ];
      }
    }
  } else if (subType === 'true_false') {
    const hasValidTf = tfStatements && tfStatements.length >= 4 && tfStatements.every((s) => s.statement && s.statement.trim().length > 0);
    if (!hasValidTf) {
      tfStatements = [
        { numeral: 'I', statement: 'Cada condutor do fio WD-1/TT possui 4 fios de cobre e 3 fios de aço para aliar condutibilidade e tração.' },
        { numeral: 'II', statement: 'É expressamente vedada a transmissão de coordenadas e nomes de comandantes em claro sob ameaça de Guerra Eletrônica.' },
        { numeral: 'III', statement: 'O FAL 7,62 funciona por ação indireta dos gases com tomada regulável no bloco do cilindro de gases.' },
        { numeral: 'IV', statement: 'A disciplina militar consiste no acatamento integral das leis, regulamentos, normas e ordens em vigor.' },
      ];
    }
  }

  // 3. Guarantee Options for any objective, multiple choice, or relation question
  let options = q.options;
  let correctOption = (q.correctOption || 'A').toString().trim().toUpperCase().slice(0, 1) || 'A';
  if (!['A', 'B', 'C', 'D', 'E'].includes(correctOption)) {
    correctOption = 'A';
  }

  if (isObjective) {
    const isOptionsMissingOrIncomplete =
      !Array.isArray(options) ||
      options.length < 4 ||
      options.some((o) => !o.text || !o.text.trim());

    if (isOptionsMissingOrIncomplete) {
      if (subType === 'column_match') {
        options = [
          { letter: 'A', text: '2 – 3 – 1 – 4' },
          { letter: 'B', text: '1 – 4 – 2 – 3' },
          { letter: 'C', text: '3 – 1 – 4 – 2' },
          { letter: 'D', text: '4 – 2 – 3 – 1' },
          { letter: 'E', text: '2 – 1 – 4 – 3' },
        ];
        correctOption = 'A';
      } else if (subType === 'true_false') {
        options = [
          { letter: 'A', text: 'V – F – V – V' },
          { letter: 'B', text: 'F – V – V – F' },
          { letter: 'C', text: 'V – V – F – F' },
          { letter: 'D', text: 'F – F – V – V' },
          { letter: 'E', text: 'V – F – F – V' },
        ];
        correctOption = 'A';
      } else if (subType === 'fill_in_blank') {
        options = [
          { letter: 'A', text: 'a disciplina militar / hierarquia e honra' },
          { letter: 'B', text: 'a hierarquia militar / camaradagem e civismo' },
          { letter: 'C', text: 'o regulamento disciplinar / moral de combate' },
          { letter: 'D', text: 'a cadeia de comando / lealdade operacional' },
          { letter: 'E', text: 'o serviço de guarda / integridade territorial' },
        ];
        correctOption = 'A';
      } else {
        const validModel = q.modelAnswer && q.modelAnswer.trim().length > 3
          ? q.modelAnswer.trim()
          : 'Alternativa A (Conforme preceituam as normas e manuais doutrinários do Exército Brasileiro)';

        options = [
          { letter: 'A', text: validModel },
          { letter: 'B', text: 'Alternativa B (Discrepante em relação aos manuais operacionais do Exército)' },
          { letter: 'C', text: 'Alternativa C (Incompleta quanto aos procedimentos regulamentares vigentes)' },
          { letter: 'D', text: 'Alternativa D (Incorreta segundo a doutrina de emprego militar)' },
          { letter: 'E', text: 'Alternativa E (Inaplicável ao contexto tático apresentado)' },
        ];
        correctOption = 'A';
      }
    } else {
      // Ensure each option has valid uppercase letter and non-empty trimmed text
      const letters: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
      options = (options || []).slice(0, 5).map((opt, oIdx) => ({
        letter: letters[oIdx] || 'A',
        text: opt.text.trim(),
      }));
    }
  } else {
    // Discursive questions do not have options
    options = undefined;
  }

  // 4. Ensure totalGaivotas is correct (strictly 1 for objective questions)
  const totalGaivotas = isObjective
    ? 1
    : (q.criteria && q.criteria.length > 0
        ? q.criteria.reduce((acc, c) => acc + (c.gaivotas || 1), 0)
        : Math.max(1, q.totalGaivotas || 3));

  // 5. Ensure modelAnswer is never empty
  let modelAnswer = (q.modelAnswer || '').trim();
  if (!modelAnswer) {
    if (isObjective && options && options.length > 0) {
      const opt = options.find((o) => o.letter === correctOption) || options[0];
      modelAnswer = `${opt.letter}) ${opt.text}`;
    } else {
      modelAnswer = 'Conforme determinação dos manuais regulamentares do Exército Brasileiro.';
    }
  }

  // 6. Ensure cardDirectFact is present and non-empty
  let cardDirectFact = q.cardDirectFact;
  if (!cardDirectFact || !cardDirectFact.frontPrompt || !cardDirectFact.backAnswer) {
    let front = prompt;
    if (subType === 'fill_in_blank' && blanksSentence) {
      front = `Complete a lacuna: ${blanksSentence}`;
    } else if (prompt.length > 120) {
      const sentences = prompt.split(/[.?!]/).filter((s) => s.trim().length > 10);
      front = sentences[sentences.length - 1]?.trim() || prompt;
    }

    let back = modelAnswer;
    if (isObjective && options && options.length > 0) {
      const opt = options.find((o) => o.letter === correctOption) || options[0];
      back = `${opt.letter}) ${opt.text}`;
    }

    cardDirectFact = {
      frontPrompt: front,
      backAnswer: back,
    };
  }

  return {
    ...q,
    number: questionNumber,
    type: isObjective ? 'objective' : 'discursive',
    subType,
    prompt,
    blanksSentence,
    columnA,
    columnB,
    tfStatements,
    options,
    correctOption: isObjective ? correctOption : undefined,
    totalGaivotas,
    modelAnswer,
    cardDirectFact,
  };
}

/**
 * Generates an arbitrary number of questions for CFST 26/2,
 * balanced between Multiple Choice (objective) and Discursive (gaivotas),
 * rigorously validated before returning to the UI.
 */
export function generateQuestionsForCFST(
  requestedCount: number,
  difficulty: DifficultyLevel = 'medio',
  themeSeed: string = 'CFST 26/2',
  excludePrompts: string[] = [],
  missedQuestions: Question[] = []
): Question[] {
  const count = Math.max(1, requestedCount);
  const questions: Question[] = [];

  const excludeSet = new Set(excludePrompts.map((p) => p.trim().toLowerCase()));

  // 1. Spaced Repetition: If user missed questions earlier, inject up to 30% of them
  let injectedMissedCount = 0;
  if (missedQuestions.length > 0) {
    const maxMissedToInject = Math.min(Math.ceil(count * 0.3), missedQuestions.length);
    const shuffledMissed = [...missedQuestions].sort(() => Math.random() - 0.5);

    for (let m = 0; m < maxMissedToInject; m++) {
      const qMissed = shuffledMissed[m];
      const validatedMissed = validateAndEnsureQuestionIntegrity(
        {
          ...qMissed,
          id: `spaced-rep-q${m + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          number: questions.length + 1,
          subject: `${qMissed.subject} (Reforço Espaçado)`,
        },
        questions.length
      );
      questions.push(validatedMissed);
      injectedMissedCount++;
    }
  }

  // 2. Filter available templates to exclude already seen prompts
  let availableTemplates = BASE_QUESTION_TEMPLATES.filter(
    (t) => !excludeSet.has(t.prompt.trim().toLowerCase())
  );

  // If all were excluded, fall back to all templates shuffled
  if (availableTemplates.length === 0) {
    availableTemplates = [...BASE_QUESTION_TEMPLATES];
  }

  // Shuffle available templates randomly
  const shuffledTemplates = [...availableTemplates].sort(() => Math.random() - 0.5);

  const remainingNeeded = count - injectedMissedCount;

  for (let i = 0; i < remainingNeeded; i++) {
    const templateIndex = i % shuffledTemplates.length;
    const base = shuffledTemplates[templateIndex];
    const cycle = Math.floor(i / shuffledTemplates.length);

    // Make each question unique with clean numbering
    const questionNumber = questions.length + 1;
    const suffix = cycle > 0 ? ` (Sessão #${cycle + 1})` : '';

    const effectiveDifficulty: DifficultyLevel =
      difficulty === 'todos'
        ? ((['facil', 'medio', 'dificil'] as const)[i % 3])
        : (difficulty || base.difficulty);

    const rawQ: Question = {
      id: `q-inédita-${questionNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: questionNumber,
      type: base.type,
      subType: base.subType || 'standard',
      difficulty: effectiveDifficulty,
      subject: `${base.subject}${suffix}`,
      prompt: base.prompt,
      contextScenario: base.contextScenario,
      blanksSentence: base.blanksSentence,
      columnA: base.columnA,
      columnB: base.columnB,
      tfStatements: base.tfStatements,
      diagram: base.diagram,
      cardDirectFact: base.cardDirectFact,
      isReinforcedCoreConcept: base.isReinforcedCoreConcept,
      totalGaivotas: base.totalGaivotas,
      modelAnswer: base.modelAnswer,
      drillTimerSeconds: base.drillTimerSeconds || 35,
      options: base.options,
      correctOption: base.correctOption,
      explanation: base.explanation,
      criteria: base.criteria?.map((c, cIdx) => ({
        id: `crit-q${questionNumber}-${cIdx + 1}`,
        description: c.description,
        gaivotas: c.gaivotas,
      })),
    };

    const validatedQ = validateAndEnsureQuestionIntegrity(rawQ, questions.length);
    questions.push(validatedQ);
  }

  // Final sweep: guarantee every single question in the returned array is 100% valid
  return questions.map((q, idx) => validateAndEnsureQuestionIntegrity(q, idx));
}

