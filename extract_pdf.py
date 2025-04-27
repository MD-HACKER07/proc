import PyPDF2

def extract_pdf_text(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n\n"
        return text

if __name__ == "__main__":
    pdf_path = "src/quiz pdf/os quiz.pdf"
    pdf_text = extract_pdf_text(pdf_path)
    print(pdf_text)
    
    # Also save to file for reference
    with open("pdf_content.txt", "w", encoding="utf-8") as output_file:
        output_file.write(pdf_text)
        print(f"Content saved to pdf_content.txt") 