import json

# Define the complete set of questions from the table
questions = [
    # First set (1-20)
    {"id": 1, "question": "What is Selenium primarily used for?", "options": ["Video editing", "Web application testing", "Mobile app development", "Data analysis"], "correctAnswer": "Web application testing"},
    {"id": 2, "question": "Which language is NOT supported by Selenium WebDriver?", "options": ["Java", "Python", "C++", "Ruby"], "correctAnswer": "C++"},
    {"id": 3, "question": "Which Selenium tool is used for recording and playing back tests?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium IDE"},
    {"id": 4, "question": "What type of testing does Selenium support?", "options": ["Manual Testing", "Performance Testing", "Automation Testing", "Security Testing"], "correctAnswer": "Automation Testing"},
    {"id": 5, "question": "Selenium can be used to test applications on which platform?", "options": ["Desktop only", "Mobile apps only", "Web browsers", "Operating systems"], "correctAnswer": "Web browsers"},
    {"id": 6, "question": "What is the function of driver.get(\\\"url\\\") in Selenium?", "options": ["Submits a form", "Navigates to a web page", "Closes the browser", "Takes a screenshot"], "correctAnswer": "Navigates to a web page"},
    {"id": 7, "question": "Which component is used for distributed testing in Selenium?", "options": ["Selenium IDE", "Selenium WebDriver", "Selenium Grid", "JUnit"], "correctAnswer": "Selenium Grid"},
    {"id": 8, "question": "What is the full form of IDE in Selenium IDE?", "options": ["Integrated Developer Engine", "Integrated Development Environment", "Internal Data Editor", "Internet Data Execution"], "correctAnswer": "Integrated Development Environment"},
    {"id": 9, "question": "Which of these is a valid WebDriver method?", "options": ["openBrowser()", "getTitle()", "showPage()", "startDriver()"], "correctAnswer": "getTitle()"},
    {"id": 10, "question": "Selenium supports automation of which browser?", "options": ["Chrome", "Firefox", "Edge", "All of the above"], "correctAnswer": "All of the above"},
    {"id": 11, "question": "What does the findElement() method do?", "options": ["Closes the current tab", "Finds a UI element on the page", "Refreshes the browser", "Opens a new tab"], "correctAnswer": "Finds a UI element on the page"},
    {"id": 12, "question": "Selenium can be used with which testing framework in Java?", "options": ["PyTest", "TestNG", "Mocha", "RSpec"], "correctAnswer": "TestNG"},
    {"id": 13, "question": "Which method is used to click a button in Selenium?", "options": ["clickElement()", "press()", "click()", "hit()"], "correctAnswer": "click()"},
    {"id": 14, "question": "Selenium WebDriver is designed to work with which type of applications?", "options": ["Command line apps", "Web-based applications", "Android apps only", "Desktop applications"], "correctAnswer": "Web-based applications"},
    {"id": 15, "question": "What is the extension of Selenium IDE test case file?", "options": [".ide", ".html", ".xml", ".java"], "correctAnswer": ".html"},
    {"id": 16, "question": "Which function is used to enter text in a text box using Selenium?", "options": ["enterText()", "type()", "sendKeys()", "inputText()"], "correctAnswer": "sendKeys()"},
    {"id": 17, "question": "Which of these can be automated using Selenium?", "options": ["UI testing", "Captcha validation", "Code compilation", "PDF editing"], "correctAnswer": "UI testing"},
    {"id": 18, "question": "Which command is used to maximize the browser window?", "options": ["driver.openWindow()", "driver.setFullScreen()", "driver.maximizeWindow()", "driver.manage().window().maximize()"], "correctAnswer": "driver.manage().window().maximize()"},
    {"id": 19, "question": "What is Selenium Grid used for?", "options": ["Testing mobile apps", "Managing test reports", "Running tests in parallel", "Storing test data"], "correctAnswer": "Running tests in parallel"},
    {"id": 20, "question": "What does the quit() method do in Selenium?", "options": ["Minimizes the window", "Restarts the browser", "Closes all browser windows", "Stops the current test"], "correctAnswer": "Closes all browser windows"},
    
    # Second set (21-40)
    {"id": 21, "question": "What is Selenium used for?", "options": ["Database testing", "Web automation", "Manual testing", "Performance testing"], "correctAnswer": "Web automation"},
    {"id": 22, "question": "Which Selenium component is used for writing test scripts?", "options": ["Selenium Grid", "Selenium IDE", "Selenium WebDriver", "Selenium Server"], "correctAnswer": "Selenium WebDriver"},
    {"id": 23, "question": "Which of the following is a web automation tool?", "options": ["Postman", "JIRA", "Selenium", "QTP"], "correctAnswer": "Selenium"},
    {"id": 24, "question": "What is the full form of XPath?", "options": ["XML Path", "XML Pointer", "XML Path Language", "XML Path Locator"], "correctAnswer": "XML Path Language"},
    {"id": 25, "question": "Which locator is most preferred in Selenium?", "options": ["Name", "ID", "Class name", "XPath"], "correctAnswer": "ID"},
    {"id": 26, "question": "Which programming language is not supported by Selenium?", "options": ["Python", "Ruby", "C#", "Java"], "correctAnswer": "Java"},
    {"id": 27, "question": "Which method is used to launch a URL in Selenium?", "options": ["driver.open()", "driver.launch()", "driver.get()", "driver.navigate()"], "correctAnswer": "driver.get()"},
    {"id": 28, "question": "What is the purpose of driver.quit()?", "options": ["Closes the browser", "Closes current tab", "Closes only child windows", "Clears browser cookies"], "correctAnswer": "Closes the browser"},
    {"id": 29, "question": "Which Selenium component allows parallel test execution?", "options": ["Selenium RC", "Selenium IDE", "Selenium WebDriver", "TestNG"], "correctAnswer": "Selenium WebDriver"},
    {"id": 30, "question": "What does Selenium WebDriver interact with?", "options": ["Database", "Operating System", "Web browser", "CPU"], "correctAnswer": "Web browser"},
    {"id": 31, "question": "Which function types text into an input box?", "options": ["sendText()", "sendKeys()", "write()", "typeText()"], "correctAnswer": "sendKeys()"},
    {"id": 32, "question": "What is the use of driver.close()?", "options": ["Closes all tabs", "Closes current tab", "Logs out user", "Stops script"], "correctAnswer": "Closes current tab"},
    {"id": 33, "question": "Which tool supports recording and playback in Selenium?", "options": ["TestNG", "Eclipse", "Selenium IDE", "JUnit"], "correctAnswer": "Selenium IDE"},
    {"id": 34, "question": "Which class helps in performing mouse actions?", "options": ["MouseDriver", "MouseHandler", "Actions", "Keyboard"], "correctAnswer": "Actions"},
    {"id": 35, "question": "What is used to locate web elements in Selenium?", "options": ["Tags", "Selectors", "Locators", "Filters"], "correctAnswer": "Locators"},
    {"id": 36, "question": "What is the syntax to locate an element by ID?", "options": ["By.id(\\\"value\\\")", "findById(\\\"value\\\")", "ByID(\\\"value\\\")", "getElementByID(\\\"value\\\")"], "correctAnswer": "By.id(\\\"value\\\")"},
    {"id": 37, "question": "Which method is used to click a button?", "options": ["submit()", "sendKeys()", "click()", "enter()"], "correctAnswer": "click()"},
    {"id": 38, "question": "Which browser is not supported by Selenium by default?", "options": ["Safari", "Chrome", "Firefox", "Edge"], "correctAnswer": "Safari"},
    {"id": 39, "question": "Which command is used to clear a text field?", "options": ["input.clearText()", "clear()", "deleteText()", "remove()"], "correctAnswer": "clear()"},
    {"id": 40, "question": "What is the primary use of implicit wait?", "options": ["To refresh browser", "To wait for page to load", "To wait for elements to appear", "To close the browser"], "correctAnswer": "To wait for elements to appear"},
    
    # Third set (41-60)
    {"id": 41, "question": "Which WebDriver is used for Chrome browser?", "options": ["GeckoDriver", "ChromeDriver", "EdgeDriver", "SafariDriver"], "correctAnswer": "ChromeDriver"},
    {"id": 42, "question": "What is TestNG used for?", "options": ["Writing documentation", "Managing databases", "Running tests", "Installing Selenium"], "correctAnswer": "Running tests"},
    {"id": 43, "question": "Which command is used to navigate to a webpage?", "options": ["driver.open()", "driver.visit()", "driver.get()", "driver.start()"], "correctAnswer": "driver.get()"},
    {"id": 44, "question": "What does assertEquals() do in TestNG?", "options": ["Compares images", "Compares strings", "Opens a page", "Closes browser"], "correctAnswer": "Compares strings"},
    {"id": 45, "question": "Which method checks if a checkbox is selected?", "options": ["isEnabled()", "isDisplayed()", "isSelected()", "isClicked()"], "correctAnswer": "isSelected()"},
    {"id": 46, "question": "What type of testing does Selenium support?", "options": ["Load testing", "Regression testing", "Stress testing", "Database testing"], "correctAnswer": "Regression testing"},
    {"id": 47, "question": "What is the file extension of a TestNG XML file?", "options": [".java", ".test", ".xml", ".txt"], "correctAnswer": ".xml"},
    {"id": 48, "question": "Which option launches browser in incognito mode?", "options": ["ChromeOption()", "FirefoxProfile()", "EdgeOptions()", "ChromeOptions()"], "correctAnswer": "ChromeOptions()"},
    {"id": 49, "question": "Which method is used to close all browser windows?", "options": ["driver.close()", "driver.end()", "driver.quit()", "driver.exit()"], "correctAnswer": "driver.quit()"},
    {"id": 50, "question": "What is WebDriverWait used for?", "options": ["Implicit wait", "Explicit wait", "Static wait", "Fluent wait"], "correctAnswer": "Explicit wait"},
    {"id": 51, "question": "Which method is used to switch between frames?", "options": ["switchWindow()", "switchTo().frame()", "changeFrame()", "goToFrame()"], "correctAnswer": "switchTo().frame()"},
    {"id": 52, "question": "Which method is used to accept an alert?", "options": ["alert.accept()", "alert.confirm()", "alert.submit()", "alert.ok()"], "correctAnswer": "alert.accept()"},
    {"id": 53, "question": "How do you select an option from a dropdown?", "options": ["selectValue()", "choose()", "selectByVisibleText()", "setText()"], "correctAnswer": "selectByVisibleText()"},
    {"id": 54, "question": "What is FluentWait in Selenium?", "options": ["Hard-coded wait", "Wait with polling", "Loop wait", "Alert wait"], "correctAnswer": "Wait with polling"},
    {"id": 55, "question": "Which element is used to define dropdown in HTML?", "options": ["<dropdown>", "<select>", "<option>", "<list>"], "correctAnswer": "<select>"},
    {"id": 56, "question": "What does driver.getTitle() return?", "options": ["Page URL", "Page name", "Page title", "Page source"], "correctAnswer": "Page title"},
    {"id": 57, "question": "Which is NOT a valid locator in Selenium?", "options": ["id", "name", "class", "link"], "correctAnswer": "link"},
    {"id": 58, "question": "What does driver.getPageSource() return?", "options": ["HTML code", "CSS file", "JavaScript", "Logs"], "correctAnswer": "HTML code"},
    {"id": 59, "question": "What is used to simulate keyboard actions?", "options": ["MouseActions", "Keys", "KeyboardDriver", "InputHandler"], "correctAnswer": "Keys"},
    {"id": 60, "question": "Which annotation in TestNG is used before any test case?", "options": ["@AfterMethod", "@BeforeTest", "@Start", "@PreTest"], "correctAnswer": "@BeforeTest"},
    
    # Fourth set (61-80)
    {"id": 61, "question": "Which language is commonly used with Selenium?", "options": ["Java", "PHP", "Swift", "Kotlin"], "correctAnswer": "Java"},
    {"id": 62, "question": "What does driver.getCurrentUrl() do?", "options": ["Gets page title", "Gets page source", "Gets current URL", "Opens new tab"], "correctAnswer": "Gets current URL"},
    {"id": 63, "question": "Which method is used to find elements by tag name?", "options": ["findElementByClass", "findByTag()", "findElement(By.tagName)", "findTagElement()"], "correctAnswer": "findElement(By.tagName)"},
    {"id": 64, "question": "How do you perform a right-click in Selenium?", "options": ["click()", "contextClick()", "doubleClick()", "pressRight()"], "correctAnswer": "contextClick()"},
    {"id": 65, "question": "What is Actions class used for?", "options": ["Taking screenshots", "Window switching", "Complex user gestures", "Assertions"], "correctAnswer": "Complex user gestures"},
    {"id": 66, "question": "Which command refreshes the page in Selenium?", "options": ["driver.reload()", "driver.refresh()", "driver.update()", "driver.sync()"], "correctAnswer": "driver.refresh()"},
    {"id": 67, "question": "What is the purpose of Thread.sleep()?", "options": ["Launch URL", "Pause execution", "Wait for alert", "Click button"], "correctAnswer": "Pause execution"},
    {"id": 68, "question": "How do you switch to an alert in Selenium?", "options": ["switchAlert()", "getAlert()", "driver.switchTo().alert()", "alertOpen()"], "correctAnswer": "driver.switchTo().alert()"},
    {"id": 69, "question": "What does isDisplayed() check?", "options": ["Element position", "Element visibility", "Page title", "Attribute value"], "correctAnswer": "Element visibility"},
    {"id": 70, "question": "Which locator uses link text?", "options": ["By.text()", "By.link()", "By.linkText()", "By.name()"], "correctAnswer": "By.linkText()"},
    {"id": 71, "question": "Which method helps to find multiple elements?", "options": ["findElement()", "findElements()", "getElements()", "locateAll()"], "correctAnswer": "findElements()"},
    {"id": 72, "question": "What does driver.manage().window().maximize() do?", "options": ["Minimize window", "Close tab", "Maximize window", "Refresh page"], "correctAnswer": "Maximize window"},
    {"id": 73, "question": "Which framework is used with Selenium for unit testing?", "options": ["Maven", "TestNG", "Jenkins", "Gradle"], "correctAnswer": "TestNG"},
    {"id": 74, "question": "What is Selenium Grid used for?", "options": ["Writing tests", "Running tests on single browser", "Parallel execution", "Recording scripts"], "correctAnswer": "Parallel execution"},
    {"id": 75, "question": "Which WebDriver is used for Firefox?", "options": ["SafariDriver", "ChromeDriver", "GeckoDriver", "EdgeDriver"], "correctAnswer": "GeckoDriver"},
    {"id": 76, "question": "What is the use of driver.switchTo().defaultContent()?", "options": ["Exit frame", "Enter frame", "Close tab", "Refresh page"], "correctAnswer": "Exit frame"},
    {"id": 77, "question": "How do you handle multiple windows in Selenium?", "options": ["switchTabs()", "driver.switchTo().window()", "changeWindow()", "openTab()"], "correctAnswer": "driver.switchTo().window()"},
    {"id": 78, "question": "What does driver.getWindowHandles() return?", "options": ["Current URL", "List of tabs", "Set of window handles", "HTML of window"], "correctAnswer": "Set of window handles"},
    {"id": 79, "question": "How do you get the text of a web element?", "options": ["element.value", "getText()", "textOf()", "innerHTML()"], "correctAnswer": "getText()"},
    {"id": 80, "question": "What is the best way to wait for elements to appear?", "options": ["Thread.sleep()", "Implicit wait", "Explicit wait", "WaitFor()"], "correctAnswer": "Explicit wait"},
]

# Create the TypeScript file content
ts_content = "const quizData = [\n"

for q in questions:
    options_str = ", ".join([f'"{opt}"' for opt in q["options"]])
    
    # Create the question object
    question_obj = f'''  {{
    id: {q["id"]},
    question: "{q["question"]}",
    options: [{options_str}],
    correctAnswer: "{q["correctAnswer"]}",
    type: "single",
    points: 10
  }}'''
    
    ts_content += question_obj + ",\n"

# Remove the trailing comma and close the array
ts_content = ts_content.rstrip(",\n") + "\n];\n\nexport default quizData;"

# Write to the file
with open("D:/app/project/src/data/quizData.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Successfully updated quizData.ts with {len(questions)} questions from the table.") 