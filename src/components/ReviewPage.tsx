import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Reviews from './Reviews';

interface ReviewPageProps {
  onBackClick: () => void;
}

const ReviewPage: React.FC<ReviewPageProps> = ({ onBackClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6"
    >
      <div className="mb-6 flex items-center">
        <button
          onClick={onBackClick}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experience with the Quiz app and read what others have to say.
        </p>
      </div>

      <Reviews />
    </motion.div>
  );
};

export default ReviewPage; 