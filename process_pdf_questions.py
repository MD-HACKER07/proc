import json
import re

# Paths to input files
pdf_questions_file = "D:/app/project/src/data/pdf_questions.json"
existing_quiz_file = "D:/app/project/src/data/quizData.ts"

# Output file
output_file = "D:/app/project/src/data/updatedQuizData.ts"

# Load PDF questions
with open(pdf_questions_file, 'r', encoding='utf-8') as f:
    pdf_data = json.load(f)

# Clean PDF questions
cleaned_questions = []
for q in pdf_data["questions"]:
    # Remove "Question" prefixes and number prefixes
    question_text = q["question"]
    question_text = re.sub(r'^Question\s*\d*', '', question_text)
    question_text = re.sub(r'^\d+\.?\s*', '', question_text)
    question_text = question_text.strip()
    
    # Skip empty or very short questions
    if len(question_text) < 5:
        continue
    
    # Skip duplicates
    if not any(cq["question"] == question_text for cq in cleaned_questions):
        cleaned_questions.append({
            "question": question_text,
            "options": []
        })

print(f"Cleaned {len(cleaned_questions)} questions from PDF")

# Read current quizData.ts to extract existing questions
with open(existing_quiz_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the existing question objects from quizData.ts
existing_questions_text = re.search(r'const quizData = \[(.*?)\];', content, re.DOTALL)
if existing_questions_text:
    existing_questions_text = existing_questions_text.group(1)
else:
    existing_questions_text = ""

# Count how many questions are already in the file
existing_count = content.count('"id":')
print(f"Found {existing_count} existing questions in quizData.ts")

# Generate new question entries
new_entries = []
next_id = existing_count + 1

for i, q in enumerate(cleaned_questions):
    # Check if question is already in the existing data
    if q["question"] in content:
        print(f"Skipping duplicate question: {q['question'][:30]}...")
        continue
        
    # Create quiz question object
    entry = f'''  {{
    id: {next_id},
    question: "{q['question']}",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    type: "single",
    points: 10
  }}'''
    
    new_entries.append(entry)
    next_id += 1

# If we found new questions to add
if new_entries:
    # Create the updated quizData content
    if existing_questions_text:
        updated_content = content.replace(
            'const quizData = [',
            'const quizData = [\n' + ',\n'.join(new_entries) + ',\n'
        )
    else:
        # If we couldn't parse the existing content, create a new file
        updated_content = f'''const quizData = [
{',\n'.join(new_entries)}
];

export default quizData;'''

    # Write the updated file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    print(f"Added {len(new_entries)} new questions to {output_file}")
else:
    print("No new questions to add.") 