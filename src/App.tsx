import React, { useState, useEffect, ErrorInfo, Component, ReactNode } from 'react';
import { QuizProvider } from './context/QuizContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AnimatePresence } from 'framer-motion';
import { CircleUserRound, Settings, BarChart, AlertTriangle } from 'lucide-react';
import Welcome from './components/Welcome';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';
import AboutDeveloper from './components/AboutDeveloper';
import ReviewPage from './components/ReviewPage';
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

// Admin routes component
const AdminRoutes = () => {
  const { user, loading } = useAuth();
  const [adminView, setAdminView] = useState<'login' | 'dashboard'>('login');

  useEffect(() => {
    if (user) {
      setAdminView('dashboard');
    } else {
      setAdminView('login');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {adminView === 'login' ? <Login /> : <Dashboard />}
    </AnimatePresence>
  );
};

function App() {
  const [appState, setAppState] = useState('welcome'); // welcome, quiz, results, admin, about, reviews
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    // Check URL for paths
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      setAppState('admin');
    } else if (path.includes('/about')) {
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

    // Set loading to false after initial checks
    setIsLoading(false);
  }, []);

  const startQuiz = () => {
    setAppState('quiz');
  };

  const endQuiz = () => {
    setAppState('results');
  };

  const resetQuiz = () => {
    setAppState('welcome');
  };

  const goToAdmin = () => {
    setAppState('admin');
    // Update URL without reload
    window.history.pushState({}, '', '/admin');
  };

  const goToHome = () => {
    setAppState('welcome');
    // Update URL without reload
    window.history.pushState({}, '', '/');
  };

  const goToAbout = () => {
    setAppState('about');
    // Update URL without reload
    window.history.pushState({}, '', '/about');
  };

  const goToReviews = () => {
    setAppState('reviews');
    // Update URL without reload
    window.history.pushState({}, '', '/reviews');
  };

  // Render the appropriate component based on app state
  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <Welcome onStart={startQuiz} onReviewsClick={goToReviews} />;
      case 'quiz':
        return <Quiz onComplete={endQuiz} />;
      case 'results':
        return <Results onRestart={resetQuiz} />;
      case 'admin':
        return <AdminRoutes />;
      case 'about':
        return <AboutDeveloper />;
      case 'reviews':
        return <ReviewPage onBackClick={goToHome} />;
      default:
        return <Welcome onStart={startQuiz} onReviewsClick={goToReviews} />;
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
        <SettingsProvider>
          <QuizProvider>
            <AppContent 
              appState={appState} 
              goToAdmin={goToAdmin} 
              goToAbout={goToAbout} 
              renderContent={renderContent} 
            />
          </QuizProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Separate component to access settings context
function AppContent({ appState, goToAdmin, goToAbout, renderContent }: {
  appState: string;
  goToAdmin: () => void;
  goToAbout: () => void;
  renderContent: () => React.ReactNode;
}) {
  const { settings } = useSettings();

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