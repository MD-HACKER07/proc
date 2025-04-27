// Question Types
export interface Question {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  type: QuestionType;
  points?: number;
  explanation?: string;
  hint?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  image?: string;
}

export type QuestionType = 'single' | 'multiple' | 'true-false';

// User Answer Types
export interface UserAnswer {
  questionId: number | string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeTaken?: number;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  questionCount?: number;
}

// Review Types
export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: Date;
  likes: number;
}

// Results Types
export interface QuizResult {
  id: string;
  username: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeTaken: number;
  date: Date;
  subject?: string;
  answers: UserAnswer[];
}

// Quiz Types
export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  timeStarted: Date | null;
  timeEnded: Date | null;
  isCompleted: boolean;
  subject?: string;
  difficulty?: string;
  username?: string;
}

// Settings Types
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  animation: boolean;
  autoSave: boolean;
  sound: boolean;
  networkSpeed: 'slow' | 'medium' | 'fast';
  notifications: boolean;
  timerVisible: boolean;
  timerDuration: number;
  highContrastMode: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  animationsEnabled: boolean;
}

// Context Types
export interface QuizContextType {
  quizState: QuizState;
  setQuestion: (questions: Question[]) => void;
  startQuiz: (username: string, subject?: string, difficulty?: string) => void;
  answerQuestion: (answer: string | string[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  timeRemaining: number | null;
  calcScore: () => { total: number; correct: number; percentage: number };
}

export interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
} 