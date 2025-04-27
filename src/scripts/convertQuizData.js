import fs from 'fs';
import path from 'path';

async function convertQuizData() {
  try {
    // Read the TypeScript file
    const tsFilePath = path.resolve('src/data/quizData.ts');
    const tsContent = await fs.promises.readFile(tsFilePath, 'utf8');
    
    // Extract the quiz data using regex
    const regex = /export const quizData = (\[[\s\S]*?\]);/;
    const match = tsContent.match(regex);
    
    if (!match || !match[1]) {
      console.error('Failed to extract quiz data from TypeScript file');
      return;
    }
    
    // Parse the extracted data
    const dataString = match[1];
    let quizData;
    
    try {
      // Use Function constructor to evaluate the array syntax safely
      quizData = new Function(`return ${dataString}`)();
    } catch (error) {
      console.error('Failed to parse quiz data:', error);
      return;
    }
    
    // Validate quiz data
    const validQuestions = [];
    const invalidQuestions = [];
    
    for (const question of quizData) {
      const requiredFields = ['id', 'question', 'options', 'correctAnswer'];
      const isValid = requiredFields.every(field => question[field] !== undefined);
      
      if (isValid) {
        validQuestions.push(question);
      } else {
        invalidQuestions.push(question);
      }
    }
    
    if (invalidQuestions.length > 0) {
      console.warn(`Found ${invalidQuestions.length} invalid questions`);
    }
    
    // Write valid questions to JSON file
    const jsonFilePath = path.resolve('src/data/quizData.json');
    await fs.promises.writeFile(
      jsonFilePath,
      JSON.stringify(validQuestions, null, 2)
    );
    
    console.log(`Successfully converted ${validQuestions.length} questions to JSON`);
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

// Execute the function
convertQuizData(); 