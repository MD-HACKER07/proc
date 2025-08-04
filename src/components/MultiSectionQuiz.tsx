import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Target, TrendingUp } from 'lucide-react';
import {
  ExamConfiguration,
  ExamSession,
  SectionResult,
  startExamSession,
  getExamSession,
  completeSectionAndGetNext,
  getSectionQuestions,
  calculatePerformanceCategory
} from '../services/examService';
import { useAuth } from '../context/UserAuthContext';

interface MultiSectionQuizProps {
  examConfig: ExamConfiguration;
  onComplete: (session: ExamSession) => void;
  onExit: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
}

const MultiSectionQuiz: React.FC<MultiSectionQuizProps> = ({ examConfig, onComplete, onExit }) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string>('');
  const [currentSection, setCurrentSection] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sectionStartTime, setSectionStartTime] = useState<Date>(new Date());
  const [sectionsCompleted, setSectionsCompleted] = useState<SectionResult[]>([]);
  const [showSectionResult, setShowSectionResult] = useState(false);
  const [currentSectionResult, setCurrentSectionResult] = useState<SectionResult | null>(null);
  const [nextDifficulty, setNextDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isExamComplete, setIsExamComplete] = useState(false);

  // Initialize exam session
  useEffect(() => {
    const initializeSession = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const newSessionId = await startExamSession(examConfig.id!, user.uid);
        setSessionId(newSessionId);
        
        // Load first section questions
        await loadSectionQuestions(1, 'medium'); // Start with medium difficulty
      } catch (err: any) {
        console.error('Error initializing exam session:', err);
        setError('Failed to start exam session');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [examConfig.id, user?.uid]);

  // Timer effect for section time limit
  useEffect(() => {
    if (sectionTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setSectionTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (sectionTimeRemaining === 0 && questions.length > 0) {
      // Auto-submit section when time runs out
      handleSectionComplete();
    }
  }, [sectionTimeRemaining, questions.length]);

  const loadSectionQuestions = async (sectionNumber: number, difficulty: 'easy' | 'medium' | 'hard') => {
    setLoading(true);
    try {
      const sectionQuestions = await getSectionQuestions(
        examConfig.subjectId,
        difficulty,
        examConfig.questionsPerSection
      );
      
      setQuestions(sectionQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer('');
      setSectionStartTime(new Date());
      
      // Set section time limit
      const sectionConfig = examConfig.sections.find(s => s.sectionNumber === sectionNumber);
      const timeLimit = sectionConfig?.timeLimit || examConfig.questionsPerSection * 2;
      setSectionTimeRemaining(timeLimit * 60); // Convert to seconds
      
    } catch (err: any) {
      console.error('Error loading section questions:', err);
      setError('Failed to load questions for this section');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      points: isCorrect ? currentQuestion.points : 0
    };

    setAnswers(prev => [...prev, answer]);
    setSelectedAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Section complete
      handleSectionComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Remove the answer for current question if going back
      const currentQuestion = questions[currentQuestionIndex];
      setAnswers(prev => prev.filter(a => a.questionId !== currentQuestion.id));
      
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Restore previous answer if exists
      const previousQuestion = questions[currentQuestionIndex - 1];
      const previousAnswer = answers.find(a => a.questionId === previousQuestion.id);
      setSelectedAnswer(previousAnswer?.answer || '');
    }
  };

  const handleSectionComplete = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      // Calculate section score
      const sectionScore = answers.reduce((sum, answer) => sum + answer.points, 0);
      const maxSectionScore = questions.reduce((sum, question) => sum + question.points, 0);
      const percentage = maxSectionScore > 0 ? (sectionScore / maxSectionScore) * 100 : 0;
      
      const sectionResult: SectionResult = {
        sectionNumber: currentSection,
        questions: questions,
        answers: answers,
        score: sectionScore,
        maxScore: maxSectionScore,
        percentage: percentage,
        performanceCategory: calculatePerformanceCategory(percentage, examConfig.performanceThresholds),
        difficultyLevel: questions[0]?.difficulty || 'medium',
        completedAt: new Date(),
        timeSpent: Math.floor((new Date().getTime() - sectionStartTime.getTime()) / 1000)
      };

      // Complete section and get next difficulty
      const result = await completeSectionAndGetNext(sessionId, sectionResult, examConfig);
      
      setCurrentSectionResult(sectionResult);
      setSectionsCompleted(prev => [...prev, sectionResult]);
      setShowSectionResult(true);
      
      if (result.isExamComplete) {
        setIsExamComplete(true);
        // Load final session data
        const finalSession = await getExamSession(sessionId);
        if (finalSession) {
          onComplete(finalSession);
        }
      } else {
        setNextDifficulty(result.nextDifficulty!);
      }
      
    } catch (err: any) {
      console.error('Error completing section:', err);
      setError('Failed to complete section');
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentSection, answers, questions, sectionStartTime, examConfig, onComplete]);

  const handleNextSection = async () => {
    setShowSectionResult(false);
    setCurrentSection(prev => prev + 1);
    await loadSectionQuestions(currentSection + 1, nextDifficulty);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getPerformanceCategoryColor = (category: 'topper' | 'average' | 'below-average') => {
    switch (category) {
      case 'topper': return 'text-green-600 bg-green-100';
      case 'average': return 'text-blue-600 bg-blue-100';
      case 'below-average': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Exit Exam
          </button>
        </div>
      </div>
    );
  }

  // Show section result screen
  if (showSectionResult && currentSectionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Section {currentSectionResult.sectionNumber} Complete!
            </h2>
            <p className="text-gray-600">Great job! Here's how you performed:</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Score:</span>
              <span className="text-lg font-bold">
                {currentSectionResult.score}/{currentSectionResult.maxScore} 
                ({Math.round(currentSectionResult.percentage)}%)
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Performance Category:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceCategoryColor(currentSectionResult.performanceCategory)}`}>
                {currentSectionResult.performanceCategory.charAt(0).toUpperCase() + currentSectionResult.performanceCategory.slice(1).replace('-', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Section Difficulty:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentSectionResult.difficultyLevel)}`}>
                {getDifficultyIcon(currentSectionResult.difficultyLevel)} {currentSectionResult.difficultyLevel.charAt(0).toUpperCase() + currentSectionResult.difficultyLevel.slice(1)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Time Spent:</span>
              <span>{formatTime(currentSectionResult.timeSpent)}</span>
            </div>

            {!isExamComplete && examConfig.adaptiveMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Next Section Difficulty:</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Based on your performance, the next section will be at{' '}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(nextDifficulty)}`}>
                    {getDifficultyIcon(nextDifficulty)} {nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)}
                  </span>{' '}
                  difficulty level.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            {isExamComplete ? (
              <button
                onClick={() => onComplete(currentSectionResult as any)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                View Final Results
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continue to Section {currentSection + 1}
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{examConfig.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Section {currentSection} of {examConfig.totalSections}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {getDifficultyIcon(currentQuestion.difficulty)} {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className={`font-mono ${sectionTimeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(sectionTimeRemaining)}
                </span>
              </div>
              <button
                onClick={onExit}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>Section Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1}</span>
              <span className="text-sm text-gray-500">{currentQuestion.points} points</span>
            </div>
            <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete Section' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSectionQuiz;
