import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuestionManager from './QuestionManager';
import SubjectManager from './SubjectManager';
import ResultsViewer from './ResultsViewer';
import ReviewsManager from './ReviewsManager';
import ResponseViewer from './ResponseViewer';
import ExamStart from './ExamStart';
import ExamMonitoring from './ExamMonitoring';
import ExamConfigManager from './ExamConfigManager';
import AdaptiveQuizManager from './AdaptiveQuizManager';

import { 
  LogOut, Users, Book, BarChart2, 
  FileQuestion, GraduationCap, Award, ActivitySquare, MessageSquare,
  Target, Star, Plus, Play
} from 'lucide-react';
import { getQuestions, getSubjects } from '../../services/quizService';

interface Tab {
  id: 'questions' | 'subjects' | 'results' | 'responses' | 'reviews' | 'analytics' | 'quiz-creator' | 'exam-start' | 'monitor' | 'exam-config' | 'adaptive-quiz';
  label: string;
  icon: React.ElementType;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab['id']>('questions');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    averageScore: 0,
    quizzesTaken: 0,
    totalQuestions: 0,
    totalSubjects: 0,
    totalReviews: 0,
    averageRating: '0.0',
    reviewsByRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentQuizzes: [] as any[],
    subjectPerformance: {} as Record<string, { attempts: number, avgScore: number }>,
    weeklyActivity: {} as Record<string, number>,
    questionTypeDistribution: {
      single: 0,
      multiple: 0,
      'true-false': 0
    },
    mostActiveUsers: [] as { username: string, quizCount: number }[],
    totalQuizzes: 0,
    activeQuizzes: 0,
    quizCompletionRate: 0,
    topPerformers: [] as { username: string, score: number }[],
    quizStats: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      try {
        // Load quiz results from localStorage
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const uniqueUsers = new Set(results.map((result: any) => result.username)).size;
        
        // Calculate average score
        const totalScore = results.reduce((sum: number, result: any) => sum + result.percentage, 0);
        const avgScore = results.length ? Math.round(totalScore / results.length) : 0;
        
        // Get reviews count and data
        const reviews = JSON.parse(localStorage.getItem('quiz-reviews') || '[]');
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
        const avgRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : '0.0';
        
        // Get reviews distribution by rating
        const reviewsByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review: any) => {
          if (reviewsByRating.hasOwnProperty(review.rating)) {
            reviewsByRating[review.rating as keyof typeof reviewsByRating] += 1;
          }
        });
        
        // Get counts from the database
        const questions = await getQuestions();
        const subjects = await getSubjects();
        
        // Load admin-created quizzes
        const adminQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const totalQuizzes = adminQuizzes.length;
        const activeQuizzes = adminQuizzes.filter((q: any) => q.isActive !== false).length;

        // Get recent quizzes (last 5)
        const sortedResults = [...results].sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);

        // Calculate subject performance
        const subjectPerf: Record<string, { attempts: number, avgScore: number, totalScore: number }> = {};
        results.forEach((result: any) => {
          if (result.subject) {
            if (!subjectPerf[result.subject]) {
              subjectPerf[result.subject] = { attempts: 0, avgScore: 0, totalScore: 0 };
            }
            subjectPerf[result.subject].attempts += 1;
            subjectPerf[result.subject].totalScore += result.percentage;
          }
        });

        // Calculate average score per subject
        const subjectPerformance: Record<string, { attempts: number, avgScore: number }> = {};
        Object.keys(subjectPerf).forEach(subject => {
          subjectPerformance[subject] = {
            attempts: subjectPerf[subject].attempts,
            avgScore: Math.round(subjectPerf[subject].totalScore / subjectPerf[subject].attempts)
          };
        });

        // Calculate weekly activity (last 7 days)
        const weeklyActivity: Record<string, number> = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          weeklyActivity[dateStr] = 0;
        }

        results.forEach((result: any) => {
          const dateStr = new Date(result.date).toISOString().split('T')[0];
          if (weeklyActivity[dateStr] !== undefined) {
            weeklyActivity[dateStr] += 1;
          }
        });

        // Calculate question type distribution
        const typeDistribution = {
          single: questions.filter(q => q.type === 'single').length,
          multiple: questions.filter(q => q.type === 'multiple').length,
          'true-false': questions.filter(q => q.type === 'true-false').length
        };

        // Calculate most active users
        const userActivity: Record<string, number> = {};
        results.forEach((result: any) => {
          if (!userActivity[result.username]) {
            userActivity[result.username] = 0;
          }
          userActivity[result.username] += 1;
        });

        const mostActiveUsers = Object.entries(userActivity)
          .map(([username, quizCount]) => ({ username, quizCount }))
          .sort((a, b) => b.quizCount - a.quizCount)
          .slice(0, 5);
        
        setDashboardStats({
          totalUsers: uniqueUsers,
          averageScore: avgScore,
          quizzesTaken: results.length,
          totalQuestions: questions.length,
          totalSubjects: subjects.length,
          totalReviews: reviews.length,
          averageRating: avgRating,
          reviewsByRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentQuizzes: sortedResults,
          subjectPerformance,
          weeklyActivity,
          questionTypeDistribution: typeDistribution,
          mostActiveUsers,
          totalQuizzes,
          activeQuizzes,
          quizCompletionRate: results.length > 0 ? Math.round((results.filter((r: any) => r.percentage >= 70).length / results.length) * 100) : 0,
          topPerformers: results.slice(0, 5).map((r: any) => ({ username: r.username, score: r.percentage })),
          quizStats: adminQuizzes
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      // Clear admin session from localStorage
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminSession');
      
      // Use Firebase logout for regular users
      await logout();
      
      // Navigate back to welcome page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tabs: Tab[] = [
    { id: 'questions', label: 'Questions', icon: FileQuestion },
    { id: 'subjects', label: 'Subjects', icon: Book },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'responses', label: 'Responses', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'quiz-creator', label: 'Quiz Creator', icon: Plus },
    { id: 'exam-config', label: 'Multi-Section Exams', icon: Target },
    { id: 'exam-start', label: 'Start Exam', icon: Play },
    { id: 'monitor', label: 'Exam Monitoring', icon: ActivitySquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Quiz Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `${dashboardStats.averageScore}%`}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <ActivitySquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.quizzesTaken}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <FileQuestion className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalQuestions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <Book className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalSubjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviews</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'questions' && <QuestionManager />}
          {activeTab === 'subjects' && <SubjectManager />}
          {activeTab === 'results' && <ResultsViewer />}
          {activeTab === 'responses' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">User Quiz Responses</h2>
              <ResponseViewer onClose={() => setActiveTab('questions')} />
            </div>
          )}
          {activeTab === 'exam-config' && <ExamConfigManager />}
          {activeTab === 'exam-start' && <ExamStart />}
          {activeTab === 'monitor' && <ExamMonitoring />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Analytics Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">Analytics coming soon...</p>
            </div>
          )}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  <div className="flex items-center">
                    <Book className="h-8 w-8 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardStats.totalQuizzes}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <ActivitySquare className="h-8 w-8 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Quizzes</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardStats.activeQuizzes}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardStats.quizCompletionRate}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalUsers}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center">
      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
        <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `${dashboardStats.averageScore}%`}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
        <ActivitySquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.quizzesTaken}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center">
      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
        <FileQuestion className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalQuestions}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center">
      <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
        <Book className="h-6 w-6 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subjects</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalSubjects}</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center">
      <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
        <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="ml-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviews</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : dashboardStats.totalReviews}</p>
      </div>
    </div>
  </div>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;