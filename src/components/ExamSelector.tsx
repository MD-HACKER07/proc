import React, { useState, useEffect } from 'react';
import { Play, Clock, Target, TrendingUp, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import {
  ExamConfiguration,
  getExamConfigurationsBySubject,
  getUserExamSessions
} from '../services/examService';
import { Subject, getSubjects } from '../services/quizService';
import { useUserAuth } from '../context/UserAuthContext';
import MultiSectionQuiz from './MultiSectionQuiz';

const ExamSelector: React.FC = () => {
  const { user } = useUserAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [examConfigs, setExamConfigs] = useState<ExamConfiguration[]>([]);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamConfiguration | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    loadSubjects();
    if (user?.uid) {
      loadUserSessions();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (selectedSubject) {
      loadExamConfigs();
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id || '');
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError('Failed to load subjects');
    }
  };

  const loadExamConfigs = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const configs = await getExamConfigurationsBySubject(selectedSubject);
      setExamConfigs(configs);
    } catch (err) {
      console.error('Error loading exam configurations:', err);
      setError('Failed to load exam configurations');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async () => {
    if (!user?.uid) return;
    
    try {
      const sessions = await getUserExamSessions(user.uid);
      setUserSessions(sessions);
    } catch (err) {
      console.error('Error loading user sessions:', err);
    }
  };

  const handleStartExam = (examConfig: ExamConfiguration) => {
    setSelectedExam(examConfig);
    setShowQuiz(true);
  };

  const handleExamComplete = (_session: any) => {
    setShowQuiz(false);
    setSelectedExam(null);
    loadUserSessions(); // Refresh user sessions
    // You could navigate to results page here
  };

  const handleExamExit = () => {
    setShowQuiz(false);
    setSelectedExam(null);
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const hasUserTakenExam = (examConfigId: string) => {
    return userSessions.some(session => 
      session.examConfigId === examConfigId && session.status === 'completed'
    );
  };

  const getUserExamScore = (examConfigId: string) => {
    const session = userSessions.find(session => 
      session.examConfigId === examConfigId && session.status === 'completed'
    );
    if (session) {
      const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
      return {
        score: session.totalScore,
        maxScore: session.maxScore,
        percentage: Math.round(percentage)
      };
    }
    return null;
  };

  if (showQuiz && selectedExam) {
    return (
      <MultiSectionQuiz
        examConfig={selectedExam}
        onComplete={handleExamComplete}
        onExit={handleExamExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Section Adaptive Exams</h1>
          <p className="text-gray-600">
            Take adaptive exams that adjust difficulty based on your performance in each section.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Subject Selection */}
        <div className="mb-6">
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Configurations */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exams...</p>
          </div>
        )}

        {!loading && selectedSubject && examConfigs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No exams available for this subject.</p>
            <p className="text-sm text-gray-500">Contact your administrator to create exam configurations.</p>
          </div>
        )}

        {!loading && examConfigs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {examConfigs.map((examConfig) => {
              const userScore = getUserExamScore(examConfig.id!);
              const hasTaken = hasUserTakenExam(examConfig.id!);
              
              return (
                <div key={examConfig.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{examConfig.name}</h3>
                      {hasTaken && (
                        <div title="Completed">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* Exam Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2" />
                        <span>{examConfig.totalSections} sections × {examConfig.questionsPerSection} questions</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Total: {examConfig.totalQuestions} questions</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span className={`px-2 py-1 rounded text-xs ${examConfig.adaptiveMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {examConfig.adaptiveMode ? 'Adaptive Difficulty' : 'Fixed Difficulty'}
                        </span>
                      </div>

                      {examConfig.adaptiveMode && (
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          <p><strong>Performance Thresholds:</strong></p>
                          <p>Topper: {examConfig.performanceThresholds.topper}%+ → Hard questions</p>
                          <p>Average: {examConfig.performanceThresholds.average}%+ → Medium questions</p>
                          <p>Below Average: &lt;{examConfig.performanceThresholds.average}% → Easy questions</p>
                        </div>
                      )}
                    </div>

                    {/* User Score (if taken) */}
                    {userScore && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Your Score:</span>
                          <span className="text-sm font-bold text-gray-900">
                            {userScore.score}/{userScore.maxScore} ({userScore.percentage}%)
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              userScore.percentage >= examConfig.performanceThresholds.topper
                                ? 'bg-green-500'
                                : userScore.percentage >= examConfig.performanceThresholds.average
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${userScore.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Section Preview */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Section Structure:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {examConfig.sections.slice(0, 4).map((section) => (
                          <div key={section.sectionNumber} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Section {section.sectionNumber}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getDifficultyColor(section.difficultyLevel)}`}>
                                {getDifficultyIcon(section.difficultyLevel)}
                              </span>
                            </div>
                            <div className="text-gray-500 mt-1">
                              {section.questionsPerSection}Q • {section.timeLimit}min
                            </div>
                          </div>
                        ))}
                        {examConfig.sections.length > 4 && (
                          <div className="text-xs bg-gray-50 p-2 rounded flex items-center justify-center text-gray-500">
                            +{examConfig.sections.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartExam(examConfig)}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                        hasTaken
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {hasTaken ? 'Retake Exam' : 'Start Exam'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        {examConfigs.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How Multi-Section Adaptive Exams Work</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Section-based:</strong> Each exam is divided into multiple sections with a set number of questions per section.</p>
              <p>• <strong>Adaptive Difficulty:</strong> Based on your performance in each section, the next section's difficulty adjusts automatically.</p>
              <p>• <strong>Performance Categories:</strong> Your performance is categorized as Topper, Average, or Below Average based on your score percentage.</p>
              <p>• <strong>Time Limits:</strong> Each section has its own time limit. Complete all questions before time runs out.</p>
              <p>• <strong>Progress Tracking:</strong> See your progress through sections and get immediate feedback after each section.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSelector;
