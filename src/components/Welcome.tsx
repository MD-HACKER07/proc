import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Timer, Award, BookOpen, ArrowRight, Search, CheckCircle, 
  TrendingUp, BrainCircuit, Lightbulb, Trophy, Star, Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useSettings } from '../context/SettingsContext';
import SubjectCard from './SubjectCard';
import { getSubjects, getQuestions, Subject } from '../services/quizService';
import SettingsModal from './SettingsModal';
import NetworkSpeed from './NetworkSpeed';
import Reviews from './Reviews';

interface WelcomeProps {
  onStart: () => void;
  onReviewsClick: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart, onReviewsClick }) => {
  const { questions, maxScore, setSelectedSubject, loadQuestions } = useQuiz();
  const { settings } = useSettings();
  const [username, setUsername] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      try {
        const subjectsData = await getSubjects();
        
        // Get question counts for each subject
        const subjectsWithCounts = await Promise.all(
          subjectsData.map(async (subject) => {
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
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load quiz subjects');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Retrieve username from localStorage if available
  useEffect(() => {
    const savedUsername = localStorage.getItem('quizUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Show confetti animation after loading completes
  useEffect(() => {
    if (!loading && subjects.length > 0 && settings.animationsEnabled) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, subjects, settings.animationsEnabled]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Save username to localStorage
      localStorage.setItem('quizUsername', username);
      setIsReady(true);
    }
  };

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    setSelectedSubject(id); // Update the selected subject in the quiz context
  };

  const startQuiz = async () => {
    if (selectedSubjectId) {
      try {
        // Load questions for the selected subject
        await loadQuestions(selectedSubjectId);
        onStart(); // Start the quiz
      } catch (error) {
        console.error('Error loading questions:', error);
        setError('Failed to load questions for this subject');
      }
    } else {
      setError('Please select a subject first');
    }
  };

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  // Dashboard stats for visual appeal
  const stats = [
    { value: '1.5K+', label: 'Active Users', icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
    { value: '10K+', label: 'Questions', icon: <BrainCircuit className="h-5 w-5 text-indigo-500" /> },
    { value: '20+', label: 'Subjects', icon: <BookOpen className="h-5 w-5 text-blue-500" /> },
    { value: '98%', label: 'Satisfaction', icon: <Star className="h-5 w-5 text-amber-500" /> }
  ];

  // Confetti animation
  const confettiColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFD600", "#E040FB", "#FF6E40"];
  const confettiCount = 50;
  const confetti = Array.from({ length: confettiCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -20 - Math.random() * 30,
    size: 5 + Math.random() * 10,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && settings.animationsEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ 
                x: `${c.x}%`, 
                y: `${c.y}%`, 
                rotate: c.rotation 
              }}
              animate={{ 
                y: '120%', 
                rotate: c.rotation + 360 
              }}
              transition={{ 
                duration: 3 + Math.random() * 3,
                ease: "easeIn",
                delay: Math.random() * 1 
              }}
              style={{
                position: 'absolute',
                width: c.size,
                height: c.size * 0.4,
                backgroundColor: c.color,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-24 right-4 z-40 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </button>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
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
                  Quiz With MD
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
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center transition-transform hover:transform hover:scale-105"
                  initial={settings.animationsEnabled ? { y: 30, opacity: 0 } : {}}
                  animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={settings.animationsEnabled ? { y: -5 } : {}}
                >
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className="font-bold text-xl">{stat.value}</div>
                  <div className="text-xs opacity-80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="p-8">
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
                  onChange={handleUsernameChange}
                  required
                />
              </div>
              <motion.button 
                type="submit" 
                className="w-full py-3 px-6 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform transition-all hover:scale-[1.02] shadow-md hover:shadow-lg flex justify-center items-center"
                whileHover={settings.animationsEnabled ? { scale: 1.03 } : {}}
                whileTap={settings.animationsEnabled ? { scale: 0.98 } : {}}
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </motion.form>
          ) : (
            <motion.div variants={settings.animationsEnabled ? itemVariants : {}} className="mb-8">
              <div className="mb-6">
                {username && (
                  <motion.div 
                    className="mb-6 text-center"
                    initial={settings.animationsEnabled ? { y: -20, opacity: 0 } : {}}
                    animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                      Hello, <span className="text-indigo-600 dark:text-indigo-400">{username}</span>! 
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">Select a subject to begin your quiz journey</p>
                  </motion.div>
                )}
                
                <motion.div 
                  className="relative mb-6"
                  initial={settings.animationsEnabled ? { y: 20, opacity: 0 } : {}}
                  animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
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
                </motion.div>
                
                {error && (
                  <motion.div 
                    className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center"
                    initial={settings.animationsEnabled ? { opacity: 0 } : {}}
                    animate={settings.animationsEnabled ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </motion.div>
                )}
                
                {loading ? (
                  <div className="flex justify-center my-12">
                    <motion.div 
                      className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"
                      animate={settings.animationsEnabled ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : subjects.length === 0 ? (
                  <motion.div 
                    className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                    initial={settings.animationsEnabled ? { scale: 0.95, opacity: 0 } : {}}
                    animate={settings.animationsEnabled ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No subjects available. Please check back later.</p>
                  </motion.div>
                ) : (
                  <>
                    <motion.h2 
                      className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center"
                      initial={settings.animationsEnabled ? { x: -20, opacity: 0 } : {}}
                      animate={settings.animationsEnabled ? { x: 0, opacity: 1 } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Lightbulb className="h-6 w-6 mr-2 text-amber-500" />
                      Select a Subject
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                      <AnimatePresence>
                        {filteredSubjects.map((subject, index) => (
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
                              scale: 1.05,
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
                              onClick={handleSubjectSelect}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {filteredSubjects.length === 0 && (
                      <motion.div 
                        className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                        initial={settings.animationsEnabled ? { opacity: 0 } : {}}
                        animate={settings.animationsEnabled ? { opacity: 1 } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Search className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No subjects match your search. Try a different term.</p>
                      </motion.div>
                    )}
                  </>
                )}
                
                {selectedSubjectId && (
                  <motion.button 
                    onClick={startQuiz}
                    className="w-full py-4 px-6 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform transition-all hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center mt-8"
                    disabled={loading}
                    initial={settings.animationsEnabled ? { y: 20, opacity: 0 } : {}}
                    animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={settings.animationsEnabled ? { scale: 1.05 } : {}}
                    whileTap={settings.animationsEnabled ? { scale: 0.98 } : {}}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Quiz
                  </motion.button>
                )}
              </div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 p-6 rounded-xl border border-indigo-100 dark:border-gray-700"
                initial={settings.animationsEnabled ? { y: 40, opacity: 0 } : {}}
                animate={settings.animationsEnabled ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
                    <p className="font-semibold text-lg">{subjects.length} Available</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mr-4">
                    <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Limit</p>
                    <p className="font-semibold text-lg">60 Seconds per Question</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
                    <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificate</p>
                    <p className="font-semibold text-lg">Earn on Completion</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Reviews Section */}
          <motion.div 
            className="mt-12"
            initial={settings.animationsEnabled ? { opacity: 0, y: 30 } : {}}
            animate={settings.animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Reviews showTitle={false} />
            <div className="flex justify-center mt-4">
              <motion.button
                onClick={onReviewsClick}
                className="px-6 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View All Reviews & Submit Your Own
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            variants={settings.animationsEnabled ? itemVariants : {}} 
            className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8"
            initial={settings.animationsEnabled ? { opacity: 0, y: 30 } : {}}
            animate={settings.animationsEnabled ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="font-semibold mb-6 text-xl text-center flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                whileHover={settings.animationsEnabled ? { y: -5, scale: 1.02 } : {}}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full h-10 w-10 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-lg">Choose a Subject</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Browse through our diverse collection of subjects and select one that interests you.</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                whileHover={settings.animationsEnabled ? { y: -5, scale: 1.02 } : {}}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-10 w-10 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-lg">Answer Questions</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Test your knowledge with carefully crafted questions. Race against the clock with a 60-second timer.</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                whileHover={settings.animationsEnabled ? { y: -5, scale: 1.02 } : {}}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-10 w-10 flex items-center justify-center mr-3 shadow-md">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-lg">Get Certified</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Score high and receive a personalized certificate to showcase your achievement.</p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Footer */}
          <motion.div 
            className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400"
            initial={settings.animationsEnabled ? { opacity: 0 } : {}}
            animate={settings.animationsEnabled ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p>© {new Date().getFullYear()} Quiz With MD | All Rights Reserved</p>
            <p className="mt-1">Designed with ♥ for lifelong learners</p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Welcome;