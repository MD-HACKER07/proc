import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// Firebase configuration from your config.ts
const firebaseConfig = {
  apiKey: "AIzaSyAdtT_Hh-whneElJ1f3VpU7CDKzitezQDg",
  authDomain: "quiz-by-md.firebaseapp.com",
  projectId: "quiz-by-md",
  storageBucket: "quiz-by-md.firebasestorage.app",
  messagingSenderId: "777075871934",
  appId: "1:777075871934:web:fe4859db2943d870094eef",
  measurementId: "G-4GV319B3ZT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Import questions from local JSON file to Firestore
 * @param filePath Path to the JSON file containing questions
 */
async function importQuestionsFromFile(filePath: string) {
  try {
    // Read file
    const data = fs.readFileSync(path.resolve(filePath), 'utf8');
    const questions = JSON.parse(data);
    
    if (!Array.isArray(questions)) {
      throw new Error('JSON file must contain an array of questions');
    }
    
    console.log(`Found ${questions.length} questions in file`);
    
    // Import questions in batches
    const questionsCollection = collection(db, 'questions');
    const batch = writeBatch(db);
    let count = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Validate question
      if (!question.question || !question.options || !question.correctAnswer) {
        console.warn(`Skipping invalid question at index ${i}`);
        continue;
      }
      
      // Create question object
      const questionData = {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        type: question.type || 'single',
        points: question.points || 10,
        subject: question.subject || null
      };
      
      // Add to batch
      const newDoc = doc(questionsCollection);
      batch.set(newDoc, questionData);
      count++;
      
      // Commit in batches of 500 (Firestore limit)
      if (count % 500 === 0) {
        console.log(`Committing batch of ${count} questions...`);
        await batch.commit();
      }
    }
    
    // Commit any remaining documents
    if (count % 500 !== 0) {
      console.log(`Committing final batch of ${count % 500} questions...`);
      await batch.commit();
    }
    
    console.log(`Successfully imported ${count} questions to Firestore`);
    return count;
  } catch (error) {
    console.error('Error importing questions:', error);
    throw error;
  }
}

// Create initial subjects
async function createInitialSubjects() {
  const subjects = [
    { name: 'Selenium Basics', description: 'Fundamental concepts of Selenium WebDriver' },
    { name: 'WebDriver Commands', description: 'Commands and methods for interacting with web elements' },
    { name: 'Advanced Automation', description: 'Advanced techniques for test automation' },
    { name: 'Best Practices', description: 'Best practices for Selenium test automation' }
  ];
  
  const subjectsCollection = collection(db, 'subjects');
  const createdSubjects = [];
  
  for (const subject of subjects) {
    try {
      const docRef = await addDoc(subjectsCollection, subject);
      createdSubjects.push({ ...subject, id: docRef.id });
      console.log(`Created subject: ${subject.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`Error creating subject ${subject.name}:`, error);
    }
  }
  
  return createdSubjects;
}

// Main function
async function main() {
  try {
    // Create subjects first
    console.log('Creating initial subjects...');
    const subjects = await createInitialSubjects();
    console.log(`Created ${subjects.length} subjects`);
    
    // Then import questions
    console.log('Importing questions from quizData.json...');
    const count = await importQuestionsFromFile('./src/data/quizData.json');
    console.log(`Import completed. ${count} questions added to Firestore.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the script
main(); 