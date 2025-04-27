import PyPDF2
import json
import os
import re

# Path to the PDF file
pdf_file = "D:/app/project/src/Excel/quiz question bank svtt.pdf"

# Output JSON file
output_file = "D:/app/project/src/data/pdf_questions.json"
# Debug file for raw text
debug_file = "D:/app/project/src/data/pdf_debug.txt"

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
        return text

# Function to parse questions from text
def extract_questions(text):
    # Save raw text for debugging
    with open(debug_file, 'w', encoding='utf-8') as f:
        f.write(text)
    
    print(f"Extracted PDF text saved to {debug_file}")
    
    # Try to find question-like patterns
    # This is a more flexible pattern looking for question-like sentences
    # Look for sentences ending with question marks or numbered items
    question_patterns = [
        r'(\d+\.\s+.+?(?:\?|\.)\s*)',  # Numbered questions (1. What is...?)
        r'([A-Z][^.!?]*\?\s*)',        # Questions ending with ?
        r'(What is .+?[.?]\s*)',       # Questions starting with "What is"
        r'(Which .+?[.?]\s*)',         # Questions starting with "Which"
        r'(How .+?[.?]\s*)'            # Questions starting with "How"
    ]
    
    questions = []
    for pattern in question_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            question_text = match.strip()
            
            # Skip if the question is too short
            if len(question_text) < 10:
                continue
                
            # Create question object
            question_obj = {
                "question": question_text,
                "options": []
            }
            
            # Add only if not already present
            if not any(q["question"] == question_text for q in questions):
                questions.append(question_obj)
    
    return questions

try:
    # Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_file)
    
    # Extract questions from text
    questions = extract_questions(pdf_text)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"questions": questions}, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully extracted {len(questions)} questions to {output_file}")

except Exception as e:
    print(f"Error: {e}") 