import React, { useState, useEffect, ErrorInfo, Component, ReactNode } from 'react';
import { QuizProvider } from './context/QuizContext';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { UserExamProvider } from './context/UserExamContext';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Welcome from './components/Welcome';
import Results from './components/Results';
import DetailedResults from './components/DetailedResults';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminModule from './components/admin/AdminModule';
import AboutDeveloper from './components/AboutDeveloper';
import ReviewPage from './components/ReviewPage';
import UserLogin from './components/UserLogin';
import UserProfile from './components/UserProfile';
import Quiz from './components/Quiz';
import RegistrationForm from './components/RegistrationForm';
import AdaptiveQuizSelector from './components/AdaptiveQuizSelector';
import './styles/main.css';

// Error Boundary to catch errors in components
class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode, fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error caught by error boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            The application encountered an error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
          {this.state.error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-mono overflow-auto text-left">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [appState, setAppState] = useState<'welcome' | 'quiz' | 'dashboard' | 'admin' | 'results' | 'profile' | 'registration' | 'reviews' | 'detailed-results' | 'about' | 'user-login' | 'user-profile' | 'proctored-quiz' | 'adaptive-quiz-selector'>('welcome'); // welcome, quiz-dashboard, quiz-active, proctored-quiz, results, admin, about, reviews, user-login, user-profile, adaptive-quiz-selector
  const [isLoading, setIsLoading] = useState(true);
  const [isAdaptiveQuiz, setIsAdaptiveQuiz] = useState(false);
  const [previousPercentage, setPreviousPercentage] = useState<number | undefined>(undefined);



  // Check for admin login
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const adminSession = localStorage.getItem('adminSession');
    
    if (isAdminLoggedIn && adminSession) {
      setAppState('admin');
    }
  }, []);

  // Initialize app
  useEffect(() => {
    // Check URL for paths
    const path = window.location.pathname;
    if (path.includes('/about')) {
      setAppState('about');
    } else if (path.includes('/reviews')) {
      setAppState('reviews');
    }

    // Initialize theme based on localStorage or system preference
    const initializeTheme = () => {
      const savedSettings = localStorage.getItem('quiz-settings');
      let theme = 'system';
      
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          theme = parsedSettings.theme || 'system';
        } catch (error) {
          console.error('Failed to parse saved settings:', error);
        }
      }
      
      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    };
    
    // Call the function to initialize theme
    initializeTheme();

    // Add event listener for detailed registration form
    const handleDetailedRegistration = () => {
      setAppState('registration');
    };

    window.addEventListener('showDetailedRegistration', handleDetailedRegistration);

    // Set loading to false after initial checks
    setIsLoading(false);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('showDetailedRegistration', handleDetailedRegistration);
    };
  }, []);

  const resetQuiz = () => {
    setAppState('welcome');
  };

  const goToAdmin = () => {
    setAppState('admin');
  };



  const goToHome = () => {
    setAppState('welcome');
  };

  const goToAbout = () => {
    setAppState('about');
  };



  // Render the appropriate component based on app state
  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <Welcome 
            onUserLogin={() => setAppState('user-login')}
            onAdminLogin={() => setAppState('admin')}
          />
        );
      case 'quiz':
        return <Quiz onComplete={() => setAppState('results')} />;
      case 'proctored-quiz':
        return <Quiz onComplete={() => setAppState('results')} />;

      case 'results':
        return <Results onRestart={resetQuiz} />;
      case 'detailed-results':
        return <DetailedResults onBack={() => setAppState('user-profile')} />;
      case 'admin':
        return <AdminModule onHomeClick={goToHome} />;
      case 'about':
        return <AboutDeveloper />;
      case 'reviews':
        return <ReviewPage onBackClick={goToHome} />;
      case 'user-login':
        return <UserLogin onLogin={() => setAppState('user-profile')} onRegister={() => setAppState('user-profile')} onHomeClick={goToHome} />;
      case 'registration':
        return <RegistrationForm onRegistrationComplete={() => setAppState('user-profile')} onHomeClick={goToHome} />;
      case 'user-profile':
        return <UserProfile onStartQuiz={(quizType?: string) => {
          if (quizType === 'detailed-results') {
            setAppState('detailed-results');
          } else if (quizType === 'adaptive') {
            setAppState('adaptive-quiz-selector');
          } else {
            setAppState('quiz');
          }
        }} onLogout={resetQuiz} />;
      case 'adaptive-quiz-selector':
        return <AdaptiveQuizSelector onStartQuiz={(subjectId: string, isAdaptive: boolean, previousPercentage?: number) => {
          // Set the adaptive quiz state and load appropriate questions
          setIsAdaptiveQuiz(isAdaptive);
          setPreviousPercentage(previousPercentage);
          // The Quiz component will handle loading adaptive questions based on these settings
          setAppState('quiz');
        }} />;
      default:
        return <Welcome 
          onUserLogin={() => setAppState('user-login')} 
          onAdminLogin={() => setAppState('admin')} 
        />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserAuthProvider>
          <SettingsProvider>
            <QuizProvider>
              <UserExamProvider>
                <AppContent 
                  appState={appState} 
                  goToAdmin={goToAdmin} 
                  goToAbout={goToAbout} 
                  renderContent={renderContent} 
                />
              </UserExamProvider>
            </QuizProvider>
          </SettingsProvider>
        </UserAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Separate component to access settings context
function AppContent({ appState, goToAdmin, goToAbout, renderContent }: {
  appState: 'welcome' | 'quiz' | 'dashboard' | 'admin' | 'results' | 'profile' | 'registration' | 'reviews' | 'detailed-results' | 'about' | 'user-login' | 'user-profile' | 'proctored-quiz' | 'adaptive-quiz-selector';
  goToAdmin: () => void;
  goToAbout: () => void;
  renderContent: () => React.ReactNode;
}) {
  const { settings } = useSettings();
  const { userProfile } = useUserAuth();

  // Apply theme when component mounts or settings change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  return (
    <div className="app-container min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100">
      {appState !== 'admin' && (
        <ErrorBoundary fallback={
          <div className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 text-center">
            <h2 className="text-lg font-medium text-red-600 dark:text-red-400">
              Header could not be loaded
            </h2>
          </div>
        }>
          <Header 
            appState={appState}
            onAdminClick={goToAdmin}
            onAboutClick={goToAbout}
            userProfile={userProfile || undefined}
          />
        </ErrorBoundary>
      )}
      
      <main className={`flex-grow flex items-center justify-center p-4 ${appState === 'admin' ? 'pt-0' : ''}`}>
        <div className={`container ${appState === 'admin' ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
          <AnimatePresence mode="wait">
            <ErrorBoundary key={appState}>
              {renderContent()}
            </ErrorBoundary>
          </AnimatePresence>
        </div>
      </main>

      {appState !== 'admin' && (
        <ErrorBoundary fallback={
          <div className="bg-white dark:bg-gray-800 py-2 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Quiz App
            </span>
          </div>
        }>
          <Footer onAboutClick={goToAbout} />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;