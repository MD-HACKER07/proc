import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, Trash2, UserCircle, Plus } from 'lucide-react';
import { getReviews, addReview, likeReview, deleteReview } from '../services/reviewService';
import { Review } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { toast } from './ui/use-toast';
import { useAuth } from '../context/AuthContext';

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const { user } = useAuth();

  // Form state
  const [newReview, setNewReview] = useState({
    username: user?.displayName || 'Anonymous',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await getReviews();
      setReviews(fetchedReviews);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.comment.trim()) {
      toast({
        title: "Review Required",
        description: "Please enter a comment for your review",
        variant: "destructive"
      });
      return;
    }

    try {
      await addReview({
        username: newReview.username,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      
      toast({
        title: "Review Added",
        description: "Your review has been posted successfully",
      });
      
      // Reset form and refresh reviews
      setNewReview({
        username: user?.displayName || 'Anonymous',
        rating: 5,
        comment: '',
      });
      setIsAddingReview(false);
      await loadReviews();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add your review. Please try again.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  const handleLikeReview = async (id: string) => {
    try {
      await likeReview(id);
      // Update the reviews list locally to avoid a full reload
      setReviews(reviews.map(review => 
        review.id === id ? { ...review, likes: review.likes + 1 } : review
      ));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like review",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(id);
      // Remove the deleted review from the state
      setReviews(reviews.filter(review => review.id !== id));
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render star rating
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
    return <div className="flex justify-center p-6">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
        <Button variant="outline" onClick={loadReviews} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <Button 
          onClick={() => setIsAddingReview(!isAddingReview)}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isAddingReview ? 'Cancel' : <>
            <Plus size={16} />
            Add Review
          </>}
        </Button>
      </div>

      <AnimatePresence>
        {isAddingReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Card className="p-4">
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <Input
                    value={newReview.username}
                    onChange={(e) => setNewReview({...newReview, username: e.target.value})}
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={`${
                            star <= newReview.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Your Review</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Write your review here..."
                    className="w-full"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full">
                    Submit Review
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No reviews yet. Be the first to add one!
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle className="text-gray-400" size={20} />
                    <span className="font-medium">{review.username}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(review.date)}
                  </div>
                </div>
                
                <div className="flex mt-2">
                  {renderStars(review.rating)}
                </div>
                
                <p className="mt-3 text-gray-700">{review.comment}</p>
                
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-600"
                    onClick={() => handleLikeReview(review.id)}
                  >
                    <ThumbsUp size={16} />
                    <span>{review.likes}</span>
                  </Button>
                  
                  {user?.isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList; 