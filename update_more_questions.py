import json

# Creating a structured list of the remaining questions from the provided table
more_questions = [
    # Next set of questions
    {"id": 61, "question": "What does driver.findElements() return if no elements found?", "options": ["null", "Empty list", "false", "Exception"], "correctAnswer": "Empty list", "type": "single", "points": 10},
    {"id": 62, "question": "Which annotation is used to mark a test method in TestNG?", "options": ["@TestCase", "@Test", "@TestMethod", "@TestNG"], "correctAnswer": "@Test", "type": "single", "points": 10},
    {"id": 63, "question": "What is POM in Selenium?", "options": ["Page Object Model", "Page Oriented Method", "Process Object Mapping", "Parameter Object Model"], "correctAnswer": "Page Object Model", "type": "single", "points": 10},
    {"id": 64, "question": "Which of these is not a valid browser event?", "options": ["click", "submit", "sendKeys", "findElement"], "correctAnswer": "findElement", "type": "single", "points": 10},
    {"id": 65, "question": "How to set browser window size in Selenium?", "options": ["driver.window().setSize()", "driver.manage().window().setSize()", "driver.browser().setSize()", "driver.setWindowSize()"], "correctAnswer": "driver.manage().window().setSize()", "type": "single", "points": 10},
    {"id": 66, "question": "Which exception is thrown when element is not found?", "options": ["ElementNotFoundException", "NoSuchElementException", "ElementNotVisibleException", "StaleElementException"], "correctAnswer": "NoSuchElementException", "type": "single", "points": 10},
    {"id": 67, "question": "What are desired capabilities in Selenium?", "options": ["Browser settings", "Test settings", "Driver settings", "Element properties"], "correctAnswer": "Browser settings", "type": "single", "points": 10},
    {"id": 68, "question": "Which method refreshes the current page?", "options": ["driver.refresh()", "driver.navigate().refresh()", "driver.reload()", "driver.page().refresh()"], "correctAnswer": "driver.navigate().refresh()", "type": "single", "points": 10},
    {"id": 69, "question": "What is used to scroll in Selenium?", "options": ["ScrollBar", "JavaScriptExecutor", "Scroller", "Window.scroll()"], "correctAnswer": "JavaScriptExecutor", "type": "single", "points": 10},
    {"id": 70, "question": "Which is used to capture screenshots in Selenium?", "options": ["ScreenCapture", "TakesScreenshot", "Screenshot", "CaptureScreen"], "correctAnswer": "TakesScreenshot", "type": "single", "points": 10},
    {"id": 71, "question": "What is the default timeout for implicit wait?", "options": ["0 seconds", "30 seconds", "60 seconds", "No timeout"], "correctAnswer": "0 seconds", "type": "single", "points": 10},
    {"id": 72, "question": "Which is not a valid navigation method?", "options": ["back()", "forward()", "refresh()", "reload()"], "correctAnswer": "reload()", "type": "single", "points": 10},
    {"id": 73, "question": "What happens if findElement cannot find an element?", "options": ["Returns null", "Returns empty object", "Throws exception", "Returns false"], "correctAnswer": "Throws exception", "type": "single", "points": 10},
    {"id": 74, "question": "What is the role of WebDriverManager?", "options": ["Manage test data", "Control WebDriver", "Automatic driver setup", "Create test reports"], "correctAnswer": "Automatic driver setup", "type": "single", "points": 10},
    {"id": 75, "question": "Which interface is used to handle dropdown?", "options": ["DropDown", "Select", "Option", "MultiSelect"], "correctAnswer": "Select", "type": "single", "points": 10},
    {"id": 76, "question": "What is the main use of Selenium Grid?", "options": ["Record tests", "Parallel execution", "Create reports", "Web scraping"], "correctAnswer": "Parallel execution", "type": "single", "points": 10},
    {"id": 77, "question": "Which method gets text from an element?", "options": ["element.value()", "element.getText()", "element.content()", "element.innerText()"], "correctAnswer": "element.getText()", "type": "single", "points": 10},
    {"id": 78, "question": "What is XPath used for?", "options": ["Testing API", "Locating elements", "Database queries", "Test reporting"], "correctAnswer": "Locating elements", "type": "single", "points": 10},
    {"id": 79, "question": "Which tool can integrate with Selenium for reporting?", "options": ["JUnit", "Log4j", "Extent Reports", "All of these"], "correctAnswer": "All of these", "type": "single", "points": 10},
    {"id": 80, "question": "What is a headless browser?", "options": ["Browser with no UI", "Mobile browser", "Text-based browser", "Embedded browser"], "correctAnswer": "Browser with no UI", "type": "single", "points": 10},
]

# Read current quizData file
with open("D:/app/project/src/data/quizData.ts", "r", encoding="utf-8") as f:
    current_content = f.read()

# Find position where we need to insert new questions
insert_position = current_content.rfind("];\n\nexport default quizData;")

if insert_position == -1:
    print("Could not find insertion point in the file!")
    exit(1)

# Prepare new question objects
new_questions_str = ""
for q in more_questions:
    options_str = ", ".join([f'"{opt}"' for opt in q["options"]])
    
    # Creating the question object
    question_obj = f'''  {{
    id: {q["id"]},
    question: "{q["question"]}",
    options: [{options_str}],
    correctAnswer: "{q["correctAnswer"]}",
    type: "{q["type"]}",
    points: {q["points"]}
  }}'''
    
    new_questions_str += question_obj + ",\n"

# Insert the new questions
updated_content = current_content[:insert_position - 1] + ",\n" + new_questions_str + current_content[insert_position - 1:]

# Write updated content
with open("D:/app/project/src/data/quizData.ts", "w", encoding="utf-8") as f:
    f.write(updated_content)

print(f"Successfully added {len(more_questions)} more questions to quizData.ts") 