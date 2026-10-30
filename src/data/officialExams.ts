import { Exam } from '../types/exam';

export const OFFICIAL_EXAMS: Exam[] = [
  // =========================================================================
  // MATÉRIA 1: ARMAMENTO, MUNIÇÃO E TIRO
  // =========================================================================
  {
    id: 'oficial-armamento-tiro',
    title: 'Armamento, Munição e Tiro (FAL 7,62 · Pst 9mm · Granadas · IRTAEx)',
    course: 'CFST',
    subject: 'Armamento, Munição e Tiro',
    institution: 'Exército Brasileiro · EB60-ME-14.061 / IRTAEx',
    instructions: 'Caderno oficial com base na Coletânea de Manuais de Armamento, Munição e Tiro do Exército Brasileiro.',
    totalTimeMinutes: 120,
    createdAt: '2026-10-27T10:00:00Z',
    isCustom: false,
    questions: [
      {
        id: 'armt-01',
        number: 1,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Quanto ao princípio motor e ao funcionamento, como é classificado o Fuzil Automático Leve 7,62 M964 (FAL)?',
        options: [
          { letter: 'A', text: 'Força muscular do atirador; funcionamento de repetição em todas as posições do registro de tiro.' },
          { letter: 'B', text: 'Força de expansão dos gases; semi-automático com RTS em "R" e automático com RTS em "A".' },
          { letter: 'C', text: 'Ação direta do ferrolho sem tomada de gases; exclusivamente automático.' },
          { letter: 'D', text: 'Recuo curto do cano; semi-automático com RTS em "S" e repetição em "A".' },
          { letter: 'E', text: 'Força de expansão dos gases; carregamento por antecarga e funcionamento contínuo.' }
        ],
        correctOption: 'B',
        modelAnswer: 'O FAL tem como princípio motor a força de expansão dos gases. Quanto ao funcionamento, é semi-automático quando o RTS estiver em "R" e automático quando o RTS estiver em "A".',
        explanation: 'Conforme o Manual EB60-ME-14.061: Princípio motor = força de expansão dos gases; Funcionamento = semi-automático na posição "R" e automático na posição "A".',
        totalGaivotas: 1
      },
      {
        id: 'armt-02',
        number: 2,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Quais são os dados numéricos oficiais de peso (sem carregador), velocidade teórica de tiro e alcance de utilização sem luneta do FAL 7,62 M964?',
        options: [
          { letter: 'A', text: 'Peso: 4,200 kg; Vel. Teórica: 650 a 700 TPM; Alcance de utilização sem luneta: 600 metros.' },
          { letter: 'B', text: 'Peso: 3,800 kg; Vel. Teórica: 450 a 500 TPM; Alcance de utilização sem luneta: 400 metros.' },
          { letter: 'C', text: 'Peso: 4,500 kg; Vel. Teórica: 800 a 900 TPM; Alcance de utilização sem luneta: 800 metros.' },
          { letter: 'D', text: 'Peso: 4,200 kg; Vel. Teórica: 120 TPM; Alcance de utilização sem luneta: 3.800 metros.' },
          { letter: 'E', text: 'Peso: 5,100 kg; Vel. Teórica: 600 TPM; Alcance de utilização sem luneta: 1.000 metros.' }
        ],
        correctOption: 'A',
        modelAnswer: 'Peso sem carregador: 4,200 kg; Velocidade teórica de tiro: 650 a 700 tiros por minuto (TPM); Alcance de utilização sem luneta: 600 metros (com luneta é 800m; alcance máximo de 3.800m).',
        explanation: 'EB60-ME-14.061: Peso sem carregador = 4,200 kg; Carregador cheio = 0,730 kg; Vel. Teórica = 650 a 700 TPM; Vel. Prática contínua = 120 TPM; Vel. Prática intermitente = 60 TPM; Alcance útil sem luneta = 600m.',
        totalGaivotas: 1
      },
      {
        id: 'armt-03',
        number: 3,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Qual é a sequência rigorosa e obrigatória das quatro Medidas Preliminares para a desmontagem de 1º escalão do FAL 7,62 M964?',
        options: [
          { letter: 'A', text: '1ª Retirar carregador; 2ª Travar a arma; 3ª Inspecionar câmara; 4ª Dois golpes de segurança.' },
          { letter: 'B', text: '1ª Travar a arma (posição "S"); 2ª Retirar o carregador; 3ª Executar dois golpes de segurança; 4ª Inspecionar a câmara.' },
          { letter: 'C', text: '1ª Executar dois golpes de segurança; 2ª Travar; 3ª Retirar o carregador; 4ª Desengatilhar.' },
          { letter: 'D', text: '1ª Travar a arma; 2ª Abrir a caixa da culatra; 3ª Retirar o ferrolho; 4ª Retirar o carregador.' },
          { letter: 'E', text: '1ª Destravar; 2ª Inspecionar a câmara; 3ª Retirar o carregador; 4ª Dois golpes de segurança.' }
        ],
        correctOption: 'B',
        modelAnswer: 'As 4 medidas preliminares na ordem exata são: 1ª Medida: Travar a arma (RTS em "S"); 2ª Medida: Retirar o carregador; 3ª Medida: Executar dois golpes de segurança (com a boca para cima, soltando a alavanca à retaguarda sem conduzi-la); 4ª Medida: Inspecionar a câmara.',
        explanation: 'Item 2.1.1 do manual do FAL: 1ª Travar a arma; 2ª Retirar o carregador; 3ª Executar dois golpes de segurança; 4ª Inspecionar a câmara.',
        totalGaivotas: 1
      },
      {
        id: 'armt-04',
        number: 4,
        type: 'column_match',
        difficulty: 'medio',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Relacione as operações do ciclo de funcionamento do FAL (Coluna I) com o momento em que ocorrem (Coluna II):',
        columnA: [
          { key: '1', text: 'Destrancamento, Abertura, Extração (2ª fase) e Ejeção' },
          { key: '2', text: 'Ação das molas recuperadoras, Carregamento, Fechamento e Trancamento' },
          { key: '3', text: 'Garra do extrator empolga o culote do estojo ao fim do carregamento' },
          { key: '4', text: 'Estojo choca-se com o ejetor e é lançado para cima e para a direita' }
        ],
        columnB: [
          { key: 'A', text: 'Fases que ocorrem durante o Avanço das Peças Móveis' },
          { key: 'B', text: 'Fases que ocorrem durante o Recuo das Peças Móveis' },
          { key: 'C', text: 'Operação de Ejeção' },
          { key: 'D', text: 'Extração de 1ª Fase' }
        ],
        options: [
          { letter: 'A', text: '1-B / 2-A / 3-D / 4-C' },
          { letter: 'B', text: '1-A / 2-B / 3-C / 4-D' },
          { letter: 'C', text: '1-B / 2-A / 3-C / 4-D' },
          { letter: 'D', text: '1-D / 2-C / 3-B / 4-A' },
          { letter: 'E', text: '1-C / 2-D / 3-A / 4-B' }
        ],
        correctOption: 'A',
        modelAnswer: '1-B (Recuo das Peças Móveis), 2-A (Avanço das Peças Móveis), 3-D (Extração 1ª fase dá-se no avanço quando o ferrolho empolga o culote), 4-C (Ejeção dá-se no recuo com o choque no ejetor).',
        explanation: 'Recuo: Destrancamento e abertura, extração 2ª fase, ejeção e apresentação. Avanço: Ação das molas recuperadoras, carregamento e fechamento, extração 1ª fase e trancamento.',
        totalGaivotas: 1
      },
      {
        id: 'armt-05',
        number: 5,
        type: 'true_false',
        difficulty: 'medio',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Julgue os itens a seguir sobre as Pistolas 9mm (IMBEL M973 e Beretta M975) e regras de tiro com Granadas de Bocal:',
        tfStatements: [
          { numeral: 'I', statement: 'A Pistola 9mm IMBEL M973 possui carregador monofilar com capacidade para 8 cartuchos (8+1 na câmara = 9 cartuchos no total).', isTrue: true },
          { numeral: 'II', statement: 'A Pistola 9mm Beretta M975 possui carregador bifilar para 15 cartuchos e seu cano apresenta 6 raias da esquerda para a direita.', isTrue: true },
          { numeral: 'III', statement: 'No lançamento de granadas de bocal com fuzil, a coronha da arma deve ser firmemente apoiada no cavado do ombro do atirador.', isTrue: false },
          { numeral: 'IV', statement: 'No tiro com granadas de bocal M2 e M3, é expressamente proibido o uso de munição comum M1 ou de festim, devendo ser utilizado exclusivamente o cartucho de lançamento sem projétil com vedação em rosácea/cera.', isTrue: true }
        ],
        options: [
          { letter: 'A', text: 'V – V – F – V' },
          { letter: 'B', text: 'V – F – V – F' },
          { letter: 'C', text: 'F – V – F – V' },
          { letter: 'D', text: 'V – V – V – F' },
          { letter: 'E', text: 'F – F – V – V' }
        ],
        correctOption: 'A',
        modelAnswer: 'V – V – F – V. O item III é FALSO porque a coronha NUNCA deve ser apoiada no ombro no lançamento de granada de bocal (deve ser posicionada sob a axila da mão que atira, para evitar luxação/fratura grave da clavícula).',
        explanation: 'Manual de Granadas de Bocal: coronha sob a axila; nunca apoiar no ombro. Munição M1 causaria explosão e acidente fatal com granadas M2/M3.',
        totalGaivotas: 1
      },
      {
        id: 'armt-06',
        number: 6,
        type: 'fill_in_blank',
        difficulty: 'medio',
        subject: 'Armamento, Munição e Tiro',
        prompt: 'Complete as lacunas sobre os Módulos de Tiro (IRTAEx EB70-IR-01.002):',
        blanksSentence: 'A Instrução Preparatória para o Tiro (IPT) possui quatro oficinas fundamentais: Pontaria, Posições de Tiro, Conduta com o Armamento e [ _____ (1) _____ ]. O teste que verifica as condições psicomotoras antes do primeiro tiro real (TIB) é o [ _____ (2) _____ ], no qual o atirador na oficina de pontaria deve obter um triângulo inscritível em um círculo de [ _____ (3) _____ ] cm de diâmetro.',
        options: [
          { letter: 'A', text: '(1) Acionamento do Gatilho · (2) TIP (Teste da Instrução Preparatória) · (3) 1' },
          { letter: 'B', text: '(1) Tiro Noturno · (2) TIA (Tiro de Instrução Avançado) · (3) 3' },
          { letter: 'C', text: '(1) Desmontagem de 2º escalão · (2) TAT (Teste de Aptidão de Tiro) · (3) 5' },
          { letter: 'D', text: '(1) Acionamento do Gatilho · (2) TCA (Tiro de Combate Avançado) · (3) 2' },
          { letter: 'E', text: '(1) Manutenção de 3º escalão · (2) TIP · (3) 4' }
        ],
        correctOption: 'A',
        modelAnswer: '(1) Acionamento do Gatilho · (2) TIP (Teste da Instrução Preparatória) · (3) 1 cm de diâmetro.',
        explanation: 'IRTAEx e C 23-1: As 4 oficinas da IPT são Pontaria, Posições de Tiro, Conduta com o Armamento e Acionamento do Gatilho (com estojo de 9mm equilibrado). O TIP é o teste prévio e a constância da pontaria exige triângulo inscritível em círculo de 1 cm.',
        totalGaivotas: 1
      }
    ]
  },

  // =========================================================================
  // MATÉRIA 2: EXPLORAÇÃO DAS COMUNICAÇÕES MILITARES
  // =========================================================================
  {
    id: 'oficial-exploracao-comunicacoes',
    title: 'Exploração das Comunicações (Meios de Comunicações Militares)',
    course: 'CFST',
    subject: 'Exploração das Comunicações',
    institution: 'Batalhão Escola de Comunicações (BEsCom) · 3º Sgt Klaus',
    instructions: 'Caderno oficial com base na instrução de Meios Existentes de Comunicações Militares do BEsCom.',
    totalTimeMinutes: 90,
    createdAt: '2026-10-27T10:00:00Z',
    isCustom: false,
    questions: [
      {
        id: 'com-01',
        number: 1,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Exploração das Comunicações',
        prompt: 'De acordo com a doutrina de comunicações militares, quais são os cinco principais meios existentes de comunicações no escalão tático e estratégico?',
        options: [
          { letter: 'A', text: 'Rádio Militar; Comunicação por Fio; Telefonia Móvel Comercial; Comunicação por Satélite (SATCOM); Internet e Redes Ciber-Militares (EBNET).' },
          { letter: 'B', text: 'Apenas Rádio VHF; Rádio HF; Satélite Comercial; Cabo Submarino; Telegrafia Morse.' },
          { letter: 'C', text: 'Telefonia Tática de Campanha; Pombos-correio; Sinalização com bandeiras; Rádio UHF; Internet pública.' },
          { letter: 'D', text: 'Redes Sociais; WhatsApp Militar; Rádio FM comercial; Walkie-talkie; E-mail corporativo.' },
          { letter: 'E', text: 'Rádio Militar; Linhas telefônicas discadas; Rádio Cidadão (PX); TV Digital; Radar.' }
        ],
        correctOption: 'A',
        modelAnswer: 'Os 5 meios são: Rádio Militar (VHF, UHF, HF); Comunicação por Fio (Telefonia Tática de Campanha e Fibra Óptica); Telefonia Móvel (Redes Celulares Comerciais); Comunicação por Satélite (SATCOM / Constelações LEO); Internet e Redes Ciber-Militares (EBNET).',
        explanation: 'Slide 2 da apresentação do BEsCom (3º Sgt Klaus): A: Rádio Militar, B: Comunicação por Fio, C: Telefonia Móvel, D: Satélite (SATCOM), E: Internet e Redes Ciber-Militares (EBNET).',
        totalGaivotas: 1
      },
      {
        id: 'com-02',
        number: 2,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Exploração das Comunicações',
        prompt: 'Por que o emprego de aparelhos celulares civis (telefonia móvel comercial) é objeto de PROIBIÇÃO ABSOLUTA nas linhas de frente de combate?',
        options: [
          { letter: 'A', text: 'Porque as baterias de lítio se descarregam rapidamente no clima frio de campanha.' },
          { letter: 'B', text: 'Porque a conexão contínua às torres emite metadados que permitem ao inimigo rastrear o adensamento de tropas e guiar ataques de artilharia e mísseis.' },
          { letter: 'C', text: 'Porque os celulares civis operam exclusivamente em frequências não autorizadas pela ANATEL.' },
          { letter: 'D', text: 'Porque os aplicativos de mensagens não suportam transmissão de voz em alta definição.' },
          { letter: 'E', text: 'Porque os sinais 4G/5G queimam os circuitos dos rádios transceptores militares próximos.' }
        ],
        correctOption: 'B',
        modelAnswer: 'Risco Extremo de Segurança: Telefones celulares conectam-se constantemente às torres locais. O inimigo intercepta chamadas, lê mensagens e identifica o adensamento de sinal para guiar alvos de mísseis de precisão. Por isso a proibição é absoluta na linha de frente.',
        explanation: 'Slides 15 e 16: "Proibição Absoluta em Linhas de Frente: Proibido levar ou ligar aparelhos celulares civis perto do combate, pois os metadados das antenas revelam o posicionamento exato da unidade. Modo avião é insuficiente (remover baterias)."',
        totalGaivotas: 1
      },
      {
        id: 'com-03',
        number: 3,
        type: 'column_match',
        difficulty: 'medio',
        subject: 'Exploração das Comunicações',
        prompt: 'Relacione os meios de comunicação militar (Coluna I) com suas respectivas principais vantagens e características táticas (Coluna II):',
        columnA: [
          { key: '1', text: 'Rádio Militar (VHF, UHF, HF)' },
          { key: '2', text: 'Comunicação por Fio e Fibra Óptica' },
          { key: '3', text: 'Comunicação por Satélite (SATCOM / LEO)' },
          { key: '4', text: 'Redes Ciber-Militares (EBNET)' }
        ],
        columnB: [
          { key: 'A', text: 'Imunidade ao Jamming e garantia de Silêncio de Rádio por não emitir ondas no ar' },
          { key: 'B', text: 'Espinha dorsal tática de infantaria, imediato, portátil e resistente fisicamente' },
          { key: 'C', text: 'Consciência situacional total conectando sensores, drones e dados táticos ao C2' },
          { key: 'D', text: 'Alcance global e independência do terreno inimigo em solo' }
        ],
        options: [
          { letter: 'A', text: '1-B / 2-A / 3-D / 4-C' },
          { letter: 'B', text: '1-A / 2-B / 3-C / 4-D' },
          { letter: 'C', text: '1-B / 2-D / 3-A / 4-C' },
          { letter: 'D', text: '1-C / 2-A / 3-D / 4-B' },
          { letter: 'E', text: '1-D / 2-C / 3-B / 4-A' }
        ],
        correctOption: 'A',
        modelAnswer: '1-B (Rádio: espinha dorsal tática imediata); 2-A (Fio: imunidade a jamming e silêncio de rádio); 3-D (SATCOM: alcance global sem depender do terreno); 4-C (EBNET: consciência situacional total em tempo real).',
        explanation: 'Conforme detalhado nos slides 4, 9, 19 e 24 do BEsCom.',
        totalGaivotas: 1
      },
      {
        id: 'com-04',
        number: 4,
        type: 'true_false',
        difficulty: 'medio',
        subject: 'Exploração das Comunicações',
        prompt: 'Julgue as afirmativas em Verdadeiro (V) ou Falso (F) quanto às restrições e alternativas de escoamento de mensagens:',
        tfStatements: [
          { numeral: 'I', statement: 'O Silêncio de Rádio consiste na proibição total de transmissões para impedir que a Guerra Eletrônica inimiga detecte e triangule a posição da tropa.', isTrue: true },
          { numeral: 'II', statement: 'Nas linhas telefônicas de campanha com fios de cobre simples, é permitido transmitir livremente coordenadas de alvos em claro sem criptografia.', isTrue: false },
          { numeral: 'III', statement: 'A técnica de "Burst Transmission" consiste em manter transmissões ultra-curtas com a menor potência possível para cobrir apenas a distância necessária.', isTrue: true },
          { numeral: 'IV', statement: 'Redes estratégicas do Estado-Maior na EBNET devem manter desconexão física obrigatória (air gap) em relação à internet pública comercial.', isTrue: true }
        ],
        options: [
          { letter: 'A', text: 'V – F – V – V' },
          { letter: 'B', text: 'V – V – F – F' },
          { letter: 'C', text: 'F – V – V – V' },
          { letter: 'D', text: 'V – F – F – V' },
          { letter: 'E', text: 'F – F – V – V' }
        ],
        correctOption: 'A',
        modelAnswer: 'V – F – V – V. O item II é FALSO: É terminantemente proibido passar coordenadas precisas em linhas de fio de cobre sem criptografia, pois o inimigo pode utilizar grampos de indução eletromagnética (tapping) sem cortar o cabo.',
        explanation: 'Slide 11: "Proibição de Conversa sem Criptografia: Proibido passar coordenadas precisas de alvos em linhas de fios de cobre simples, pois o inimigo pode usar grampos de indução (tapping) sem precisar cortar o cabo."',
        totalGaivotas: 1
      }
    ]
  },

  // =========================================================================
  // MATÉRIA 3: EXPLORAÇÃO EM RADIOTELEFONIA (MANUAL C 24-9)
  // =========================================================================
  {
    id: 'oficial-radiotelefonia-c249',
    title: 'Exploração em Radiotelefonia (Manual C 24-9 · Tráfego Rádio)',
    course: 'CFST',
    subject: 'Radiotelefonia Militar (C 24-9)',
    institution: 'Estado-Maior do Exército · Manual C 24-9',
    instructions: 'Caderno oficial com base na Instrução Técnica de Exploração em Radiotelefonia e fonética militar da Força Terrestre.',
    totalTimeMinutes: 90,
    createdAt: '2026-10-27T10:00:00Z',
    isCustom: false,
    questions: [
      {
        id: 'rad-01',
        number: 1,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Radiotelefonia Militar (C 24-9)',
        prompt: 'Qual é o Tripé das Comunicações Militares segundo o Manual de Campanha C 24-9?',
        options: [
          { letter: 'A', text: 'Velocidade, Volume e Potência.' },
          { letter: 'B', text: 'Rapidez, Clareza e Segurança.' },
          { letter: 'C', text: 'Criptografia, Frequência e Antena.' },
          { letter: 'D', text: 'Disciplina, Hierarquia e Camuflagem.' },
          { letter: 'E', text: 'Alcance, Modulação e Repetição.' }
        ],
        correctOption: 'B',
        modelAnswer: 'O Tripé das Comunicações Militares é composto por: Rapidez (o rádio é o meio mais rápido de desdobramento tático), Clareza (mensagens ambíguas geram baixas amigas) e Segurança (proteção vital contra Guerra Eletrônica).',
        explanation: 'Slide 2: "Tripé das Comunicações: Rapidez, Clareza e Segurança. A radiotelefonia (voz) é a forma de comunicação com maior vulnerabilidade à GE inimiga."',
        totalGaivotas: 1
      },
      {
        id: 'rad-02',
        number: 2,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Radiotelefonia Militar (C 24-9)',
        prompt: 'Na Numeração Fonética Militar (Padrão Força Terrestre), qual é a pronúncia regulamentar estrita para os números 6, 9 e 0?',
        options: [
          { letter: 'A', text: '6 = SEIS; 9 = NOVE; 0 = ZERO.' },
          { letter: 'B', text: '6 = MÊI-A; 9 = NÓ-VÊ (tônico); 0 = ZÉ-RÔ (tônico).' },
          { letter: 'C', text: '6 = MEIA-DÚZIA; 9 = NONA; 0 = NULO.' },
          { letter: 'D', text: '6 = MÊI-A; 9 = NO-VE; 0 = CI-FRA.' },
          { letter: 'E', text: '6 = SEIS; 9 = NOVE; 0 = NE-GA-TI-VO.' }
        ],
        correctOption: 'B',
        modelAnswer: 'No padrão EB: 6 é falado estritamente como "MÊI-A" (proibido falar Seis ou Meia-Dúzia); 9 é pronunciado "NÓ-VÊ" (com ênfase tônica aberta); e 0 é pronunciado "ZÉ-RÔ" (tônico).',
        explanation: 'Slide 5: "Numeração Fonética Militar: 1 U-NO, 2 DÔ-IS, 3 TRÊS, 4 QUA-TRO, 5 CIN-CO, 6 MÊI-A, 7 SÉ-TÊ, 8 ÔI-TO, 9 NÓ-VÊ, 0 ZÉ-RÔ. Proibido dizer Seis ou Meia-Dúzia."',
        totalGaivotas: 1
      },
      {
        id: 'rad-03',
        number: 3,
        type: 'column_match',
        difficulty: 'facil',
        subject: 'Radiotelefonia Militar (C 24-9)',
        prompt: 'Relacione as Expressões Convencionais de Serviço (Coluna I) com seus respectivos significados regulamentares (Coluna II):',
        columnA: [
          { key: '1', text: 'CÂMBIO' },
          { key: '2', text: 'APAGO' },
          { key: '3', text: 'CORREÇÃO' },
          { key: '4', text: 'SILÊNCIO (repetido 3 vezes)' }
        ],
        columnB: [
          { key: 'A', text: 'Fim da transmissão. Não espero resposta.' },
          { key: 'B', text: 'Fim da transmissão. Espero resposta.' },
          { key: 'C', text: 'Cessar imediatamente todas as transmissões na rede (prioridade máxima).' },
          { key: 'D', text: 'Houve um erro na transmissão. Continuarei a partir da última palavra correta.' }
        ],
        options: [
          { letter: 'A', text: '1-B / 2-A / 3-D / 4-C' },
          { letter: 'B', text: '1-A / 2-B / 3-C / 4-D' },
          { letter: 'C', text: '1-B / 2-C / 3-A / 4-D' },
          { letter: 'D', text: '1-D / 2-A / 3-B / 4-C' },
          { letter: 'E', text: '1-C / 2-D / 3-A / 4-B' }
        ],
        correctOption: 'A',
        modelAnswer: '1-B (CÂMBIO: fim da transmissão, espero resposta); 2-A (APAGO: fim da transmissão, não espero resposta); 3-D (CORREÇÃO: erro, retoma da última correta); 4-C (SILÊNCIO SILÊNCIO SILÊNCIO: cessação imediata de tráfego).',
        explanation: 'Slide 7 do manual C 24-9: Expressões Convencionais de Serviço. Nunca utilizar "Câmbio final", "Positivo" ou "Obrigado".',
        totalGaivotas: 1
      },
      {
        id: 'rad-04',
        number: 4,
        type: 'true_false',
        difficulty: 'medio',
        subject: 'Radiotelefonia Militar (C 24-9)',
        prompt: 'Julgue os itens quanto às normas disciplinares de tráfego rádio e engajamento na pista de fonia:',
        tfStatements: [
          { numeral: 'I', statement: 'Durante o procedimento de autenticação no rádio, a expressão SOLETRANDO é dispensada.', isTrue: true },
          { numeral: 'II', statement: 'Expressões como "Câmbio final", "Positivo", "QSL" (em fonia clara) e "Obrigado" são autorizadas para agilizar a cortesia entre operadores militares.', isTrue: false },
          { numeral: 'III', statement: 'Na transmissão de numerais inteiros após a palavra "NUMERAL", os algarismos são anunciados um a um, exceto "MIL" e "MILHÃO".', isTrue: true },
          { numeral: 'IV', statement: 'Ao acionar o botão PTT (Push-To-Talk), o operador deve aguardar 1 segundo antes de falar e manter a transmissão por no máximo 20 segundos para evitar corte e superaquecimento/triangulação.', isTrue: true }
        ],
        options: [
          { letter: 'A', text: 'V – F – V – V' },
          { letter: 'B', text: 'V – V – F – F' },
          { letter: 'C', text: 'F – F – V – V' },
          { letter: 'D', text: 'V – F – F – V' },
          { letter: 'E', text: 'F – V – V – F' }
        ],
        correctOption: 'A',
        modelAnswer: 'V – F – V – V. O item II é FALSO: O rádio militar não é telefone civil. É terminantemente proibido o uso de gírias, "Câmbio final", "Positivo", "QSL" ou agradecimentos como "Obrigado" (falta grave com eliminação na ficha do instrutor).',
        explanation: 'Slides 7, 9, 11 e 15 da Instrução Técnica C 24-9.',
        totalGaivotas: 1
      }
    ]
  },

  // =========================================================================
  // MATÉRIA 4: SISTEMA RÁDIO DIGITAL TRONCALIZADO (SRDT)
  // =========================================================================
  {
    id: 'oficial-srdt-apx2000',
    title: 'Sistema Rádio Digital Troncalizado (SRDT · APX 2000 / APX 2500)',
    course: 'CFST',
    subject: 'Rádios Digitais Troncalizados (SRDT)',
    institution: 'Escola Coronel Higyno Corsetti (EsCom) · CCOMGEX',
    instructions: 'Caderno oficial com base no manual de programação e operação dos rádios APX 2000, SRX 1200 e APX 2500 da EsCom.',
    totalTimeMinutes: 100,
    createdAt: '2026-10-27T10:00:00Z',
    isCustom: false,
    questions: [
      {
        id: 'srdt-01',
        number: 1,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Rádios Digitais Troncalizados (SRDT)',
        prompt: 'Quais são as características técnicas nominais de potência de transmissão do rádio portátil APX 2000/SRX 1200 e do rádio móvel APX 2500?',
        options: [
          { letter: 'A', text: 'APX 2000 (Portátil): 3 Watts (1 a 3,3 W); APX 2500 (Móvel): 35 Watts.' },
          { letter: 'B', text: 'APX 2000 (Portátil): 10 Watts; APX 2500 (Móvel): 100 Watts.' },
          { letter: 'C', text: 'APX 2000 (Portátil): 0,5 Watts; APX 2500 (Móvel): 15 Watts.' },
          { letter: 'D', text: 'APX 2000 (Portátil): 35 Watts; APX 2500 (Móvel): 3 Watts.' },
          { letter: 'E', text: 'APX 2000 (Portátil): 5 Watts; APX 2500 (Móvel): 50 Watts.' }
        ],
        correctOption: 'A',
        modelAnswer: 'Rádio portátil APX 2000 / SRX 1200: potência de 1 a 3,3 W (nominal 3 W). Rádio móvel APX 2500 / XTL 2500: potência de 35 W.',
        explanation: 'Slides 13, 30, 31, 32 e 34 do manual da EsCom.',
        totalGaivotas: 1
      },
      {
        id: 'srdt-02',
        number: 2,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Rádios Digitais Troncalizados (SRDT)',
        prompt: 'No Sistema Rádio Digital Troncalizado (SRDT), como se dá o funcionamento e qual é a principal regra de tráfego da Chamada Privativa?',
        options: [
          { letter: 'A', text: 'A conversa inicia-se imediatamente ao pressionar o botão laranja de emergência.' },
          { letter: 'B', text: 'O remetente e destinatário devem estar na mesma rede; o remetente só fala após o destinatário aceitar e pressionar o PTT; e ela ocupa um canal durante todo o tempo aberta.' },
          { letter: 'C', text: 'A chamada privativa nunca ocupa canais de voz, trafegando exclusivamente por mensagens SMS curtas via satélite.' },
          { letter: 'D', text: 'O destinatário não precisa aceitar a chamada, sendo o áudio transmitido em viva-voz imediato para toda a rede.' },
          { letter: 'E', text: 'A chamada privativa é encerrada automaticamente após 5 segundos de silêncio pelo sistema repetidor.' }
        ],
        correctOption: 'B',
        modelAnswer: 'Na Chamada Privativa: 1) Remetente e destinatário devem estar na mesma rede; 2) O destinatário deve aceitar a chamada no rádio; 3) O remetente só poderá falar após o destinatário pressionar o PTT; 4) Ela ocupa o canal durante todo o tempo que estiver aberta, devendo ser encerrada via menu.',
        explanation: 'Slide 141 da EsCom: "Chamada Privativa ocupa o canal durante todo o tempo que estiver aberta, mesmo que nenhum usuário esteja transmitindo. O remetente só fala após o destinatário pressionar o PTT."',
        totalGaivotas: 1
      },
      {
        id: 'srdt-03',
        number: 3,
        type: 'true_false',
        difficulty: 'medio',
        subject: 'Rádios Digitais Troncalizados (SRDT)',
        prompt: 'Julgue as afirmativas sobre a configuração, operação e transporte dos rádios APX 2000:',
        tfStatements: [
          { numeral: 'I', statement: 'O "Codeplug" é o conjunto de dados armazenado na memória do rádio que pode ser lido e programado através do software APX CPS.', isTrue: true },
          { numeral: 'II', statement: 'Rádios programados com uma versão mais recente do CPS podem ser reprogramados livremente com versões anteriores do software.', isTrue: false },
          { numeral: 'III', statement: 'Na função GPS do rádio, o ícone de satélite em formato de "X" de forma contínua indica que o GPS está ligado e o sinal foi adquirido.', isTrue: true },
          { numeral: 'IV', statement: 'Ao transportar o rádio, convém retirar a antena e a bateria para evitar danos e impedir que o rádio seja ligado acidentalmente, não devendo ser conduzido no quadril.', isTrue: true }
        ],
        options: [
          { letter: 'A', text: 'V – F – V – V' },
          { letter: 'B', text: 'V – V – F – F' },
          { letter: 'C', text: 'F – V – V – V' },
          { letter: 'D', text: 'V – F – F – V' },
          { letter: 'E', text: 'F – F – V – V' }
        ],
        correctOption: 'A',
        modelAnswer: 'V – F – V – V. O item II é FALSO: Os rádios que forem programados com determinada versão do software CPS NÃO podem ser reprogramados com versões anteriores do software.',
        explanation: 'Slide 37: "OBS: Os rádios que forem programados com determinada versão não podem ser reprogramados com versões anteriores do software." Slide 143 (GPS: ícone contínuo = sinal adquirido), Slide 144 (Transporte e condução).',
        totalGaivotas: 1
      },
      {
        id: 'srdt-04',
        number: 4,
        type: 'column_match',
        difficulty: 'medio',
        subject: 'Rádios Digitais Troncalizados (SRDT)',
        prompt: 'Relacione os conceitos do sistema APX / SRDT (Coluna I) com suas respectivas definições (Coluna II):',
        columnA: [
          { key: '1', text: 'Comunicação Simplex (Ponto a Ponto)' },
          { key: '2', text: 'Comunicação Half-Duplex (Repetidora)' },
          { key: '3', text: 'Operação Talk Around' },
          { key: '4', text: 'UNS (Unified Network Services)' }
        ],
        columnB: [
          { key: 'A', text: 'Frequência de Transmissão igual à de Recepção (T1 = R1) sem uso de repetidor' },
          { key: 'B', text: 'Utilização de par de frequências distintas (Tx1/Rx2 e Tx2/Rx1) com estação repetidora' },
          { key: 'C', text: 'Utiliza um rádio como ponto de passagem para outro que está fora da área de cobertura' },
          { key: 'D', text: 'Interface de geoposicionamento dos rádios SRDT com os Sistemas de Apoio à Decisão (SAD PACIFICADOR) via EBNET' }
        ],
        options: [
          { letter: 'A', text: '1-A / 2-B / 3-C / 4-D' },
          { letter: 'B', text: '1-B / 2-A / 3-D / 4-C' },
          { letter: 'C', text: '1-A / 2-C / 3-B / 4-D' },
          { letter: 'D', text: '1-D / 2-B / 3-C / 4-A' },
          { letter: 'E', text: '1-C / 2-D / 3-A / 4-B' }
        ],
        correctOption: 'A',
        modelAnswer: '1-A (Simplex: T1 = R1); 2-B (Half-Duplex com repetidora); 3-C (Talk Around: passagem para rádio fora de cobertura); 4-D (UNS: interface de geolocalização com SAD PACIFICADOR).',
        explanation: 'Slides 7, 8, 10 e 20 da apresentação da EsCom.',
        totalGaivotas: 1
      }
    ]
  },

  // =========================================================================
  // MATÉRIA 5: LIDERANÇA MILITAR
  // =========================================================================
  {
    id: 'oficial-lideranca-militar',
    title: 'Liderança Militar (CFST · Manual C 20-10 · Ética e Conduta)',
    course: 'CFST',
    subject: 'Liderança Militar',
    institution: 'Curso de Formação de Sargento Temporário (CFST) · Manual C 20-10',
    instructions: 'Caderno oficial com base na disciplina de Liderança Militar do CFST e preceitos da Ética Militar.',
    totalTimeMinutes: 80,
    createdAt: '2026-10-27T10:00:00Z',
    isCustom: false,
    questions: [
      {
        id: 'lid-01',
        number: 1,
        type: 'objective',
        difficulty: 'facil',
        subject: 'Liderança Militar',
        prompt: 'Conforme a doutrina militar do Exército Brasileiro (Manual C 20-10), quais são as Três Servidões Indelegáveis do líder militar?',
        options: [
          { letter: 'A', text: 'Comandar, punir e fiscalizar.' },
          { letter: 'B', text: 'Decidir, Fazer justiça e Dar o exemplo.' },
          { letter: 'C', text: 'Instruir, motivar e planejar.' },
          { letter: 'D', text: 'Vigiar, delegar e inspecionar.' },
          { letter: 'E', text: 'Ordenar, controlar e avaliar.' }
        ],
        correctOption: 'B',
        modelAnswer: 'As Três Servidões Indelegáveis são: 1. Decidir (tomar decisões rápidas e firmes sob pressão); 2. Fazer justiça (tratar subordinados com equidade e respeito às normas); 3. Dar o exemplo (servir de espelho moral para a tropa).',
        explanation: 'Slide 9 do CFST: "As Três Servidões Indelegáveis do Líder: 1. Decidir; 2. Fazer justiça; 3. Dar o exemplo ("A palavra convence, o exemplo arrasta")."',
        totalGaivotas: 1
      },
      {
        id: 'lid-02',
        number: 2,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Liderança Militar',
        prompt: 'Qual é a distinção conceitual e filosófica entre "Ética" e "Moral" apresentada na formação de líderes do Exército Brasileiro?',
        options: [
          { letter: 'A', text: 'Ética é um conjunto de leis civis punitivas, enquanto Moral refere-se exclusivamente a dogmas religiosos.' },
          { letter: 'B', text: 'A Moral (do latim Mores) é normativa e prática, consistindo no conjunto de regras de conduta do grupo social; enquanto a Ética (do grego Ethos) é a ciência e teoria reflexiva permanente sobre o bem e a justiça que estuda o comportamento moral.' },
          { letter: 'C', text: 'A Moral é científica e teórica, enquanto a Ética é passageira e muda a cada missão militar.' },
          { letter: 'D', text: 'Não existe qualquer distinção entre os termos na doutrina das Forças Armadas.' },
          { letter: 'E', text: 'Ética aplica-se apenas aos oficiais generais, enquanto a Moral regula as praças.' }
        ],
        correctOption: 'B',
        modelAnswer: 'Moral (Mores): Conjunto de normas, princípios, costumes e regras práticas de conduta no grupo social (caráter normativo). Ética (Ethos): Teoria, ciência ou reflexão crítica do comportamento moral, com caráter permanente.',
        explanation: 'Slide 7 do CFST: Ética (grego Ethos, modo de ser, ciência reflexiva sobre o bem e a justiça) versus Moral (latim Mores, costumes, regras práticas de conduta adquiridas por hábito na convivência).',
        totalGaivotas: 1
      },
      {
        id: 'lid-03',
        number: 3,
        type: 'column_match',
        difficulty: 'facil',
        subject: 'Liderança Militar',
        prompt: 'Relacione os tipos de liderança (Coluna I) com suas respectivas características (Coluna II):',
        columnA: [
          { key: '1', text: 'Liderança Autocrática' },
          { key: '2', text: 'Liderança Participativa' },
          { key: '3', text: 'Liderança Coaching' },
          { key: '4', text: 'Liderança Liberal' }
        ],
        columnB: [
          { key: 'A', text: 'Cria ambiente onde as decisões são compartilhadas e as opiniões dos subordinados são levadas em consideração' },
          { key: 'B', text: 'Decisões centralizadas no líder sem participação, costuma oprimir e não valoriza competências' },
          { key: 'C', text: 'Colaboradores têm ampla liberdade com mínima interferência direta das lideranças' },
          { key: 'D', text: 'Competências são estimuladas, projetos conduzidos em parceria e habilidades desenvolvidas' }
        ],
        options: [
          { letter: 'A', text: '1-B / 2-A / 3-D / 4-C' },
          { letter: 'B', text: '1-A / 2-B / 3-C / 4-D' },
          { letter: 'C', text: '1-B / 2-D / 3-A / 4-C' },
          { letter: 'D', text: '1-C / 2-A / 3-D / 4-B' },
          { letter: 'E', text: '1-D / 2-C / 3-B / 4-A' }
        ],
        correctOption: 'A',
        modelAnswer: '1-B (Autocrática: centralizada e opressiva); 2-A (Participativa: decisões compartilhadas); 3-D (Coaching: parceria e desenvolvimento de competências); 4-C (Liberal: liberdade para agir com pouca interferência).',
        explanation: 'Slides 12 e 13 da instrução de Liderança do CFST.',
        totalGaivotas: 1
      },
      {
        id: 'lid-04',
        number: 4,
        type: 'objective',
        difficulty: 'medio',
        subject: 'Liderança Militar',
        prompt: 'Quais são os seis vícios capitais da liderança militar elencados na doutrina do CFST?',
        options: [
          { letter: 'A', text: 'O Medo, A Frouxidão, A Indolência, A Hesitação, O Desleixo e A Negligência.' },
          { letter: 'B', text: 'A Hipocrisia, A Vaidade, A Ambição, O Sadismo, O Sarcasmo e O Bom-Modismo.' },
          { letter: 'C', text: 'A Rigidez, O Centralismo, A Severidade, O Formalismo, O Distanciamento e A Friaza.' },
          { letter: 'D', text: 'A Inveja, O Egoísmo, O Desespero, A Desobediência, A Ira e O Vencimento.' },
          { letter: 'E', text: 'A Autonomia, A Franqueza, A Firmeza, A Tolerância, O Exemplo e A Justiça.' }
        ],
        correctOption: 'B',
        modelAnswer: 'Os seis vícios da liderança são: A Hipocrisia, A Vaidade, A Ambição, O Sadismo, O Sarcasmo e O Bom-Modismo.',
        explanation: 'Slide 17 do CFST: "Os Seis Vícios da Liderança: A Hipocrisia; A Vaidade; A Ambição; O Sadismo e o Sarcasmo; O Bom-Modismo."',
        totalGaivotas: 1
      }
    ]
  }
];
