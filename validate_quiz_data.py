import json
import re

# Define the expected questions, options, and answers according to the table
expected_questions = [
    # First set (1-20)
    {"question": "What is Selenium primarily used for?", "options": ["Video editing", "Web application testing", "Mobile app development", "Data analysis"], "correctAnswer": "Web application testing"},
    {"question": "Which language is NOT supported by Selenium WebDriver?", "options": ["Java", "Python", "C++", "Ruby"], "correctAnswer": "C++"},
    {"question": "Which Selenium tool is used for recording and playing back tests?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium IDE"},
    {"question": "What type of testing does Selenium support?", "options": ["Manual Testing", "Performance Testing", "Automation Testing", "Security Testing"], "correctAnswer": "Automation Testing"},
    {"question": "Selenium can be used to test applications on which platform?", "options": ["Desktop only", "Mobile apps only", "Web browsers", "Operating systems"], "correctAnswer": "Web browsers"},
    {"question": "What is the function of driver.get(\"url\") in Selenium?", "options": ["Submits a form", "Navigates to a web page", "Closes the browser", "Takes a screenshot"], "correctAnswer": "Navigates to a web page"},
    {"question": "Which component is used for distributed testing in Selenium?", "options": ["Selenium IDE", "Selenium WebDriver", "Selenium Grid", "JUnit"], "correctAnswer": "Selenium Grid"},
    {"question": "What is the full form of IDE in Selenium IDE?", "options": ["Integrated Developer Engine", "Integrated Development Environment", "Internal Data Editor", "Internet Data Execution"], "correctAnswer": "Integrated Development Environment"},
    {"question": "Which of these is a valid WebDriver method?", "options": ["openBrowser()", "getTitle()", "showPage()", "startDriver()"], "correctAnswer": "getTitle()"},
    {"question": "Selenium supports automation of which browser?", "options": ["Chrome", "Firefox", "Edge", "All of the above"], "correctAnswer": "All of the above"},
    {"question": "What does the findElement() method do?", "options": ["Closes the current tab", "Finds a UI element on the page", "Refreshes the browser", "Opens a new tab"], "correctAnswer": "Finds a UI element on the page"},
    {"question": "Selenium can be used with which testing framework in Java?", "options": ["PyTest", "TestNG", "Mocha", "RSpec"], "correctAnswer": "TestNG"},
    {"question": "Which method is used to click a button in Selenium?", "options": ["clickElement()", "press()", "click()", "hit()"], "correctAnswer": "click()"},
    {"question": "Selenium WebDriver is designed to work with which type of applications?", "options": ["Command line apps", "Web-based applications", "Android apps only", "Desktop applications"], "correctAnswer": "Web-based applications"},
    {"question": "What is the extension of Selenium IDE test case file?", "options": [".ide", ".html", ".xml", ".java"], "correctAnswer": ".html"},
    {"question": "Which function is used to enter text in a text box using Selenium?", "options": ["enterText()", "type()", "sendKeys()", "inputText()"], "correctAnswer": "sendKeys()"},
    {"question": "Which of these can be automated using Selenium?", "options": ["UI testing", "Captcha validation", "Code compilation", "PDF editing"], "correctAnswer": "UI testing"},
    {"question": "Which command is used to maximize the browser window?", "options": ["driver.openWindow()", "driver.setFullScreen()", "driver.maximizeWindow()", "driver.manage().window().maximize()"], "correctAnswer": "driver.manage().window().maximize()"},
    {"question": "What is Selenium Grid used for?", "options": ["Testing mobile apps", "Managing test reports", "Running tests in parallel", "Storing test data"], "correctAnswer": "Running tests in parallel"},
    {"question": "What does the quit() method do in Selenium?", "options": ["Minimizes the window", "Restarts the browser", "Closes all browser windows", "Stops the current test"], "correctAnswer": "Closes all browser windows"},
    
    # Second set (21-40)
    {"question": "What is Selenium used for?", "options": ["Database testing", "Web automation", "Manual testing", "Performance testing"], "correctAnswer": "Web automation"},
    {"question": "Which Selenium component is used for writing test scripts?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "Selenium Server"], "correctAnswer": "Selenium WebDriver"},
    {"question": "Which of the following is a web automation tool?", "options": ["Postman", "JIRA", "Selenium", "QTP"], "correctAnswer": "Selenium"},
    {"question": "What is the full form of XPath?", "options": ["XML Path", "XML Pointer", "XML Path Language", "XML Path Locator"], "correctAnswer": "XML Path Language"},
    {"question": "Which locator is most preferred in Selenium?", "options": ["Name", "ID", "Class name", "XPath"], "correctAnswer": "ID"},
    {"question": "Which programming language is not supported by Selenium?", "options": ["Python", "Ruby", "C#", "Java"], "correctAnswer": "Java"},
    {"question": "Which method is used to launch a URL in Selenium?", "options": ["driver.open()", "driver.launch()", "driver.get()", "driver.navigate()"], "correctAnswer": "driver.get()"},
    {"question": "What is the purpose of driver.quit()?", "options": ["Closes the browser", "Closes current tab", "Closes only child windows", "Clears browser cookies"], "correctAnswer": "Closes the browser"},
    {"question": "Which Selenium component allows parallel test execution?", "options": ["Selenium RC", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium WebDriver"},
    {"question": "What does Selenium WebDriver interact with?", "options": ["Database", "Operating System", "Web browser", "CPU"], "correctAnswer": "Web browser"},
    {"question": "Which function types text into an input box?", "options": ["sendText()", "sendKeys()", "write()", "typeText()"], "correctAnswer": "sendKeys()"},
    {"question": "What is the use of driver.close()?", "options": ["Closes all tabs", "Closes current tab", "Logs out user", "Stops script"], "correctAnswer": "Closes current tab"},
    {"question": "Which tool supports recording and playback in Selenium?", "options": ["TestNG", "Eclipse", "Selenium IDE", "JUnit"], "correctAnswer": "Selenium IDE"},
    {"question": "Which class helps in performing mouse actions?", "options": ["MouseDriver", "MouseHandler", "Actions", "Keyboard"], "correctAnswer": "Actions"},
    {"question": "What is used to locate web elements in Selenium?", "options": ["Tags", "Selectors", "Locators", "Filters"], "correctAnswer": "Locators"},
    {"question": "What is the syntax to locate an element by ID?", "options": ["By.id(\"value\")", "findById(\"value\")", "ByID(\"value\")", "getElementByID(\"value\")"], "correctAnswer": "By.id(\"value\")"},
    {"question": "Which method is used to click a button?", "options": ["submit()", "sendKeys()", "click()", "enter()"], "correctAnswer": "click()"},
    {"question": "Which browser is not supported by Selenium by default?", "options": ["Safari", "Chrome", "Firefox", "Edge"], "correctAnswer": "Safari"},
    {"question": "Which command is used to clear a text field?", "options": ["input.clearText()", "clear()", "deleteText()", "remove()"], "correctAnswer": "clear()"},
    {"question": "What is the primary use of implicit wait?", "options": ["To refresh browser", "To wait for page to load", "To wait for elements to appear", "To close the browser"], "correctAnswer": "To wait for elements to appear"},
    
    # Third set (41-60)
    {"question": "Which WebDriver is used for Chrome browser?", "options": ["GeckoDriver", "ChromeDriver", "EdgeDriver", "SafariDriver"], "correctAnswer": "ChromeDriver"},
    {"question": "What is TestNG used for?", "options": ["Writing documentation", "Managing databases", "Running tests", "Installing Selenium"], "correctAnswer": "Running tests"},
    {"question": "Which command is used to navigate to a webpage?", "options": ["driver.open()", "driver.visit()", "driver.get()", "driver.start()"], "correctAnswer": "driver.get()"},
    {"question": "What does assertEquals() do in TestNG?", "options": ["Compares images", "Compares strings", "Opens a page", "Closes browser"], "correctAnswer": "Compares strings"},
    {"question": "Which method checks if a checkbox is selected?", "options": ["isEnabled()", "isDisplayed()", "isSelected()", "isClicked()"], "correctAnswer": "isSelected()"},
    {"question": "What type of testing does Selenium support?", "options": ["Load testing", "Regression testing", "Stress testing", "Database testing"], "correctAnswer": "Regression testing"},
    {"question": "What is the file extension of a TestNG XML file?", "options": [".java", ".test", ".xml", ".txt"], "correctAnswer": ".xml"},
    {"question": "Which option launches browser in incognito mode?", "options": ["ChromeOption()", "FirefoxProfile()", "EdgeOptions()", "ChromeOptions()"], "correctAnswer": "ChromeOptions()"},
    {"question": "Which method is used to close all browser windows?", "options": ["driver.close()", "driver.end()", "driver.quit()", "driver.exit()"], "correctAnswer": "driver.quit()"},
    {"question": "What is WebDriverWait used for?", "options": ["Implicit wait", "Explicit wait", "Static wait", "Fluent wait"], "correctAnswer": "Explicit wait"},
    {"question": "Which method is used to switch between frames?", "options": ["switchWindow()", "switchTo().frame()", "changeFrame()", "goToFrame()"], "correctAnswer": "switchTo().frame()"},
    {"question": "Which method is used to accept an alert?", "options": ["alert.accept()", "alert.confirm()", "alert.submit()", "alert.ok()"], "correctAnswer": "alert.accept()"},
    {"question": "How do you select an option from a dropdown?", "options": ["selectValue()", "choose()", "selectByVisibleText()", "setText()"], "correctAnswer": "selectByVisibleText()"},
    {"question": "What is FluentWait in Selenium?", "options": ["Hard-coded wait", "Wait with polling", "Loop wait", "Alert wait"], "correctAnswer": "Wait with polling"},
    {"question": "Which element is used to define dropdown in HTML?", "options": ["<dropdown>", "<select>", "<option>", "<list>"], "correctAnswer": "<select>"},
    {"question": "What does driver.getTitle() return?", "options": ["Page URL", "Page name", "Page title", "Page source"], "correctAnswer": "Page title"},
    {"question": "Which is NOT a valid locator in Selenium?", "options": ["id", "name", "class", "link"], "correctAnswer": "link"},
    {"question": "What does driver.getPageSource() return?", "options": ["HTML code", "CSS file", "JavaScript", "Logs"], "correctAnswer": "HTML code"},
    {"question": "What is used to simulate keyboard actions?", "options": ["MouseActions", "Keys", "KeyboardDriver", "InputHandler"], "correctAnswer": "Keys"},
    {"question": "Which annotation in TestNG is used before any test case?", "options": ["@AfterMethod", "@BeforeTest", "@Start", "@PreTest"], "correctAnswer": "@BeforeTest"},
    
    # Fourth set (61-80)
    {"question": "Which language is commonly used with Selenium?", "options": ["Java", "PHP", "Swift", "Kotlin"], "correctAnswer": "Java"},
    {"question": "What does driver.getCurrentUrl() do?", "options": ["Gets page title", "Gets page source", "Gets current URL", "Opens new tab"], "correctAnswer": "Gets current URL"},
    {"question": "Which method is used to find elements by tag name?", "options": ["findElementByClass", "findByTag()", "findElement(By.tagName)", "findTagElement()"], "correctAnswer": "findElement(By.tagName)"},
    {"question": "How do you perform a right-click in Selenium?", "options": ["click()", "contextClick()", "doubleClick()", "pressRight()"], "correctAnswer": "contextClick()"},
    {"question": "What is Actions class used for?", "options": ["Taking screenshots", "Window switching", "Complex user gestures", "Assertions"], "correctAnswer": "Complex user gestures"},
    {"question": "Which command refreshes the page in Selenium?", "options": ["driver.reload()", "driver.refresh()", "driver.update()", "driver.sync()"], "correctAnswer": "driver.refresh()"},
    {"question": "What is the purpose of Thread.sleep()?", "options": ["Launch URL", "Pause execution", "Wait for alert", "Click button"], "correctAnswer": "Pause execution"},
    {"question": "How do you switch to an alert in Selenium?", "options": ["switchAlert()", "getAlert()", "driver.switchTo().alert()", "alertOpen()"], "correctAnswer": "driver.switchTo().alert()"},
    {"question": "What does isDisplayed() check?", "options": ["Element position", "Element visibility", "Page title", "Attribute value"], "correctAnswer": "Element visibility"},
    {"question": "Which locator uses link text?", "options": ["By.text()", "By.link()", "By.linkText()", "By.name()"], "correctAnswer": "By.linkText()"},
    {"question": "Which method helps to find multiple elements?", "options": ["findElement()", "findElements()", "getElements()", "locateAll()"], "correctAnswer": "findElements()"},
    {"question": "What does driver.manage().window().maximize() do?", "options": ["Minimize window", "Close tab", "Maximize window", "Refresh page"], "correctAnswer": "Maximize window"},
    {"question": "Which framework is used with Selenium for unit testing?", "options": ["Maven", "TestNG", "Jenkins", "Gradle"], "correctAnswer": "TestNG"},
    {"question": "What is Selenium Grid used for?", "options": ["Writing tests", "Running tests on single browser", "Parallel execution", "Recording scripts"], "correctAnswer": "Parallel execution"},
    {"question": "Which WebDriver is used for Firefox?", "options": ["SafariDriver", "ChromeDriver", "GeckoDriver", "EdgeDriver"], "correctAnswer": "GeckoDriver"},
    {"question": "What is the use of driver.switchTo().defaultContent()?", "options": ["Exit frame", "Enter frame", "Close tab", "Refresh page"], "correctAnswer": "Exit frame"},
    {"question": "How do you handle multiple windows in Selenium?", "options": ["switchTabs()", "driver.switchTo().window()", "changeWindow()", "openTab()"], "correctAnswer": "driver.switchTo().window()"},
    {"question": "What does driver.getWindowHandles() return?", "options": ["Current URL", "List of tabs", "Set of window handles", "HTML of window"], "correctAnswer": "Set of window handles"},
    {"question": "How do you get the text of a web element?", "options": ["element.value", "getText()", "textOf()", "innerHTML()"], "correctAnswer": "getText()"},
    {"question": "What is the best way to wait for elements to appear?", "options": ["Thread.sleep()", "Implicit wait", "Explicit wait", "WaitFor()"], "correctAnswer": "Explicit wait"},
]

# Read current quizData.ts file
with open("D:/app/project/src/data/quizData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Extract the questions from the current file
current_questions = []
question_blocks = re.findall(r'{\s+id:\s+\d+,\s+question:\s+"([^"]+)",\s+options:\s+\[([^\]]+)\],\s+correctAnswer:\s+"([^"]+)",', content)

for q in question_blocks:
    question_text = q[0]
    # Fix escaping for display
    question_text = question_text.replace('\\\"', '"')
    
    # Extract options array
    options_text = q[1]
    options = [opt.strip('" ') for opt in options_text.split(',')]
    
    # Extract correct answer
    correct_answer = q[2]
    
    current_questions.append({
        "question": question_text,
        "options": options,
        "correctAnswer": correct_answer
    })

# Compare current questions with expected questions
issues = []
corrections = []

for i, (current, expected) in enumerate(zip(current_questions, expected_questions)):
    # Check question text
    if current["question"] != expected["question"]:
        issues.append(f"Question {i+1}: Text mismatch\n  Current: {current['question']}\n  Expected: {expected['question']}")
        corrections.append({
            "index": i+1,
            "field": "question",
            "current": current["question"],
            "expected": expected["question"]
        })
    
    # Check options
    if current["options"] != expected["options"]:
        issues.append(f"Question {i+1}: Options mismatch\n  Current: {current['options']}\n  Expected: {expected['options']}")
        corrections.append({
            "index": i+1,
            "field": "options",
            "current": current["options"],
            "expected": expected["options"]
        })
    
    # Check correct answer
    if current["correctAnswer"] != expected["correctAnswer"]:
        issues.append(f"Question {i+1}: Correct answer mismatch\n  Current: {current['correctAnswer']}\n  Expected: {expected['correctAnswer']}")
        corrections.append({
            "index": i+1,
            "field": "correctAnswer",
            "current": current["correctAnswer"],
            "expected": expected["correctAnswer"]
        })

# Print results
if issues:
    print(f"Found {len(issues)} issues:")
    for issue in issues:
        print(issue)
        print("-" * 50)
    
    # Create correction script
    print("\nGenerating correction script...")
    with open("D:/app/project/fix_quiz_data.py", "w", encoding="utf-8") as f:
        f.write("""import json
import re

# List of corrections to make
corrections = %s

# Read current quizData.ts file
with open("D:/app/project/src/data/quizData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Apply corrections
for correction in corrections:
    index = correction["index"]
    field = correction["field"]
    expected = correction["expected"]
    
    # Create the regex pattern to find the question block by index
    pattern = r'(\\{\\s+id:\\s+%d,.*?)(\\"%s\\":\\s+)([^,]+)(,)' % (index, field)
    
    if field == "options":
        # For options, which is an array
        options_str = ", ".join(['"%s"' % opt for opt in expected])
        replacement = f'\\\\1\\\\2[{options_str}]\\\\4'
    else:
        # For question text or correctAnswer
        replacement = f'\\\\1\\\\2"{expected}"\\\\4'
    
    # Apply the replacement
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write the corrected content back
with open("D:/app/project/src/data/quizData.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Applied {len(corrections)} corrections to quiz data.")
""" % json.dumps(corrections, indent=2))
    
    print("Correction script generated as fix_quiz_data.py")
else:
    print("All questions match the expected values!")

# Check if we have the right number of questions
if len(current_questions) < len(expected_questions):
    missing = len(expected_questions) - len(current_questions)
    print(f"\nWARNING: {missing} questions are missing from the current file")
    
    # Generate script to add missing questions
    print("Generating script to add missing questions...")
    with open("D:/app/project/add_missing_questions.py", "w", encoding="utf-8") as f:
        f.write("""import json

# Missing questions to add
missing_questions = %s

# Read current quizData.ts file
with open("D:/app/project/src/data/quizData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Find the end of the array
end_position = content.rfind("];")

if end_position == -1:
    print("Could not find the end of the array in the file!")
    exit(1)

# Prepare new question entries
current_id = len(content.split("id:")) - 1  # Approximate count of existing questions
new_entries = []

for q in missing_questions:
    current_id += 1
    options_str = ", ".join([f'"{opt}"' for opt in q["options"]])
    
    entry = f'''  {{
    id: {current_id},
    question: "{q["question"]}",
    options: [{options_str}],
    correctAnswer: "{q["correctAnswer"]}",
    type: "single",
    points: 10
  }},'''
    
    new_entries.append(entry)

# Insert the missing questions
if new_entries:
    updated_content = content[:end_position] + ",\n" + "\\n".join(new_entries) + content[end_position:]
    
    # Write the updated content
    with open("D:/app/project/src/data/quizData.ts", "w", encoding="utf-8") as f:
        f.write(updated_content)
    
    print(f"Added {len(missing_questions)} missing questions to quizData.ts")
""" % json.dumps(expected_questions[len(current_questions):], indent=2))
    
    print("Script to add missing questions generated as add_missing_questions.py")
elif len(current_questions) > len(expected_questions):
    extra = len(current_questions) - len(expected_questions)
    print(f"\nWARNING: There are {extra} extra questions in the current file")
else:
    print("\nThe file has the correct number of questions.") 