import { collection, doc, onSnapshot, setDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ActiveExam } from './examService';

// Collection references
const EXAM_SESSIONS_COLLECTION = collection(db, 'examSessions');
const EXAM_EVENTS_COLLECTION = collection(db, 'examEvents');

// Exam Session interface
export interface ExamSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subjectId: string;
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'completed' | 'terminated';
  examDuration: number; // minutes
}

// Exam Event interface (for monitoring)
export interface ExamEvent {
  id?: string;
  sessionId: string;
  userId: string;
  eventType: 'start' | 'question_change' | 'security_alert' | 'submit' | 'terminate' | 'tab_switch' | 'fullscreen_exit' | 'devtools_open';
  timestamp: Date;
  details?: any;
}

// Start a new exam session for a user
export const startExamSession = async (
  userId: string,
  userEmail: string,
  userName: string,
  activeExam: ActiveExam
): Promise<string> => {
  const sessionDoc = doc(EXAM_SESSIONS_COLLECTION);
  await setDoc(sessionDoc, {
    userId,
    userEmail,
    userName,
    subjectId: activeExam.subjectId,
    startedAt: serverTimestamp(),
    lastActivity: serverTimestamp(),
    status: 'active',
    examDuration: activeExam.duration
  });
  return sessionDoc.id;
};

// End a user's exam session
export const endExamSession = async (sessionId: string) => {
  await updateDoc(doc(EXAM_SESSIONS_COLLECTION, sessionId), {
    status: 'completed',
    endedAt: serverTimestamp()
  });
};

// Terminate a user's exam session (admin action)
export const terminateExamSession = async (sessionId: string) => {
  await updateDoc(doc(EXAM_SESSIONS_COLLECTION, sessionId), {
    status: 'terminated',
    endedAt: serverTimestamp()
  });
  
  // Log termination event
  const eventDoc = doc(EXAM_EVENTS_COLLECTION);
  await setDoc(eventDoc, {
    sessionId,
    userId: '', // Will be filled from session
    eventType: 'terminate',
    timestamp: serverTimestamp(),
    details: { reason: 'Admin terminated exam' }
  });
};

// Get all active exam sessions
export const getActiveExamSessions = (subjectId: string, callback: (sessions: ExamSession[]) => void) => {
  const q = query(
    EXAM_SESSIONS_COLLECTION,
    where('subjectId', '==', subjectId),
    where('status', '==', 'active')
  );
  
  return onSnapshot(q, (snapshot) => {
    const sessions: ExamSession[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        subjectId: data.subjectId,
        startedAt: data.startedAt?.toDate() || new Date(),
        lastActivity: data.lastActivity?.toDate() || new Date(),
        status: data.status,
        examDuration: data.examDuration
      });
    });
    callback(sessions);
  });
};

// Get exam events for monitoring
export const getExamEvents = (sessionId: string, callback: (events: ExamEvent[]) => void) => {
  const q = query(
    EXAM_EVENTS_COLLECTION,
    where('sessionId', '==', sessionId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const events: ExamEvent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        sessionId: data.sessionId,
        userId: data.userId,
        eventType: data.eventType,
        timestamp: data.timestamp?.toDate() || new Date(),
        details: data.details
      });
    });
    callback(events);
  });
};

// Log an exam event
export const logExamEvent = async (event: Omit<ExamEvent, 'id' | 'timestamp'>) => {
  const eventDoc = doc(EXAM_EVENTS_COLLECTION);
  await setDoc(eventDoc, {
    ...event,
    timestamp: serverTimestamp()
  });
};

// Get all exam sessions for a user
export const getUserExamSessions = (userId: string, callback: (sessions: ExamSession[]) => void) => {
  const q = query(
    EXAM_SESSIONS_COLLECTION,
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const sessions: ExamSession[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        subjectId: data.subjectId,
        startedAt: data.startedAt?.toDate() || new Date(),
        lastActivity: data.lastActivity?.toDate() || new Date(),
        status: data.status,
        examDuration: data.examDuration
      });
    });
    callback(sessions);
  });
};
