import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { ArrowRight, Trophy, Calendar, BarChart2 } from 'lucide-react';

const ProgressStats: React.FC = () => {
  const { currentDay, streak, completionRate } = useTaskContext();
  
  const progressPercentage = (currentDay / 100) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">Day {currentDay}/100</p>
          </div>
          <Calendar className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-indigo-500 dark:bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Start</span>
            <span>{progressPercentage.toFixed(0)}%</span>
            <span>Goal</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{streak} days</p>
          </div>
          <Trophy className="h-8 w-8 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <p>
              {streak === 0 
                ? "Start your streak by completing today's tasks!" 
                : streak < 3 
                  ? "Keep going to build your streak!" 
                  : streak < 7 
                    ? "Great consistency! Keep it up!" 
                    : "Impressive! You're on fire!"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{completionRate}%</p>
          </div>
          <BarChart2 className="h-8 w-8 text-green-500 dark:text-green-400" />
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${
                completionRate < 30 
                  ? 'bg-red-500 dark:bg-red-600' 
                  : completionRate < 70 
                    ? 'bg-amber-500 dark:bg-amber-600' 
                    : 'bg-green-500 dark:bg-green-600'
              }`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;