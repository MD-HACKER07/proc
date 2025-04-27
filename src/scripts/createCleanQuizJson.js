import { readFileSync, writeFileSync } from 'fs';

// Function to properly format option text
function cleanOptionText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

// Function to create a clean quiz JSON file
function createCleanQuizJson() {
  try {
    // First, let's read in the raw PDF content for reference to help with formatting
    const pdfContent = readFileSync('pdf_content.txt', 'utf8');
    const lines = pdfContent.split('\n');
    
    // Find the indices for parsing the different sections
    const optionOneIndex = lines.findIndex(line => line.includes('Option One Option Two'));
    const optionThreeIndex = lines.findIndex(line => line.includes('Option Three Option Four Correct Option'));
    
    // Extract the raw option lines for reference
    const optionOneTwoLines = lines.slice(optionOneIndex + 1, optionThreeIndex)
      .filter(line => line.trim() !== '');
    const optionThreeFourLines = lines.slice(optionThreeIndex + 1)
      .filter(line => line.trim() !== '');
    
    // Now read our structured JSON data to fix
    const osQuestions = JSON.parse(readFileSync('src/data/osQuestions.json', 'utf8'));
    
    if (!Array.isArray(osQuestions)) {
      throw new Error('OS questions data is not an array');
    }
    
    // Create improved questions with better option formatting
    const cleanedQuestions = osQuestions.map((question, index) => {
      try {
        // Get the corresponding option lines from the raw data
        const optionLine = optionOneTwoLines[index];
        const answerLine = optionThreeFourLines[index];
        
        if (!optionLine || !answerLine) {
          return question; // Keep original if we can't find raw data
        }
        
        // Extract properly formatted options
        // Last word of optionLine is option 2, rest is option 1
        const optLineParts = optionLine.split(' ');
        const option2 = optLineParts.pop();
        const option1 = optLineParts.join(' ');
        
        // Last character of answerLine is the correct answer letter
        // Last word before that is option 4, rest is option 3
        const correctLetter = answerLine.slice(-1);
        const answerNoCLetter = answerLine.slice(0, -1).trim();
        const answerParts = answerNoCLetter.split(' ');
        const option4 = answerParts.pop();
        const option3 = answerParts.join(' ');
        
        // Create clean options array
        const cleanOptions = [
          cleanOptionText(option1),
          cleanOptionText(option2),
          cleanOptionText(option3),
          cleanOptionText(option4)
        ];
        
        // Determine the correct answer based on the letter
        let correctAnswer = '';
        switch (correctLetter) {
          case 'A': correctAnswer = cleanOptions[0]; break;
          case 'B': correctAnswer = cleanOptions[1]; break;
          case 'C': correctAnswer = cleanOptions[2]; break;
          case 'D': correctAnswer = cleanOptions[3]; break;
          default: correctAnswer = question.correctAnswer; // Keep original if letter is invalid
        }
        
        return {
          id: question.id,
          question: question.question,
          options: cleanOptions,
          correctAnswer: correctAnswer,
          type: "single",
          points: 10,
          subject: "os",
          category: question.subjectName || 'Operating Systems',
          explanation: question.explanation || `Explanation for ${question.question.substring(0, 20)}...`
        };
      } catch (error) {
        console.error(`Error processing question ${index + 1}:`, error);
        return question; // Return original question if there's an error
      }
    });
    
    // Create the output JSON object
    const outputData = {
      subject: "Operating Systems",
      description: "Test your knowledge of operating system concepts including processes, memory management, scheduling, and more.",
      lastUpdated: new Date().toISOString(),
      questions: cleanedQuestions
    };
    
    // Write to osquiz.json in root directory
    writeFileSync('osquiz.json', JSON.stringify(outputData, null, 2));
    
    console.log(`Successfully created osquiz.json with ${cleanedQuestions.length} clean questions`);
    return true;
  } catch (error) {
    console.error('Error creating clean quiz JSON:', error);
    return false;
  }
}

// Execute the function
createCleanQuizJson(); 