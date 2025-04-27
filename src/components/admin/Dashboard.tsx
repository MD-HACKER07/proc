import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuestionManager from './QuestionManager';
import SubjectManager from './SubjectManager';
import ResultsViewer from './ResultsViewer';
import ReviewsManager from './ReviewsManager';
import { 
  Clipboard, LogOut, Users, Book, BarChart2, 
  FileQuestion, GraduationCap, Award, ActivitySquare, MessageSquare,
  TrendingUp, Clock, PieChart, Target, Calendar, Star
} from 'lucide-react';
import { getQuestions, getSubjects } from '../../services/quizService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'subjects' | 'results' | 'reviews' | 'analytics'>('questions');
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
        const [questions, subjects] = await Promise.all([
          getQuestions(),
          getSubjects()
        ]);

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
          single: 0,
          multiple: 0,
          'true-false': 0
        };

        questions.forEach((q: any) => {
          if (typeDistribution.hasOwnProperty(q.type)) {
            typeDistribution[q.type as keyof typeof typeDistribution] += 1;
          }
        });

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
          reviewsByRating,
          recentQuizzes: sortedResults,
          subjectPerformance,
          weeklyActivity,
          questionTypeDistribution: typeDistribution,
          mostActiveUsers
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
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
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <FileQuestion className="h-4 w-4 mr-2" />
                Manage Questions
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                  activeTab === 'subjects'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Book className="h-4 w-4 mr-2" />
                Manage Subjects
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                View Results
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Manage Reviews
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 text-sm font-medium flex items-center border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'questions' && <QuestionManager />}
          {activeTab === 'subjects' && <SubjectManager />}
          {activeTab === 'results' && <ResultsViewer />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance Analytics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                          Weekly Quiz Activity
                        </h3>
                      </div>
                      <div className="h-64">
                        {loading ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="animate-pulse">Loading activity data...</div>
                          </div>
                        ) : (
                          <div className="h-full flex items-end space-x-2">
                            {Object.entries(dashboardStats.weeklyActivity).map(([date, count], index) => {
                              const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                              const maxCount = Math.max(...Object.values(dashboardStats.weeklyActivity));
                              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                              return (
                                <div key={date} className="flex flex-col items-center flex-1">
                                  <div 
                                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-500"
                                    style={{ height: `${height}%` }}
                                  ></div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{dayOfWeek}</div>
                                  <div className="text-xs font-medium text-gray-900 dark:text-white">{count}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject Performance */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          <Target className="h-5 w-5 mr-2 text-purple-500" />
                          Subject Performance
                        </h3>
                      </div>
                      <div className="h-64 overflow-y-auto">
                        {loading ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="animate-pulse">Loading subject data...</div>
                          </div>
                        ) : Object.keys(dashboardStats.subjectPerformance).length > 0 ? (
                          <ul className="space-y-4">
                            {Object.entries(dashboardStats.subjectPerformance).map(([subject, data]) => (
                              <li key={subject} className="flex flex-col">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{subject}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{data.avgScore}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      data.avgScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${data.avgScore}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.attempts} attempts</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">No subject data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Analytics Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reviews Analytics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reviews Rating Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-500" />
                          Rating Distribution
                        </h3>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.averageRating}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ 5</span>
                        </div>
                      </div>
                      <div className="h-64">
                        {loading ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="animate-pulse">Loading ratings data...</div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(dashboardStats.reviewsByRating || {}).reverse().map(([rating, count]) => {
                              const totalReviews = dashboardStats.totalReviews || 1; // Avoid division by zero
                              const percentage = Math.round((count as number / totalReviews) * 100) || 0;
                              return (
                                <div key={rating} className="flex items-center">
                                  <div className="flex items-center w-20">
                                    <span className="text-sm font-medium mr-1">{rating}</span>
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  </div>
                                  <div className="w-full ml-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                      <div
                                        className="bg-yellow-500 h-2.5 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="ml-2 min-w-[50px] text-right">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{count}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({percentage}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reviews Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-pink-500" />
                          Reviews Summary
                        </h3>
                      </div>
                      <div className="h-64 flex flex-col">
                        {loading ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="animate-pulse">Loading review data...</div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Reviews</h4>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalReviews}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Rating</h4>
                                <div className="flex items-center justify-center">
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.averageRating}</p>
                                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-1" />
                                </div>
                              </div>
                            </div>

                            {dashboardStats.totalReviews > 0 ? (
                              <div className="flex-1 flex flex-col justify-center items-center">
                                <div className="text-center">
                                  <div className="flex justify-center mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-8 w-8 ${
                                          star <= Math.round(parseFloat(dashboardStats.averageRating))
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {parseFloat(dashboardStats.averageRating) >= 4.5
                                      ? 'Excellent feedback from users!'
                                      : parseFloat(dashboardStats.averageRating) >= 4
                                      ? 'Very good feedback from users!'
                                      : parseFloat(dashboardStats.averageRating) >= 3
                                      ? 'Good feedback from users'
                                      : 'Users think we can improve'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex justify-center items-center">
                                <p className="text-gray-500 dark:text-gray-400">No reviews available</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Question Type Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-6">
                    <PieChart className="h-5 w-5 mr-2 text-indigo-500" />
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Question Types</h3>
                  </div>
                  {loading ? (
                    <div className="animate-pulse">Loading question type data...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Single Choice</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dashboardStats.questionTypeDistribution.single}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">Multiple Choice</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dashboardStats.questionTypeDistribution.multiple}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">True/False</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{dashboardStats.questionTypeDistribution["true-false"]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Most Active Users */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-6">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Most Active Users</h3>
                  </div>
                  {loading ? (
                    <div className="animate-pulse">Loading user data...</div>
                  ) : dashboardStats.mostActiveUsers.length > 0 ? (
                    <ul className="space-y-3">
                      {dashboardStats.mostActiveUsers.map((user, index) => (
                        <li key={user.username} className="flex items-center">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            index === 1 ? 'bg-gray-100 text-gray-800' : 
                            index === 2 ? 'bg-orange-100 text-orange-800' : 
                            'bg-blue-100 text-blue-800'
                          } dark:bg-gray-700 mr-3 text-xs font-bold`}>
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                            {user.username}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.quizCount} {user.quizCount === 1 ? 'quiz' : 'quizzes'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No user activity data available</p>
                  )}
                </div>

                {/* Recent Quizzes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-6">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Recent Quizzes</h3>
                  </div>
                  {loading ? (
                    <div className="animate-pulse">Loading recent quizzes...</div>
                  ) : dashboardStats.recentQuizzes.length > 0 ? (
                    <ul className="space-y-3">
                      {dashboardStats.recentQuizzes.map((quiz: any, index) => (
                        <li key={index} className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{quiz.username}</span>
                            <span className={`${
                              quiz.percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                            } font-medium`}>
                              {quiz.percentage}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(quiz.date).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No recent quiz data available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 