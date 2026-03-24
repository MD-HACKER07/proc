import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle, Sparkles, Mail, Bell, Star } from 'lucide-react';

interface ResultsProps {
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ onRestart }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    'Exam submitted successfully!',
    'Great job completing the exam!',
    'Your responses have been recorded.',
    'Results will be available soon.',
    'Thank you for your participation.',
    'Your dedication is commendable!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);
    setTimeout(() => setShowConfetti(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const confettiColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto relative overflow-hidden"
    >
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                initial={{
                  y: -20,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 720 - 360,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
                className="fixed pointer-events-none z-50"
                style={{
                  width: 10 + Math.random() * 10,
                  height: 10 + Math.random() * 10,
                  backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Floating Stars */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '110vh', x: `${Math.random() * 100}%`, opacity: 0 }}
          animate={{ y: '-20vh', opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: 5 + Math.random() * 3,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="fixed pointer-events-none z-10"
        >
          {i % 2 === 0 ? (
            <Star className="text-yellow-400 fill-yellow-400" style={{ width: 16 + Math.random() * 16, height: 16 + Math.random() * 16 }} />
          ) : (
            <Sparkles className="text-blue-400" style={{ width: 16 + Math.random() * 16, height: 16 + Math.random() * 16 }} />
          )}
        </motion.div>
      ))}

      {/* Main Card */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative z-20 border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            >
              <CheckCircle className="w-14 h-14 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Exam Completed!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/90 text-lg"
          >
            Your exam has been submitted successfully.
          </motion.p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Animated Message */}
          <motion.div className="text-center mb-8 min-h-[60px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{messages[currentMessage]}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex items-center gap-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Results Pending</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your results will be available once the administrator releases them. Check your dashboard for updates.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, type: 'spring' }}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 flex items-center gap-4 border border-purple-200 dark:border-purple-800"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Email Notification</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You will receive an email notification when your results are published.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.0, type: 'spring' }}
              className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 flex items-center gap-4 border border-green-200 dark:border-green-800"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">What's Next?</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Visit your profile to view detailed results, download certificates, and track your progress.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Button */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} className="text-center">
            <motion.button
              onClick={onRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg flex items-center justify-center gap-3 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Go to Dashboard
            </motion.button>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              You can also view your exam history and performance analytics in your profile.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 SadiyaIgnite. All rights reserved.</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Results;
