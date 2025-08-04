import { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useUserAuth } from '../context/UserAuthContext';
import SecurityService from '../services/SecurityService';
import { Maximize, AlertTriangle, Shield, Clock, Eye, EyeOff } from 'lucide-react';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import Timer from './Timer';

interface ProctoredQuizProps {
  onComplete: () => void;
  onExit: () => void;
}

const ProctoredQuiz = ({ onComplete, onExit }: ProctoredQuizProps) => {
  const { quizState, answerQuestion, nextQuestion, prevQuestion, completeQuiz } = useQuiz();
  const { userProfile } = useUserAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const securityService = SecurityService.getInstance();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (quizState.questions.length > 0 && userProfile) {
      const session = securityService.startQuizSession('quiz', userProfile.displayName);
      setSessionId(session.id);
      setIsMonitoring(true);
      
      // Enable security features
      securityService.disableContextMenu();
      securityService.disableKeyboardShortcuts();
      
      // Enter fullscreen
      enterFullscreen();
      
      // Start camera monitoring
      startCameraMonitoring();
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      exitFullscreen();
    };
  }, [quizState.questions.length, userProfile]);

  const enterFullscreen = async () => {
    try {
      await securityService.enterFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.warn('Fullscreen not available:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      await securityService.exitFullscreen();
      setIsFullscreen(false);
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  };

  const startCameraMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.warn('Camera access denied:', error);
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    answerQuestion(answer);
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      prevQuestion();
    }
  };

  const handleCompleteQuiz = () => {
    if (sessionId) {
      // End security session
      securityService.endQuizSession(sessionId, {
        id: sessionId,
        username: userProfile?.displayName || 'Anonymous',
        totalQuestions: quizState.questions.length,
        correctAnswers: quizState.answers.filter(a => a.isCorrect).length,
        percentage: 0, // Will be calculated
        subject: quizState.subject || 'General',
        difficulty: quizState.difficulty || 'medium',
        timeTaken: 0,
        date: new Date(),
        answers: quizState.answers
      });
    }
    
    completeQuiz();
    onComplete();
  };

  const handleExitQuiz = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will not be saved.')) {
      onExit();
    }
  };

  if (quizState.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Security Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">PROCTORED EXAM IN PROGRESS</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Camera Active</span>
            </div>
            {isFullscreen && (
              <div className="flex items-center space-x-1">
                <Maximize className="h-4 w-4" />
                <span className="text-xs">Fullscreen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="fixed top-16 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden shadow-lg z-40">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-1 right-1 bg-red-600 rounded-full w-3 h-3 animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Proctored Quiz
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {userProfile?.displayName || 'Student'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Timer />
              <button
                onClick={handleExitQuiz}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Security Alerts */}
        {securityEvents.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {securityEvents.length} security event(s) detected
              </span>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={quizState.currentQuestionIndex + 1}
              totalQuestions={quizState.questions.length}
              onAnswer={handleAnswer}
              selectedAnswer={quizState.answers[quizState.currentQuestionIndex]?.userAnswer}
              timeLimit={180} // 3 minutes per question
            />
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={quizState.currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {quizState.currentQuestionIndex === quizState.questions.length - 1 ? (
              <button
                onClick={handleCompleteQuiz}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctoredQuiz;
