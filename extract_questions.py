import pandas as pd
import json
import os

# Path to the Excel file
excel_file = "D:/app/project/src/Excel/quiz question bank svtt.xlsx"

try:
    # Read the Excel file
    df = pd.read_excel(excel_file)
    
    # Initialize an empty list to store questions
    questions = []
    
    # Process each row in the dataframe
    for index, row in df.iterrows():
        question_data = {}
        
        # Extract question text and options
        if 'Question' in df.columns:
            question_data['question'] = str(row['Question']) if not pd.isna(row['Question']) else ""
        
        # Extract options A, B, C, D
        options = []
        for opt in ['A', 'B', 'C', 'D']:
            if opt in df.columns and not pd.isna(row[opt]):
                options.append(str(row[opt]))
        question_data['options'] = options
        
        # Extract correct answer
        if 'Answer' in df.columns:
            question_data['answer'] = str(row['Answer']) if not pd.isna(row['Answer']) else ""
        
        # Add the question to our list
        questions.append(question_data)
    
    # Save to JSON file
    output_file = "D:/app/project/src/data/questions.json"
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({'questions': questions}, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully extracted {len(questions)} questions to {output_file}")

except Exception as e:
    print(f"Error: {e}") 