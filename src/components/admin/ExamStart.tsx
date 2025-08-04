import React, { useState, useEffect } from 'react';
import { getSubjects, Subject } from '../../services/quizService';
import { startActiveExam, endActiveExam, subscribeToActiveExam, ActiveExam } from '../../services/examService';
import { useSettings } from '../../context/SettingsContext';
import { Play, BookOpen, Clock, CheckCircle2, Calendar, Shuffle } from 'lucide-react';


const ExamStart: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(settings.selectedSubject || '');
  const [examDuration, setExamDuration] = useState<number>(settings.examDuration || 30);
  const [loading, setLoading] = useState<boolean>(true);
  // new UI/feature states
  const [startOption, setStartOption] = useState<'now' | 'schedule'>('now');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [shuffle, setShuffle] = useState<boolean>(settings.shuffleQuestions ?? true);
  const [instructions, setInstructions] = useState<string>('');
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  const [ending, setEnding] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setError(null);
        const subjectList = await getSubjects();
        setSubjects(subjectList);
        if (subjectList.length > 0 && subjectList[0].id) {
          setSelectedSubject(subjectList[0].id);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
        setError('Failed to load subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();

    // subscribe to active exam
    const unsub = subscribeToActiveExam((exam) => setActiveExam(exam));
    return () => unsub();
  }, []);

  const handleStartExam = async () => {
    if (!selectedSubject || examDuration <= 0) {
      setError('Please select a subject and set a valid exam duration.');
      return;
    }
    
    try {
      setIsStarting(true);
      setError(null);
      
      // Update settings with exam duration and selected subject
      await updateSettings({ 
        examDuration,
        selectedSubject,
        shuffleQuestions: shuffle
      });
      
      await startActiveExam(selectedSubject, examDuration, startOption === 'schedule' ? scheduledTime : undefined, shuffle, instructions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      const errorMessage = error.message || 'Failed to start exam. Please try again.';
      setError(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndExam = async () => {
    if (!activeExam || ending) return;
    if (!confirm('Are you sure you want to end the current exam? This will force submission for all students.')) return;
    try {
      setEnding(true);
      await endActiveExam();
    } catch (err) {
      console.error('Failed to end exam', err);
      alert('Failed to end exam. Please try again');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
        <Play className="w-6 h-6 mr-2 text-indigo-600" />
        Start New Exam
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Subject
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Exam Duration (minutes)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              min="1"
              value={examDuration}
              onChange={(e) => setExamDuration(parseInt(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Start time options */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Time
          </label>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                checked={startOption === 'now'}
                onChange={() => setStartOption('now')}
              />
              <span className="ml-2 text-sm">Start Now</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                checked={startOption === 'schedule'}
                onChange={() => setStartOption('schedule')}
              />
              <span className="ml-2 text-sm">Schedule</span>
            </label>
          </div>
          {startOption === 'schedule' && (
            <div className="mt-3 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Shuffle option */}
        <div className="flex items-center space-x-3">
          <Shuffle className="text-gray-400 w-5 h-5" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shuffle Questions</label>
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
        </div>

        {/* Active exam info */}
        {activeExam && activeExam.active && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg space-y-2">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center">
              Ongoing Exam
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Subject ID: {activeExam.subjectId}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Started: {activeExam.startedAt.toLocaleString()}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Duration: {activeExam.duration} min</p>
            <button
              onClick={handleEndExam}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              disabled={ending}
            >
              {ending ? 'Ending...' : 'End Exam Now'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Exam Instructions (optional)
          </label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter any special instructions for candidates..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleStartExam}
            disabled={examDuration <= 0 || !selectedSubject || isStarting}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
              examDuration <= 0 || !selectedSubject || isStarting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Exam
              </>
            )}
          </button>
          
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="w-5 h-5 mr-1" />
              <span>
                {startOption === 'schedule' 
                  ? 'Exam scheduled successfully!' 
                  : 'Exam started successfully!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamStart;
