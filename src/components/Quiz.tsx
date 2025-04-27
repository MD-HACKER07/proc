import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz, Question } from '../context/QuizContext';
import { useSettings } from '../context/SettingsContext';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';

interface QuizProps {
  onComplete: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const { 
    questions: originalQuestions, 
    currentQuestionIndex, 
    userAnswers, 
    submitAnswer,
    isQuizComplete,
    timeRemaining,
    setTimeRemaining
  } = useQuiz();

  const { settings } = useSettings();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  // Shuffle an array using Fisher-Yates algorithm
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle questions when they change or when the setting changes
  useEffect(() => {
    if (settings.shuffleQuestions) {
      setShuffledQuestions(shuffleArray(originalQuestions));
    } else {
      setShuffledQuestions(originalQuestions);
    }
  }, [originalQuestions, settings.shuffleQuestions]);
  
  // Get the questions array to use based on shuffle setting
  const questions = shuffledQuestions.length > 0 ? shuffledQuestions : originalQuestions;
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Shuffle options when question changes or when setting changes
  useEffect(() => {
    if (currentQuestion && settings.shuffleOptions) {
      setShuffledOptions(shuffleArray(currentQuestion.options));
    } else if (currentQuestion) {
      setShuffledOptions(currentQuestion.options);
    }
  }, [currentQuestion, settings.shuffleOptions]);
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setIsSubmitting(false);
    setShowFeedback(false);
    setTimeRemaining(60); // Reset timer for new question
  }, [currentQuestionIndex, setTimeRemaining]);
  
  // Complete quiz when all questions are answered
  useEffect(() => {
    if (isQuizComplete) {
      onComplete();
    }
  }, [isQuizComplete, onComplete]);

  // Time's up handler
  useEffect(() => {
    if (timeRemaining <= 0 && !isSubmitting) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitting]);

  // Handle selecting an answer
  const handleSelectAnswer = (answer: string) => {
    if (currentQuestion?.type === 'multiple') {
      // Toggle the selection for multiple choice
      setSelectedAnswer((prev) => {
        const prevAnswers = Array.isArray(prev) ? prev : [];
        if (prevAnswers.includes(answer)) {
          return prevAnswers.filter(a => a !== answer);
        } else {
          return [...prevAnswers, answer];
        }
      });
    } else {
      // Single selection for other question types
      setSelectedAnswer(answer);
    }
  };

  // Initialize for multiple choice
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'multiple') {
      setSelectedAnswer([]);
    }
  }, [currentQuestion]);

  // Submit the answer
  const handleSubmit = () => {
    if (!currentQuestion) return;
    
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      // If no answer is selected, consider it wrong
      submitAnswer('');
      return;
    }
    
    setIsSubmitting(true);
    const correctAnswer = currentQuestion.correctAnswer;
    
    // Check if the answer is correct
    let correct = false;
    if (Array.isArray(correctAnswer) && Array.isArray(selectedAnswer)) {
      correct = 
        correctAnswer.length === selectedAnswer.length && 
        correctAnswer.every(a => selectedAnswer.includes(a));
    } else {
      correct = selectedAnswer === correctAnswer;
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Play sound if enabled
    if (settings.sound) {
      const sound = new Audio(
        correct 
          ? '/sounds/correct.mp3' 
          : '/sounds/incorrect.mp3'
      );
      sound.play().catch(e => console.log('Error playing sound:', e));
    }
    
    // Submit after showing feedback
    setTimeout(() => {
      submitAnswer(selectedAnswer);
      setIsSubmitting(false);
      setShowFeedback(false);
    }, 1500);
  };

  // Calculate progress
  const progress = ((currentQuestionIndex) / (questions.length || 1)) * 100;

  // Handle loading state or no questions
  if (!questions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Helper function to determine question type
  const getQuestionType = (type: string | undefined): 'single' | 'multiple' | 'true-false' => {
    if (type === 'multiple') return 'multiple';
    if (type === 'true-false') return 'true-false';
    return 'single';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressBar progress={progress} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={settings.animationsEnabled ? { x: 50, opacity: 0 } : {}}
          animate={settings.animationsEnabled ? { x: 0, opacity: 1 } : {}}
          exit={settings.animationsEnabled ? { x: -50, opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion.question}
              options={shuffledOptions}
              type={getQuestionType(currentQuestion.type)}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              showFeedback={showFeedback}
              isCorrect={isCorrect}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              explanation={currentQuestion.explanation}
              animationsEnabled={settings.animationsEnabled}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;