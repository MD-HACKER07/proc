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
}

// Subject interface for managing quiz subjects
export interface Subject {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
}

// Collection references
const questionsCollection = collection(db, 'questions');
const subjectsCollection = collection(db, 'subjects');

// Questions operations
export const getQuestions = async (subjectId?: string) => {
  try {
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