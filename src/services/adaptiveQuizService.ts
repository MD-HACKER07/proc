import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getQuestions } from './quizService';

export interface AdaptiveQuizConfig {
  id?: string;
  name: string;
  subjectId: string;
  totalQuestions: number;
  adaptiveMode: boolean;
  performanceThresholds: {
    topper: number; // percentage (e.g., 80)
    average: number; // percentage (e.g., 50)
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdaptiveQuizSession {
  id?: string;
  configId: string;
  userId: string;
  questions: any[];
  currentQuestionIndex: number;
  answers: any[];
  adaptiveHistory: {
    questionIndex: number;
    difficulty: 'easy' | 'medium' | 'hard';
    isCorrect: boolean;
    performance: number; // running performance percentage
  }[];
  status: 'in-progress' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  finalScore: number;
  maxScore: number;
}

const getAdaptiveQuizConfigsCollection = () => {
  if (!db) throw new Error('Database not initialized');
  return collection(db, 'adaptiveQuizConfigs');
};

const getAdaptiveQuizSessionsCollection = () => {
  if (!db) throw new Error('Database not initialized');
  return collection(db, 'adaptiveQuizSessions');
};

// Create adaptive quiz configuration
export const createAdaptiveQuizConfig = async (config: Omit<AdaptiveQuizConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const adaptiveConfig: AdaptiveQuizConfig = {
    ...config,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(getAdaptiveQuizConfigsCollection(), adaptiveConfig);
  return docRef.id;
};

// Get all adaptive quiz configurations
export const getAdaptiveQuizConfigs = async (): Promise<AdaptiveQuizConfig[]> => {
  const snapshot = await getDocs(getAdaptiveQuizConfigsCollection());
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as AdaptiveQuizConfig;
  });
};

// Get adaptive quiz configurations by subject
export const getAdaptiveQuizConfigsBySubject = async (subjectId: string): Promise<AdaptiveQuizConfig[]> => {
  const q = query(getAdaptiveQuizConfigsCollection(), where('subjectId', '==', subjectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as AdaptiveQuizConfig;
  });
};

// Generate adaptive quiz questions based on configuration
export const generateAdaptiveQuiz = async (
  subjectId: string,
  totalQuestions: number,
  adaptiveMode: boolean = true,
  currentPerformance?: number
): Promise<any[]> => {
  // Get all questions for the subject
  const allQuestions = await getQuestions(subjectId);
  
  if (!adaptiveMode) {
    // If not adaptive, just return random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalQuestions);
  }

  // For adaptive mode, create a balanced mix from all difficulty levels
  const easyQuestions = allQuestions.filter(q => q.difficulty === 'easy');
  const mediumQuestions = allQuestions.filter(q => q.difficulty === 'medium');
  const hardQuestions = allQuestions.filter(q => q.difficulty === 'hard');

  // If no difficulty is set, treat as medium
  const unsetQuestions = allQuestions.filter(q => !q.difficulty);
  mediumQuestions.push(...unsetQuestions);

  // Determine difficulty distribution based on performance
  let easyCount, mediumCount, hardCount;
  
  if (currentPerformance !== undefined) {
    // Section-wise adaptive distribution based on previous performance
    if (currentPerformance >= 80) {
      // High performer (≥80%) - more hard questions
      hardCount = Math.floor(totalQuestions * 0.7);
      mediumCount = Math.floor(totalQuestions * 0.2);
      easyCount = totalQuestions - hardCount - mediumCount;
    } else if (currentPerformance >= 40) {
      // Average performer (40-79%) - balanced medium questions
      mediumCount = Math.floor(totalQuestions * 0.7);
      hardCount = Math.floor(totalQuestions * 0.2);
      easyCount = totalQuestions - mediumCount - hardCount;
    } else {
      // Below average performer (<40%) - more easy questions
      easyCount = Math.floor(totalQuestions * 0.7);
      mediumCount = Math.floor(totalQuestions * 0.2);
      hardCount = totalQuestions - easyCount - mediumCount;
    }
  } else {
    // Default balanced distribution for first section
    easyCount = Math.floor(totalQuestions * 0.2);
    mediumCount = Math.floor(totalQuestions * 0.6);
    hardCount = Math.floor(totalQuestions * 0.2);
  }

  // Adjust if we don't have enough questions in any category
  const availableEasy = Math.min(easyCount, easyQuestions.length);
  const availableMedium = Math.min(mediumCount, mediumQuestions.length);
  const availableHard = Math.min(hardCount, hardQuestions.length);

  // Fill remaining slots with available questions
  let remaining = totalQuestions - (availableEasy + availableMedium + availableHard);
  
  const selectedQuestions: any[] = [];
  
  // Add questions from each difficulty level
  selectedQuestions.push(...easyQuestions.sort(() => Math.random() - 0.5).slice(0, availableEasy));
  selectedQuestions.push(...mediumQuestions.sort(() => Math.random() - 0.5).slice(0, availableMedium));
  selectedQuestions.push(...hardQuestions.sort(() => Math.random() - 0.5).slice(0, availableHard));

  // Fill remaining slots with any available questions
  if (remaining > 0) {
    const remainingQuestions = allQuestions.filter(q => !selectedQuestions.includes(q));
    selectedQuestions.push(...remainingQuestions.sort(() => Math.random() - 0.5).slice(0, remaining));
  }

  // Shuffle the final selection to mix difficulties
  return selectedQuestions.sort(() => Math.random() - 0.5).slice(0, totalQuestions);
};

// Start adaptive quiz session
export const startAdaptiveQuizSession = async (
  configId: string,
  userId: string,
  questions: any[]
): Promise<string> => {
  const session: AdaptiveQuizSession = {
    configId,
    userId,
    questions,
    currentQuestionIndex: 0,
    answers: [],
    adaptiveHistory: [],
    status: 'in-progress',
    startedAt: new Date(),
    finalScore: 0,
    maxScore: questions.reduce((sum, q) => sum + (q.points || 10), 0)
  };
  
  const docRef = await addDoc(getAdaptiveQuizSessionsCollection(), session);
  return docRef.id;
};

// Update adaptive quiz session with answer
export const updateAdaptiveQuizSession = async (
  sessionId: string,
  answer: any,
  isCorrect: boolean,
  currentPerformance: number
): Promise<void> => {
  const sessionDoc = doc(getAdaptiveQuizSessionsCollection(), sessionId);
  
  // Get current session data
  const sessionSnapshot = await getDocs(query(getAdaptiveQuizSessionsCollection(), where('__name__', '==', sessionId)));
  if (sessionSnapshot.empty) return;
  
  const sessionData = sessionSnapshot.docs[0].data() as AdaptiveQuizSession;
  
  // Update session with new answer and adaptive history
  const updatedAnswers = [...sessionData.answers, answer];
  const updatedHistory = [...sessionData.adaptiveHistory, {
    questionIndex: sessionData.currentQuestionIndex,
    difficulty: sessionData.questions[sessionData.currentQuestionIndex]?.difficulty || 'medium',
    isCorrect,
    performance: currentPerformance
  }];
  
  const isComplete = sessionData.currentQuestionIndex >= sessionData.questions.length - 1;
  
  await updateDoc(sessionDoc, {
    answers: updatedAnswers,
    adaptiveHistory: updatedHistory,
    currentQuestionIndex: isComplete ? sessionData.currentQuestionIndex : sessionData.currentQuestionIndex + 1,
    status: isComplete ? 'completed' : 'in-progress',
    completedAt: isComplete ? new Date() : null,
    finalScore: updatedAnswers.reduce((sum, ans) => sum + (ans.points || 0), 0)
  });
};

// Get next question difficulty based on performance
export const getNextQuestionDifficulty = (
  currentPerformance: number,
  thresholds: { topper: number; average: number }
): 'easy' | 'medium' | 'hard' => {
  if (currentPerformance >= thresholds.topper) {
    return 'hard';
  } else if (currentPerformance >= thresholds.average) {
    return 'medium';
  } else {
    return 'easy';
  }
};

// Calculate performance category
export const getPerformanceCategory = (
  percentage: number,
  thresholds: { topper: number; average: number }
): 'topper' | 'average' | 'below-average' => {
  if (percentage >= thresholds.topper) {
    return 'topper';
  } else if (percentage >= thresholds.average) {
    return 'average';
  } else {
    return 'below-average';
  }
};

// Get user's adaptive quiz sessions
export const getUserAdaptiveQuizSessions = async (userId: string): Promise<AdaptiveQuizSession[]> => {
  const q = query(getAdaptiveQuizSessionsCollection(), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startedAt: data.startedAt?.toDate(),
      completedAt: data.completedAt?.toDate()
    } as AdaptiveQuizSession;
  });
};
