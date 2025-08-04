/**
 * Utility functions for handling dates and timestamps from Firestore
 */

/**
 * Safely converts Firestore timestamp to Date object
 * @param dateInput - Date, string, or Firestore Timestamp
 * @returns Date object
 */
export const safeDate = (dateInput: any): Date => {
  if (!dateInput) return new Date();
  
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  if (typeof dateInput === 'string') {
    return new Date(dateInput);
  }
  
  // Handle Firestore Timestamp
  if (dateInput.toDate && typeof dateInput.toDate === 'function') {
    return dateInput.toDate();
  }
  
  // Handle Firestore server timestamp
  if (dateInput.seconds && dateInput.nanoseconds) {
    return new Date(dateInput.seconds * 1000);
  }
  
  return new Date();
};

/**
 * Safely formats a date for display
 * @param dateInput - Date, string, or Firestore Timestamp
 * @returns Formatted date string
 */
export const formatDate = (dateInput: any, locale: string = 'en-IN'): string => {
  const date = safeDate(dateInput);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Safely formats a date with time for display
 * @param dateInput - Date, string, or Firestore Timestamp
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateInput: any, locale: string = 'en-IN'): string => {
  const date = safeDate(dateInput);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};
