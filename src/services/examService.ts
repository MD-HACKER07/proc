import { doc, onSnapshot, setDoc, serverTimestamp, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getQuestions } from './quizService';

export interface ActiveExam {
  subjectId: string;
  duration: number; // minutes
  startedAt: Date;
  scheduledTime?: Date; // Optional scheduled start time
  active: boolean;
}

// Multi-section adaptive exam interfaces
export interface ExamSection {
  sectionNumber: number;
  questionsPerSection: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  timeLimit: number; // minutes per section
}

export interface ExamConfiguration {
  id?: string;
  name: string;
  subjectId: string;
  totalSections: number;
  questionsPerSection: number;
  totalQuestions: number;
  adaptiveMode: boolean;
  sections: ExamSection[];
  performanceThresholds: {
    topper: number; // percentage (e.g., 80)
    average: number; // percentage (e.g., 50)
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExamSession {
  id?: string;
  examConfigId: string;
  userId: string;
  currentSection: number;
  sectionsCompleted: SectionResult[];
  status: 'in-progress' | 'completed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  totalScore: number;
  maxScore: number;
}

export interface SectionResult {
  sectionNumber: number;
  questions: any[];
  answers: any[];
  score: number;
  maxScore: number;
  percentage: number;
  performanceCategory: 'topper' | 'average' | 'below-average';
  difficultyLevel: 'easy' | 'medium' | 'hard';
  completedAt: Date;
  timeSpent: number; // seconds
}

const ACTIVE_EXAM_DOC = doc(db, 'config', 'activeExam');

// Admin: start an exam
export interface ExamOptions {
  scheduledTime?: string; // ISO datetime string
  shuffle?: boolean;
  instructions?: string;
}

export const startActiveExam = async (
  subjectId: string,
  duration: number,
  scheduledTime?: string,
  shuffle: boolean = true,
  instructions: string = ''
) => {
  await setDoc(ACTIVE_EXAM_DOC, {
    subjectId,
    duration,
    scheduledTime: scheduledTime || null,
    shuffle,
    instructions,
    startedAt: serverTimestamp(),
    active: true,
  });
};

// Admin: end the active exam (e.g., after it ends)
export const endActiveExam = async () => {
  await setDoc(ACTIVE_EXAM_DOC, { active: false, endedAt: serverTimestamp() }, { merge: true });
};

// User/Admin: subscribe to the active exam status
export const subscribeToActiveExam = (callback: (exam: ActiveExam | null) => void) => {
  return onSnapshot(ACTIVE_EXAM_DOC, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      subjectId: data.subjectId,
      duration: data.duration,
      startedAt: data.startedAt?.toDate() || new Date(),
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined,
      active: data.active,
    });
  });
};

// Multi-section adaptive exam functions
const examConfigsCollection = collection(db, 'examConfigurations');
const examSessionsCollection = collection(db, 'examSessions');

