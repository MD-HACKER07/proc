import { Database, ref, push, onValue, off, DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase/config';

export interface RealtimeSecurityEvent {
  type: string;
  message: string;
  timestamp: number;
  userId: string;
  sessionId: string;
}

const db = rtdb as Database;

export const pushSecurityEvent = async (evt: RealtimeSecurityEvent) => {
  if (!db) return;
  const node = ref(db, `securityEvents/${evt.userId}/${evt.sessionId}`);
  await push(node, evt);
};

export const subscribeSecurityEvents = (
  path: string,
  callback: (events: RealtimeSecurityEvent[]) => void
) => {
  if (!db) return () => {};
  const node = ref(db, path);
  const handler = (snap: DataSnapshot) => {
    const data = snap.val() || {};
    const list: RealtimeSecurityEvent[] = [];
    // Handle nested structure: securityEvents/userId/sessionId/eventId
    Object.values(data).forEach(userData => {
      if (typeof userData === 'object' && userData !== null) {
        Object.values(userData).forEach(sessionData => {
          if (typeof sessionData === 'object' && sessionData !== null) {
            Object.values(sessionData).forEach(event => {
              if (typeof event === 'object' && event !== null) {
                list.push(event as RealtimeSecurityEvent);
              }
            });
          }
        });
      }
    });
    // sort latest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    callback(list);
  };
  onValue(node, handler);
  return () => off(node, 'value', handler);
};
