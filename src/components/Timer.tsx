import React, { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';

const Timer: React.FC = () => {
  const { timeRemaining, setTimeRemaining } = useQuiz();
  
  useEffect(() => {
    // Only run if timeRemaining is defined
    if (timeRemaining === undefined || timeRemaining === null) return;
    
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(timeRemaining - 1);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, setTimeRemaining]);
  
  // Return a placeholder if timeRemaining is undefined
  if (timeRemaining === undefined || timeRemaining === null) {
    return <span className="text-gray-400">--</span>;
  }
  
  // Calculate percentage for SVG circle
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeRemaining / 60);
  
  return (
    <div className="flex items-center">
      <svg width="40" height="40" className="transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          className="timer-ring"
          cx="20"
          cy="20"
          r={radius}
          fill="transparent"
          stroke={timeRemaining < 10 ? "#ef4444" : "#6366f1"}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className={`ml-2 font-mono text-sm font-medium ${
        timeRemaining < 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {timeRemaining}s
      </span>
    </div>
  );
};

export default Timer;