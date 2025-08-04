import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Settings as SettingsIcon, ArrowRight, 
  Sparkles, Info, BookOpen, Building, Award
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import SettingsModal from './SettingsModal';
import NetworkSpeed from './NetworkSpeed';

interface WelcomeProps {
  onUserLogin: () => void;
  onAdminLogin: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onUserLogin, onAdminLogin }) => {
  const { settings } = useSettings();
  const { userProfile } = useUserAuth();
  const [username, setUsername] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load username from localStorage if available
  useEffect(() => {
    if (userProfile?.displayName) {
      setUsername(userProfile.displayName);
      setIsReady(true);
    } else {
      const savedUsername = localStorage.getItem('quizUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setIsReady(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('quizUsername', username);
      setIsReady(true);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BrainCircuit className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Exam Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onUserLogin}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Student Login
              </button>
              <button
                onClick={onAdminLogin}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Admin Login
              </button>
              <button
                onClick={() => {}}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-24 right-4 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </button>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      {/* Network Speed Monitor */}
      <NetworkSpeed />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={settings.animationsEnabled ? containerVariants : {}}
        className="quiz-card max-w-5xl mx-auto rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
      >
        {/* Hero Header Section */}
        <motion.div 
          variants={settings.animationsEnabled ? itemVariants : {}}
          className="relative bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 text-white p-8 md:p-12 rounded-b-[40px] shadow-md"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {settings.animationsEnabled && Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  scale: 0.1 + Math.random() * 0.3
                }}
                animate={{
                  x: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%'
                  ],
                  y: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%'
                  ]
                }}
                transition={{
                  duration: 10 + Math.random() * 30,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{
                  width: 20 + Math.random() * 50,
                  height: 20 + Math.random() * 50
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center md:text-left md:max-w-3xl">
            <motion.div
              initial={settings.animationsEnabled ? { y: -20, opacity: 0 } : {}}
              animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight flex flex-wrap items-center justify-center md:justify-start">
                Welcome to 
                <motion.span 
                  className="ml-2 inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200"
                  initial={settings.animationsEnabled ? { scale: 0.8 } : {}}
                  animate={settings.animationsEnabled ? { scale: 1 } : {}}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 15,
                    delay: 0.5
                  }}
                >
                  Sanjivani Proctor Exam Portal
                  <Sparkles className="h-6 w-6 ml-2 text-yellow-300" />
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl"
              initial={settings.animationsEnabled ? { y: 20, opacity: 0 } : {}}
              animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Challenge yourself with our interactive quizzes. Expand your knowledge, track your progress, and compete with others.
            </motion.p>
          </div>
        </motion.div>

        <div className="p-8 text-center">
          {!isReady ? (
            <motion.form 
              variants={settings.animationsEnabled ? itemVariants : {}} 
              onSubmit={handleSubmit}
              className="mb-8 max-w-md mx-auto"
            >
              <div className="mb-6">
                <label 
                  htmlFor="username" 
                  className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-3"
                >
                  Enter your name to get started
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-input text-lg py-3 px-4 w-full border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <motion.button 
                type="submit"
                className="w-full py-3 px-6 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
                whileHover={settings.animationsEnabled ? { scale: 1.03 } : {}}
                whileTap={settings.animationsEnabled ? { scale: 0.98 } : {}}
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </motion.button>
            </motion.form>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={settings.animationsEnabled ? { y: -20, opacity: 0 } : {}}
              animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userProfile?.displayName || username}</span>!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Head over to your dashboard to view available quizzes and track your progress.
              </p>
              <motion.button
                onClick={onUserLogin}
                className="px-8 py-3 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                whileHover={settings.animationsEnabled ? { scale: 1.05 } : {}}
                whileTap={settings.animationsEnabled ? { scale: 0.98 } : {}}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </motion.button>
            </motion.div>
          )}

          {/* About Sanjivani University */}
          <motion.div 
            className="mt-16 mb-16"
            initial={settings.animationsEnabled ? { opacity: 0, y: 20 } : {}}
            animate={settings.animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <motion.div 
                className="inline-flex items-center justify-center mb-4"
                whileHover={settings.animationsEnabled ? { rotate: 5 } : {}}
              >
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-full">
                  <div className="bg-white dark:bg-gray-900 rounded-full p-2">
                    <Info className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
                About Sanjivani University
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Card 1 */}
              <motion.div 
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-7 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                whileHover={settings.animationsEnabled ? { y: -10, scale: 1.02 } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Glowing corner element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10 -translate-y-16 translate-x-16 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="inline-flex mb-5"
                    whileHover={settings.animationsEnabled ? { scale: 1.1, rotate: 10 } : {}}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                      <BookOpen className="text-white h-7 w-7" />
                    </div>
                  </motion.div>
                  
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    World-Class Education
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    Sanjivani Rural Education Society’s Sanjivani University is a premier institution located in Ahmednagar, Maharashtra. Established with a vision to impart world-class education, the University offers multidisciplinary programs in engineering, pharmacy, management, and liberal studies.
                  </p>
                </div>
              </motion.div>
              
              {/* Card 2 */}
              <motion.div 
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-7 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                whileHover={settings.animationsEnabled ? { y: -10, scale: 1.02 } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Glowing corner element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full filter blur-3xl opacity-10 -translate-y-16 translate-x-16 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="inline-flex mb-5"
                    whileHover={settings.animationsEnabled ? { scale: 1.1, rotate: -10 } : {}}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-2xl shadow-lg">
                      <Building className="text-white h-7 w-7" />
                    </div>
                  </motion.div>
                  
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    State-of-the-Art Infrastructure
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    With state-of-the-art infrastructure, experiential learning pedagogy, and strong industry collaborations, Sanjivani nurtures students to become globally competent professionals and socially responsible citizens.
                  </p>
                </div>
              </motion.div>
              
              {/* Card 3 */}
              <motion.div 
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-7 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                whileHover={settings.animationsEnabled ? { y: -10, scale: 1.02 } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Glowing corner element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-10 -translate-y-16 translate-x-16 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="relative z-10">
                  <motion.div 
                    className="inline-flex mb-5"
                    whileHover={settings.animationsEnabled ? { scale: 1.1, rotate: 10 } : {}}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                      <Award className="text-white h-7 w-7" />
                    </div>
                  </motion.div>
                  
                  <h4 className="font-bold text-xl text-gray-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Innovation & Excellence
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    The University’s vibrant campus life, research culture, and emphasis on innovation consistently place it among India’s leading emerging universities.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Footer */}
          <motion.div 
            className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400"
            initial={settings.animationsEnabled ? { opacity: 0 } : {}}
            animate={settings.animationsEnabled ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p> Sanjivani Proctor Exam Portal | All Rights Reserved</p>
            <p className="mt-1">Designed with ♥ for lifelong learners</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;