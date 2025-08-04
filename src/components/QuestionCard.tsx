import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Info, HelpCircle, LightbulbIcon } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface QuestionCardProps {
  question: string;
  options: string[];
  type: 'single' | 'multiple' | 'true-false';
  selectedAnswer: string | string[];
  onSelectAnswer: (answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  questionNumber: number;
  totalQuestions: number;
  explanation?: string;
  animationsEnabled?: boolean;
  correctAnswer?: string | string[];
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  type,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  isSubmitting,
  showFeedback,
  isCorrect,
  questionNumber,
  totalQuestions,
  explanation,
  animationsEnabled = true,
  correctAnswer
}) => {
  const { questions, currentQuestionIndex } = useQuiz();
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Get the actual correct answer from the quiz context
  const actualCorrectAnswer = questions[currentQuestionIndex]?.correctAnswer || correctAnswer;

  // Determine which options are correct
  const isCorrectOption = (option: string): boolean => {
    if (!actualCorrectAnswer) return false;
    
    if (Array.isArray(actualCorrectAnswer)) {
      return actualCorrectAnswer.includes(option);
    } else {
      return option === actualCorrectAnswer;
    }
  };
  
  // Check if option is selected
  const isSelected = (option: string) => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(option);
    }
    return selectedAnswer === option;
  };

  // Determine classes based on feedback state
  const getOptionClasses = (option: string) => {
    let baseClasses = "relative p-4 mb-3 border rounded-lg transition-all duration-300 flex items-center";
    
    if (isSelected(option)) {
      baseClasses += " border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30";
    } else {
      baseClasses += " border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700";
    }

    if (showFeedback) {
      if (isCorrect && isSelected(option)) {
        baseClasses += " answer-correct border-green-500 bg-green-50 dark:bg-green-900/20";
      } else if (!isCorrect && isSelected(option)) {
        baseClasses += " answer-incorrect border-red-500 bg-red-50 dark:bg-red-900/20";
      }
    }
    
    // Highlight the correct answer when "Show Answer" is clicked
    if (showAnswer && !showFeedback && isCorrectOption(option)) {
      baseClasses += " border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    return baseClasses;
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    if (type === 'multiple') {
      return Array.isArray(selectedAnswer) ? selectedAnswer.length === 0 : true;
    }
    return !selectedAnswer;
  };

  // Get correct answer to display
  const getCorrectAnswer = () => {
    if (!actualCorrectAnswer) return "No answer available.";
    
    if (Array.isArray(actualCorrectAnswer)) {
      return `The correct answers are: ${actualCorrectAnswer.join(', ')}`;
    } else {
      return `The correct answer is: ${actualCorrectAnswer}`;
    }
  };

  // Animation variants
  const answerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } }
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.97 }
  };

  return (
    <div className="quiz-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          {question}
        </h2>
        
        {type === 'multiple' && (
          <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            Select all that apply
          </div>
        )}
      </div>

      {/* Answer Display */}
      <AnimatePresence>
        {showAnswer && !showFeedback && (
          <motion.div 
            variants={animationsEnabled ? answerVariants : {}}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800 dark:text-green-300">
                <div className="font-medium mb-1">Answer:</div>
                <div>{getCorrectAnswer()}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="mb-6">
        {options.map((option, index) => (
          <motion.div
            key={index}
            variants={animationsEnabled ? optionVariants : {}}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className={getOptionClasses(option)}
            onClick={() => !isSubmitting && !showAnswer && onSelectAnswer(option)}
            whileHover={animationsEnabled && !showAnswer ? { scale: 1.01 } : {}}
          >
            {/* Checkbox or Radio Button UI */}
            <div className="mr-3">
              {type === 'multiple' ? (
                <div className={`h-5 w-5 rounded border ${
                  isSelected(option) 
                    ? 'bg-indigo-600 border-indigo-600 flex items-center justify-center' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected(option) && <Check className="h-3 w-3 text-white" />}
                </div>
              ) : (
                <div className={`h-5 w-5 rounded-full border ${
                  isSelected(option) 
                    ? 'border-indigo-600 flex items-center justify-center' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected(option) && <div className="h-3 w-3 rounded-full bg-indigo-600" />}
                </div>
              )}
            </div>

            {/* Option Text */}
            <div className="flex-1">{option}</div>

            {/* Feedback Icons */}
            {showFeedback && isSelected(option) && (
              <div className="absolute right-4">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
            
            {/* Show check mark on correct answer when showing answer */}
            {showAnswer && !showFeedback && isCorrectOption(option) && (
              <div className="absolute right-4">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Explanation (shown after answering) */}
      <AnimatePresence>
        {showFeedback && explanation && (
          <motion.div 
            variants={animationsEnabled ? answerVariants : {}}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <div className="font-medium mb-1">Explanation:</div>
                <div>{explanation}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default QuestionCard;