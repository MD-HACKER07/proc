import { readFileSync, writeFileSync } from 'fs';

// OS quiz data - manually structured for clean output
const OS_SUBJECTS = {
  'processes': 'Process Management',
  'scheduling': 'CPU Scheduling',
  'deadlock': 'Deadlock',
  'memory': 'Memory Management',
  'paging': 'Paging & Virtual Memory',
  'concurrency': 'Concurrency & Synchronization',
  'filesystem': 'File Systems',
  'disk': 'Disk Management'
};

// Map questions to subject areas based on keywords
function categorizeQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('process') || lowerQuestion.includes('fork') || lowerQuestion.includes('dup')) {
    return 'processes';
  } else if (lowerQuestion.includes('scheduling') || lowerQuestion.includes('sjf') || 
            lowerQuestion.includes('fcfs') || lowerQuestion.includes('robin') || 
            lowerQuestion.includes('priority') || lowerQuestion.includes('stcf')) {
    return 'scheduling';
  } else if (lowerQuestion.includes('deadlock')) {
    return 'deadlock';
  } else if (lowerQuestion.includes('memory') || lowerQuestion.includes('allocation') || 
             lowerQuestion.includes('fragmentation')) {
    return 'memory';
  } else if (lowerQuestion.includes('page') || lowerQuestion.includes('frame') || 
             lowerQuestion.includes('fifo') || lowerQuestion.includes('lru')) {
    return 'paging';
  } else if (lowerQuestion.includes('concurrency') || lowerQuestion.includes('mutex') || 
             lowerQuestion.includes('lock') || lowerQuestion.includes('semaphore') || 
             lowerQuestion.includes('critical')) {
    return 'concurrency';
  } else if (lowerQuestion.includes('file') || lowerQuestion.includes('directory')) {
    return 'filesystem';
  } else if (lowerQuestion.includes('disk') || lowerQuestion.includes('scan') || 
             lowerQuestion.includes('sstf')) {
    return 'disk';
  }
  
  return 'processes'; // Default
}

// Function to parse the PDF content into a structured JSON
function parseOsQuestions() {
  try {
    // Read the PDF content from the text file
    const pdfContent = readFileSync('pdf_content.txt', 'utf8');
    
    // Split the content into lines and remove empty lines
    const lines = pdfContent.split('\n').filter(line => line.trim() !== '');
    
    // Find the section boundaries
    const questionHeaderIndex = lines.findIndex(line => line.includes('Question Statement'));
    const optionOneHeaderIndex = lines.findIndex(line => line.includes('Option One Option Two'));
    const optionThreeHeaderIndex = lines.findIndex(line => line.includes('Option Three Option Four Correct Option'));
    
    // Extract questions (skip the "Question Statement" header)
    const questionLines = lines.slice(questionHeaderIndex + 1, optionOneHeaderIndex);
    
    // Extract options sections
    const optionOneTwoLines = lines.slice(optionOneHeaderIndex + 1, optionThreeHeaderIndex);
    const optionThreeFourCorrectLines = lines.slice(optionThreeHeaderIndex + 1);
    
    // Create an array to hold the structured questions
    const questionsData = [];
    
    // Process each question
    for (let i = 0; i < questionLines.length; i++) {
      try {
        // Skip empty questions
        const questionText = questionLines[i]?.trim();
        if (!questionText) continue;
        
        // Get corresponding option lines
        const optionLine = optionOneTwoLines[i]?.trim();
        const answerLine = optionThreeFourCorrectLines[i]?.trim();
        
        // Skip if we can't find the options
        if (!optionLine || !answerLine) continue;
        
        // Parse options better
        // Options 1 and 2 are in optionLine
        const optionLineParts = optionLine.split(' ');
        const optionTwo = optionLineParts.pop(); // Last word is option two
        const optionOne = optionLineParts.join(' '); // Rest is option one
        
        // Options 3, 4 and correct answer are in answerLine
        // Last character is the correct answer letter
        const correctOption = answerLine.slice(-1);
        const optionAnswerParts = answerLine.slice(0, -1).trim().split(' ');
        const optionFour = optionAnswerParts.pop(); // Last word before correct option is option four
        const optionThree = optionAnswerParts.join(' '); // Rest is option three
        
        // Map correct option letter to the option text
        let correctAnswer = '';
        switch (correctOption) {
          case 'A': correctAnswer = optionOne; break;
          case 'B': correctAnswer = optionTwo; break;
          case 'C': correctAnswer = optionThree; break;
          case 'D': correctAnswer = optionFour; break;
          default: continue; // Skip if we don't have a valid correct option
        }
        
        // Determine subject category
        const subjectKey = categorizeQuestion(questionText);
        const subjectName = OS_SUBJECTS[subjectKey];
        
        // Create the question object
        const questionObj = {
          id: `os-${subjectKey}-${i + 1}`,
          question: questionText,
          options: [optionOne, optionTwo, optionThree, optionFour],
          correctAnswer: correctAnswer,
          type: 'single',
          points: 10,
          subject: subjectKey,
          subjectName: subjectName,
          explanation: `Explanation for: ${questionText.substring(0, 30)}...`
        };
        
        questionsData.push(questionObj);
      } catch (error) {
        console.error(`Error processing question ${i + 1}:`, error);
      }
    }
    
    // Save the structured data to a JSON file
    writeFileSync('src/data/osQuestions.json', JSON.stringify(questionsData, null, 2));
    
    console.log(`Successfully converted PDF content to JSON with ${questionsData.length} questions`);
    console.log('Saved to src/data/osQuestions.json');
    
    return questionsData;
  } catch (error) {
    console.error('Error parsing OS questions:', error);
    return [];
  }
}

// Run the parsing function
parseOsQuestions(); 