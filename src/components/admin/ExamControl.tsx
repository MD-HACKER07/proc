import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2 } from 'lucide-react';

/**
 * ExamControl component – allows an admin to set the overall exam duration (in minutes)
 * before activating / announcing a quiz. This simply updates SettingsContext so all clients
 * subsequently use the new duration when they start the quiz.
 */
const ExamControl: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [minutes, setMinutes] = useState<number>(settings.examDuration);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (minutes <= 0) return;
    updateSettings({ examDuration: minutes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Exam Timing Control</h2>
      <label className="block mb-4 text-gray-700 dark:text-gray-300">
        <span className="block mb-1">Exam duration (minutes)</span>
        <input
          type="number"
          min={1}
          value={minutes}
          onChange={e => setMinutes(parseInt(e.target.value, 10))}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </label>
      <button
        onClick={handleSave}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
      >
        Save
      </button>
      {saved && (
        <p className="flex items-center text-green-600 mt-3"><CheckCircle2 className="w-4 h-4 mr-1" />Saved</p>
      )}
    </div>
  );
};

export default ExamControl;
