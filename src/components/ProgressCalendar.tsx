import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

const ProgressCalendar: React.FC = () => {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonthDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays = [];
    if (firstDay > 0) {
      const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(date.getFullYear(), date.getMonth() - 1, daysInPrevMonth - i),
          isCurrentMonth: false
        });
      }
    }
    return prevMonthDays;
  };

  const getCurrentMonthDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(date.getFullYear(), date.getMonth(), i),
        isCurrentMonth: true
      });
    }
    return currentMonthDays;
  };

  const getNextMonthDays = (date: Date, totalDays: number) => {
    const nextMonthDays = [];
    const remainingDays = 42 - totalDays; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(date.getFullYear(), date.getMonth() + 1, i),
        isCurrentMonth: false
      });
    }
    return nextMonthDays;
  };

  const getAllDays = () => {
    const prevMonthDays = getPreviousMonthDays(currentDate);
    const currentMonthDays = getCurrentMonthDays(currentDate);
    const nextMonthDays = getNextMonthDays(currentDate, prevMonthDays.length + currentMonthDays.length);
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDayStyle = (day: { date: Date; isCurrentMonth: boolean }) => {
    const dayTasks = getTasksForDate(day.date);
    const hasCompletedTasks = dayTasks.some(task => task.completed);
    const hasIncompleteTasks = dayTasks.some(task => !task.completed);
    
    let bgColor = day.isCurrentMonth 
      ? 'bg-white dark:bg-gray-800' 
      : 'bg-gray-50 dark:bg-gray-900';
    
    if (hasCompletedTasks && !hasIncompleteTasks) {
      bgColor = 'bg-green-100 dark:bg-green-900';
    } else if (hasCompletedTasks && hasIncompleteTasks) {
      bgColor = 'bg-yellow-100 dark:bg-yellow-900';
    } else if (hasIncompleteTasks) {
      bgColor = 'bg-red-100 dark:bg-red-900';
    }

    const isToday = day.date.toDateString() === new Date().toDateString();
    const borderStyle = isToday ? 'border-2 border-indigo-500 dark:border-indigo-400' : '';

    return `${bgColor} ${borderStyle}`;
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progress Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{monthYear}</span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        {getAllDays().map((day, index) => {
          const dayTasks = getTasksForDate(day.date);
          return (
            <div
              key={index}
              className={`aspect-square p-1 rounded-lg ${getDayStyle(day)} transition-colors duration-200`}
            >
              <div className="h-full flex flex-col">
                <span className={`text-sm ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                  {day.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <div className="mt-auto">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className="h-1 bg-indigo-500 rounded"
                        style={{
                          width: `${(dayTasks.filter(t => t.completed).length / dayTasks.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-400">All Complete</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-400">Partially Complete</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900 mr-1"></div>
          <span className="text-gray-600 dark:text-gray-400">Incomplete</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCalendar;