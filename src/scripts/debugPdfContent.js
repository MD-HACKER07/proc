import { readFileSync, writeFileSync } from 'fs';

function debugPdfContent() {
  try {
    // Read the PDF content from the text file
    const pdfContent = readFileSync('pdf_content.txt', 'utf8');
    
    // Split the content into lines
    const lines = pdfContent.split('\n');
    
    // Create a debug report with line numbers
    let debugReport = 'PDF CONTENT ANALYSIS:\n\n';
    debugReport += 'Total lines: ' + lines.length + '\n\n';
    
    // Add line numbers for easier reference
    lines.forEach((line, index) => {
      debugReport += `Line ${index + 1}: ${line}\n`;
    });
    
    // Try to find section markers
    const optionOneIndex = lines.findIndex(line => line.includes('Option One Option Two'));
    const optionThreeIndex = lines.findIndex(line => line.includes('Option Three Option Four Correct Option'));
    
    debugReport += '\n\nSection Headers:\n';
    debugReport += `"Option One Option Two" appears at line: ${optionOneIndex + 1}\n`;
    debugReport += `"Option Three Option Four Correct Option" appears at line: ${optionThreeIndex + 1}\n`;
    
    // Write the debug report to a file
    writeFileSync('pdf_debug_report.txt', debugReport);
    
    console.log('Debug report created at pdf_debug_report.txt');
    
    // Attempt to extract the first few questions and options as a test
    const questions = lines.slice(1, Math.min(11, optionOneIndex !== -1 ? optionOneIndex : lines.length));
    
    console.log('\nFirst few questions:');
    questions.forEach(q => console.log(` - ${q}`));
    
    return true;
  } catch (error) {
    console.error('Error analyzing PDF content:', error);
    return false;
  }
}

// Execute the function
debugPdfContent(); 