import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Clock, Target, BookOpen, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: Question[];
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  passingScore: number;
}

interface QuizCreatorProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ onSave, onCancel }) => {
  const [quiz, setQuiz] = useState<Quiz>({
    id: Date.now().toString(),
    title: '',
    description: '',
    subject: '',
    questions: [],
    timeLimit: 30,
    difficulty: 'medium',
    totalQuestions: 0,
    passingScore: 70,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Date.now().toString(),
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    timeLimit: 60,
  });

  const subjects = [
    'Mathematics',
    'Science',
    'History',
    'English',
    'Geography',
    'Computer Science',
    'General Knowledge',
  ];

  const addQuestion = () => {
    if (currentQuestion.question.trim() && 
        currentQuestion.options.every(option => option.trim()) &&
        currentQuestion.explanation.trim()) {
      
      const newQuestion = { ...currentQuestion, id: Date.now().toString() };
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
        totalQuestions: prev.questions.length + 1,
      }));
      
      setCurrentQuestion({
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        timeLimit: 60,
      });
    }
  };

  const removeQuestion = (id: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
      totalQuestions: prev.questions.length - 1,
    }));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      ),
    }));
  };

  const handleSave = () => {
    if (quiz.title.trim() && quiz.description.trim() && quiz.subject && quiz.questions.length > 0) {
      onSave(quiz);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Create New Quiz</h2>
        
        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quiz title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={quiz.subject}
              onChange={(e) => setQuiz(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={quiz.description}
            onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe this quiz..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={quiz.timeLimit}
              onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              Difficulty
            </label>
            <select
              value={quiz.difficulty}
              onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BookOpen className="inline w-4 h-4 mr-1" />
              Passing Score (%)
            </label>
            <input
              type="number"
              value={quiz.passingScore}
              onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FileQuestion className="w-5 h-5 mr-2" />
            Questions ({quiz.questions.length})
          </h3>

          {quiz.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Question {index + 1}
                </h4>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <textarea
                value={question.question}
                onChange={(e) => {
                  const updatedQuestions = quiz.questions.map(q => 
                    q.id === question.id ? { ...q, question: e.target.value } : q
                  );
                  setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
                rows={2}
                placeholder="Enter question..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === optIndex}
                      onChange={() => {
                        const updatedQuestions = quiz.questions.map(q => 
                          q.id === question.id ? { ...q, correctAnswer: optIndex } : q
                        );
                        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                      }}
                      className="text-blue-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                  </div>
                ))}
              </div>

              <textarea
                value={question.explanation}
                onChange={(e) => {
                  const updatedQuestions = quiz.questions.map(q => 
                    q.id === question.id ? { ...q, explanation: e.target.value } : q
                  );
                  setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                rows={2}
                placeholder="Explanation for correct answer..."
              />
            </motion.div>
          ))}
        </div>

        {/* Add New Question */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Add New Question</h4>
          
          <textarea
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
            rows={2}
            placeholder="Enter question..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={currentQuestion.correctAnswer === index}
                  onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                  className="text-blue-600"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[index] = e.target.value;
                    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <textarea
            value={currentQuestion.explanation}
            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
            rows={2}
            placeholder="Explanation for correct answer..."
          />

          <button
            onClick={addQuestion}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={!quiz.title || !quiz.description || !quiz.subject || quiz.questions.length === 0}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
            <span>Save Quiz</span>
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>

        {(!quiz.title || !quiz.description || !quiz.subject || quiz.questions.length === 0) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please fill in all required fields and add at least one question to save the quiz.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizCreator;
