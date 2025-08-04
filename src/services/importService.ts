import { collection, addDoc, getDocs, query, where, deleteDoc, writeBatch, doc, Firestore } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question, Subject } from './quizService';
import Papa from 'papaparse';

// Ensure db is not null before proceeding
const firestoreDb = db as Firestore;

/**
 * Detect difficulty level from filename
 * set1.csv -> hard, set2.csv -> medium, set3.csv -> easy
 * @param filename The name of the file being imported
 * @returns The difficulty level or 'medium' as default
 */
const detectDifficultyFromFilename = (filename: string): 'easy' | 'medium' | 'hard' => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('set1')) {
    return 'hard';
  } else if (lowerFilename.includes('set2')) {
    return 'medium';
  } else if (lowerFilename.includes('set3')) {
    return 'easy';
  }
  
  // Default to medium if no pattern is detected
  return 'medium';
};

interface CsvQuestion {
  subjectId: string;
  subjectName?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string; // A, B, C, or D
  marks?: string;
}

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: string[];
}

/**
 * Import questions from a JSON file to Firestore
 * @param file The JSON file containing questions
 * @param subjectId Optional subject ID to assign to all questions
 */
export const importQuestionsFromFile = async (file: File, subjectId?: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Detect difficulty from filename
    const detectedDifficulty = detectDifficultyFromFilename(file.name);
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const jsonContent = event.target.result as string;
        let parsedData = JSON.parse(jsonContent);
        let questions = [];
        
        // Auto-detect and normalize the JSON structure
        if (Array.isArray(parsedData)) {
          // Direct array of questions
          questions = parsedData;
        } else if (parsedData && typeof parsedData === 'object') {
          // Check for common patterns in JSON structure
          if (parsedData.questions && Array.isArray(parsedData.questions)) {
            // { questions: [...] } format
            questions = parsedData.questions;
          } else if (parsedData.data && Array.isArray(parsedData.data)) {
            // { data: [...] } format
            questions = parsedData.data;
          } else if (parsedData.items && Array.isArray(parsedData.items)) {
            // { items: [...] } format
            questions = parsedData.items;
          } else {
            // If no recognizable arrays found, try to convert the object itself
            const possibleQuestions = Object.values(parsedData).filter(val => 
              typeof val === 'object' && val !== null && 'question' in val && 'options' in val
            );
            
            if (possibleQuestions.length > 0) {
              questions = possibleQuestions;
            } else {
              throw new Error('Could not find questions in the JSON structure');
            }
          }
        } else {
          throw new Error('JSON file must contain questions in a recognizable format');
        }
        
        // Validate and normalize the questions
        const normalizedQuestions = questions.map((q: any, index: number) => {
          // Handle different property names that might be in the import
          const normalizedQuestion: any = {
            question: q.question || q.text || q.title || '',
            options: q.options || q.answers || q.choices || [],
            correctAnswer: q.correctAnswer || q.answer || q.correct || '',
            type: q.type || 'single',
            points: q.points || q.value || 10,
            subject: subjectId || q.subject || q.category || ''
          };
          
          // Convert options from object format {a: "option1", b: "option2"} to array if needed
          if (!Array.isArray(normalizedQuestion.options) && typeof normalizedQuestion.options === 'object') {
            normalizedQuestion.options = Object.values(normalizedQuestion.options);
          }
          
          // Ensure correctAnswer is a string
          if (typeof normalizedQuestion.correctAnswer !== 'string') {
            // If correctAnswer is an index, convert it to the actual option
            if (typeof normalizedQuestion.correctAnswer === 'number' && 
                Array.isArray(normalizedQuestion.options) && 
                normalizedQuestion.correctAnswer < normalizedQuestion.options.length) {
              normalizedQuestion.correctAnswer = normalizedQuestion.options[normalizedQuestion.correctAnswer];
            } else {
              // Try to stringify it
              normalizedQuestion.correctAnswer = String(normalizedQuestion.correctAnswer);
            }
          }
          
          return normalizedQuestion;
        }).filter((q: any) => q.question && q.options && q.options.length > 0 && q.correctAnswer);
        
        // If a subject ID is provided, ensure all questions are associated with it
        if (subjectId) {
          normalizedQuestions.forEach((q: any) => q.subject = subjectId);
        }
        
        const importedCount = await batchAddQuestions(normalizedQuestions, subjectId, detectedDifficulty);
        resolve(importedCount);
      } catch (error) {
        console.error('Error importing questions:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Add multiple questions to Firestore in batches
 * @param questions Array of questions to add
 * @param subjectId Optional subject ID to assign to all questions
 * @param difficulty Optional difficulty level to assign to all questions
 * @returns Number of questions imported
 */
const batchAddQuestions = async (questions: any[], subjectId?: string, difficulty?: 'easy' | 'medium' | 'hard'): Promise<number> => {
  // Ensure db is not null before proceeding
  if (!db) {
    throw new Error('Firestore database is not initialized');
  }
  
  const firestoreDb = db as Firestore;
  const questionsCollection = collection(firestoreDb, 'questions');
  const batch = writeBatch(firestoreDb);
  let count = 0;
  
  // Process in smaller batches to avoid Firestore limits
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    // Validate question structure
    if (!question.question || !question.options || !question.correctAnswer) {
      console.warn(`Skipping invalid question at index ${i}`);
      continue;
    }
    
    // Create the question object
    const questionData: Question = {
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      type: question.type || 'single',
      points: question.points || 10,
      // If subjectId is provided, it takes precedence over any existing subject property
      subject: subjectId || question.subject || null,
      // Add difficulty field - use provided difficulty or question's difficulty or default to medium
      difficulty: difficulty || question.difficulty || 'medium'
    };
    
    // Create a new document for each question instead of updating existing ones
    const newDoc = doc(questionsCollection);
    batch.set(newDoc, questionData);
    count++;
    
    // Commit in batches of 500 (Firestore limit)
    if (count % 500 === 0) {
      await batch.commit();
    }
  }
  
  // Commit any remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  return count;
};

/**
 * Extract and create unique subjects from a questions file
 * @param file The JSON file containing questions with subjects
 */
export const importQuestionsFromCsv = async (
  file: File,
  defaultSubjectId?: string
): Promise<ImportResult> => {
  // Ensure db is not null before proceeding
  if (!db) {
    return Promise.resolve({
      success: false,
      total: 0,
      imported: 0,
      errors: ['Firestore database is not initialized']
    });
  }
  
  const firestoreDb = db as Firestore;
  
  // Detect difficulty from filename
  const detectedDifficulty = detectDifficultyFromFilename(file.name);
  
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const questions = results.data as CsvQuestion[];
          const errors: string[] = [];
          
          // Validate data
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question?.trim()) {
              errors.push(`Row ${i + 2}: Missing question`);
            }
            if (!q.optionA?.trim() || !q.optionB?.trim() || !q.optionC?.trim() || !q.optionD?.trim()) {
              errors.push(`Row ${i + 2}: All options (A-D) are required`);
            }
            if (!['A', 'B', 'C', 'D'].includes(q.correctOption?.toUpperCase())) {
              errors.push(`Row ${i + 2}: Correct option must be A, B, C, or D`);
            }
            if (defaultSubjectId) {
              q.subjectId = defaultSubjectId;
            } else if (!q.subjectId?.trim()) {
              errors.push(`Row ${i + 2}: Missing subjectId`);
            }
          }

          if (errors.length > 0) {
            resolve({
              success: false,
              total: questions.length,
              imported: 0,
              errors
            });
            return;
          }

          // Batch write to Firestore
          const batchSize = 500;
          let imported = 0;
          
          for (let i = 0; i < questions.length; i += batchSize) {
            const batch = writeBatch(firestoreDb);
            const batchQuestions = questions.slice(i, i + batchSize);
            
            for (const q of batchQuestions) {
              const questionDoc = {
                question: q.question.trim(),
                options: [
                  q.optionA.trim(),
                  q.optionB.trim(),
                  q.optionC.trim(),
                  q.optionD.trim()
                ],
                correctAnswer: q.correctOption.toUpperCase(),
                subject: defaultSubjectId || q.subjectId.trim(), // Use defaultSubjectId if provided
                difficulty: detectedDifficulty, // Auto-assign difficulty based on filename
                marks: q.marks ? parseInt(q.marks) || 1 : 1,
                createdAt: new Date()
              };
              
              // Store in the main questions collection, not in a subcollection
              const docRef = doc(collection(firestoreDb, 'questions'));
              batch.set(docRef, questionDoc);
            }
            
            await batch.commit();
            imported += batchQuestions.length;
          }

          resolve({
            success: true,
            total: questions.length,
            imported,
            errors: []
          });
        } catch (error: any) {
          resolve({
            success: false,
            total: 0,
            imported: 0,
            errors: [error.message || 'Failed to process CSV file']
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          total: 0,
          imported: 0,
          errors: [error.message || 'Failed to parse CSV file']
        });
      }
    });
  });
};

