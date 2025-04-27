import { useState, useEffect } from 'react';
import { Download, Search, ChevronDown, ChevronUp, Users, BarChart2 } from 'lucide-react';

interface QuizResult {
  username: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

interface UserStat {
  username: string;
  tests: number;
  avgScore: number;
  lastActivity: string;
  totalCorrect: number;
  totalIncorrect: number;
}

const ResultsViewer = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'users'>('results');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending',
  });

  useEffect(() => {
    // Load quiz results from localStorage
    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    setResults(storedResults);
    
    // Calculate user statistics
    const userMap = new Map<string, UserStat>();
    
    storedResults.forEach((result: QuizResult) => {
      const username = result.username;
      const existingUser = userMap.get(username);
      
      if (existingUser) {
        existingUser.tests += 1;
        existingUser.avgScore = ((existingUser.avgScore * (existingUser.tests - 1)) + result.percentage) / existingUser.tests;
        existingUser.totalCorrect += result.correctAnswers;
        existingUser.totalIncorrect += result.incorrectAnswers;
        
        // Update last activity if this result is more recent
        const resultDate = new Date(result.date);
        const existingDate = new Date(existingUser.lastActivity);
        if (resultDate > existingDate) {
          existingUser.lastActivity = result.date;
        }
        
        userMap.set(username, existingUser);
      } else {
        userMap.set(username, {
          username,
          tests: 1,
          avgScore: result.percentage,
          lastActivity: result.date,
          totalCorrect: result.correctAnswers,
          totalIncorrect: result.incorrectAnswers
        });
      }
    });
    
    setUsers(Array.from(userMap.values()));
  }, []);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key as keyof QuizResult] < b[sortConfig.key as keyof QuizResult]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof QuizResult] > b[sortConfig.key as keyof QuizResult]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof UserStat];
    const bValue = b[sortConfig.key as keyof UserStat];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredResults = sortedResults.filter(result => 
    result.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = sortedUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCsv = () => {
    if (activeTab === 'results') {
      const headers = ['Username', 'Date', 'Score', 'Max Score', 'Percentage', 'Correct Answers', 'Incorrect Answers'];
      const rows = filteredResults.map(result => [
        result.username,
        new Date(result.date).toLocaleString(),
        result.score.toString(),
        result.maxScore.toString(),
        `${result.percentage}%`,
        result.correctAnswers.toString(),
        result.incorrectAnswers.toString()
      ]);

      const csvContent = 
        `${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Username', 'Tests Taken', 'Average Score', 'Last Activity', 'Total Correct Answers', 'Total Incorrect Answers'];
      const rows = filteredUsers.map(user => [
        user.username,
        user.tests.toString(),
        `${user.avgScore.toFixed(1)}%`,
        new Date(user.lastActivity).toLocaleString(),
        user.totalCorrect.toString(),
        user.totalIncorrect.toString()
      ]);

      const csvContent = 
        `${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_statistics.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Results</h2>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Search by ${activeTab === 'results' ? 'username' : 'user'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'results'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          Individual Results
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Users className="h-4 w-4 mr-2" />
          User Statistics
        </button>
      </div>
      
      <div className="overflow-x-auto">
        {activeTab === 'results' ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center">
                    Username
                    {getSortIcon('username')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('percentage')}
                >
                  <div className="flex items-center">
                    Score
                    {getSortIcon('percentage')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('correctAnswers')}
                >
                  <div className="flex items-center">
                    Correct
                    {getSortIcon('correctAnswers')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('incorrectAnswers')}
                >
                  <div className="flex items-center">
                    Incorrect
                    {getSortIcon('incorrectAnswers')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {result.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(result.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="mr-2">{result.percentage}%</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              result.percentage >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                      {result.correctAnswers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {result.incorrectAnswers}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No results match your search' : 'No quiz results yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center">
                    Username
                    {getSortIcon('username')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('tests')}
                >
                  <div className="flex items-center">
                    Tests Taken
                    {getSortIcon('tests')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('avgScore')}
                >
                  <div className="flex items-center">
                    Avg. Score
                    {getSortIcon('avgScore')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastActivity')}
                >
                  <div className="flex items-center">
                    Last Activity
                    {getSortIcon('lastActivity')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalCorrect')}
                >
                  <div className="flex items-center">
                    Total Correct
                    {getSortIcon('totalCorrect')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user.tests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="mr-2">{user.avgScore.toFixed(1)}%</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              user.avgScore >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${user.avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(user.lastActivity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium mr-2">
                        {user.totalCorrect}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">correct</span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="text-red-600 dark:text-red-400 font-medium mr-2">
                        {user.totalIncorrect}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">incorrect</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No users match your search' : 'No user data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-300">
        {activeTab === 'results' ? (
          filteredResults.length > 0 && (
            <span>Showing {filteredResults.length} of {results.length} results</span>
          )
        ) : (
          filteredUsers.length > 0 && (
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          )
        )}
      </div>
    </div>
  );
};

export default ResultsViewer; 