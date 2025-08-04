import { db } from '../firebase/config';
import { collection, addDoc, getDocs, getDoc, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface QuizResponse {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  startedAt: Date;
  completedAt: Date;
  responses: QuestionResponse[];
  released?: boolean; // Flag to indicate if results have been released by admin
  isFlagged?: boolean; // Flag to indicate if response has security issues
  securityEvents?: any[]; // Security events detected during quiz
  performanceCategory?: 'Topper' | 'Average' | 'Below Average'; // Automatic categorization based on score
  nextQuizSet?: 'easy' | 'medium' | 'hard'; // Next quiz set assigned based on performance
}

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  options: string[];
}

// Utility function to determine performance category based on percentage
export const getPerformanceCategory = (percentage: number): 'Topper' | 'Average' | 'Below Average' => {
  if (percentage >= 80) {
    return 'Topper';
  } else if (percentage >= 50) {
    return 'Average';
  } else {
    return 'Below Average';
  }
};

export const saveQuizResponse = async (response: Omit<QuizResponse, 'id'>) => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db!, 'quizResponses'), response);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz response:', error);
    throw error;
  }
};

export const getAllQuizResponses = async () => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const q = query(
      collection(db!, 'quizResponses'),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as QuizResponse));
  } catch (error) {
    console.error('Error getting quiz responses:', error);
    throw error;
  }
};

export const getUserQuizResponses = async (userId: string) => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const q = query(
      collection(db!, 'quizResponses'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as QuizResponse));
  } catch (error) {
    console.error('Error getting user quiz responses:', error);
    throw error;
  }
};

export const deleteQuizResponse = async (responseId: string) => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    await deleteDoc(doc(db!, 'quizResponses', responseId));
  } catch (error) {
    console.error('Error deleting quiz response:', error);
    throw error;
  }
};

export const getQuizResponseById = async (responseId: string): Promise<QuizResponse | null> => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const responseDoc = await getDoc(doc(db!, 'quizResponses', responseId));
    if (responseDoc.exists()) {
      return { id: responseDoc.id, ...responseDoc.data() } as QuizResponse;
    }
    return null;
  } catch (error) {
    console.error('Error getting quiz response:', error);
    throw error;
  }
};

// Update the release status of a quiz response
export const updateQuizResponseReleaseStatus = async (responseId: string, released: boolean): Promise<void> => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const responseDoc = doc(db!, 'quizResponses', responseId);
    await updateDoc(responseDoc, { released });
  } catch (error) {
    console.error('Error updating quiz response release status:', error);
    throw error;
  }
};