export const extractAndCreateSubjects = async (file: File): Promise<Subject[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const jsonContent = event.target.result as string;
        const questions = JSON.parse(jsonContent);
        
        if (!Array.isArray(questions)) {
          throw new Error('JSON file must contain an array of questions');
        }
        
        // Extract unique subject names
        const subjectNames = new Set<string>();
        questions.forEach(q => {
          if (q.subject && typeof q.subject === 'string') {
            subjectNames.add(q.subject);
          }
        });
        
        // Create subjects in Firestore
        const subjectsCollection = collection(firestoreDb, 'subjects');
        const createdSubjects: Subject[] = [];
        
        for (const name of subjectNames) {
          // Check if subject already exists
          const subjectQuery = query(subjectsCollection, where('name', '==', name));
          const existingSubjects = await getDocs(subjectQuery);
          
          if (existingSubjects.empty) {
            // Create new subject
            const newSubject: Subject = { name, description: `Created from import on ${new Date().toLocaleString()}` };
            const docRef = await addDoc(subjectsCollection, newSubject);
            createdSubjects.push({ ...newSubject, id: docRef.id });
          } else {
            // Use existing subject
            const existingSubject = existingSubjects.docs[0];
            createdSubjects.push({ 
              id: existingSubject.id, 
              ...existingSubject.data() as Subject 
            });
          }
        }
        
        resolve(createdSubjects);
      } catch (error) {
        console.error('Error extracting subjects:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Clear all questions in the database
 * Use with caution!
 */
export const clearAllQuestions = async (): Promise<number> => {
  const questionsCollection = collection(firestoreDb, 'questions');
  const questionsSnapshot = await getDocs(questionsCollection);
  let count = 0;
  
  const batch = writeBatch(firestoreDb);
  
  questionsSnapshot.forEach(document => {
    batch.delete(doc(firestoreDb, 'questions', document.id));
    count++;
    
    // Commit in batches of 500 (Firestore limit)
    if (count % 500 === 0) {
      batch.commit();
    }
  });
  
  // Commit any remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  return count;
}; 