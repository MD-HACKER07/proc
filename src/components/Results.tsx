import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface ResultsProps {
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ onRestart }) => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your quiz has been submitted successfully! Your responses have been securely recorded and are now available for review in the results section. If you’d like to re-take the exam, please contact: Md Abu Shalem Alam (+91 79034 35363).
          </p>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onRestart}
          className="btn-primary flex items-center justify-center"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Good bye!
        </button>
      </div>
    </motion.div>
  );
};

export default Results;