// Create a new exam configuration
export const createExamConfiguration = async (config: Omit<ExamConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const examConfig: ExamConfiguration = {
    ...config,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(examConfigsCollection, examConfig);
  return docRef.id;
};

// Get all exam configurations
export const getExamConfigurations = async (): Promise<ExamConfiguration[]> => {
  const snapshot = await getDocs(examConfigsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as ExamConfiguration[];
};

// Get exam configurations by subject
export const getExamConfigurationsBySubject = async (subjectId: string): Promise<ExamConfiguration[]> => {
  const q = query(examConfigsCollection, where('subjectId', '==', subjectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as ExamConfiguration[];
};

// Update exam configuration
export const updateExamConfiguration = async (id: string, updates: Partial<ExamConfiguration>): Promise<void> => {
  const docRef = doc(examConfigsCollection, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date()
  });
};

// Delete exam configuration
export const deleteExamConfiguration = async (id: string): Promise<void> => {
  const docRef = doc(examConfigsCollection, id);
  await deleteDoc(docRef);
};

// Start a new exam session
export const startExamSession = async (examConfigId: string, userId: string): Promise<string> => {
  const examSession: ExamSession = {
    examConfigId,
    userId,
    currentSection: 1,
    sectionsCompleted: [],
    status: 'in-progress',
    startedAt: new Date(),
    totalScore: 0,
    maxScore: 0
  };
  
  const docRef = await addDoc(examSessionsCollection, examSession);
  return docRef.id;
};

// Get exam session by ID
export const getExamSession = async (sessionId: string): Promise<ExamSession | null> => {
  const docRef = doc(examSessionsCollection, sessionId);
  const snapshot = await getDocs(query(examSessionsCollection, where('__name__', '==', sessionId)));
  
  if (snapshot.empty) return null;
  
  const sessionDoc = snapshot.docs[0];
  return {
    id: sessionDoc.id,
    ...sessionDoc.data(),
    startedAt: sessionDoc.data().startedAt?.toDate(),
    completedAt: sessionDoc.data().completedAt?.toDate()
  } as ExamSession;
};

// Update exam session
export const updateExamSession = async (sessionId: string, updates: Partial<ExamSession>): Promise<void> => {
  const docRef = doc(examSessionsCollection, sessionId);
  await updateDoc(docRef, updates);
};

// Complete a section and determine next section difficulty
export const completeSectionAndGetNext = async (
  sessionId: string,
  sectionResult: SectionResult,
  examConfig: ExamConfiguration
): Promise<{ nextDifficulty: 'easy' | 'medium' | 'hard' | null; isExamComplete: boolean }> => {
  const session = await getExamSession(sessionId);
  if (!session) throw new Error('Exam session not found');

  // Update session with completed section
  const updatedSectionsCompleted = [...session.sectionsCompleted, sectionResult];
  const updatedTotalScore = session.totalScore + sectionResult.score;
  const updatedMaxScore = session.maxScore + sectionResult.maxScore;
  
  const isExamComplete = session.currentSection >= examConfig.totalSections;
  
  await updateExamSession(sessionId, {
    sectionsCompleted: updatedSectionsCompleted,
    totalScore: updatedTotalScore,
    maxScore: updatedMaxScore,
    currentSection: isExamComplete ? session.currentSection : session.currentSection + 1,
    status: isExamComplete ? 'completed' : 'in-progress',
    completedAt: isExamComplete ? new Date() : undefined
  });

  if (isExamComplete) {
    return { nextDifficulty: null, isExamComplete: true };
  }

  // Determine next section difficulty based on performance
  let nextDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  
  if (examConfig.adaptiveMode) {
    const { topper, average } = examConfig.performanceThresholds;
    
    if (sectionResult.percentage >= topper) {
      nextDifficulty = 'hard';
    } else if (sectionResult.percentage >= average) {
      nextDifficulty = 'medium';
    } else {
      nextDifficulty = 'easy';
    }
  } else {
    // Use predefined section difficulty if not adaptive
    const nextSectionConfig = examConfig.sections.find(s => s.sectionNumber === session.currentSection + 1);
    nextDifficulty = nextSectionConfig?.difficultyLevel || 'medium';
  }

  return { nextDifficulty, isExamComplete: false };
};

// Get questions for a specific section based on difficulty
export const getSectionQuestions = async (
  subjectId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionsPerSection: number
): Promise<any[]> => {
  const allQuestions = await getQuestions(subjectId);
  
  // Filter questions by difficulty
  const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
  
  // Shuffle and take required number of questions
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, questionsPerSection);
};

// Calculate performance category based on percentage
export const calculatePerformanceCategory = (
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

// Get user's exam sessions
export const getUserExamSessions = async (userId: string): Promise<ExamSession[]> => {
  const q = query(examSessionsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startedAt: doc.data().startedAt?.toDate(),
    completedAt: doc.data().completedAt?.toDate()
  })) as ExamSession[];
};

// Generate default exam configuration
export const generateDefaultExamConfig = (
  name: string,
  subjectId: string,
  totalSections: number = 4,
  questionsPerSection: number = 5
): Omit<ExamConfiguration, 'id' | 'createdAt' | 'updatedAt'> => {
  const sections: ExamSection[] = [];
  
  for (let i = 1; i <= totalSections; i++) {
    sections.push({
      sectionNumber: i,
      questionsPerSection,
      difficultyLevel: 'medium', // Default to medium, will be adaptive
      timeLimit: questionsPerSection * 2 // 2 minutes per question
    });
  }
  
  return {
    name,
    subjectId,
    totalSections,
    questionsPerSection,
    totalQuestions: totalSections * questionsPerSection,
    adaptiveMode: true,
    sections,
    performanceThresholds: {
      topper: 80,
      average: 50
    }
  };
};
