import { useState, useEffect } from 'react';
import { Plus, Trash, UploadCloud, Search, AlertCircle, Check, X } from 'lucide-react';
import { Question, Subject, addQuestion, updateQuestion, deleteQuestion, getQuestions, getSubjects, deleteAllQuestions } from '../../services/quizService';
import CsvImportModal from './CsvImportModal';

interface QuestionFormData {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ImportStatus {
  isImporting: boolean;
  success: boolean;
  error: string;
  count: number;
}

const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    subject: '',
    difficulty: 'medium'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isImporting: false,
    success: false,
    error: '',
    count: 0
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [successMessage, setSuccessMessage] = useState('');

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
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load questions or subjects');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSubject]);

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      subject: subjects[0]?.id || '',
      difficulty: 'medium'
    });
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    if (subjects.length > 0) {
      setFormData(prev => ({ ...prev, subject: subjects[0].id || '' }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setFormData({
      id: question.id,
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      subject: question.subject || '',
      difficulty: question.difficulty || 'medium'
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || formData.options.some(opt => !opt) || !formData.correctAnswer || !formData.subject) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.options.includes(formData.correctAnswer)) {
      setError('Correct answer must be one of the options');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && formData.id) {
        await updateQuestion(formData.id, {
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          subject: formData.subject,
          difficulty: formData.difficulty
        });
      } else {
        await addQuestion({
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          subject: formData.subject,
          difficulty: formData.difficulty
        });
      }
      
      // Refresh questions list
      const updatedQuestions = await getQuestions(selectedSubject || undefined);
      setQuestions(updatedQuestions);
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save the question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteQuestion(id);
      // Update questions list
      setQuestions(questions.filter(q => q.id !== id));
      setSuccessMessage('Question deleted successfully');
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete the question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!window.confirm('Are you sure you want to delete ALL questions? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteAllQuestions();
      // Clear the questions list
      setQuestions([]);
      setError('');
      setSuccessMessage('All questions deleted successfully');
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting all questions:', err);
      setError('Failed to delete all questions');
    } finally {
      setLoading(false);
    }
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
  };

  const handleImportComplete = () => {
    // Refresh questions and subjects
    const loadData = async () => {
      setLoading(true);
      try {
        const [questionsData, subjectsData] = await Promise.all([
          getQuestions(selectedSubject || undefined),
          getSubjects()
        ]);
        setQuestions(questionsData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load questions or subjects');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  };

  // Filter questions based on search term and difficulty
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      subjects.find(s => s.id === question.subject)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
        <button 
          onClick={() => setError('')} 
          className="ml-auto text-red-500 hover:text-red-700"
        >
          <X size={16} />
        </button>
      </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
          <button 
            onClick={() => setSuccessMessage('')} 
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Quiz Questions</h2>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-2 py-0.5 rounded">
            {filteredQuestions.length} of {questions.length}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDeleteAllQuestions}
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm text-sm"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete All Questions
          </button>
          <button
            onClick={openImportModal}
            className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm text-sm"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Import Questions
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, options, or subjects..."
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full md:w-64">
            <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Difficulty
            </label>
            <select
              id="difficulty-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
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
      </div>

      {/* Questions list */}
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
      
      {!loading && filteredQuestions.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'No questions matching your search.' : 'No questions found.'}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add a Question
            </button>
            <button
              onClick={openImportModal}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Import Questions
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow rounded-lg p-4">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{question.question}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(question)}
                  className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => question.id && handleDelete(question.id)}
                  className="text-sm px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
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
                {subjects.find(s => s.id === question.subject)?.name || 'Unknown'}
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
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Question' : 'Add New Question'}
            </h2>
            
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options
                  </label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    id="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {formData.options.map((option, index) => (
                      option && (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Easy: For students scoring &lt;50% | Medium: For 50-79% | Hard: For 80%+
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        subjects={subjects}
        selectedSubject={selectedSubject}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default QuestionManager;