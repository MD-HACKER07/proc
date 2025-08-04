import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserAuth } from '../context/UserAuthContext';
import { useQuiz } from '../context/QuizContext';
import { getUserQuizResponses } from '../services/responseService';
import { getSubjects } from '../services/quizService';
import { Brain, TrendingUp, Target, Award, ChevronRight, BookOpen } from 'lucide-react';

interface AdaptiveQuizSelectorProps {
  onStartQuiz: (subjectId: string, isAdaptive: boolean, previousPercentage?: number) => void;
}

const AdaptiveQuizSelector: React.FC<AdaptiveQuizSelectorProps> = ({ onStartQuiz }) => {
  const { userProfile } = useUserAuth();
  const { setSelectedSubject } = useQuiz();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [userPerformance, setUserPerformance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subjects
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        // Load user's quiz history if logged in
        if (userProfile?.uid) {
          const responses = await getUserQuizResponses(userProfile.uid);
          
          // Group responses by subject and get latest performance
          const performanceMap: Record<string, any> = {};
          responses.forEach(response => {
            const subjectId = response.quizId;
            if (!performanceMap[subjectId] || 
                new Date(response.completedAt) > new Date(performanceMap[subjectId].completedAt)) {
              performanceMap[subjectId] = response;
            }
          });
          
          setUserPerformance(performanceMap);
        }
      } catch (error) {
        console.error('Error loading adaptive quiz data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

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
      case 'easy': return <BookOpen className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'hard': return <Award className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getRecommendedDifficulty = (subjectId: string): 'easy' | 'medium' | 'hard' => {
    const performance = userPerformance[subjectId];
    if (!performance) return 'medium'; // Default for first-time users
    
    if (performance.percentage >= 80) return 'hard';
    if (performance.percentage >= 50) return 'medium';
    return 'easy';
  };

  const handleStartAdaptiveQuiz = (subject: any) => {
    const performance = userPerformance[subject.id];
    const previousPercentage = performance?.percentage;
    
    setSelectedSubject(subject.id);
    onStartQuiz(subject.id, true, previousPercentage);
  };

  const handleStartRegularQuiz = (subject: any) => {
    setSelectedSubject(subject.id);
    onStartQuiz(subject.id, false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          <Brain className="inline-block w-8 h-8 mr-2 text-blue-600" />
          Adaptive Quiz System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our adaptive quiz system automatically adjusts question difficulty based on your performance. 
          Start with any subject and the system will recommend the best difficulty level for you.
        </p>
      </div>

      {userProfile && Object.keys(userPerformance).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(userPerformance).map(([subjectId, performance]) => {
              const subject = subjects.find(s => s.id === subjectId);
              const recommendedDifficulty = getRecommendedDifficulty(subjectId);
              
              return (
                <div key={subjectId} className="bg-white rounded-lg p-3 border">
                  <div className="font-medium text-gray-900">{subject?.name || 'Unknown Subject'}</div>
                  <div className="text-sm text-gray-600">Last Score: {performance.percentage}%</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDifficultyColor(recommendedDifficulty)}`}>
                    {getDifficultyIcon(recommendedDifficulty)}
                    <span className="ml-1 capitalize">Next: {recommendedDifficulty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const performance = userPerformance[subject.id];
          const recommendedDifficulty = getRecommendedDifficulty(subject.id);
          const hasPerformanceData = !!performance;

          return (
            <motion.div
              key={subject.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
                  {subject.icon && (
                    <div className="text-2xl">{subject.icon}</div>
                  )}
                </div>
                
                {subject.description && (
                  <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                )}

                {hasPerformanceData && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Last Performance</span>
                      <span className="text-sm font-bold text-gray-900">{performance.percentage}%</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendedDifficulty)}`}>
                      {getDifficultyIcon(recommendedDifficulty)}
                      <span className="ml-1 capitalize">Recommended: {recommendedDifficulty}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleStartAdaptiveQuiz(subject)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Start Adaptive Quiz
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                  
                  <button
                    onClick={() => handleStartRegularQuiz(subject)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Regular Quiz
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                {!hasPerformanceData && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    First time? We'll start with medium difficulty questions.
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Available</h3>
          <p className="text-gray-600">Please contact your administrator to add quiz subjects.</p>
        </div>
      )}
    </div>
  );
};

export default AdaptiveQuizSelector;
