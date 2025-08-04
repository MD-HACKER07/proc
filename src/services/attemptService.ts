import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const ATTEMPTS_COL = collection(db, 'quizAttempts');

export interface AttemptRecord {
  userId: string;
  subjectId: string;
  attemptedAt: Date;
}

export const recordAttempt = async (userId: string, subjectId: string) => {
  const ref = doc(ATTEMPTS_COL, `${userId}_${subjectId}`);
  await setDoc(ref, {
    userId,
    subjectId,
    attemptedAt: new Date(),
  });
};

export const hasTakenExam = async (userId: string, subjectId: string): Promise<boolean> => {
  if (!userId || !subjectId) return false;
  const q = query(ATTEMPTS_COL, where('userId', '==', userId), where('subjectId', '==', subjectId));
  const snap = await getDocs(q);
  return !snap.empty;
};
