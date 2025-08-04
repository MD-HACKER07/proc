import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { formatDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Target, BookOpen, Percent, 
  AlertCircle, Search, Lightbulb, Play, Bell 
} from 'lucide-react';
import { getUserQuizResponses } from '../services/responseService';
import SubjectCard from './SubjectCard';
import { useQuiz } from '../context/QuizContext';
import { getSubjects, getQuestions } from '../services/quizService'; 
import { useSettings } from '../context/SettingsContext';
import { useUserExam } from '../context/UserExamContext';

interface UserProfileProps {
  onStartQuiz: (quizType?: string) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onStartQuiz, onLogout }) => {
  const { setSelectedSubject } = useQuiz();
  const { userProfile } = useUserAuth();

  // Auto-logout on back button
  useEffect(() => {
    const handlePopState = () => {
      onLogout();
      window.location.href = '/';
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onLogout]);
  const { activeExam } = useUserExam();
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quizResponses, setQuizResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchQuizResponses = async () => {
      if (userProfile?.uid) {
        try {
          setLoading(true);
          const responses = await getUserQuizResponses(userProfile.uid);
          console.log('UserProfile: Loaded responses:', responses);
          setQuizResponses(responses);
          setLoading(false);
        } catch (error) {
          console.error('UserProfile: Error fetching quiz responses:', error);
          setLoading(false);
        }
      } else {
        console.log('UserProfile: No user ID available');
        setLoading(false);
      }
    };

    fetchQuizResponses();
  }, [userProfile?.uid]);

  const handleQuizSelect = (id: string) => {
    setSelectedQuiz(id);
    setSelectedSubjectId(id);
    setTermsAccepted(false); // Reset terms acceptance when selecting a new quiz
  };

  // Load subjects and quizzes
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subjects from database
        const subjectsData = await getSubjects();
        
        // Get question counts for each subject
        const subjectsWithCounts = await Promise.all(
          subjectsData.map(async (subject: any) => {
            if (!subject.id) return subject;
            
            try {
              const questions = await getQuestions(subject.id);
              return {
                ...subject,
                questionCount: questions.length
              };
            } catch (error) {
              console.error(`Error fetching questions for subject ${subject.id}:`, error);
              return {
                ...subject,
                questionCount: 0
              };
            }
          })
        );
        
        setSubjects(subjectsWithCounts);
        
        // Load admin quizzes from localStorage
        JSON.parse(localStorage.getItem('quizzes') || '[]');
        
      } catch (error) {
        console.error('Error loading data:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter subjects based on search term
  const filteredSubjects = subjects.filter((subject: any) => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please Login First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need to login to access your profile and take quizzes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Active Exam Banner */}
        {activeExam?.active && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 mb-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-6 w-6 mr-3" />
                <div>
                  <h2 className="text-lg font-bold">Exam Started by Admin</h2>
                  <p className="text-green-100">
                    Subject: {subjects.find(s => s.id === activeExam.subjectId)?.name || 'Loading...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubject(activeExam.subjectId);
                  onStartQuiz();
                }}
                className="flex items-center px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Exam
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {(
                  userProfile.fullName?.trim() ||
                  `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim() ||
                  userProfile.displayName ||
                  'User'
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {userProfile.email}
              </p>
            </div>
            
            {/* Profile Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                User Profile
                <svg className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      // TODO: Implement Change Password
                      alert('Change Password feature coming soon');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      // TODO: Implement Virtual ID Card
                      alert('Virtual ID Card feature coming soon');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Virtual ID Card
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProfile.quizzesTaken || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center">
              <Percent className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProfile.averageScore?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProfile.totalScore || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {formatDate(userProfile.createdAt)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quiz History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Quiz History
          </h2>
          <button 
            onClick={() => onStartQuiz('detailed-results')}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            View Detailed Results
          </button>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading quiz results...</p>
            </div>
          ) : quizResponses && quizResponses.length > 0 ? (
            <div className="space-y-3">
              {quizResponses
                .filter(response => response.released === true)
                .map((response, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {response.quizTitle || 'Quiz'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(response.score || 0).toString().padStart(2, '0')}/{(response.totalQuestions || 0).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {response.completedAt ? formatDate(response.completedAt) : 'Unknown date'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {response.timeTaken ? `${Math.floor(response.timeTaken / 60)}m ${response.timeTaken % 60}s` : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              {quizResponses.filter(response => response.released === true).length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No released quiz results yet. Results will appear here after admin approval.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No quiz results found. Take a quiz to see your results here.
            </p>
          )}
        </motion.div>

        {/* Quiz Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Available Quizzes
          </h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <motion.div 
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No quizzes available. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filteredSubjects.map((subject: any, index: number) => (
                  <motion.div
                    key={subject.id}
                    initial={settings.animationsEnabled ? { scale: 0.9, opacity: 0, y: 20 } : {}}
                    animate={settings.animationsEnabled ? { scale: 1, opacity: 1, y: 0 } : {}}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={settings.animationsEnabled ? { 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    } : {}}
                  >
                    <SubjectCard
                      id={subject.id || ''}
                      name={subject.name}
                      description={subject.description}
                      icon={subject.icon}
                      color={subject.color}
                      questionCount={subject.questionCount || 0}
                      isSelected={selectedSubjectId === subject.id}
                      onClick={handleQuizSelect}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {selectedQuiz && (
            <div className="mt-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Terms & Conditions</h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                      <li>• This is a timed quiz - please ensure you have stable internet connection</li>
                      <li>• All questions must be answered - skipping questions will result in incorrect marks</li>
                      <li>• Do not refresh the page or navigate away during the quiz</li>
                      <li>• Your progress will be saved automatically</li>
                      <li>• Results will be displayed immediately after completion</li>
                    </ul>
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">
                          I agree to the terms and conditions
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (termsAccepted && selectedQuiz) {
                      setSelectedSubject(selectedQuiz);
                      onStartQuiz();
                    }
                  }}
                  disabled={!termsAccepted || !selectedQuiz}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Start Quiz
                </button>
                <button
                  onClick={() => {
                    setSelectedQuiz('');
                    setTermsAccepted(false);
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
