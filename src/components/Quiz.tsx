import React, { useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useQuiz, Question } from '../context/QuizContext';
import { useSettings } from '../context/SettingsContext';
import QuestionCard from './QuestionCard';
import RealtimeMonitor from './RealtimeMonitor';
import { pushSecurityEvent } from '../services/realtimeService';
import { useUserAuth } from '../context/UserAuthContext';
import { useUserExam } from '../context/UserExamContext';
import ProgressBar from './ProgressBar';
import { Shield, Eye, EyeOff, Lock, AlertTriangle, WifiOff, Clock, Calendar } from 'lucide-react';
import { saveQuizResponse, getPerformanceCategory } from '../services/responseService';
import { startExamSession, getActiveExamSessions, endExamSession, ExamSession } from '../services/examMonitoringService';
import { hasTakenExam, recordAttempt } from '../services/attemptService';
import { getNextQuizSet } from '../services/quizService';
import { generateAdaptiveQuiz, getAdaptiveQuizConfigs, AdaptiveQuizConfig } from '../services/adaptiveQuizService';

type QuizProps = {
  onComplete: () => void;
  children?: ReactNode;
};

type SecurityAlert = {
  type: 'tab-switch' | 'dev-tools' | 'copy' | 'paste' | 'print' | 'right-click' | 'fullscreen-exit' | 'network-loss';
  message: string;
  timestamp: number;
};

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const { 
    questions: originalQuestions, 
    submitAnswer,
    isQuizComplete,
    currentQuestionIndex,
    timeRemaining,
    setTimeRemaining,
    setCurrentQuestionIndex,
    userAnswers,
    loadQuestions,
    selectedSubject
  } = useQuiz();
  
  const { activeExam } = useUserExam();

  const { settings } = useSettings();

  // Whole-exam timer state (seconds)
  const [examTimeLeft, setExamTimeLeft] = useState(settings.examDuration * 60);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[] | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({});
  
  // Adaptive quiz state
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveQuizConfig | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionQuestions, setSectionQuestions] = useState<Question[][]>([]);
  const [sectionResults, setSectionResults] = useState<Array<{score: number, total: number, percentage: number}>>([]);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<Question[]>([]);
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false);
  
  // Security state
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [showMonitor, setShowMonitor] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [sessionId] = useState(Date.now().toString()); // unique session ID
  const [quizEnded, setQuizEnded] = useState(false);
  
  // Refs for security monitoring
  const visibilityChangeRef = useRef<() => void>();
  const devToolsDetectorRef = useRef<NodeJS.Timeout>();
  const fullscreenChangeRef = useRef<() => void>();
  const keydownRef = useRef<(e: KeyboardEvent) => void>();
  const copyRef = useRef<(e: ClipboardEvent) => void>();
  const printRef = useRef<() => void>();
  
  // Security monitoring setup
  const { userProfile, addQuizMark } = useUserAuth();

  // Check single-attempt and initialize adaptive quiz on mount
  useEffect(() => {
    const check = async () => {
      if (!userProfile?.uid || !selectedSubject) return;
      try {
        const taken = await hasTakenExam(userProfile.uid, selectedSubject);
        setAlreadyTaken(taken);
        
        // Check for adaptive quiz configurations
        const adaptiveConfigs = await getAdaptiveQuizConfigs();
        const subjectConfig = adaptiveConfigs.find(config => config.subjectId === selectedSubject);
        
        if (subjectConfig) {
          setAdaptiveConfig(subjectConfig);
          setIsAdaptiveMode(true);
          await initializeAdaptiveQuiz(subjectConfig);
        } else {
          // Fallback to regular quiz mode
          setIsAdaptiveMode(false);
        }
      } catch (err) {
        console.error('Attempt check failed', err);
      } finally {
        setCheckingAttempt(false);
      }
    };
    check();
  }, [userProfile, selectedSubject]);
  const addSecurityAlert = useCallback((type: SecurityAlert['type'], message: string) => {
    const evt = { type, message, timestamp: Date.now() };
    setSecurityAlerts(prev => [...prev, evt]);
    // Push to Firebase Realtime Database
    if (userProfile?.uid) {
      pushSecurityEvent({
        ...evt,
        userId: userProfile.uid,
        sessionId
      });
    }
  }, [userProfile?.uid, sessionId]);

  // Initialize adaptive quiz with 4 sections
  const initializeAdaptiveQuiz = useCallback(async (config: AdaptiveQuizConfig) => {
    try {
      if (!selectedSubject) return;
      
      const questionsPerSection = Math.floor(config.totalQuestions / 4);
      const sections: Question[][] = [];
      
      // Section 1: Start with medium difficulty questions
      const section1Questions = await generateAdaptiveQuiz(
        selectedSubject,
        questionsPerSection,
        config.adaptiveMode,
        60 // Start with medium performance assumption
      );
      sections.push(section1Questions);
      
      // Initialize with first section
      setSectionQuestions(sections);
      setCurrentSectionQuestions(section1Questions);
      setShuffledQuestions(section1Questions);
      setCurrentSection(0);
      
      // Initialize shuffled options for first section
      const optionsMap: Record<string, string[]> = {};
      section1Questions.forEach(q => {
        if (q.options && q.options.length > 0) {
          optionsMap[q.id] = shuffleArray([...q.options]);
        }
      });
      setShuffledOptions(optionsMap);
      
      // Set exam time based on total question count
      setExamTimeLeft(config.totalQuestions * 60); // 1 minute per question
      
    } catch (error) {
      console.error('Error initializing adaptive quiz:', error);
      // Fallback to regular quiz mode
      setIsAdaptiveMode(false);
    }
  }, [selectedSubject]);
  
  // Anti-cheating security measures
  useEffect(() => {
    if (!quizStarted || quizEnded) return;
    
    // Tab switching detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addSecurityAlert('tab-switch', 'User switched tabs during quiz');
        handleSubmit();
      }
    };
    
    // Dev tools detection
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        addSecurityAlert('dev-tools', 'Developer tools detected');
      }
    };
    
    // Network connectivity monitoring
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => {
      setIsConnected(false);
      addSecurityAlert('network-loss', 'Network connection lost');
    };
    
    // Fullscreen monitoring
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && isFullscreen) {
        addSecurityAlert('fullscreen-exit', 'Exited fullscreen mode');
      }
    };
    
    
    
    // Keyboard shortcuts prevention
    const preventShortcuts = (e: KeyboardEvent) => {
      // Prevent common cheating shortcuts
      if (
        (e.ctrlKey || e.metaKey) && 
        ['c', 'v', 'x', 'a', 'p', 's', 'u', 'i', 'j', 'shift', 'f12'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        addSecurityAlert('copy', `Keyboard shortcut blocked: ${e.key}`);
      }
      
      // Prevent F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        addSecurityAlert('dev-tools', 'F12 key blocked');
      }
    };
    
    // Clipboard prevention
    const preventClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      addSecurityAlert(e.type === 'copy' ? 'copy' : 'paste', `${e.type} action blocked`);
    };
    
    // Print prevention
    const preventPrint = () => {
      addSecurityAlert('print', 'Print action blocked');
    };
    
    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('copy', preventClipboard);
    document.addEventListener('cut', preventClipboard);
    document.addEventListener('paste', preventClipboard);
    document.addEventListener('beforeprint', preventPrint);
    
    // Store refs for cleanup
    visibilityChangeRef.current = handleVisibilityChange;
    fullscreenChangeRef.current = handleFullscreenChange;
    keydownRef.current = preventShortcuts;
    copyRef.current = preventClipboard;
    printRef.current = preventPrint;
    
    // Start dev tools detection interval
    devToolsDetectorRef.current = setInterval(detectDevTools, 1000);
    
    // Check network status
    if (!navigator.onLine) {
      handleOffline();
    }
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('copy', preventClipboard);
      document.removeEventListener('cut', preventClipboard);
      document.removeEventListener('paste', preventClipboard);
      document.removeEventListener('beforeprint', preventPrint);
      
      if (devToolsDetectorRef.current) {
        clearInterval(devToolsDetectorRef.current);
      }
    };
  }, [quizStarted, quizEnded, addSecurityAlert, isFullscreen]);
  
  // Security utility functions
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  const startQuiz = async () => {
    try {
      if (userProfile && selectedSubject && activeExam) {
        // Start exam session in Firestore
        await startExamSession(
          userProfile.uid,
          userProfile.email || '',
          userProfile.displayName || 'Anonymous',
          activeExam
        );
      }
      
      setQuizStarted(true);
      setExamTimeLeft(settings.examDuration * 60); // initialise exam countdown
      enterFullscreen();
    } catch (error) {
      console.error('Error starting exam session:', error);
      // Still allow quiz to start even if session tracking fails
      setQuizStarted(true);
      setExamTimeLeft(settings.examDuration * 60);
      enterFullscreen();
    }
  };

  const endQuiz = () => {
    setQuizEnded(true);
    exitFullscreen();
    onComplete();
  };

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
  
  // Shuffle options for each question when questions change or when setting changes
  useEffect(() => {
    const newShuffledOptions: Record<string, string[]> = {};
    questions.forEach(question => {
      if (settings.shuffleOptions) {
        newShuffledOptions[String(question.id)] = shuffleArray(question.options);
      } else {
        newShuffledOptions[String(question.id)] = question.options;
      }
    });
    setShuffledOptions(newShuffledOptions);
  }, [questions, settings.shuffleOptions]);
  
  // Initialize selected answers when questions change
  useEffect(() => {
    const initialAnswers: Record<string, string | string[] | null> = {};
    questions.forEach(question => {
      if (question.type === 'multiple') {
        initialAnswers[String(question.id)] = [];
      } else {
        initialAnswers[String(question.id)] = null;
      }
    });
    setSelectedAnswers(initialAnswers);
  }, [questions]);
  
  // Complete quiz when all questions are answered
  useEffect(() => {
    if (isQuizComplete) {
      onComplete();
    }
  }, [isQuizComplete, onComplete]);

  const QUESTION_TIME = 60; // seconds per question, can be moved to settings later

  // Reset timer whenever we move to a new question
  useEffect(() => {
    if (!quizStarted || quizEnded) return;
    setTimeRemaining(QUESTION_TIME);
  }, [currentQuestionIndex, quizStarted, quizEnded, setTimeRemaining]);

  // Timer countdown – functional update avoids stale closure & triggers auto-advance / auto-submit
  useEffect(() => {
    if (!quizStarted || quizEnded) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev: number): number => {
        if (prev > 1) {
          return prev - 1;
        }
        // Time for this question expired
        if (currentQuestionIndex === questions.length - 1) {
          handleSubmit(); // auto-submit on last question
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
        return QUESTION_TIME; // reset timer for next question (won't matter if quiz ended)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizEnded, currentQuestionIndex, questions.length]);

  // Whole-exam countdown timer – ends exam when it reaches 0
  useEffect(() => {
    if (!quizStarted || quizEnded) return;

    const examTimer = setInterval(() => {
      setExamTimeLeft(prev => {
        if (prev > 1) {
          return prev - 1;
        }
        // Time is up – auto submit / end quiz
        handleSubmit();
        return 0;
      });
    }, 1000);

    return () => clearInterval(examTimer);
  }, [quizStarted, quizEnded]);

  // Ensure questions are loaded when subject is selected
  useEffect(() => {
    if (originalQuestions.length === 0 && selectedSubject) {
      loadQuestions(selectedSubject);
    }
  }, [originalQuestions.length, selectedSubject, loadQuestions]);

  // Handle selecting an answer for a specific question
  const handleSelectAnswer = (questionId: string, answer: string | string[]) => {
    const question = questions.find(q => String(q.id) === questionId);
    if (!question) return;

    if (question.type === 'multiple') {
      // Handle multiple selection
      const currentAnswers = (selectedAnswers[questionId] as string[]) || [];
      const newAnswers = currentAnswers.includes(answer as string)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer as string];
      
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));
    } else {
      // Single selection for other question types
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || quizEnded) return; // guard
    setIsSubmitting(true);
    setQuizEnded(true);
    
    try {
      // End exam session if it exists
      if (userProfile && selectedSubject && activeExam) {
        // Get active sessions and find the user's session
        const unsubscribe = getActiveExamSessions(activeExam.subjectId, (sessions: ExamSession[]) => {
          const userSession = sessions.find(s => s.userId === userProfile.uid);
          if (userSession) {
            endExamSession(userSession.id).catch(console.error);
          }
        });
        
        // Clean up the subscription
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }
    } catch (error) {
      console.error('Error ending exam session:', error);
      // Continue with quiz submission even if session ending fails
    }
    try {
      // Handle section-wise adaptive progression
      if (isAdaptiveMode && currentSection < 3) {
        // This is section completion, not final submission
        await handleSectionComplete();
        setIsSubmitting(false);
        return;
      }
      
      // Final submission - calculate total score across all sections
      const allQuestions = isAdaptiveMode ? 
        sectionQuestions.flat() : 
        shuffledQuestions;
      
      // Loop through questions in order to preserve index context
      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        const answer = selectedAnswers[String(q.id)] ?? (q.type === 'multiple' ? [] : '');
        // Update context index so QuizContext can evaluate correctness
        setCurrentQuestionIndex(i);
        await submitAnswer(answer);
      }
      // -------- Build quiz result payload and persist to Firestore --------
      try {
        const totalQuestions = questions.length;

        // Helper functions to evaluate correctness
        const normalise = (val: string) => val.trim().toLowerCase();
        const isCorrectAnswer = (userAns: string | string[], correctAns: string | string[]): boolean => {
          if (Array.isArray(correctAns)) {
            if (!Array.isArray(userAns)) return false;
            if (correctAns.length !== userAns.length) return false;
            const correctSet = new Set(correctAns.map(normalise));
            return userAns.every(a => correctSet.has(normalise(a)));
          }
          if (Array.isArray(userAns)) {
            return normalise(userAns[0] ?? '') === normalise(correctAns);
          }
          return normalise(userAns) === normalise(correctAns);
        };

        let correctCount = 0;

        const responseDetails = questions.map(q => {
          const userAns = (selectedAnswers as any)[String(q.id)] ?? (q.type === 'multiple' ? [] : '');
          const isCorrect = isCorrectAnswer(userAns, q.correctAnswer);
          if (isCorrect) {
            correctCount += 1;
          }
          return {
            questionId: q.id,
            questionText: q.question,
            selectedAnswer: Array.isArray(userAns) ? userAns.join(', ') : userAns,
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer,
            isCorrect,
            timeSpent: 0,
            options: q.options
          };
        });

        const percentage = Math.round((correctCount / totalQuestions) * 100);
        const timeTaken = (questions.length * QUESTION_TIME) - timeRemaining;

        // Determine next quiz set based on performance
        const nextQuizSet = getNextQuizSet(percentage);
        
        // Determine performance category based on percentage
        const performanceCategory = getPerformanceCategory(percentage);

        const responsePayload = {
          userId: userProfile?.uid || 'anonymous',
          userEmail: userProfile?.email || 'anon@example.com',
          userName: userProfile?.displayName || 'Anonymous',
          quizId: (selectedSubject as any)?.id || 'default-quiz',
          quizTitle: (selectedSubject as any)?.title || (selectedSubject as any)?.name || 'Quiz',
          score: correctCount, // Use correct count as score instead of points
          totalQuestions,
          percentage,
          timeTaken,
          startedAt: new Date(Date.now() - (timeTaken * 1000)),
          completedAt: new Date(),
          responses: responseDetails,
          released: false, // Default to not released until admin approves
          nextQuizSet, // Add the next quiz set assignment
          performanceCategory // Add automatic performance categorization
        } as any;

        await saveQuizResponse(responsePayload);
        // Record attempt to prevent re-take
        if (userProfile?.uid && selectedSubject) {
          await recordAttempt(userProfile.uid, selectedSubject);
        }
        
        // Add to user profile
        if (userProfile && addQuizMark) {
          const quizMark = {
            quizId: responsePayload.quizId,
            subject: responsePayload.quizTitle,
            score: responsePayload.score,
            totalQuestions: responsePayload.totalQuestions,
            percentage: responsePayload.percentage,
            date: responsePayload.completedAt,
            timeSpent: responsePayload.timeTaken,
            released: false // Default to not released until admin approves
          };
          await addQuizMark(quizMark);
        }
      } catch (err) {
        console.error('Error saving quiz response:', err);
      }

      // -----------------------------------------------------------------

      endQuiz();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle section completion and progression
  const handleSectionComplete = async () => {
    if (!isAdaptiveMode || !adaptiveConfig || !selectedSubject) return false;
    
    // Calculate current section score
    let correctInSection = 0;
    const sectionQuestionIds = currentSectionQuestions.map(q => String(q.id));
    
    // Helper function to check answers
    const checkAnswer = (userAnswer: string | string[], correctAnswer: string | string[]): boolean => {
      const normalise = (val: string) => val.trim().toLowerCase();
      
      if (Array.isArray(correctAnswer)) {
        if (!Array.isArray(userAnswer)) return false;
        if (correctAnswer.length !== userAnswer.length) return false;
        const correctSet = new Set(correctAnswer.map(normalise));
        return userAnswer.every(ans => correctSet.has(normalise(ans)));
      }
      if (Array.isArray(userAnswer)) {
        return normalise(userAnswer[0] ?? '') === normalise(correctAnswer);
      }
      return normalise(userAnswer) === normalise(correctAnswer);
    };
    
    sectionQuestionIds.forEach(qId => {
      const userAnswer = selectedAnswers[qId];
      const question = currentSectionQuestions.find(q => String(q.id) === qId);
      if (question && userAnswer) {
        const isCorrect = checkAnswer(userAnswer, question.correctAnswer);
        if (isCorrect) correctInSection++;
      }
    });
    
    const sectionPercentage = (correctInSection / currentSectionQuestions.length) * 100;
    
    // Store section result
    const newSectionResult = {
      score: correctInSection,
      total: currentSectionQuestions.length,
      percentage: sectionPercentage
    };
    
    setSectionResults(prev => [...prev, newSectionResult]);
    
    // Check if we have more sections to go
    const nextSectionIndex = currentSection + 1;
    if (nextSectionIndex < 4) {
      // Generate next section questions based on performance
      const questionsPerSection = Math.floor(adaptiveConfig.totalQuestions / 4);
      const nextSectionQuestions = await generateAdaptiveQuiz(
        selectedSubject,
        questionsPerSection,
        true,
        sectionPercentage
      );
      
      // Update section state
      setSectionQuestions(prev => {
        const updated = [...prev];
        updated[nextSectionIndex] = nextSectionQuestions;
        return updated;
      });
      
      setCurrentSectionQuestions(nextSectionQuestions);
      setShuffledQuestions(nextSectionQuestions);
      setCurrentSection(nextSectionIndex);
      setCurrentQuestionIndex(0);
      
      // Clear selected answers for new section
      setSelectedAnswers({});
      
      // Update shuffled options for new section
      const optionsMap: Record<string, string[]> = {};
      nextSectionQuestions.forEach(q => {
        if (q.options && q.options.length > 0) {
          optionsMap[q.id] = shuffleArray([...q.options]);
        }
      });
      setShuffledOptions(optionsMap);
      
      return false; // Continue to next section
    }
    
    return true; // Quiz complete
  };

  // Helper function to determine question type for QuestionCard
  const getQuestionType = (type: string | undefined): 'single' | 'multiple' | 'true-false' => {
    if (type === 'multiple') return 'multiple';
    if (type === 'true-false') return 'true-false';
    return 'single';
  };

  // Security alert component
  const SecurityAlertBanner = () => {
    if (securityAlerts.length === 0) return null;
    
    const latestAlert = securityAlerts[securityAlerts.length - 1];
    const alertIcon = {
      'tab-switch': <AlertTriangle className="w-5 h-5" />,
      'dev-tools': <AlertTriangle className="w-5 h-5" />,
      'copy': <Lock className="w-5 h-5" />,
      'paste': <Lock className="w-5 h-5" />,
      'print': <Lock className="w-5 h-5" />,
      'right-click': <Lock className="w-5 h-5" />,
      'fullscreen-exit': <AlertTriangle className="w-5 h-5" />,
      'network-loss': <WifiOff className="w-5 h-5" />
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm z-50"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 text-red-600">
            {alertIcon[latestAlert.type]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">Security Alert</p>
            <p className="text-sm text-red-700">{latestAlert.message}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // State for countdown timer (must be declared before any conditional returns)
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  
  // Calculate time components
  const seconds = Math.floor((timeUntilStart / 1000) % 60);
  const minutes = Math.floor((timeUntilStart / (1000 * 60)) % 60);
  const hours = Math.floor((timeUntilStart / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
  
  // Update countdown every second
  useEffect(() => {
    // Only set up timer if we have an active scheduled exam
    if (activeExam?.active && activeExam.scheduledTime && new Date() < new Date(activeExam.scheduledTime)) {
      const scheduledTime = new Date(activeExam.scheduledTime);
      setTimeUntilStart(scheduledTime.getTime() - new Date().getTime());
      
      const timer = setInterval(() => {
        const newTimeUntilStart = scheduledTime.getTime() - new Date().getTime();
        setTimeUntilStart(newTimeUntilStart);
        
        // If time is up, component will re-render and show the quiz
        if (newTimeUntilStart <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeExam]);

  // Pre-quiz security setup
  if (checkingAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Checking exam eligibility...</p>
        </div>
      </div>
    );
  }

  if (alreadyTaken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="max-w-md mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Exam Already Taken</h1>
            <p className="text-gray-600 mb-6">You have already completed this exam. Each user is allowed only one attempt.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if exam is scheduled and if it's time to start
  const isExamReady = activeExam?.active && (
    !activeExam.scheduledTime || 
    new Date() >= activeExam.scheduledTime
  );

  if (!quizStarted) {
    // Show scheduled exam info if exam is scheduled but not yet ready
    if (activeExam?.active && activeExam.scheduledTime && new Date() < new Date(activeExam.scheduledTime)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center">
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Scheduled</h1>
                <p className="text-gray-600 mb-6">This exam is scheduled to start soon</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Scheduled Start Time</p>
                    <p className="text-sm text-blue-700">{activeExam.scheduledTime.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Time Until Start</p>
                    <p className="text-sm text-green-700">
                      {days > 0 && `${days}d `}
                      {hours > 0 && `${hours}h `}
                      {minutes > 0 && `${minutes}m `}
                      {seconds}s
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">Please wait for the admin to start the exam. The quiz will automatically become available at the scheduled time.</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  This page will automatically update when the exam is ready
                </p>
              </div>
              
              <div className="text-center mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  ← Go Back
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    // Show regular security screen if exam is ready or no scheduling
    if (!activeExam?.active || isExamReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="text-center">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Quiz Environment</h1>
                <p className="text-gray-600 mb-6">Your quiz will begin in a secure, monitored environment</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Fullscreen Mode</p>
                    <p className="text-sm text-green-700">Quiz will run in fullscreen to prevent distractions</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-red-50 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Anti-Cheating Measures</p>
                    <p className="text-sm text-red-700">Copy/paste, right-click, and shortcuts are disabled</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Tab Switching Detection</p>
                    <p className="text-sm text-yellow-700">Switching tabs will be detected and logged</p>
                  </div>
                </div>

                {!isConnected && (
                  <div className="flex items-center p-4 bg-red-50 rounded-lg">
                    <WifiOff className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-900">Network Connection Lost</p>
                      <p className="text-sm text-red-700">Please check your internet connection</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={startQuiz}
                  disabled={!isConnected || !isExamReady}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Secure Quiz
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  By starting the quiz, you agree to the monitoring and security measures
                </p>
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  ← Go Back
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600">There are no questions for this quiz.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <SecurityAlertBanner />

      {/* Top-right Question Navigator */}
      <div className="fixed top-16 right-4 z-50">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 flex flex-col space-y-2">
          {questions.map((_, idx) => {
            const isAnswered = userAnswers.some((ans: {questionId: string|number}) => ans.questionId === questions[idx].id);
            const isActive = idx === currentQuestionIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-12 h-8 flex items-center justify-center rounded-md text-sm font-semibold border transition-colors duration-200
                  ${isActive ? 'bg-blue-600 border-blue-300 text-white' : isAnswered ? 'bg-green-500 border-green-300 text-white' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Security status bar */}
      <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-90 text-white p-2 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Secure Quiz Active</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isConnected && (
              <div className="flex items-center space-x-1 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">Offline</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              {isFullscreen ? (
                <Eye className="w-4 h-4 text-green-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-xs">
                {isFullscreen ? 'Fullscreen' : 'Windowed'}
              </span>
            </div>
            
            <button
              onClick={exitFullscreen}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Exit Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Floating real-time monitor toggle */}
      {quizStarted && (
        <>
          <button
            onClick={() => setShowMonitor(true)}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 z-50"
          >
            Monitor
          </button>
          {showMonitor && (
            <RealtimeMonitor onClose={() => setShowMonitor(false)} />
          )}
        </>
      )}

      <div className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-2xl p-8"
          >
            {/* Header with timers */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
                {isAdaptiveMode && adaptiveConfig && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Adaptive Mode: {adaptiveConfig.name}
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Section {currentSection + 1} of 4
                    </div>
                  </div>
                )}
              </div>
              
              {/* Section Progress */}
              {isAdaptiveMode && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Section Progress</span>
                    <span className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(sectionIndex => (
                      <div
                        key={sectionIndex}
                        className={`flex-1 h-2 rounded ${
                          sectionIndex < currentSection
                            ? 'bg-green-500'
                            : sectionIndex === currentSection
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Section Results */}
                  {sectionResults.length > 0 && (
                    <div className="mt-3 flex gap-2 text-xs">
                      {sectionResults.map((result, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded ${
                            result.percentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : result.percentage >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          S{index + 1}: {result.score}/{result.total} ({Math.round(result.percentage)}%)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <ProgressBar progress={((currentQuestionIndex + 1) / (shuffledQuestions.length || 1)) * 100} />

              {timeRemaining !== undefined && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Question Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}

              {/* Overall exam timer */}
              {examTimeLeft !== undefined && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900">
                    Exam Time Left: {Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}
            </div> {/* end header */}

            {/* Render the current question */}
            {shuffledQuestions.length > 0 && (
              <QuestionCard
                question={shuffledQuestions[currentQuestionIndex].question}
                options={shuffledOptions[shuffledQuestions[currentQuestionIndex].id] || shuffledQuestions[currentQuestionIndex].options}
                type={getQuestionType(shuffledQuestions[currentQuestionIndex].type)}
                selectedAnswer={selectedAnswers[String(shuffledQuestions[currentQuestionIndex].id)] ?? (shuffledQuestions[currentQuestionIndex].type === 'multiple' ? [] : '')}
                onSelectAnswer={(answer: string | string[]) => handleSelectAnswer(String(shuffledQuestions[currentQuestionIndex].id), answer)}
                onSubmit={() => {}}
                isSubmitting={isSubmitting}
                showFeedback={false}
                isCorrect={false}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={shuffledQuestions.length}
                explanation={shuffledQuestions[currentQuestionIndex].explanation}
                animationsEnabled={settings.animationsEnabled}
                correctAnswer={shuffledQuestions[currentQuestionIndex].correctAnswer}
              />
            )}
              
              <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Security alerts: {securityAlerts.length}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => {
                    // If this is the last question, submit the quiz
                    if (currentQuestionIndex === shuffledQuestions.length - 1) {
                      handleSubmit();
                    } else {
                      // Otherwise, go to the next question
                      setCurrentQuestionIndex(Math.min(shuffledQuestions.length - 1, currentQuestionIndex + 1));
                    }
                  }}
                  disabled={isSubmitting || (currentQuestionIndex === shuffledQuestions.length - 1 && Object.keys(selectedAnswers).length !== shuffledQuestions.length)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : currentQuestionIndex === shuffledQuestions.length - 1 ? 'Submit Quiz' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;