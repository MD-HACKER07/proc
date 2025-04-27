import React, { useState, useEffect } from 'react';
import { Question, getQuestions, deleteQuestion, getSubjects, Subject } from '../../services/quizService';
import { Trash2, Edit, Search, X, AlertCircle, CheckCircle } from 'lucide-react';

interface QuestionListProps {
  onEdit?: (question: Question) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ onEdit }) => {
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load questions and subjects
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [questionsData, subjectsData] = await Promise.all([
          getQuestions(selectedSubject || undefined),
          getSubjects()
        ]);
        setQuestions(questionsData);
        setSubjects(subjectsData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load questions or subjects');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSubject]);

  // Handle delete question
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteQuestion(id);
      // Update questions list
      setQuestions(questions.filter(q => q.id !== id));
      setSuccess('Question deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete the question');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question => 
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get subject name
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'No Subject';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
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

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Quiz Questions</h2>
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-2 py-0.5 rounded">
              {filteredQuestions.length} of {questions.length}
            </span>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
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
        </div>
        
        <div className="w-full md:w-64">
          <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Subject
          </label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
      
      {/* Empty state */}
      {!loading && filteredQuestions.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'No questions matching your search.' : 'No questions found.'}
          </p>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4 mt-4">
        {filteredQuestions.map((question) => (
          <div 
            key={question.id} 
            className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{question.question}</h3>
                
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</p>
                  <ul className="mt-1 space-y-1">
                    {question.options.map((option, index) => (
                      <li 
                        key={index} 
                        className={`text-sm pl-2 border-l-2 ${
                          option === question.correctAnswer 
                            ? "border-green-500 text-green-600 dark:text-green-400 font-medium" 
                            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    {getSubjectName(question.subject)}
                  </span>
                  {question.type && (
                    <span className="ml-2 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {question.type}
                    </span>
                  )}
                  {question.points && (
                    <span className="ml-2 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                      {question.points} pts
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex mt-3 sm:mt-0 sm:ml-4 space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(question)}
                    className="flex items-center text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => question.id && handleDelete(question.id)}
                  className="flex items-center text-sm px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionList; 