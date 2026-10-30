/**
 * Arquivos Oficiais do CFST 26/2 Carregados na Nuvem Permanente do Aplicativo
 * Referência aos 5 arquivos PDF enviados pelo combatente e armazenados em /public/assets/aistudio/
 */

export interface CloudMaterialFile {
  id: string;
  name: string;
  title: string;
  subject: string;
  fileSize: string;
  fileCategory: 'pdf';
  localUrl: string;
  description: string;
  associatedExamId: string;
  pageCountApprox: string;
  topics: string[];
}

export const CLOUD_STORAGE_FILES: CloudMaterialFile[] = [
  {
    id: 'cloud-doc-1',
    name: 'Bizu_Armamento_Muni__o_e_Tiro__1__4c9cba05.pdf',
    title: 'Bizu de Armamento, Munição e Tiro',
    subject: 'Armamento, Munição e Tiro',
    fileSize: '1.8 MB',
    fileCategory: 'pdf',
    localUrl: '/assets/aistudio/Bizu_Armamento_Muni__o_e_Tiro__1__4c9cba05.pdf',
    description: 'Manual de Armamento Leve EB60-ME-14.061 e IRTAEx: FAL 7,62 M964, Pistola 9mm (Beretta/IMBEL), Granadas de Bocal M2/M3 e Módulos de Tiro (IPT/TIB).',
    associatedExamId: 'oficial-armamento-tiro',
    pageCountApprox: '45 slides / páginas',
    topics: ['FAL 7,62 M964', 'Pistola 9mm M973/M975', 'Medidas Preliminares', 'Ciclo de Funcionamento', 'Granadas de Bocal', 'Módulos IRTAEx'],
  },
  {
    id: 'cloud-doc-2',
    name: 'Explora__o_das_comunica__es_f94298cb.pdf',
    title: 'Exploração das Comunicações Militares',
    subject: 'Exploração das Comunicações',
    fileSize: '3.2 MB',
    fileCategory: 'pdf',
    localUrl: '/assets/aistudio/Explora__o_das_comunica__es_f94298cb.pdf',
    description: 'Instrução do Batalhão Escola de Comunicações (BEsCom · 3º Sgt Klaus): Meios Rádio VHF/HF, Meio Fio de Campanha (WD-1/TT), SATCOM LEO e Redes Ciber-Militares (EBNET).',
    associatedExamId: 'oficial-exploracao-comunicacoes',
    pageCountApprox: '38 slides / páginas',
    topics: ['Meios Rádio Militar', 'Meio Fio e Fibra Óptica', 'Proibição de Celulares Civis', 'Guerra Eletrônica e Jamming', 'SATCOM', 'EBNET'],
  },
  {
    id: 'cloud-doc-3',
    name: 'Explora__o_em_Radiotelefonia_ffbdf454.pdf',
    title: 'Exploração em Radiotelefonia (C 24-9)',
    subject: 'Radiotelefonia Militar (C 24-9)',
    fileSize: '2.1 MB',
    fileCategory: 'pdf',
    localUrl: '/assets/aistudio/Explora__o_em_Radiotelefonia_ffbdf454.pdf',
    description: 'Manual de Campanha C 24-9: Tripé das Comunicações (Rapidez, Clareza e Segurança), Numeração Fonética Militar, Palavras de Procedimento (CÂMBIO, APAGO, SILÊNCIO) e Pista de Fonia.',
    associatedExamId: 'oficial-radiotelefonia-c249',
    pageCountApprox: '32 slides / páginas',
    topics: ['Tripé das Comunicações', 'Fonética Militar (MÊI-A, NÓ-VÊ)', 'Expressões Convencionais', 'Procedimento de Autenticação', 'Disciplina de Tráfego'],
  },
  {
    id: 'cloud-doc-4',
    name: 'Introdu__o___Programa__o_dos_R_dios__enfoque_em_APX_2000_SRX1200__e27ea42c.pdf',
    title: 'Programação de Rádios SRDT (APX 2000 / SRX 1200)',
    subject: 'Rádios Digitais Troncalizados (SRDT)',
    fileSize: '4.5 MB',
    fileCategory: 'pdf',
    localUrl: '/assets/aistudio/Introdu__o___Programa__o_dos_R_dios__enfoque_em_APX_2000_SRX1200__e27ea42c.pdf',
    description: 'Manual Técnico da EsCom / CCOMGEX: Transceptores digitais Motorola APX 2000, SRX 1200 e APX 2500, software CPS, Codeplug, potência (3W e 35W) e Chamada Privativa.',
    associatedExamId: 'oficial-srdt-apx2000',
    pageCountApprox: '56 slides / páginas',
    topics: ['Rádios APX 2000 e SRX 1200', 'Móvel APX 2500', 'Software APX CPS e Codeplug', 'Chamada Privativa', 'Comunicação Simplex/Half-Duplex', 'Interface UNS / SAD'],
  },
  {
    id: 'cloud-doc-5',
    name: 'Lideran_a_32ff2d49.pdf',
    title: 'Liderança Militar (Manual C 20-10)',
    subject: 'Liderança Militar',
    fileSize: '1.4 MB',
    fileCategory: 'pdf',
    localUrl: '/assets/aistudio/Lideran_a_32ff2d49.pdf',
    description: 'Doutrina de Liderança Militar do CFST e Manual C 20-10: Distinção entre Ética e Moral, As Três Servidões Indelegáveis do Líder, Estilos de Liderança e os 6 Vícios Capitais.',
    associatedExamId: 'oficial-lideranca-militar',
    pageCountApprox: '28 slides / páginas',
    topics: ['Ética vs Moral', 'Três Servidões Indelegáveis', 'Dar o Exemplo', 'Estilos de Liderança', 'Seis Vícios da Liderança', 'Tomada de Decisão'],
  },
];
