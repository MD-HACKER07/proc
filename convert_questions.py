import json

def convert_questions(input_file, output_file):
    try:
        # Read input JSON
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        # Convert questions to simplified format
        simplified_questions = []
        for q in data:
            simplified_q = {
                "id": int(q["id"].split("-")[-1]),
                "question": q["question"],
                "options": [opt.strip() for opt in q["options"]],
                "correctAnswer": q["correctAnswer"],
                "category": q["subjectName"]
            }
            simplified_questions.append(simplified_q)
        
        # Write output JSON
        with open(output_file, 'w') as f:
            json.dump({"questions": simplified_questions}, f, indent=2)
        
        print(f"Successfully converted {len(simplified_questions)} questions")
        
    except Exception as e:
        print(f"Error converting questions: {str(e)}")

if __name__ == "__main__":
    input_file = "osquiz.json"
    output_file = "simplified_questions.json"
    convert_questions(input_file, output_file)