import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Star,
  GraduationCap,
  Trophy,
  Clock,
  Shield,
  Crown,
  Zap,
  Target,
  CheckCircle,
  Users,
  Brain,
} from 'lucide-react';

interface WelcomeProps {
  onUserLogin: () => void;
  onAdminLogin: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onUserLogin, onAdminLogin }) => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    'Believe in yourself and shine! ✨',
    'Every expert was once a beginner 🌟',
    'Your potential is limitless! 💫',
    'Success starts with a single step 🚀',
    'Dream big, work hard! 💪',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const features = [
    { icon: Brain, title: 'Smart Learning', desc: 'AI-powered exam system designed for success', color: 'from-pink-500 to-rose-500' },
    { icon: Shield, title: 'Secure Exams', desc: 'Proctored environment with anti-cheat protection', color: 'from-purple-500 to-violet-500' },
    { icon: Trophy, title: 'Track Progress', desc: 'Detailed analytics and performance insights', color: 'from-amber-500 to-orange-500' },
  ];

  const stats = [
    { value: '10K+', label: 'Students', icon: Users },
    { value: '500+', label: 'Exams', icon: BookOpen },
    { value: '98%', label: 'Success Rate', icon: Target },
    { value: '24/7', label: 'Support', icon: Clock },
  ];

  const steps = [
    { title: 'Sign Up', icon: Users },
    { title: 'Choose Exam', icon: Target },
    { title: 'Take Test', icon: BookOpen },
    { title: 'Get Results', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ y: '100vh', x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.5, 0.5, 0] }}
            transition={{ duration: 15 + Math.random() * 10, delay: i * 1.5, repeat: Infinity, ease: 'linear' }}
          >
            {i % 2 === 0 ? (
              <Star className="w-4 h-4 text-yellow-400/30 fill-yellow-400/30" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-400/30" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-yellow-800" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
              SadiyaIgnite
            </span>
          </div>

          <button
            onClick={onAdminLogin}
            className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/20 hover:scale-105 transition-all"
          >
            Admin Portal
          </button>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative mb-8"
          >
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Award className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center"
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-center mb-3"
          >
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
              SadiyaIgnite
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-purple-200/80 text-center mb-4"
          >
            Your Gateway to Academic Excellence
          </motion.p>

          {/* Animated Quote */}
          <div className="h-10 mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuote}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-lg text-pink-300/90 text-center font-medium"
              >
                {quotes[currentQuote]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <button
              onClick={onUserLogin}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white font-bold text-lg shadow-xl shadow-purple-500/30 flex items-center gap-3 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 transition-all"
            >
              <GraduationCap className="w-6 h-6" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onUserLogin}
              className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-purple-400/30 text-white font-bold text-lg flex items-center gap-3 hover:bg-white/20 hover:scale-105 transition-all"
            >
              <BookOpen className="w-6 h-6" />
              Explore Exams
            </button>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full mb-12"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 hover:-translate-y-2 transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-purple-200/70 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-12"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:scale-105 transition-transform"
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-purple-200/60 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-3xl w-full mb-8"
          >
            <h2 className="text-xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              {steps.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center hover:scale-110 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/30">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-medium text-sm">{item.title}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="w-5 h-5 text-purple-400/50 hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center border-t border-white/10">
          <p className="text-purple-300/60 text-sm">© 2024 SadiyaIgnite. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
