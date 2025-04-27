import { useState, useEffect, useRef } from 'react';
import { Question, Subject, addQuestion, updateQuestion, deleteQuestion, getQuestions, getSubjects, addSubject, deleteAllQuestions } from '../../services/quizService';
import { importQuestionsFromFile, extractAndCreateSubjects } from '../../services/importService';
import { UploadCloud, AlertCircle, Check, X, Trash, Search } from 'lucide-react';
import { Plus } from 'lucide-react';

interface QuestionFormData {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
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
    subject: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isImporting: false,
    success: false,
    error: '',
    count: 0
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState({
    file: null as File | null,
    subjectId: '',
    createNewSubject: false,
    newSubjectName: '',
    autoDetectSubjects: false
  });
  const [searchTerm, setSearchTerm] = useState('');
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
      subject: subjects[0]?.id || ''
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
      subject: question.subject || ''
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
          subject: formData.subject
        });
      } else {
        await addQuestion({
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          subject: formData.subject
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
    setImportStatus({
      isImporting: false,
      success: false,
      error: '',
      count: 0
    });
    setImportData({
      file: null,
      subjectId: selectedSubject || '',
      createNewSubject: false,
      newSubjectName: '',
      autoDetectSubjects: false
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Accept JSON or CSV files
    if (file.type !== 'application/json' && !file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      setImportStatus({
        ...importStatus,
        error: 'Please select a JSON or CSV file'
      });
      return;
    }
    
    setImportStatus({
      isImporting: false,
      success: false,
      error: '',
      count: 0
    });
    
    setImportData({
      ...importData,
      file
    });
  };

  const handleImportFile = async () => {
    if (!importData.file) {
      setImportStatus({
        ...importStatus,
        error: 'Please select a file to import'
      });
      return;
    }

    // Validate subject selection
    if (!importData.autoDetectSubjects && !importData.subjectId && !importData.createNewSubject) {
      setImportStatus({
        ...importStatus,
        error: 'Please select a subject, create a new one, or enable auto-detect subjects'
      });
      return;
    }

    // Validate new subject name if creating a new subject
    if (importData.createNewSubject && !importData.newSubjectName.trim()) {
      setImportStatus({
        ...importStatus,
        error: 'Please enter a name for the new subject'
      });
      return;
    }

    setImportStatus({
      isImporting: true,
      success: false,
      error: '',
      count: 0
    });
    
    try {
      let targetSubjectId = importData.subjectId;
      
      // Create a new subject if requested
      if (importData.createNewSubject) {
        const newSubject = await addSubject({
          name: importData.newSubjectName,
          description: `Created on ${new Date().toLocaleDateString()}`
        });
        targetSubjectId = newSubject.id || '';
        
        // Update subjects list
        const updatedSubjects = await getSubjects();
        setSubjects(updatedSubjects);
      }
      
      // Auto-detect and create subjects if enabled
      if (importData.autoDetectSubjects) {
        setImportStatus(prev => ({
          ...prev,
          error: '',
          isImporting: true,
          success: false,
          count: 0
        }));
        
        try {
          // Extract and create subjects from the file
          const createdSubjects = await extractAndCreateSubjects(importData.file);
          
          if (createdSubjects.length > 0) {
            // Update subjects list
            const updatedSubjects = await getSubjects();
            setSubjects(updatedSubjects);
            
            setImportStatus(prev => ({
              ...prev,
              error: '',
              isImporting: true,
              success: false,
              count: 0
            }));
          }
        } catch (err: any) {
          console.error('Error auto-detecting subjects:', err);
          // Continue with import even if subject detection fails
        }
      }
      
      // Import the questions with the selected subject
      const count = await importQuestionsFromFile(importData.file, targetSubjectId);
      
      // Refresh subjects and questions
      const [updatedSubjects, updatedQuestions] = await Promise.all([
        getSubjects(),
        getQuestions(selectedSubject || undefined)
      ]);
      
      setSubjects(updatedSubjects);
      setQuestions(updatedQuestions);
      
      // If we created a new subject, select it
      if (importData.createNewSubject && targetSubjectId) {
        setSelectedSubject(targetSubjectId);
      }
      
      setImportStatus({
        isImporting: false,
        success: true,
        error: '',
        count
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error importing questions:', err);
      setImportStatus({
        isImporting: false,
        success: false,
        error: err.message || 'Failed to import questions',
        count: 0
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'application/json') {
      setImportStatus({
        ...importStatus,
        error: 'Please drop a JSON file'
      });
      return;
    }
    
    setImportData({
      ...importData,
      file
    });
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question => 
    question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) ||
    subjects.find(s => s.id === question.subject)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import Questions</h2>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {importStatus.error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {importStatus.error}
              </div>
            )}
            
            {importStatus.success && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Successfully imported {importStatus.count} questions
              </div>
            )}
            
            <div className="space-y-4">
              {!importStatus.success && (
                <>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">
                      {importData.file ? importData.file.name : 'Drag & drop a JSON file or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400">
                      The file will be automatically converted to the correct format
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".json,.csv"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {/* Auto-detect subjects option */}
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                      <input
                        type="checkbox"
                        id="auto-detect"
                        checked={importData.autoDetectSubjects}
                        onChange={(e) => setImportData({...importData, autoDetectSubjects: e.target.checked})}
                      />
                      <label htmlFor="auto-detect" className="text-sm">
                        Auto-detect and create subjects from the file
                      </label>
                    </div>
                    
                    {!importData.autoDetectSubjects && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Subject
                          </label>
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              id="use-existing"
                              checked={!importData.createNewSubject}
                              onChange={() => setImportData({...importData, createNewSubject: false})}
                            />
                            <label htmlFor="use-existing">Use existing subject</label>
                          </div>
                          <select
                            value={importData.subjectId}
                            onChange={(e) => setImportData({...importData, subjectId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={importData.createNewSubject}
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              id="create-new"
                              checked={importData.createNewSubject}
                              onChange={() => setImportData({...importData, createNewSubject: true})}
                            />
                            <label htmlFor="create-new">Create new subject</label>
                          </div>
                          <input
                            type="text"
                            placeholder="New subject name"
                            value={importData.newSubjectName}
                            onChange={(e) => setImportData({...importData, newSubjectName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={!importData.createNewSubject}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {importStatus.success ? 'Close' : 'Cancel'}
              </button>
              {!importStatus.success && (
                <button
                  type="button"
                  onClick={handleImportFile}
                  disabled={importStatus.isImporting || !importData.file}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {importStatus.isImporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      <span>Import Questions</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager; 