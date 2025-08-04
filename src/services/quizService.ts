import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query,
  where,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Question interface that matches our existing structure
export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type?: string;
  points?: number;
  subject?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Subject interface for managing quiz subjects
export interface Subject {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
  // Adaptive quiz fields
  hasAdaptiveQuiz?: boolean;
  easySetId?: string;
  mediumSetId?: string;
  hardSetId?: string;
}

// Collection references
const questionsCollection = db ? collection(db, 'questions') : null;
const subjectsCollection = db ? collection(db, 'subjects') : null;

// Questions operations
export const getQuestions = async (subjectId?: string) => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    let q: CollectionReference | Query = questionsCollection;
    
    if (subjectId) {
      q = query(questionsCollection, where('subject', '==', subjectId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Question[];
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

export const addQuestion = async (question: Question) => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const docRef = await addDoc(questionsCollection, {
      ...question,
      type: question.type || 'single',
      points: question.points || 10
    });
    return {
      id: docRef.id,
      ...question
    };
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

export const updateQuestion = async (id: string, question: Partial<Question>) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const questionRef = doc(db, 'questions', id);
    await updateDoc(questionRef, question);
    return {
      id,
      ...question
    };
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (id: string) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const questionRef = doc(db, 'questions', id);
    await deleteDoc(questionRef);
    return id;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Subjects operations
export const getSubjects = async () => {
  try {
    if (!subjectsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const snapshot = await getDocs(subjectsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Subject[];
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw error;
  }
};

export const addSubject = async (subject: Subject) => {
  try {
    if (!subjectsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const docRef = await addDoc(subjectsCollection, subject);
    return {
      id: docRef.id,
      ...subject
    };
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

export const updateSubject = async (id: string, subject: Partial<Subject>) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const subjectRef = doc(db, 'subjects', id);
    await updateDoc(subjectRef, subject);
    return {
      id,
      ...subject
    };
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (id: string) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const subjectRef = doc(db, 'subjects', id);
    await deleteDoc(subjectRef);
    return id;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// New functions to delete all questions
export const deleteAllQuestions = async () => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const snapshot = await getDocs(questionsCollection);
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error deleting all questions:', error);
    throw error;
  }
};

export const deleteQuestionsBySubject = async (subjectId: string) => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const q = query(questionsCollection, where('subject', '==', subjectId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error deleting questions by subject:', error);
    throw error;
  }
};

// Function to determine next quiz set based on user performance
export const getNextQuizSet = (percentage: number): 'easy' | 'medium' | 'hard' => {
  if (percentage >= 80) {
    return 'hard';
  } else if (percentage >= 50) {
    return 'medium';
  } else {
    return 'easy';
  }
};

// Function to get questions for a specific difficulty level
export const getQuestionsByDifficulty = async (subjectId: string, difficulty: 'easy' | 'medium' | 'hard') => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    const q = query(
      questionsCollection, 
      where('subject', '==', subjectId),
      where('difficulty', '==', difficulty)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Question[];
  } catch (error) {
    console.error(`Error getting ${difficulty} questions:`, error);
    throw error;
  }
};

// Function to get adaptive quiz questions based on subject and previous performance
export const getAdaptiveQuizQuestions = async (subjectId: string, previousPercentage?: number) => {
  try {
    if (!questionsCollection) {
      throw new Error('Firebase database not initialized');
    }
    
    // If no previous performance, start with medium difficulty
    const difficulty = previousPercentage ? getNextQuizSet(previousPercentage) : 'medium';
    
    const q = query(
      questionsCollection, 
      where('subject', '==', subjectId),
      where('difficulty', '==', difficulty)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Question[];
  } catch (error) {
    console.error('Error getting adaptive quiz questions:', error);
    throw error;
  }
}; 