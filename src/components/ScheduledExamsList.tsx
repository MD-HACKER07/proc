import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Play, AlertCircle, BookOpen, Timer, Users, FileText } from 'lucide-react';
import { getScheduledExamsForUser, ScheduledExam } from '../services/examService';
import { useUserAuth } from '../context/UserAuthContext';
import { formatDate } from '../utils/dateUtils';

interface ScheduledExamsListProps {
  onStartExam: (quizType?: string) => void;
}

const ScheduledExamsList: React.FC<ScheduledExamsListProps> = ({ onStartExam }) => {
  const { userProfile } = useUserAuth();
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadScheduledExams();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [userProfile]);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      loadScheduledExams();
    }, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const loadScheduledExams = async () => {
    try {
      setLoading(true);
      const exams = await getScheduledExamsForUser(userProfile?.uid);
      setScheduledExams(exams);
    } catch (error) {
      console.error('Error loading scheduled exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeStatus = (exam: ScheduledExam) => {
    const now = currentTime;
    const startTime = new Date(exam.startTime);
    const endTime = exam.endTime ? new Date(exam.endTime) : new Date(startTime.getTime() + exam.duration * 60000);

    if (now < startTime) {
      const timeDiff = startTime.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (days > 0) {
        return { text: `${days}d ${hours}h ${minutes}m ${seconds}s`, color: 'text-blue-600', canStart: false, isUpcoming: true };
      } else if (hours > 0) {
        return { text: `${hours}h ${minutes}m ${seconds}s`, color: 'text-purple-600', canStart: false, isUpcoming: true };
      } else if (minutes > 0) {
        return { text: `${minutes}m ${seconds}s`, color: 'text-orange-600', canStart: false, isUpcoming: true };
      } else {
        return { text: `${seconds}s`, color: 'text-red-600 animate-pulse', canStart: false, isUpcoming: true };
      }
    } else if (now >= startTime && now <= endTime) {
      const timeRemaining = Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60));
      return { text: `${timeRemaining} min remaining`, color: 'text-green-600', canStart: true, isUpcoming: false };
    } else {
      return { text: 'Ended', color: 'text-gray-600', canStart: false, isUpcoming: false };
    }
  };

  const handleStartExam = (exam: ScheduledExam) => {
    const timeStatus = getTimeStatus(exam);
    if (timeStatus.canStart) {
      localStorage.setItem(
        'scheduledExam',
        JSON.stringify({
          examId: exam.id,
          examName: exam.examName,
          subjectId: exam.subjectId,
          subjectName: exam.subjectName,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          instructions: exam.instructions,
          shuffleQuestions: exam.shuffleQuestions,
          maxAttempts: exam.maxAttempts,
          passingScore: exam.passingScore,
        })
      );
      onStartExam('scheduled-exam');
    } else {
      alert('Exam has not started yet. Please wait for the scheduled time.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-3">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">No Scheduled Exams</h3>
          <p className="text-gray-600 dark:text-gray-400">Check back later for upcoming exams.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {scheduledExams.map((exam, index) => {
            const timeStatus = getTimeStatus(exam);

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-5 border transition-all ${
                  timeStatus.canStart
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 shadow-lg'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{exam.examName}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{exam.subjectName}</p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      timeStatus.canStart ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {timeStatus.canStart ? 'LIVE' : 'Upcoming'}
                  </span>
                </div>

                {/* Exam Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-bold">{exam.totalQuestions}</span>&nbsp;Questions
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <Timer className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="font-bold">{exam.duration}</span>&nbsp;Min
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    {formatDate(exam.startTime)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Countdown / Action Box */}
                <div
                  className={`p-4 rounded-xl border mb-4 ${
                    timeStatus.canStart
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                      <Clock className={`w-6 h-6 mr-3 ${timeStatus.color}`} />
                      <div>
                        <span className={`text-lg font-bold ${timeStatus.color}`}>
                          {timeStatus.canStart ? 'Exam is Live!' : timeStatus.text}
                        </span>
                        {timeStatus.isUpcoming && <p className="text-sm text-gray-500">Please wait for the exam to start</p>}
                      </div>
                    </div>

                    {timeStatus.canStart ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStartExam(exam)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center font-bold shadow-lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Exam
                      </motion.button>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Not available yet
                      </div>
                    )}
                  </div>
                </div>

                {exam.instructions && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Instructions:</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">{exam.instructions}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {exam.maxAttempts || 1} attempt{(exam.maxAttempts || 1) > 1 ? 's' : ''}
                    </span>
                    {exam.passingScore && (
                      <span className="text-green-600 dark:text-green-400 font-medium">Pass: {exam.passingScore}%</span>
                    )}
                  </div>
                  {exam.shuffleQuestions && <span className="text-blue-600 dark:text-blue-400">Shuffled</span>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ScheduledExamsList;
