import json

# Creating a structured list of questions from the provided table
questions = [
    # First set of questions (1-20)
    {"id": 1, "question": "What is Selenium primarily used for?", "options": ["Video editing", "Web application testing", "Mobile app development", "Data analysis"], "correctAnswer": "Web application testing", "type": "single", "points": 10},
    {"id": 2, "question": "Which language is NOT supported by Selenium WebDriver?", "options": ["Java", "Python", "C++", "Ruby"], "correctAnswer": "C++", "type": "single", "points": 10},
    {"id": 3, "question": "Which Selenium tool is used for recording and playing back tests?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium IDE", "type": "single", "points": 10},
    {"id": 4, "question": "What type of testing does Selenium support?", "options": ["Manual Testing", "Performance Testing", "Automation Testing", "Security Testing"], "correctAnswer": "Automation Testing", "type": "single", "points": 10},
    {"id": 5, "question": "Selenium can be used to test applications on which platform?", "options": ["Desktop only", "Mobile apps only", "Web browsers", "Operating systems"], "correctAnswer": "Web browsers", "type": "single", "points": 10},
    {"id": 6, "question": "What is the function of driver.get(\"url\") in Selenium?", "options": ["Submits a form", "Navigates to a web page", "Closes the browser", "Takes a screenshot"], "correctAnswer": "Navigates to a web page", "type": "single", "points": 10},
    {"id": 7, "question": "Which component is used for distributed testing in Selenium?", "options": ["Selenium IDE", "Selenium WebDriver", "Selenium Grid", "Selenium RC"], "correctAnswer": "Selenium Grid", "type": "single", "points": 10},
    {"id": 8, "question": "What is the full form of IDE in Selenium IDE?", "options": ["Integrated Developer Engine", "Integrated Development Environment", "Internal Data Editor", "Internet Data Execution"], "correctAnswer": "Integrated Development Environment", "type": "single", "points": 10},
    {"id": 9, "question": "Which of these is a valid WebDriver method?", "options": ["openBrowser()", "getTitle()", "showPage()", "startDriver()"], "correctAnswer": "getTitle()", "type": "single", "points": 10},
    {"id": 10, "question": "Selenium supports automation of which browser?", "options": ["Chrome", "Firefox", "Edge", "All of the above"], "correctAnswer": "All of the above", "type": "single", "points": 10},
    {"id": 11, "question": "What does the findElement() method do?", "options": ["Closes the current tab", "Refreshes the browser", "Finds a UI element on the page", "Opens a new tab"], "correctAnswer": "Finds a UI element on the page", "type": "single", "points": 10},
    {"id": 12, "question": "Selenium can be used with which testing framework in Java?", "options": ["PyTest", "TestNG", "Mocha", "RSpec"], "correctAnswer": "TestNG", "type": "single", "points": 10},
    {"id": 13, "question": "Which method is used to click a button in Selenium?", "options": ["clickElement()", "press()", "click()", "hit()"], "correctAnswer": "click()", "type": "single", "points": 10},
    {"id": 14, "question": "Selenium WebDriver is designed to work with which type of applications?", "options": ["Command line apps", "Web-based applications", "Android apps only", "Desktop applications"], "correctAnswer": "Web-based applications", "type": "single", "points": 10},
    {"id": 15, "question": "What is the extension of Selenium IDE test case file?", "options": [".ide", ".html", ".xml", ".java"], "correctAnswer": ".html", "type": "single", "points": 10},
    {"id": 16, "question": "Which function is used to enter text in a text box using Selenium?", "options": ["enterText()", "type()", "sendKeys()", "inputText()"], "correctAnswer": "sendKeys()", "type": "single", "points": 10},
    {"id": 17, "question": "Which of these can be automated using Selenium?", "options": ["UI testing", "Captcha validation", "Code compilation", "PDF editing"], "correctAnswer": "UI testing", "type": "single", "points": 10},
    {"id": 18, "question": "Which command is used to maximize the browser window?", "options": ["driver.openWindow()", "driver.setFullScreen()", "driver.maximizeWindow()", "driver.manage().window().maximize()"], "correctAnswer": "driver.manage().window().maximize()", "type": "single", "points": 10},
    {"id": 19, "question": "What is Selenium Grid used for?", "options": ["Testing mobile apps", "Managing test reports", "Running tests in parallel", "Storing test data"], "correctAnswer": "Running tests in parallel", "type": "single", "points": 10},
    {"id": 20, "question": "What does the quit() method do in Selenium?", "options": ["Minimizes the window", "Restarts the browser", "Closes all browser windows", "Stops the current test"], "correctAnswer": "Closes all browser windows", "type": "single", "points": 10},
    
    # Second set of questions (21-40)
    {"id": 21, "question": "What is Selenium used for?", "options": ["Database testing", "Web automation", "Manual testing", "Performance testing"], "correctAnswer": "Web automation", "type": "single", "points": 10},
    {"id": 22, "question": "Which Selenium component is used for writing test scripts?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "Selenium Server"], "correctAnswer": "Selenium WebDriver", "type": "single", "points": 10},
    {"id": 23, "question": "Which of the following is a web automation tool?", "options": ["Postman", "JIRA", "Selenium", "QTP"], "correctAnswer": "Selenium", "type": "single", "points": 10},
    {"id": 24, "question": "What is the full form of XPath?", "options": ["XML Path", "XML Pointer", "XML Path Language", "XML Path Locator"], "correctAnswer": "XML Path Language", "type": "single", "points": 10},
    {"id": 25, "question": "Which locator is most preferred in Selenium?", "options": ["Name", "ID", "Class name", "XPath"], "correctAnswer": "ID", "type": "single", "points": 10},
    {"id": 26, "question": "Which programming language is not supported by Selenium?", "options": ["Python", "Ruby", "Java", "C#"], "correctAnswer": "Java", "type": "single", "points": 10},
    {"id": 27, "question": "Which method is used to launch a URL in Selenium?", "options": ["driver.open()", "driver.launch()", "driver.get()", "driver.navigate()"], "correctAnswer": "driver.get()", "type": "single", "points": 10},
    {"id": 28, "question": "What is the purpose of driver.quit()?", "options": ["Closes the browser", "Closes current tab", "Closes only child windows", "Clears browser cookies"], "correctAnswer": "Closes the browser", "type": "single", "points": 10},
    {"id": 29, "question": "Which Selenium component allows parallel test execution?", "options": ["Selenium RC", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium WebDriver", "type": "single", "points": 10},
    {"id": 30, "question": "What does Selenium WebDriver interact with?", "options": ["Database", "Operating System", "Web browser", "CPU"], "correctAnswer": "Web browser", "type": "single", "points": 10},
    {"id": 31, "question": "Which function types text into an input box?", "options": ["sendText()", "sendKeys()", "write()", "typeText()"], "correctAnswer": "sendKeys()", "type": "single", "points": 10},
    {"id": 32, "question": "What is the use of driver.close()?", "options": ["Closes browser", "Closes current window", "Closes application", "Terminates WebDriver"], "correctAnswer": "Closes current window", "type": "single", "points": 10},
    {"id": 33, "question": "Which tool supports recording and playback in Selenium?", "options": ["Selenium IDE", "Selenium RC", "Selenium Grid", "Selenium WebDriver"], "correctAnswer": "Selenium IDE", "type": "single", "points": 10},
    {"id": 34, "question": "Which class helps in performing mouse actions?", "options": ["JavaScriptExecutor", "Actions", "Select", "Robot"], "correctAnswer": "Actions", "type": "single", "points": 10},
    {"id": 35, "question": "What is used to locate web elements in Selenium?", "options": ["Drivers", "Selectors", "Locators", "Identifiers"], "correctAnswer": "Locators", "type": "single", "points": 10},
    {"id": 36, "question": "What is the syntax to locate an element by ID?", "options": ["driver.findElementByID()", "driver.findElement(By.id())", "driver.locateElement(ID)", "element.findById()"], "correctAnswer": "driver.findElement(By.id())", "type": "single", "points": 10},
    {"id": 37, "question": "Which method is used to click a button?", "options": ["element.press()", "element.select()", "element.click()", "element.submit()"], "correctAnswer": "element.click()", "type": "single", "points": 10},
    {"id": 38, "question": "Which browser is not supported by Selenium by default?", "options": ["Chrome", "Firefox", "Safari", "Internet Explorer"], "correctAnswer": "Safari", "type": "single", "points": 10},
    {"id": 39, "question": "Which command is used to clear a text field?", "options": ["clear()", "reset()", "delete()", "empty()"], "correctAnswer": "clear()", "type": "single", "points": 10},
    {"id": 40, "question": "What is the primary use of implicit wait?", "options": ["Wait for specific element", "Pause execution", "Global timeout for elements", "Handle alerts"], "correctAnswer": "Global timeout for elements", "type": "single", "points": 10},
    
    # Third set of questions (41-60)
    {"id": 41, "question": "Which WebDriver is used for Chrome browser?", "options": ["FirefoxDriver", "EdgeDriver", "ChromeDriver", "SafariDriver"], "correctAnswer": "ChromeDriver", "type": "single", "points": 10},
    {"id": 42, "question": "What is TestNG used for?", "options": ["UI testing", "Test automation framework", "Browser automation", "Performance testing"], "correctAnswer": "Test automation framework", "type": "single", "points": 10},
    {"id": 43, "question": "Which command is used to navigate to a webpage?", "options": ["driver.navigate(url)", "driver.get(url)", "driver.open(url)", "driver.goTo(url)"], "correctAnswer": "driver.get(url)", "type": "single", "points": 10},
    {"id": 44, "question": "What does assertEquals() do in TestNG?", "options": ["Skips a test", "Compares values", "Marks test as pass", "Sets up test data"], "correctAnswer": "Compares values", "type": "single", "points": 10},
    {"id": 45, "question": "Which method checks if a checkbox is selected?", "options": ["isSelected()", "isChecked()", "isEnabled()", "isActive()"], "correctAnswer": "isSelected()", "type": "single", "points": 10},
    {"id": 46, "question": "What type of testing does Selenium support?", "options": ["Manual testing", "Functional testing", "Security testing", "Performance testing"], "correctAnswer": "Functional testing", "type": "single", "points": 10},
    {"id": 47, "question": "What is the file extension of a TestNG XML file?", "options": [".xml", ".testng", ".json", ".config"], "correctAnswer": ".xml", "type": "single", "points": 10},
    {"id": 48, "question": "Which option launches browser in incognito mode?", "options": ["ChromeOptions", "FirefoxProfile", "EdgeOptions", "DriverOptions"], "correctAnswer": "ChromeOptions", "type": "single", "points": 10},
    {"id": 49, "question": "Which method is used to close all browser windows?", "options": ["close()", "closeAll()", "quit()", "exit()"], "correctAnswer": "quit()", "type": "single", "points": 10},
    {"id": 50, "question": "What is WebDriverWait used for?", "options": ["Implicit waiting", "Explicit waiting", "Fluent waiting", "Thread sleeping"], "correctAnswer": "Explicit waiting", "type": "single", "points": 10},
    {"id": 51, "question": "Which method is used to switch between frames?", "options": ["switchTo().frame()", "goTo().frame()", "moveTo().frame()", "navigateTo().frame()"], "correctAnswer": "switchTo().frame()", "type": "single", "points": 10},
    {"id": 52, "question": "Which method is used to accept an alert?", "options": ["alert().ok()", "alert().accept()", "alert().confirm()", "alert().yes()"], "correctAnswer": "alert().accept()", "type": "single", "points": 10},
    {"id": 53, "question": "How do you select an option from a dropdown?", "options": ["Select class", "Actions class", "Options class", "DropDown class"], "correctAnswer": "Select class", "type": "single", "points": 10},
    {"id": 54, "question": "What is FluentWait in Selenium?", "options": ["Implicit wait type", "Explicit wait type", "Wait with polling", "Thread sleep alternative"], "correctAnswer": "Wait with polling", "type": "single", "points": 10},
    {"id": 55, "question": "Which element is used to define dropdown in HTML?", "options": ["<dropdown>", "<select>", "<option>", "<list>"], "correctAnswer": "<select>", "type": "single", "points": 10},
    {"id": 56, "question": "What does driver.getTitle() return?", "options": ["Page URL", "Page title", "Page source", "Page header"], "correctAnswer": "Page title", "type": "single", "points": 10},
    {"id": 57, "question": "Which is NOT a valid locator in Selenium?", "options": ["id", "name", "color", "xpath"], "correctAnswer": "color", "type": "single", "points": 10},
    {"id": 58, "question": "What does driver.getPageSource() return?", "options": ["Page title", "Page URL", "HTML source", "Page status"], "correctAnswer": "HTML source", "type": "single", "points": 10},
    {"id": 59, "question": "What is used to simulate keyboard actions?", "options": ["KeySimulator", "Actions", "KeyPress", "Robot"], "correctAnswer": "Actions", "type": "single", "points": 10},
    {"id": 60, "question": "Which method gets current URL in Selenium?", "options": ["driver.getURL()", "driver.getCurrentURL()", "driver.getCurrentUrl()", "driver.url()"], "correctAnswer": "driver.getCurrentUrl()", "type": "single", "points": 10},
]

# Creating the TypeScript file content
ts_content = "const quizData = [\n"

for q in questions:
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
    
    ts_content += question_obj + ",\n"

# Remove trailing comma and close the array
ts_content = ts_content.rstrip(",\n") + "\n];\n\nexport default quizData;"

# Write to the file
with open("D:/app/project/src/data/quizData.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Successfully updated quizData.ts with {len(questions)} questions") 