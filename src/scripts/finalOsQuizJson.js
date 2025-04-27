import { readFileSync, writeFileSync } from 'fs';

// Function to clean text and normalize whitespace
function cleanText(text) {
  return text ? text.trim().replace(/\s+/g, ' ') : '';
}

// Function to create a final, clean OS quiz JSON for all 86 questions
function createFinalOsQuizJson() {
  try {
    // Read the raw PDF content for consistent reference
    const pdfContent = readFileSync('pdf_content.txt', 'utf8');
    const lines = pdfContent.split('\n');
    
    // Find section boundaries for better parsing
    const questionStatementIndex = lines.findIndex(line => line.includes('Question Statement'));
    const optionOneIndex = lines.findIndex(line => line.includes('Option One Option Two'));
    const optionThreeIndex = lines.findIndex(line => line.includes('Option Three Option Four Correct Option'));
    
    // Get all questions, options and answers
    const questionLines = lines.slice(questionStatementIndex + 1, optionOneIndex)
      .filter(line => line.trim() !== '');
    const optionOneTwoLines = lines.slice(optionOneIndex + 1, optionThreeIndex)
      .filter(line => line.trim() !== '');
    const optionThreeFourLines = lines.slice(optionThreeIndex + 1)
      .filter(line => line.trim() !== '');
    
    // Read our structured data
    const osQuestionsData = JSON.parse(readFileSync('src/data/osQuestions.json', 'utf8'));

    // Prepare the cleaned questions array
    const cleanedQuestions = [];
    
    // Process each question using raw data from PDF for consistent parsing
    for (let i = 0; i < questionLines.length; i++) {
      try {
        // Get question text
        const questionText = cleanText(questionLines[i]);
        if (!questionText) continue;
        
        // Get option lines
        const optionLine = optionOneTwoLines[i];
        const answerLine = optionThreeFourLines[i];
        if (!optionLine || !answerLine) continue;
        
        // Parse options 1 and 2
        const optLineParts = optionLine.split(' ');
        const option2 = optLineParts.pop() || '';
        const option1 = optLineParts.join(' ');
        
        // Parse options 3 and 4 and correct answer letter
        const correctLetter = answerLine.slice(-1);
        const answerNoCLetter = answerLine.slice(0, -1).trim();
        const answerParts = answerNoCLetter.split(' ');
        const option4 = answerParts.pop() || '';
        const option3 = answerParts.join(' ');
        
        // Clean the option texts
        const cleanOptions = [
          cleanText(option1),
          cleanText(option2),
          cleanText(option3), 
          cleanText(option4)
        ].filter(opt => opt !== '');
        
        // Determine correct answer based on letter
        let correctAnswer = '';
        switch (correctLetter) {
          case 'A': correctAnswer = cleanOptions[0]; break;
          case 'B': correctAnswer = cleanOptions[1]; break;
          case 'C': correctAnswer = cleanOptions[2]; break;
          case 'D': correctAnswer = cleanOptions[3]; break;
          default: correctAnswer = ''; // Unknown correct answer
        }
        
        // If we have invalid data, skip this question
        if (cleanOptions.length < 2 || !correctAnswer) {
          console.warn(`Skipping question due to invalid options or missing correct answer: ${questionText}`);
          continue;
        }
        
        // Find original question data for category and other metadata
        const originalQuestion = osQuestionsData.find(q => 
          q.question.toLowerCase().includes(questionText.toLowerCase().substring(0, 20))
        );
        
        // Determine subject category
        const category = originalQuestion?.subjectName || 'Operating Systems';
        const subjectKey = originalQuestion?.subject || 'os';
        
        // Create the cleaned question object
        const questionObj = {
          id: `os-${subjectKey}-${i + 1}`,
          question: questionText,
          options: cleanOptions,
          correctAnswer: correctAnswer,
          type: "single",
          points: 10,
          subject: "os",
          category: category,
          explanation: `Explanation for: ${questionText.substring(0, 30)}...`
        };
        
        cleanedQuestions.push(questionObj);
      } catch (error) {
        console.error(`Error processing question ${i + 1}:`, error);
      }
    }
    
    // Create the final quiz JSON
    const quizData = {
      subject: "Operating Systems",
      description: "Test your knowledge of operating system concepts including processes, memory management, scheduling, and more.",
      lastUpdated: new Date().toISOString(),
      questions: cleanedQuestions
    };
    
    // Write to final OS quiz JSON file
    writeFileSync('osquiz.json', JSON.stringify(quizData, null, 2));
    
    console.log(`Successfully created final osquiz.json with ${cleanedQuestions.length} questions`);
    return true;
  } catch (error) {
    console.error('Error creating final OS quiz JSON:', error);
    return false;
  }
}

// Execute the function
createFinalOsQuizJson(); 