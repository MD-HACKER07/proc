import { Review } from '../types';

// Local storage fallback functions
const getReviewsFromLocalStorage = (): Review[] => {
  try {
    const reviews = JSON.parse(localStorage.getItem('quiz-reviews') || '[]');
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews from localStorage:', error);
    return [];
  }
};

const saveReviewsToLocalStorage = (reviews: Review[]): void => {
  try {
    localStorage.setItem('quiz-reviews', JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews to localStorage:', error);
  }
};

// Get all reviews
export const getReviews = async (): Promise<Review[]> => {
  try {
    // Firebase integration would go here
    // For now, use localStorage as fallback
    return getReviewsFromLocalStorage();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return getReviewsFromLocalStorage();
  }
};

// Add a new review
export const addReview = async (review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  try {
    // Firebase integration would go here
    // For now, use localStorage as fallback
    const reviews = getReviewsFromLocalStorage();
    const newReview: Review = {
      ...review,
      id: crypto.randomUUID(),
      date: new Date(),
      likes: 0
    };
    
    reviews.push(newReview);
    saveReviewsToLocalStorage(reviews);
    return newReview;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Delete a review by ID
export const deleteReview = async (id: string): Promise<void> => {
  try {
    // Firebase integration would go here
    // For now, use localStorage as fallback
    const reviews = getReviewsFromLocalStorage();
    const updatedReviews = reviews.filter((review: Review) => review.id !== id);
    saveReviewsToLocalStorage(updatedReviews);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Like a review
export const likeReview = async (id: string): Promise<Review> => {
  try {
    // Firebase integration would go here
    // For now, use localStorage as fallback
    const reviews = getReviewsFromLocalStorage();
    const reviewIndex = reviews.findIndex((review: Review) => review.id === id);
    
    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }
    
    reviews[reviewIndex].likes += 1;
    saveReviewsToLocalStorage(reviews);
    return reviews[reviewIndex];
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
}; 