import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTaskContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Moon, Sun, BookOpen, LogOut, User } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentDay, streak } = useTaskContext();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">PrepBuddy</h1>
                <span className="text-sm text-gray-600 dark:text-gray-400">by Mani</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-6">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Day:</span>
                  <span className="text-lg font-bold bg-indigo-600 text-white dark:bg-indigo-700 px-2 py-1 rounded">
                    {currentDay}/100
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Streak:</span>
                  <span className="text-lg font-bold bg-amber-500 text-white dark:bg-amber-600 px-2 py-1 rounded">
                    {streak} days
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
                  aria-label="Open profile"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.display_name || 'Profile'}
                  </span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={signOut}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex justify-center space-x-6 mt-3">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Day:</span>
              <span className="text-lg font-bold bg-indigo-600 text-white dark:bg-indigo-700 px-2 py-1 rounded">
                {currentDay}/100
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold mr-2">Streak:</span>
              <span className="text-lg font-bold bg-amber-500 text-white dark:bg-amber-600 px-2 py-1 rounded">
                {streak} days
              </span>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};

export default Header;