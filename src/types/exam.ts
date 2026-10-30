export type QuestionType =
  | 'discursive'
  | 'objective'
  | 'fill_in_blank'
  | 'column_match'
  | 'true_false'
  | 'scenario'
  | 'diagram_identification';

export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'todos';
export type StudyMode = 'simulado' | 'flashcards' | 'revisao' | 'revisao_ativa';
export type CourseType = 'CFST' | 'CFC' | 'CFS' | 'Geral';

export interface Criterion {
  id: string;
  description: string;
  gaivotas: number; // typically 1 gaivota per criterion
  met?: boolean;
  justification?: string;
  manualOverride?: boolean;
}

export interface Option {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface ColumnItem {
  key: string; // "1", "2", "3", "4" or "A", "B", "C"
  text: string;
}

export interface TrueFalseItem {
  numeral: string; // "I", "II", "III", "IV"
  statement: string;
  isTrue?: boolean;
}

export interface DiagramData {
  title: string;
  type: 'radio_panel' | 'antenna_schematic' | 'wire_splice' | 'frequency_spectrum' | 'tactical_network' | 'generic';
  caption?: string;
  componentLabels?: Array<{ code: string; name: string; functionDesc?: string }>;
}

export interface CardDirectFact {
  frontPrompt: string; // Ex: "Frequência de operação do Rádio PX 2000:"
  backAnswer: string;  // Ex: "30 a 87.975 MHz (Faixa VHF-FM militar)"
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  subType?: 'fill_in_blank' | 'column_match' | 'true_false' | 'scenario' | 'diagram_identification' | 'standard';
  difficulty: DifficultyLevel;
  subject: string;
  prompt: string;
  contextScenario?: string; // Situational military operational scenario/story
  blanksSentence?: string; // Text containing [ ____(1)____ ] blanks
  columnA?: ColumnItem[]; // Coluna A (itens 1, 2, 3...)
  columnB?: ColumnItem[]; // Coluna B (definições para associar)
  tfStatements?: TrueFalseItem[]; // Sentenças I, II, III para julgar V ou F
  diagram?: DiagramData; // Diagrama ilustrativo do componente ou esquema
  cardDirectFact?: CardDirectFact; // Pergunta curta e resposta direta para o modo Flashcard
  isReinforcedCoreConcept?: boolean; // Ponto vital/gaivota certa reforçada
  totalGaivotas: number; // e.g. 3 gaivotas for 3 items
  modelAnswer: string;
  criteria?: Criterion[];
  options?: Option[];
  correctOption?: string;
  explanation?: string;
  drillTimerSeconds?: number;
}

export interface Exam {
  id: string;
  title: string;
  course: CourseType;
  subject: string;
  institution: string;
  instructions: string;
  totalTimeMinutes: number;
  questions: Question[];
  isCustom?: boolean;
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  textAnswer?: string;
  selectedOption?: string;
  isEvaluated?: boolean;
  gaivotasAwarded?: number;
  evaluatedCriteria?: Criterion[];
  generalFeedback?: string;
  positivePoints?: string[];
  improvements?: string[];
  evaluatedAt?: string;
  retentionRating?: 'errei' | 'bom' | 'facil';
}

export interface ExamAttempt {
  id: string;
  examId: string;
  mode: StudyMode;
  difficulty?: DifficultyLevel;
  startedAt: string;
  completedAt?: string;
  answers: Record<string, StudentAnswer>;
  totalGaivotasEarned: number;
  totalGaivotasPossible: number;
  finalScorePercent: number;
}

export interface UploadedDoc {
  name: string;
  size: string;
  mimeType: string;
  base64?: string;
  text?: string;
  charCount?: number;
  fileCategory?: 'powerpoint' | 'word' | 'excel' | 'pdf' | 'text' | 'image' | 'outro';
  extractStatus?: 'ready' | 'extracting' | 'error';
  extractError?: string;
}

export interface StudySessionConfig {
  mode: StudyMode;
  course?: CourseType;
  subject?: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  examId?: string;
  materialSource?: 'nuvem' | 'upload' | 'misto';
  selectedCloudExamId?: string;
  selectedCloudExamIds?: string[];
  uploadedFiles?: Array<{ name: string; size: string }>;
  uploadedDocs?: UploadedDoc[];
  uploadedText?: string;
  avoidRepeatedQuestions?: boolean;
  enableSpacedRepetition?: boolean;
  excludePrompts?: string[];
  missedQuestions?: Array<{ id?: string; prompt: string; subject?: string }>;
}
