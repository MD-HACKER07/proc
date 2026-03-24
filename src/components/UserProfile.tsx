import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { formatDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Clock,
  Target,
  BookOpen,
  Percent,
  AlertCircle,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Eye,
  X,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { getUserQuizResponses } from '../services/responseService';
import ScheduledExamsList from './ScheduledExamsList';
import Certificate from './Certificate';

interface UserProfileProps {
  onStartQuiz: (quizType?: string) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onStartQuiz, onLogout }) => {
  const { userProfile } = useUserAuth();
  const [quizResponses, setQuizResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scheduled-exams'>('dashboard');
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuizResponses = async () => {
      if (userProfile?.uid) {
        try {
          setLoading(true);
          const responses = await getUserQuizResponses(userProfile.uid);
          setQuizResponses(responses);
          setLoading(false);
        } catch (error) {
          console.error('UserProfile: Error fetching quiz responses:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchQuizResponses();
  }, [userProfile?.uid]);

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please Login First</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to login to access your dashboard.</p>
        </motion.div>
      </div>
    );
  }

  const userName =
    userProfile.fullName?.trim() ||
    `${userProfile.firstName ?? ''} ${userProfile.lastName ?? ''}`.trim() ||
    userProfile.displayName ||
    'Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                {userName}
              </h1>
              <p className="text-white/80 text-sm mt-1">{userProfile.email}</p>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
              >
                <User className="w-4 h-4" />
                Profile
                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-10 border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      alert('Coming soon!');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      alert('Coming soon!');
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
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('scheduled-exams')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'scheduled-exams'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Exams
          </motion.button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              >
                <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userProfile.quizzesTaken || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              >
                <Percent className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {userProfile.averageScore?.toFixed(1) || 0}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              >
                <Target className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{userProfile.totalScore || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              >
                <Clock className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{formatDate(userProfile.createdAt)}</p>
              </motion.div>
            </div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Exam Results
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-3">Loading results...</p>
                </div>
              ) : quizResponses && quizResponses.filter((r) => r.released).length > 0 ? (
                <div className="space-y-4">
                  {quizResponses
                    .filter((response) => response.released === true)
                    .map((response, index) => {
                      const score = response.score || response.correctAnswers || 0;
                      const total = response.totalQuestions || 0;
                      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
                      const isPassed = pct >= 50;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`rounded-xl p-4 border ${
                            isPassed
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                                {response.quizTitle || response.subject || 'Quiz'}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {response.completedAt ? formatDate(response.completedAt) : 'Unknown date'}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                  {score} <span className="text-gray-400 text-lg">/ {total}</span>
                                </div>
                                <div className={`text-sm font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                  {pct}% - {isPassed ? 'Passed' : 'Failed'}
                                </div>
                              </div>

                              <div
                                className={`px-4 py-2 rounded-full text-sm font-bold ${
                                  pct >= 80
                                    ? 'bg-amber-100 text-amber-700'
                                    : pct >= 60
                                      ? 'bg-green-100 text-green-700'
                                      : pct >= 50
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {pct >= 90
                                  ? 'A+'
                                  : pct >= 80
                                    ? 'A'
                                    : pct >= 70
                                      ? 'B'
                                      : pct >= 60
                                        ? 'C'
                                        : pct >= 50
                                          ? 'D'
                                          : 'F'}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {isPassed && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedResult(response);
                                    setShowCertificate(true);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-sm"
                                >
                                  <Award className="w-4 h-4" />
                                  Certificate
                                </motion.button>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setReviewResult(response);
                                  setShowQuestionReview(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Review
                              </motion.button>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {response.timeTaken
                                ? `${Math.floor(response.timeTaken / 60)}m ${response.timeTaken % 60}s`
                                : 'N/A'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No results available yet</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                    Results will appear here after admin releases them
                  </p>
                </div>
              )}
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-blue-500 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-200 text-lg mb-2">How to Take an Exam</h3>
                  <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                    <li>Click on "Scheduled Exams" tab</li>
                    <li>Wait for the exam countdown to finish</li>
                    <li>Click "Start Exam" button when available</li>
                    <li>Complete the exam within the time limit</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'scheduled-exams' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Scheduled Exams
            </h2>
            <ScheduledExamsList onStartExam={onStartQuiz} />
          </motion.div>
        )}

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 SadiyaIgnite. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && selectedResult && (
        <Certificate
          studentName={userProfile.fullName || userProfile.displayName || userProfile.firstName || 'Student'}
          subject={selectedResult.quizTitle || selectedResult.subject || 'Quiz'}
          score={selectedResult.score || selectedResult.correctAnswers || 0}
          totalQuestions={selectedResult.totalQuestions || 0}
          percentage={
            selectedResult.percentage ||
            Math.round(((selectedResult.score || 0) / (selectedResult.totalQuestions || 1)) * 100)
          }
          completedAt={selectedResult.completedAt || new Date()}
          onClose={() => {
            setShowCertificate(false);
            setSelectedResult(null);
          }}
        />
      )}

      {/* Question Review Modal */}
      {showQuestionReview && reviewResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQuestionReview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
              <button
                onClick={() => setShowQuestionReview(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">Question Review</h2>
              <p className="text-white/80 mt-1">
                {reviewResult.quizTitle || reviewResult.subject || 'Quiz'} -{' '}
                {formatDate(reviewResult.completedAt)}
              </p>
              <div className="flex gap-4 mt-3">
                <span className="px-3 py-1 bg-green-400/30 rounded-full text-white text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Correct: {reviewResult.responses?.filter((r: any) => r.isCorrect).length || 0}
                </span>
                <span className="px-3 py-1 bg-red-400/30 rounded-full text-white text-sm flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Wrong: {reviewResult.responses?.filter((r: any) => !r.isCorrect).length || 0}
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {reviewResult.responses && reviewResult.responses.length > 0 ? (
                <div className="space-y-4">
                  {reviewResult.responses.map((questionResp: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl p-4 border-2 ${
                        questionResp.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            questionResp.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {questionResp.isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white mb-3">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">Q{index + 1}.</span>{' '}
                            {questionResp.questionText}
                          </p>

                          {questionResp.options && questionResp.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              {questionResp.options.map((option: string, optIndex: number) => {
                                const optionLetter = String.fromCharCode(65 + optIndex);
                                const isSelected =
                                  questionResp.selectedAnswer === option ||
                                  questionResp.selectedAnswer === optionLetter;
                                const isCorrectOption =
                                  questionResp.correctAnswer === option ||
                                  questionResp.correctAnswer === optionLetter;

                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-2 rounded-lg text-sm ${
                                      isCorrectOption
                                        ? 'bg-green-200 dark:bg-green-800/50 border-2 border-green-500'
                                        : isSelected && !questionResp.isCorrect
                                          ? 'bg-red-200 dark:bg-red-800/50 border-2 border-red-500'
                                          : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                                    }`}
                                  >
                                    <span className="font-bold mr-2">{optionLetter}.</span>
                                    {option}
                                    {isCorrectOption && <span className="ml-2">✓</span>}
                                    {isSelected && !questionResp.isCorrect && <span className="ml-2">✗</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Your Answer: </span>
                              <span
                                className={`font-bold ${questionResp.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {questionResp.selectedAnswer || 'Not answered'}
                              </span>
                            </div>
                            {!questionResp.isCorrect && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Correct Answer: </span>
                                <span className="font-bold text-green-600">{questionResp.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">Question details not available for this exam.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setShowQuestionReview(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Close Review
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserProfile;
