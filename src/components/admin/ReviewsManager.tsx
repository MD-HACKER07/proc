import { useState, useEffect } from 'react';
import { getReviews, deleteReview } from '../../services/reviewService';
import { Review } from '../../types';
import { Star, Trash2, Search, X, AlertCircle, CheckCircle, UserCircle, ExternalLink, Filter, ArrowDown, ArrowUp, Download } from 'lucide-react';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Review;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending',
  });
  const [showFilters, setShowFilters] = useState(false);

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
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview(id);
      // Remove the deleted review from the state
      setReviews(reviews.filter(review => review.id !== id));
      setSelectedReviews(selectedReviews.filter(reviewId => reviewId !== id));
      setSuccess('Review deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete the review');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedReviews.length === 0) {
      setError('No reviews selected');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedReviews.length} selected review(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete all selected reviews
      const deletePromises = selectedReviews.map(id => deleteReview(id));
      await Promise.all(deletePromises);
      
      // Update reviews state
      setReviews(reviews.filter(review => !selectedReviews.includes(review.id)));
      setSelectedReviews([]);
      setSuccess(`${selectedReviews.length} review(s) deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting reviews:', err);
      setError('Failed to delete some reviews');
    } finally {
      setLoading(false);
    }
  };

  // Handle selection
  const toggleSelectReview = (id: string) => {
    setSelectedReviews(prev => 
      prev.includes(id) 
        ? prev.filter(reviewId => reviewId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(review => review.id));
    }
  };

  // Handle sorting
  const handleSort = (key: keyof Review) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter reviews safely
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredReviews = sortedReviews.filter(review => {
    // Filter by search term (safely checking for null/undefined values)
    const usernameMatch = review.username ? review.username.toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
    const commentMatch = review.comment ? review.comment.toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
    const matchesSearch = usernameMatch || commentMatch;
    
    // Filter by rating
    const matchesRating = selectedRating === null || review.rating === selectedRating;
    
    return matchesSearch && matchesRating;
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getSortIcon = (key: keyof Review) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const exportReviewsCSV = () => {
    // Define headers for CSV file
    const headers = ['ID', 'Username', 'Rating', 'Date', 'Comment', 'Likes'];
    
    // Format the review data for CSV
    const csvData = filteredReviews.map(review => [
      review.id,
      review.username,
      review.rating,
      new Date(review.date).toISOString(),
      `"${review.comment.replace(/"/g, '""')}"`, // Escape quotes in comments
      review.likes
    ]);
    
    // Combine headers and rows
    const csvContent = 
      `${headers.join(',')}\n${csvData.map(row => row.join(',')).join('\n')}`;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz_reviews_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      {/* Status messages */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
          <button 
            onClick={() => setSuccess(null)} 
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">User Reviews</h2>
          <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-2 py-0.5 rounded">
            {filteredReviews.length} of {reviews.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-expanded={showFilters}
          >
            <Filter className="h-5 w-5" />
          </button>
          
          <button
            onClick={exportReviewsCSV}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={filteredReviews.length === 0}
            title="Export reviews as CSV"
          >
            <Download className="h-5 w-5" />
          </button>
          
          {selectedReviews.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedReviews.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="mb-2 font-medium">Filter Reviews</div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Rating</label>
              <div className="flex space-x-2">
                {[null, 1, 2, 3, 4, 5].map((rating, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedRating(rating)}
                    className={`flex items-center justify-center w-8 h-8 rounded ${
                      selectedRating === rating 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {rating === null ? 'All' : rating}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Sort By</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleSort('date')}
                  className={`px-3 py-1 rounded text-sm ${
                    sortConfig.key === 'date' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'ascending' 
                        ? <ArrowUp className="ml-1 h-3 w-3" /> 
                        : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </button>
                <button 
                  onClick={() => handleSort('rating')}
                  className={`px-3 py-1 rounded text-sm ${
                    sortConfig.key === 'rating' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    Rating
                    {sortConfig.key === 'rating' && (
                      sortConfig.direction === 'ascending' 
                        ? <ArrowUp className="ml-1 h-3 w-3" /> 
                        : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </button>
                <button 
                  onClick={() => handleSort('likes')}
                  className={`px-3 py-1 rounded text-sm ${
                    sortConfig.key === 'likes' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    Likes
                    {sortConfig.key === 'likes' && (
                      sortConfig.direction === 'ascending' 
                        ? <ArrowUp className="ml-1 h-3 w-3" /> 
                        : <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>}
      
      {/* Empty state */}
      {!loading && filteredReviews.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedRating ? 'No reviews matching your filters.' : 'No reviews found.'}
          </p>
          <a 
            href="/reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Reviews Page
          </a>
        </div>
      )}

      {/* Bulk selection header */}
      {filteredReviews.length > 0 && (
        <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
              onChange={toggleSelectAll}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Select All
          </label>
          <span className="mx-2">|</span>
          <button 
            onClick={() => handleSort('date')}
            className="flex items-center mr-4 focus:outline-none"
          >
            Date {getSortIcon('date')}
          </button>
          <button 
            onClick={() => handleSort('rating')}
            className="flex items-center mr-4 focus:outline-none"
          >
            Rating {getSortIcon('rating')}
          </button>
          <button 
            onClick={() => handleSort('likes')}
            className="flex items-center focus:outline-none"
          >
            Likes {getSortIcon('likes')}
          </button>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4 mt-4">
        {filteredReviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedReviews.includes(review.id)}
                    onChange={() => toggleSelectReview(review.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{review.username}</h3>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteReview(review.id)}
                className="flex items-center text-sm px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
            
            <div className="mt-3 pl-11">
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  <span className="mr-1">{review.likes}</span>
                  <span>Likes</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsManager; 