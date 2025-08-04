import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserAuth } from '../context/UserAuthContext';
import { getUserQuizResponses } from '../services/responseService';
import { CheckCircle, XCircle, Clock, Award, Book, BookOpen } from 'lucide-react';

interface DetailedResultsProps {
  onBack: () => void;
}

const DetailedResults: React.FC<DetailedResultsProps> = ({ onBack }) => {
  const { userProfile } = useUserAuth();
  const [quizResponses, setQuizResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizResponses = async () => {
      if (!userProfile?.uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const responses = await getUserQuizResponses(userProfile.uid);
        console.log('Raw responses:', responses);
        
        // Filter to only show released results
        const releasedResponses = responses.filter(response => response.released === true);
        console.log('Released responses:', releasedResponses);
        
        if (releasedResponses.length === 0 && responses.length > 0) {
          console.log('Found responses but none are released:', responses.length);
        }
        
        setQuizResponses(releasedResponses);
      } catch (err) {
        console.error('Error loading quiz responses:', err);
        setError(`Failed to load quiz results: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadQuizResponses();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-card text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={onBack}
          className="btn-primary"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <div className="quiz-card mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quiz Results</h1>
          <button 
            onClick={onBack}
            className="btn-secondary"
          >
            Back to Profile
          </button>
        </div>

        {quizResponses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No quiz results available yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Results will appear here after you complete quizzes and admins release them.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {quizResponses.map((response) => (
              <div key={response.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {response.quizTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Completed on {new Date(response.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {response.percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {response.score}/{response.totalQuestions}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                    <div className="font-medium">
                      {Math.floor(response.timeTaken / 60)}m {response.timeTaken % 60}s
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <Award className="h-5 w-5 text-green-500 dark:text-green-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                    <div className="font-medium">
                      {response.responses.filter((r: any) => r.isCorrect).length}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
                    <div className="font-medium">
                      {response.responses.filter((r: any) => !r.isCorrect).length}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <Book className="h-5 w-5 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                    <div className="font-medium">{response.totalQuestions}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Question Breakdown</h3>
                  <div className="space-y-4">
                    {response.responses.map((questionResp: any, index: number) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-3 ${questionResp.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {questionResp.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {questionResp.questionText}
                            </p>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your Answer:</p>
                                <p className={`font-medium ${questionResp.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {questionResp.selectedAnswer || 'No answer provided'}
                                </p>
                              </div>
                              {!questionResp.isCorrect && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Correct Answer:</p>
                                  <p className="font-medium text-green-600 dark:text-green-400">
                                    {questionResp.correctAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DetailedResults;
