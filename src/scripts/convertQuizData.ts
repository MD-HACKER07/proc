import fs from 'fs';
import path from 'path';

/**
 * Convert TypeScript quiz data to proper JSON format
 */
async function convertQuizData() {
  try {
    // Read the original TypeScript file content
    const tsFilePath = path.resolve('./src/data/quizData.ts');
    const tsFileContent = fs.readFileSync(tsFilePath, 'utf8');
    
    // Extract the quiz data array by finding content between export const quizData = [ ... ];
    const regex = /export const quizData = (\[[\s\S]*?\]);/m;
    const match = tsFileContent.match(regex);
    
    if (!match || !match[1]) {
      throw new Error('Could not find quizData array in the TypeScript file');
    }
    
    // Get the array as a string
    let arrayString = match[1];
    
    // Convert TypeScript syntax to valid JSON
    // Replace single quotes with double quotes
    arrayString = arrayString.replace(/'/g, '"');
    
    // Fix trailing commas in arrays and objects (not allowed in JSON)
    arrayString = arrayString.replace(/,(\s*[\]}])/g, '$1');
    
    // Parse the string to validate it's proper JSON 
    const quizData = JSON.parse(arrayString);
    
    // Make sure all required fields are present
    const validQuestions = quizData.map((q: any, index: number) => {
      if (!q.id || !q.question || !q.options || !q.correctAnswer) {
        console.warn(`Question at index ${index} is missing required fields, adding defaults`);
      }
      
      // Ensure consistent format
      return {
        id: q.id || `question_${index + 1}`,
        question: q.question || 'Missing question text',
        options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || q.options?.[0] || 'Option A',
        subject: q.subject || null
      };
    });
    
    // Write to JSON file
    const jsonFilePath = path.resolve('./src/data/quizData.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(validQuestions, null, 2));
    
    console.log(`Successfully converted ${validQuestions.length} questions to JSON format`);
    console.log(`Output saved to ${jsonFilePath}`);
    
    return validQuestions.length;
  } catch (error) {
    console.error('Error converting quiz data:', error);
    throw error;
  }
}

// Run the script
convertQuizData()
  .then(count => {
    console.log(`Conversion completed. ${count} questions processed.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Conversion failed:', error);
    process.exit(1);
  }); 