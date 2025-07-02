import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DayNavigation: React.FC = () => {
  const { currentDay, incrementDay, decrementDay } = useTaskContext();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Day {currentDay}: Your Tasks</h1>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={decrementDay}
          disabled={currentDay <= 1}
          className={`p-2 rounded-md ${
            currentDay <= 1 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800'
          } transition-colors duration-200`}
          aria-label="Previous day"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={incrementDay}
          className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-md text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200"
          aria-label="Next day"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DayNavigation