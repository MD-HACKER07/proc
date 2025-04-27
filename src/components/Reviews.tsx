import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, UserCircle } from 'lucide-react';
import { getReviews, likeReview } from '../services/reviewService';
import { Review } from '../types';
import ReviewForm from './ReviewForm';

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const loadedReviews = await getReviews();
      // Sort by date descending
      const sortedReviews = loadedReviews.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setReviews(sortedReviews);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const updatedReview = await likeReview(id);
      setReviews(reviews.map(review => 
        review.id === id ? updatedReview : review
      ));
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleNewReview = () => {
    setShowForm(true);
  };

  const handleReviewAdded = async () => {
    setShowForm(false);
    await loadReviews();
  };

  // Format date to be more readable
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Reviews</h2>
        <button
          onClick={handleNewReview}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {showForm ? (
        <ReviewForm onSuccess={handleReviewAdded} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No reviews yet. Be the first to share your experience!</p>
              <button
                onClick={handleNewReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{review.username}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 ml-11">
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    
                    <button 
                      onClick={() => handleLike(review.id)}
                      className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{review.likes} {review.likes === 1 ? 'like' : 'likes'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews; 