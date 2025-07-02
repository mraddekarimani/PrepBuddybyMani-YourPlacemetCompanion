import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useTaskContext } from '../context/TaskContext';
import { X, User, Mail, Calendar, Trophy, Target, Settings, Save, Edit3, Loader } from 'lucide-react';
import NotificationSettings from './NotificationSettings';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { 
    currentDay, 
    streak, 
    completionRate, 
    tasks, 
    notificationSettings, 
    updateNotificationSettings 
  } = useTaskContext();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'stats'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form fields when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setIsEditing(false);
      setSuccessMessage('');
    }
  }, [isOpen, profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      await updateProfile({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      });
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccessMessage('Failed to update profile. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async (settings: { emailNotifications: boolean; dailyReminders: boolean }) => {
    try {
      setLoading(true);
      await updateNotificationSettings(settings);
      setSuccessMessage('Notification settings updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setSuccessMessage('Failed to update settings. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics dynamically
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
  const currentCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: <Target className="h-5 w-5" /> },
    { label: 'Completed Tasks', value: completedTasks, icon: <Trophy className="h-5 w-5" /> },
    { label: 'Current Day', value: `${currentDay}/100`, icon: <Calendar className="h-5 w-5" /> },
    { label: 'Current Streak', value: `${streak} days`, icon: <Trophy className="h-5 w-5" /> },
    { label: 'Completion Rate', value: `${currentCompletionRate}%`, icon: <Target className="h-5 w-5" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-md ${
            successMessage.includes('Failed') 
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          }`}>
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'settings'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'stats'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy className="h-4 w-4 inline mr-2" />
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Picture Placeholder */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {profile?.display_name || 'PrepBuddy User'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Joined {joinDate}</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Display Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter your display name"
                          disabled={loading}
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100">
                          {profile?.display_name || 'No display name set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-gray-100">{user?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Tell us about your placement preparation journey..."
                          disabled={loading}
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100 min-h-[80px]">
                          {profile?.bio || 'No bio added yet'}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setDisplayName(profile?.display_name || '');
                              setBio(profile?.bio || '');
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <NotificationSettings
                    currentSettings={notificationSettings}
                    onSave={handleNotificationSave}
                  />
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Statistics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                          </div>
                          <div className="text-indigo-500 dark:text-indigo-400">
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Visualization */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Progress Overview</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>100-Day Challenge Progress</span>
                          <span>{currentDay}/100 days</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 dark:bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(currentDay / 100) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Task Completion Rate</span>
                          <span>{currentCompletionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              currentCompletionRate < 30 
                                ? 'bg-red-500 dark:bg-red-600' 
                                : currentCompletionRate < 70 
                                  ? 'bg-amber-500 dark:bg-amber-600' 
                                  : 'bg-green-500 dark:bg-green-600'
                            }`}
                            style={{ width: `${currentCompletionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Achievements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {streak >= 7 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg text-center">
                          <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Week Warrior</p>
                        </div>
                      )}
                      {currentDay >= 30 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg text-center">
                          <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Month Master</p>
                        </div>
                      )}
                      {currentCompletionRate >= 80 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-center">
                          <Target className="h-6 w-6 text-green-500 mx-auto mb-1" />
                          <p className="text-xs font-medium text-green-800 dark:text-green-200">High Achiever</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;