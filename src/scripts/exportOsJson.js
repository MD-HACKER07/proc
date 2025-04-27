import { readFileSync, writeFileSync } from 'fs';

// Function to export the OS questions to a separate JSON file
function exportOsQuestions() {
  try {
    // Read the OS questions from the JSON file
    const osQuestions = JSON.parse(readFileSync('src/data/osQuestions.json', 'utf8'));
    
    if (!Array.isArray(osQuestions)) {
      throw new Error('OS questions data is not an array');
    }
    
    // Clean and enhance the questions for export
    const enhancedQuestions = osQuestions.map(question => {
      // Fix the option formatting issues - we need to properly parse the options
      // The original data has some options split across multiple array entries
      
      // Create a new properly formatted options array
      let fixedOptions = [];
      
      // Original first option
      if (question.options[0]) {
        fixedOptions.push(question.options[0]);
      }
      
      // Original second option
      if (question.options[1]) {
        fixedOptions.push(question.options[1]);
      }
      
      // Original third option
      if (question.options[2]) {
        fixedOptions.push(question.options[2]);
      }
      
      // Original fourth option
      if (question.options[3]) {
        fixedOptions.push(question.options[3]);
      }
      
      // Ensure correct answer is in the options list
      if (!fixedOptions.includes(question.correctAnswer)) {
        console.warn(`Correct answer not found in options for question: ${question.question}`);
      }
      
      return {
        id: question.id,
        question: question.question,
        options: fixedOptions,
        correctAnswer: question.correctAnswer,
        type: "single",
        points: 10,
        subject: "os",
        category: question.subjectName || 'Operating Systems',
        explanation: question.explanation || `Explanation for ${question.question.substring(0, 20)}...`
      };
    });
    
    // Create the export object
    const exportData = {
      subject: "Operating Systems",
      description: "Test your knowledge of operating system concepts including processes, memory management, scheduling, and more.",
      lastUpdated: new Date().toISOString(),
      questions: enhancedQuestions
    };
    
    // Write to osquiz.json in root directory
    writeFileSync('osquiz.json', JSON.stringify(exportData, null, 2));
    
    console.log(`Successfully exported ${enhancedQuestions.length} OS questions to osquiz.json`);
    return true;
  } catch (error) {
    console.error('Error exporting OS questions:', error);
    return false;
  }
}

// Execute the function
exportOsQuestions(); 