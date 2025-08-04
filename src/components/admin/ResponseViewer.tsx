import { useState, useEffect } from 'react';
import { Eye, Download, Filter, Search, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { getAllQuizResponses, deleteQuizResponse, updateQuizResponseReleaseStatus, QuizResponse } from '../../services/responseService';
import { backfillPerformanceCategories } from '../../utils/backfillPerformanceCategories';

interface ResponseViewerProps {
  onClose: () => void;
}

const ResponseViewer = ({ onClose }: ResponseViewerProps) => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<QuizResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<QuizResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [backfillLoading, setBackfillLoading] = useState(false);

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, searchTerm, filterType, dateFilter]);

  const loadResponses = async () => {
    setLoading(true);
    
    try {
      const firestoreResponses = await getAllQuizResponses();
      setResponses(firestoreResponses);
      setFilteredResponses(firestoreResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
      // Fallback to localStorage if Firestore fails
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      setResponses(stored);
      setFilteredResponses(stored);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = [...responses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(response =>
        response.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(response => {
        switch (filterType) {
          case 'high-score':
            return response.percentage >= 80;
          case 'average-score':
            return response.percentage >= 50 && response.percentage < 80;
          case 'low-score':
            return response.percentage < 50;
          case 'topper':
            return response.performanceCategory === 'Topper';
          case 'average':
            return response.performanceCategory === 'Average';
          case 'below-average':
            return response.performanceCategory === 'Below Average';
          case 'long-time':
            return response.timeTaken > 300;
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.completedAt).toISOString().split('T')[0];
        return responseDate.startsWith(dateFilter);
      });
    }

    setFilteredResponses(filtered);
  };

  const exportResponses = () => {
    try {
      const headers = ['Student Name', 'Email', 'Subject', 'Score', 'Total Questions', 'Percentage', 'Performance Category', 'Date', 'Duration (seconds)', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredResponses.map(response => [
          response.userName || 'N/A',
          response.userEmail || 'N/A',
          response.quizTitle || 'N/A',
          response.score !== undefined ? response.score : 'N/A',
          response.totalQuestions || 'N/A',
          response.percentage !== undefined ? response.percentage : 'N/A',
          response.performanceCategory || 'N/A',
          response.completedAt ? formatDate(response.completedAt) : 'Invalid Date',
          response.timeTaken || 'N/A',
          response.released ? 'Released' : 'Pending'
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz_responses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting responses:', error);
      alert('Failed to export responses. Please try again.');
    }
  };

  // Robust date formatter that supports Firestore Timestamps, strings, numbers and native Date objects
  const formatDate = (value: any): string => {
    if (!value) return 'Invalid Date';

    let date: Date;
    // Firestore Timestamp check (duck-typing)
    if (typeof value === 'object' && (value.seconds || value._seconds)) {
      const seconds = value.seconds ?? value._seconds;
      date = new Date(seconds * 1000);
    } else if (value instanceof Date) {
      date = value;
    } else {
      // string or number
      date = new Date(value);
    }

    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const formatDuration = (timeTaken: number | undefined) => {
    if (!timeTaken || timeTaken <= 0) return 'NaNm NaNs';
    const minutes = Math.floor(timeTaken / 60);
    const seconds = Math.floor(timeTaken % 60);
    return `${minutes}m ${seconds}s`;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuizResponse(id);
      loadResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const toggleReleaseStatus = async (response: QuizResponse) => {
    try {
      await updateQuizResponseReleaseStatus(response.id!, !response.released);
      // Update local state
      setResponses(responses.map(r => 
        r.id === response.id ? { ...r, released: !response.released } : r
      ));
      setFilteredResponses(filteredResponses.map(r => 
        r.id === response.id ? { ...r, released: !response.released } : r
      ));
      // If we're viewing this response, update it too
      if (selectedResponse && selectedResponse.id === response.id) {
        setSelectedResponse({ ...selectedResponse, released: !response.released });
      }
      // Refresh data
    } catch (error) {
      console.error('Error updating release status:', error);
    }
  };

  const handleBackfillCategories = async () => {
    try {
      setBackfillLoading(true);
      await backfillPerformanceCategories();
      // Reload responses to show updated categories
      await loadResponses();
      alert('Performance categories have been successfully updated for existing responses!');
    } catch (error) {
      console.error('Error backfilling categories:', error);
      alert('Error updating performance categories. Please try again.');
    } finally {
      setBackfillLoading(false);
    }
  };

  if (selectedResponse) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Response Details
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleReleaseStatus(selectedResponse)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${selectedResponse.released ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {selectedResponse.released ? 'Unrelease Results' : 'Release Results'}
                </button>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student Name
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedResponse.userName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedResponse.quizTitle}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Score
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedResponse.score}/{selectedResponse.totalQuestions} ({selectedResponse.percentage}%)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(selectedResponse.completedAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Email
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedResponse.userEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Percentage
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedResponse.percentage}%
                  </p>
                </div>
              </div>

              {/* Security Status */}
              {selectedResponse.isFlagged && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                      Security Alert
                    </h3>
                  </div>
                  <p className="mt-2 text-red-700 dark:text-red-300">
                    This quiz session has been flagged for suspicious activity.
                  </p>
                </div>
              )}

              {/* Security Events */}
              {selectedResponse.securityEvents && selectedResponse.securityEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Security Events
                  </h3>
                  <div className="space-y-2">
                    {selectedResponse.securityEvents.map((event: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.type.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {event.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Answers
                </h3>
                <div className="space-y-3">
                  {selectedResponse.responses.map((response: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Question {index + 1}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {response.questionText}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-1 ${
                          response.isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {response.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {response.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
                          <p className="text-sm text-gray-900 dark:text-white">{response.selectedAnswer}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Correct:</span>
                          <p className="text-sm text-gray-900 dark:text-white">{response.correctAnswer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quiz Responses
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBackfillCategories}
                disabled={backfillLoading}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update existing responses with performance categories"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {backfillLoading ? 'Updating...' : 'Fix Categories'}
              </button>
              <button
                onClick={exportResponses}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Responses</option>
              <option value="high-score">High Score (&gt;=80%)</option>
              <option value="average-score">Average Score (50-79%)</option>
              <option value="low-score">Low Score (&lt;50%)</option>
              <option value="topper">🏆 Toppers</option>
              <option value="average">📊 Average Performers</option>
              <option value="below-average">📉 Below Average</option>
              <option value="long-time">Long Time Taken (&gt;5min)</option>
              <option value="flagged">Flagged Only</option>
              <option value="completed">Completed Only</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <button
              onClick={loadResponses}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading responses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredResponses.map((response, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{response.userName}</div>
                        <div className="text-sm text-gray-500">{response.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{response.quizTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{response.score}/{response.totalQuestions}</div>
                        <div className="text-sm text-gray-500">{response.percentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          response.performanceCategory === 'Topper' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          response.performanceCategory === 'Average' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                          response.performanceCategory === 'Below Average' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                          {response.performanceCategory === 'Topper' ? '🏆 Topper' :
                           response.performanceCategory === 'Average' ? '📊 Average' :
                           response.performanceCategory === 'Below Average' ? '📉 Below Avg' :
                           'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(response.completedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(response.timeTaken)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${response.released ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                          {response.released ? 'Released' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleReleaseStatus(response)}
                          className={`mr-3 ${response.released ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}`}
                        >
                          {response.released ? 'Unrelease' : 'Release'}
                        </button>
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(response.id!)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseViewer;
