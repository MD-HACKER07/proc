import React, { useState, useEffect } from 'react';
import { getSubjects, Subject } from '../../services/quizService';
import { endActiveExam } from '../../services/examService';
import { getActiveExamSessions, terminateExamSession, ExamSession, getExamEvents, ExamEvent } from '../../services/examMonitoringService';
import { useUserExam } from '../../context/UserExamContext';
import { BookOpen, Clock, Users, AlertTriangle, XCircle, Activity } from 'lucide-react';

const ExamMonitoring: React.FC = () => {
  const { activeExam } = useUserExam();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSessions, setActiveSessions] = useState<ExamSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState<ExamEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ending, setEnding] = useState<boolean>(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectList = await getSubjects();
        setSubjects(subjectList);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load subjects:', error);
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Subscribe to active exam sessions
  useEffect(() => {
    if (!activeExam?.subjectId) {
      setActiveSessions([]);
      return;
    }
    
    console.log('Subscribing to active sessions for subject:', activeExam.subjectId);
    const unsubscribe = getActiveExamSessions(activeExam.subjectId, (sessions) => {
      console.log('Active sessions updated:', sessions);
      setActiveSessions(sessions);
    });

    return () => {
      console.log('Unsubscribing from active sessions');
      unsubscribe();
    };
  }, [activeExam?.subjectId]);

  // Subscribe to events for selected session
  useEffect(() => {
    if (!selectedSession) {
      setSessionEvents([]);
      return;
    }
    
    const unsubscribe = getExamEvents(selectedSession, (events) => {
      setSessionEvents(events);
    });

    return () => unsubscribe();
  }, [selectedSession]);

  const handleEndExam = async () => {
    if (!window.confirm('Are you sure you want to end the exam for all students?')) return;
    
    try {
      setEnding(true);
      await endActiveExam();
    } catch (error) {
      console.error('Failed to end exam:', error);
      alert('Failed to end exam. Please try again.');
    } finally {
      setEnding(false);
    }
  };

  const handleTerminateSession = async (sessionId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to terminate ${userName}'s exam?`)) return;
    
    try {
      await terminateExamSession(sessionId);
    } catch (error) {
      console.error('Failed to terminate session:', error);
      alert('Failed to terminate session. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading monitoring data...</div>;
  }

  if (!activeExam) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Exam</h3>
          <p className="text-gray-600 dark:text-gray-300">
            There is currently no active exam. Please start an exam from the Start Exam tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Exam Monitoring</h2>
          <button
            onClick={handleEndExam}
            disabled={ending}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-5 w-5 mr-2" />
            {ending ? 'Ending...' : 'End Exam for All'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-300 mr-3" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Students Taking Exam</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-white">{activeSessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-500 dark:text-green-300 mr-3" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Subject</p>
                <p className="text-lg font-bold text-green-900 dark:text-white">
                  {subjects.find(s => s.id === activeExam?.subjectId)?.name || 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-500 dark:text-purple-300 mr-3" />
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Duration</p>
                <p className="text-lg font-bold text-purple-900 dark:text-white">{activeExam?.duration || 0} minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Active Students</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Subject: <span className="font-medium">{subjects.find(s => s.id === activeExam?.subjectId)?.name || 'Unknown'}</span>
          </div>
        </div>
        
        {activeSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No students are currently taking the exam</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeSessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${selectedSession === session.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                    onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{session.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{session.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {session.startedAt.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminateSession(session.id, session.userName);
                        }}
                        className="flex items-center text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Events */}
      {selectedSession && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Session Events</h3>
          
          {sessionEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No events recorded for this session</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessionEvents
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {event.eventType === 'security_alert' || event.eventType === 'tab_switch' || event.eventType === 'fullscreen_exit' || event.eventType === 'devtools_open' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.eventType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                      {event.details && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {JSON.stringify(event.details)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamMonitoring;
