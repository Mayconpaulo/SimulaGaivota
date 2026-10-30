import { Option } from '../types/exam';

export const isGibberishOrDummy = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (trimmed.length === 0) return true;

  // Rejects sequences composed ONLY of letters A-E, spaces, and punctuation
  const lettersOnly = trimmed.replace(/[\s,;–\-\.\/\(\)\[\]]+/g, '');
  if (/^[A-E]+$/i.test(lettersOnly) && lettersOnly.length <= 8) {
    return true;
  }

  // Rejects "Alternativa A", "Opção B", "Alternativa B (Discrepante...)", etc.
  if (/^(alternativa|op[çc][ãa]o|letra)\s+[A-E]/i.test(trimmed)) {
    return true;
  }

  return false;
};

export const getContextualOptions = (
  prompt: string = '',
  subject: string = '',
  subType: string = 'standard',
  modelAnswer?: string,
  existingOptions?: Option[]
): Option[] => {
  // If existing options are healthy and non-dummy, preserve them
  if (
    Array.isArray(existingOptions) &&
    existingOptions.length >= 4 &&
    existingOptions.every((o) => o && o.text && !isGibberishOrDummy(o.text))
  ) {
    // Fill up to 5 if only 4
    if (existingOptions.length === 4) {
      const letters: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
      const copy = [...existingOptions];
      copy.push({
        letter: 'E',
        text: 'Nenhuma das alternativas anteriores atende aos critérios doutrinários.',
      });
      return copy;
    }
    return existingOptions.slice(0, 5);
  }

  const combined = `${prompt} ${subject} ${modelAnswer || ''}`.toLowerCase();

  // 1. Redes de Computadores / Informática / Impressoras
  const isNetwork =
    combined.includes('rede') ||
    combined.includes('computador') ||
    combined.includes('lan') ||
    combined.includes('wan') ||
    combined.includes('pan') ||
    combined.includes('switch') ||
    combined.includes('roteador') ||
    combined.includes('servidor') ||
    combined.includes('cliente') ||
    combined.includes('q-405');

  const isPrinter =
    combined.includes('impressora') ||
    combined.includes('impressão') ||
    combined.includes('toner') ||
    combined.includes('q-404');

  if (isPrinter) {
    return [
      { letter: 'A', text: modelAnswer || 'Impressora a Laser (fusão térmica do toner no papel)' },
      { letter: 'B', text: 'Impressora Jato de Tinta (ejeção de microgotas de tinta líquida)' },
      { letter: 'C', text: 'Impressora Térmica (aquecimento direto de papel termossensível)' },
      { letter: 'D', text: 'Impressora Matricial (impacto de agulhas contra fita entintada)' },
      { letter: 'E', text: 'Impressora de Sublimação Térmica (transferência por calor e pressão)' },
    ];
  }

  if (isNetwork) {
    if (combined.includes('pan') || combined.includes('área pessoal') || combined.includes('notebook') || combined.includes('abrangência') || combined.includes('classificação')) {
      return [
        { letter: 'A', text: 'PAN (Personal Area Network - Rede de Área Pessoal).' },
        { letter: 'B', text: 'LAN (Local Area Network - Rede de Área Local).' },
        { letter: 'C', text: 'MAN (Metropolitan Area Network - Rede Metropolitana).' },
        { letter: 'D', text: 'WAN (Wide Area Network - Rede de Longa Distância).' },
        { letter: 'E', text: 'WLAN (Wireless Local Area Network - Rede Local Sem Fio).' },
      ];
    }

    if (combined.includes('topologia') || combined.includes('estrela') || combined.includes('barramento')) {
      return [
        { letter: 'A', text: 'Topologia em Estrela (com concentrador/switch central).' },
        { letter: 'B', text: 'Topologia em Barramento (cabo coaxial linear compartilhado).' },
        { letter: 'C', text: 'Topologia em Anel (passagem de permissão / token em circuito fechado).' },
        { letter: 'D', text: 'Topologia em Malha (enlaces redundantes ponto-a-ponto).' },
        { letter: 'E', text: 'Topologia Ponto-a-Ponto (enlace dedicado exclusivo entre dois nós).' },
      ];
    }

    if (subType === 'fill_in_blank') {
      return [
        { letter: 'A', text: 'computadores / meio de transmissão / compartilhamento de recursos' },
        { letter: 'B', text: 'servidores dedicados / portas lógicas / isolamento de estações' },
        { letter: 'C', text: 'estações autônomas / cabos coaxiais / bloqueio de impressoras' },
        { letter: 'D', text: 'switches de núcleo / placas de rede / memórias voláteis' },
        { letter: 'E', text: 'nós periféricos / topologia em anel / processamento isolado' },
      ];
    }

    return [
      { letter: 'A', text: modelAnswer || 'Existência de servidor centralizado gerenciando recursos e segurança' },
      { letter: 'B', text: 'Arquitetura ponto-a-ponto sem controle de acesso central' },
      { letter: 'C', text: 'Segmentação física obrigatória sem possibilidade de sub-redes' },
      { letter: 'D', text: 'Utilização exclusiva de cabeamento coaxial sem concentradores' },
      { letter: 'E', text: 'Descentralização total de autenticação e banco de dados' },
    ];
  }

  // 2. Comunicações Militares / Rádio / Fio
  const isComms =
    combined.includes('comunica') ||
    combined.includes('rádio') ||
    combined.includes('fio') ||
    combined.includes('fonia') ||
    combined.includes('wd-1') ||
    combined.includes('vhf') ||
    combined.includes('hf') ||
    combined.includes('uhf') ||
    combined.includes('q-401') ||
    combined.includes('q-402') ||
    combined.includes('q-408');

  if (isComms) {
    if (combined.includes('wd-1') || combined.includes('cobre') || combined.includes('aço')) {
      return [
        { letter: 'A', text: '4 fios de cobre (condutibilidade) e 3 fios de aço (resistência à tração)' },
        { letter: 'B', text: '7 fios de cobre puro estanhado para máxima condução' },
        { letter: 'C', text: '5 fios de aço e 2 fios de cobre estanhado' },
        { letter: 'D', text: '6 fios de alumínio e 1 fio de tungstênio' },
        { letter: 'E', text: '3 fios de latão e 4 fios de náilon condutivo' },
      ];
    }

    if (combined.includes('câmbio') || combined.includes('terminado') || combined.includes('fonia') || combined.includes('palavra de procedimento')) {
      return [
        { letter: 'A', text: modelAnswer || 'CÂMBIO (termina a transmissão e aguarda resposta do interlocutor)' },
        { letter: 'B', text: 'TERMINADO (encerra a ligação em definitivo sem aguardar resposta)' },
        { letter: 'C', text: 'AQUI (precede a identificação e indicativo da estação transmissora)' },
        { letter: 'D', text: 'SILÊNCIO RÁDIO (ordem imediata de cessação de transmissões na rede)' },
        { letter: 'E', text: 'REPITA (solicita nova transmissão integral da última mensagem enviada)' },
      ];
    }

    if (subType === 'fill_in_blank') {
      return [
        { letter: 'A', text: 'segurança das comunicações / indicativo de chamada / sigilo das transmissões' },
        { letter: 'B', text: 'linguagem clara / potência máxima / transmissão contínua' },
        { letter: 'C', text: 'antena omnidirecional / modulação em amplitude / onda direta' },
        { letter: 'D', text: 'frequência fixa / silêncio rádio / interferência intencional' },
        { letter: 'E', text: 'transmissor sintonizado / acoplador de antena / espalhamento espectral' },
      ];
    }

    return [
      { letter: 'A', text: modelAnswer || 'Emprego de palavras de procedimento e indicativos padronizados pelo Exército' },
      { letter: 'B', text: 'Transmissão em linguagem clara de coordenadas do escalão superior' },
      { letter: 'C', text: 'Abertura indiscriminada de portadora sem controle de rede' },
      { letter: 'D', text: 'Utilização de frequências não autorizadas pelas NGA' },
      { letter: 'E', text: 'Identificação nominal de comandantes através da rede rádio tática' },
    ];
  }

  // 3. Armamento, Munição e Tiro
  const isWeapon =
    combined.includes('armamento') ||
    combined.includes('fuzil') ||
    combined.includes('fal') ||
    combined.includes('tiro') ||
    combined.includes('pistola') ||
    combined.includes('revólver');

  if (isWeapon) {
    if (subType === 'fill_in_blank') {
      return [
        { letter: 'A', text: 'força de expansão dos gases / repetição / 7,62 mm' },
        { letter: 'B', text: 'ação muscular do atirador / repetição / .38 SPL' },
        { letter: 'C', text: 'curto recuo do cano / semiautomático / 9 mm' },
        { letter: 'D', text: 'massa inercial do ferrolho / automático / 5,56 mm' },
        { letter: 'E', text: 'pressão dos gases / repetição manual / 12 gauge' },
      ];
    }

    return [
      { letter: 'A', text: modelAnswer || 'Ação indireta dos gases com tomada regulável de pressão' },
      { letter: 'B', text: 'Ação exclusiva da força muscular do atirador com repetição manual' },
      { letter: 'C', text: 'Curto recuo do cano com travamento por bloco oscilante' },
      { letter: 'D', text: 'Inércia simples do ferrolho com culatra aberta' },
      { letter: 'E', text: 'Longo recuo do cano com percussão por cão externo' },
    ];
  }

  // 4. Default / Doutrina Militar Geral
  if (subType === 'fill_in_blank') {
    return [
      { letter: 'A', text: 'preceitos regulamentares / cadeia de comando / cumprimento da missão' },
      { letter: 'B', text: 'ordens verbais informais / iniciativa isolada / ação descentralizada' },
      { letter: 'C', text: 'normas operacionais / delegação plena / autonomia total de fração' },
      { letter: 'D', text: 'regulamentos disciplinares / sanções diretas / boletim interno' },
      { letter: 'E', text: 'instruções gerais / segurança orgânica / prontidão permanente' },
    ];
  }

  return [
    { letter: 'A', text: modelAnswer || 'Cumprimento rigoroso da missão em conformidade com as diretrizes do escalão superior' },
    { letter: 'B', text: 'Inobservância das normas de segurança prescritas nos manuais regulamentares' },
    { letter: 'C', text: 'Emprego isolado de meios técnicos sem coordenação com as frações vizinhas' },
    { letter: 'D', text: 'Descentralização excessiva sem manutenção do controle das comunicações' },
    { letter: 'E', text: 'Alteração dos parâmetros operacionais sem autorização do comando' },
  ];
};
