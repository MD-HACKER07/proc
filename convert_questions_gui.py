import json
import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path

class QuestionConverterGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("OS Questions Converter")
        self.root.geometry("600x400")
        
        # Input file path
        self.input_frame = tk.Frame(root)
        self.input_frame.pack(pady=10, padx=10, fill=tk.X)
        
        tk.Label(self.input_frame, text="Input JSON:").pack(side=tk.LEFT)
        self.input_path = tk.Entry(self.input_frame)
        self.input_path.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        tk.Button(self.input_frame, text="Browse", command=self.browse_input).pack(side=tk.LEFT)

        # Output file path
        self.output_frame = tk.Frame(root)
        self.output_frame.pack(pady=10, padx=10, fill=tk.X)
        
        tk.Label(self.output_frame, text="Output JSON:").pack(side=tk.LEFT)
        self.output_path = tk.Entry(self.output_frame)
        self.output_path.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        tk.Button(self.output_frame, text="Browse", command=self.browse_output).pack(side=tk.LEFT)

        # Convert button
        tk.Button(root, text="Convert Questions", command=self.convert).pack(pady=10)

        # Log area
        self.log_area = tk.Text(root, height=15)
        self.log_area.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)

    def browse_input(self):
        filename = filedialog.askopenfilename(
            title="Select Input JSON",
            filetypes=[("JSON files", "*.json")]
        )
        if filename:
            self.input_path.delete(0, tk.END)
            self.input_path.insert(0, filename)
            
            # Auto-set output path
            output = str(Path(filename).with_name("simplified_questions.json"))
            self.output_path.delete(0, tk.END)
            self.output_path.insert(0, output)

    def browse_output(self):
        filename = filedialog.asksaveasfilename(
            title="Save Output JSON",
            filetypes=[("JSON files", "*.json")],
            defaultextension=".json"
        )
        if filename:
            self.output_path.delete(0, tk.END)
            self.output_path.insert(0, filename)

    def log(self, message):
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)

    def convert(self):
        input_file = self.input_path.get()
        output_file = self.output_path.get()

        if not input_file or not output_file:
            messagebox.showerror("Error", "Please select both input and output files")
            return

        try:
            with open(input_file, 'r') as f:
                data = json.load(f)
            
            # Check if data has a questions key
            if isinstance(data, dict) and "questions" in data:
                questions = data["questions"]
            else:
                questions = data  # Assume it's directly an array of questions
            
            self.log(f"Reading {len(questions)} questions from {input_file}")
            
            simplified_questions = []
            for q in questions:
                try:
                    simplified_q = {
                        "id": int(str(q.get("id", "0")).split("-")[-1]),
                        "question": q.get("question", ""),
                        "options": [str(opt).strip() for opt in q.get("options", [])],
                        "correctAnswer": q.get("correctAnswer", ""),
                        "category": q.get("subjectName", "General")
                    }
                    simplified_questions.append(simplified_q)
                except Exception as e:
                    self.log(f"Warning: Skipped question due to error: {str(e)}")
            
            with open(output_file, 'w') as f:
                json.dump({"questions": simplified_questions}, f, indent=2)
            
            self.log(f"Successfully converted {len(simplified_questions)} questions")
            self.log(f"Saved to {output_file}")
            messagebox.showinfo("Success", "Conversion completed successfully!")
            
        except Exception as e:
            self.log(f"Error: {str(e)}")
            messagebox.showerror("Error", f"Failed to convert questions: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = QuestionConverterGUI(root)
    root.mainloop()