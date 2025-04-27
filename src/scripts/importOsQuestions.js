import { readFileSync } from 'fs';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Create a subject for OS in Firebase if it doesn't exist yet
async function createOsSubject() {
  try {
    const subjectsCollection = collection(db, 'subjects');
    
    // Create a new subject for Operating Systems
    const subjectData = {
      name: 'Operating Systems',
      description: 'Test your knowledge of operating system concepts, processes, memory management, and more.',
      icon: 'server',
      color: 'blue',
    };
    
    const subjectRef = await addDoc(subjectsCollection, subjectData);
    console.log('Created new OS subject with ID:', subjectRef.id);
    return subjectRef.id;
  } catch (error) {
    console.error('Error creating OS subject:', error);
    throw error;
  }
}

// Import questions from JSON file to Firebase
async function importOsQuestions() {
  try {
    // Read the questions from the JSON file
    const questionsData = JSON.parse(readFileSync('src/data/osQuestions.json', 'utf8'));
    
    if (!Array.isArray(questionsData)) {
      throw new Error('Questions data is not an array');
    }
    
    console.log(`Found ${questionsData.length} questions to import`);
    
    // Create OS subject if it doesn't exist
    const subjectId = await createOsSubject();
    
    // Reference to the questions collection
    const questionsCollection = collection(db, 'questions');
    
    // Counter for successfully imported questions
    let importedCount = 0;
    
    // Import each question
    for (const question of questionsData) {
      try {
        // Add subject ID to the question
        const questionWithSubject = {
          ...question,
          subject: subjectId
        };
        
        // Remove the generated ID as Firebase will create a new one
        delete questionWithSubject.id;
        
        // Add the question to Firebase
        await addDoc(questionsCollection, questionWithSubject);
        importedCount++;
        
        // Show progress every 10 questions
        if (importedCount % 10 === 0) {
          console.log(`Imported ${importedCount} questions...`);
        }
      } catch (error) {
        console.error(`Error importing question: ${question.question}`, error);
      }
    }
    
    console.log(`Successfully imported ${importedCount} out of ${questionsData.length} questions`);
    return importedCount;
  } catch (error) {
    console.error('Error importing OS questions:', error);
    return 0;
  }
}

// Run the import function
importOsQuestions().then(() => {
  console.log('Import process completed');
}).catch(error => {
  console.error('Import process failed:', error);
}); 