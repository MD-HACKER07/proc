import { readFileSync, writeFileSync } from 'fs';

// Helper function to clean up option text
function cleanOption(text) {
  return text.trim().replace(/\s+/g, ' ');
}

// Function to convert the PDF text content to JSON format
function convertPdfToJson() {
  try {
    // Read the PDF content from the text file
    const pdfContent = readFileSync('pdf_content.txt', 'utf8');
    
    // Split the content into lines
    const lines = pdfContent.split('\n');
    
    // Find the indices for parsing the different sections
    const optionOneIndex = lines.findIndex(line => line.includes('Option One Option Two'));
    const optionThreeIndex = lines.findIndex(line => line.includes('Option Three Option Four Correct Option'));
    
    if (optionOneIndex === -1 || optionThreeIndex === -1) {
      throw new Error('Could not parse PDF content properly. Missing section headers.');
    }
    
    // Extract questions (skip the first line which is "Question Statement")
    const questions = [];
    for (let i = 1; i < optionOneIndex; i++) {
      if (lines[i].trim() !== '') {
        questions.push(lines[i].trim());
      }
    }
    
    // Extract options (first two options)
    const optionsOneTwo = [];
    for (let i = optionOneIndex + 1; i < optionThreeIndex; i++) {
      if (lines[i].trim() !== '') {
        optionsOneTwo.push(lines[i].trim());
      }
    }
    
    // Extract options (third, fourth options and correct answer)
    const optionsThreeFourCorrect = [];
    for (let i = optionThreeIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        optionsThreeFourCorrect.push(lines[i].trim());
      }
    }
    
    // Create the quiz data structure
    const quizData = [];
    
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      try {
        // Skip empty questions
        if (!questions[i] || questions[i].trim() === '') continue;
        
        // Get the options for this question
        const optionLine = optionsOneTwo[i];
        if (!optionLine) continue;
        
        // Get the answer line with options three and four + correct answer
        const answerLine = optionsThreeFourCorrect[i];
        if (!answerLine) continue;
        
        // Extract options and correct answer
        // Structure is different for each section, so we need to handle differently
        
        // Find the last index of space to split option one and two
        const lastSpaceOptions = optionLine.lastIndexOf(' ');
        const optionOne = cleanOption(optionLine.substring(0, lastSpaceOptions));
        const optionTwo = cleanOption(optionLine.substring(lastSpaceOptions + 1));
        
        // Parse answer line - last character is the correct option (A, B, C, or D)
        const correctOption = answerLine.charAt(answerLine.length - 1);
        
        // Rest of the line contains option three and four
        const answerPartsStr = answerLine.substring(0, answerLine.length - 1).trim();
        const lastSpaceAnswers = answerPartsStr.lastIndexOf(' ');
        const optionThree = cleanOption(answerPartsStr.substring(0, lastSpaceAnswers));
        const optionFour = cleanOption(answerPartsStr.substring(lastSpaceAnswers + 1));
        
        // Map correct option letter to the actual option
        let correctAnswer = '';
        switch (correctOption) {
          case 'A':
            correctAnswer = optionOne;
            break;
          case 'B':
            correctAnswer = optionTwo;
            break;
          case 'C':
            correctAnswer = optionThree;
            break;
          case 'D':
            correctAnswer = optionFour;
            break;
          default:
            // If correct option doesn't match A/B/C/D, skip this question
            continue;
        }
        
        // Create a question object
        const questionObj = {
          id: `os-q${i + 1}`,
          question: questions[i],
          options: [optionOne, optionTwo, optionThree, optionFour].filter(opt => opt !== ''),
          correctAnswer: correctAnswer,
          type: 'single',
          points: 10,
          subject: 'os',
          explanation: `This is the explanation for the question about ${questions[i].substring(0, 30)}...`
        };
        
        quizData.push(questionObj);
      } catch (error) {
        console.error(`Error processing question ${i + 1}:`, error);
      }
    }
    
    // Write the JSON to a file
    const jsonData = JSON.stringify(quizData, null, 2);
    writeFileSync('src/data/osQuestions.json', jsonData);
    
    console.log(`Successfully converted PDF content to JSON with ${quizData.length} questions.`);
    console.log('Saved to src/data/osQuestions.json');
    
    return quizData;
  } catch (error) {
    console.error('Error converting PDF to JSON:', error);
    return [];
  }
}

// Execute the function
convertPdfToJson(); 