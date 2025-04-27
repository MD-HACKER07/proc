import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getQuestions } from '../services/quizService';

// Define the types
export interface Question {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  type?: 'single' | 'multiple' | 'true-false' | string;
  points: number;
  subject?: string;
  explanation?: string;
}

interface UserAnswer {
  questionId: string | number;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

interface QuizContextType {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  timeRemaining: number;
  isQuizComplete: boolean;
  totalScore: number;
  maxScore: number;
  selectedSubject: string | null;
  setCurrentQuestionIndex: (index: number) => void;
  submitAnswer: (answer: string | string[]) => void;
  restartQuiz: () => void;
  setTimeRemaining: (time: number) => void;
  setSelectedSubject: (subjectId: string) => void;
  loadQuestions: (subjectId: string) => Promise<void>;
}

// Create context with default values
const QuizContext = createContext<QuizContextType>({
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  timeRemaining: 0,
  isQuizComplete: false,
  totalScore: 0,
  maxScore: 0,
  selectedSubject: null,
  setCurrentQuestionIndex: () => {},
  submitAnswer: () => {},
  restartQuiz: () => {},
  setTimeRemaining: () => {},
  setSelectedSubject: () => {},
  loadQuestions: async () => {},
});

// Hook to use the quiz context
export const useQuiz = () => useContext(QuizContext);

// Provider component
export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load questions for a specific subject
  const loadQuestions = async (subjectId: string): Promise<void> => {
    setLoading(true);
    try {
      const fetchedQuestions = await getQuestions(subjectId);
      
      // Format questions to ensure they have the required properties
      const formattedQuestions = fetchedQuestions.map(q => ({
        ...q,
        type: q.type || 'single',
        points: q.points || 10
      })) as Question[];
      
      setQuestions(formattedQuestions);
      
      // Calculate max possible score
      const total = formattedQuestions.reduce((sum, question) => sum + question.points, 0);
      setMaxScore(total);
      
      // Reset quiz state when loading new questions
      restartQuiz();
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if the answer is correct and calculate points
  const checkAnswer = (questionId: string | number, userAnswer: string | string[], correctAnswer: string | string[]): boolean => {
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // For multiple-choice questions, all correct options must be selected
      return correctAnswer.length === userAnswer.length && 
             correctAnswer.every(answer => userAnswer.includes(answer));
    } else {
      // For single-choice questions
      return userAnswer === correctAnswer;
    }
  };

  // Submit an answer
  const submitAnswer = (answer: string | string[]) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion.id, answer, currentQuestion.correctAnswer);
    
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: answer,
      isCorrect: isCorrect,
      points: isCorrect ? currentQuestion.points : 0
    };

    setUserAnswers(prev => [...prev, userAnswer]);
    setTotalScore(prev => prev + (isCorrect ? currentQuestion.points : 0));

    // Move to the next question or complete the quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  // Restart the quiz
  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTotalScore(0);
    setIsQuizComplete(false);
    setTimeRemaining(60); // Reset timer
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    questions,
    currentQuestionIndex,
    userAnswers,
    timeRemaining,
    isQuizComplete,
    totalScore,
    maxScore,
    selectedSubject,
    setCurrentQuestionIndex,
    submitAnswer,
    restartQuiz,
    setTimeRemaining,
    setSelectedSubject,
    loadQuestions,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};