import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { Award, BarChart, RotateCcw, Share, Clock, FileText } from 'lucide-react';
import Certificate from './Certificate';

interface ResultsProps {
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ onRestart }) => {
  const { totalScore, maxScore, userAnswers, questions } = useQuiz();
  const percentage = Math.round((totalScore / maxScore) * 100);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Get username from localStorage
  const username = localStorage.getItem('quizUsername') || 'User';
  
  // Calculate statistics
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = userAnswers.length - correctAnswers;
  
  // Determine certification level based on score
  const getCertificationLevel = () => {
    if (percentage >= 90) return "Expert Level";
    if (percentage >= 80) return "Advanced Level";
    if (percentage >= 70) return "Intermediate Level";
    return "Foundation Level";
  };
  
  useEffect(() => {
    // Save results to localStorage
    const previousResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const newResult = {
      date: new Date().toISOString(),
      score: totalScore,
      maxScore,
      percentage,
      correctAnswers,
      incorrectAnswers,
      username
    };
    
    localStorage.setItem('quizResults', JSON.stringify([newResult, ...previousResults]));
  }, [totalScore, maxScore, percentage, correctAnswers, incorrectAnswers, username]);

  if (showCertificate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="mb-4">
          <button 
            onClick={() => setShowCertificate(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            &larr; Back to Results
          </button>
        </div>
        <Certificate 
          username={username}
          score={totalScore}
          maxScore={maxScore}
          certificationLevel={getCertificationLevel()}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="quiz-card"
    >
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mx-auto mb-4"
        >
          {percentage >= 70 ? (
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full inline-block">
              <Award className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full inline-block">
              <BarChart className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {percentage >= 70 ? 'Excellent Work!' : 'Quiz Completed!'}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          {username}, you scored:
        </p>
        
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2"
        >
          {totalScore}/{maxScore}
        </motion.div>
        
        <p className="text-lg text-gray-600 dark:text-gray-300">
          That's {percentage}% correct!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">{correctAnswers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Correct</div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">{incorrectAnswers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Incorrect</div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
          <div className="flex justify-center items-center">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-1" />
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {Math.round(questions.length * 60 / 60)}:00
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Time Spent</div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          onClick={onRestart}
          className="btn-primary flex items-center justify-center"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Take Quiz Again
        </button>
        
        <button 
          onClick={() => setShowCertificate(true)}
          className="btn-secondary flex items-center justify-center"
        >
          <FileText className="h-5 w-5 mr-2" />
          View Certificate
        </button>
        
        <button 
          className="btn-outline flex items-center justify-center"
        >
          <Share className="h-5 w-5 mr-2" />
          Share Your Results
        </button>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {percentage >= 70 
            ? "Great job! You've demonstrated excellent knowledge on this topic." 
            : "There's room for improvement. Consider reviewing the topics and trying again."}
        </p>
        
        {percentage < 70 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm">
            Tip: Take your time reading each question carefully before answering. Focus particularly on the JavaScript and CSS questions where you can improve.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Results;