import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { Task, Category } from '../types';
import { sendDailyReminder, sendProgressUpdate } from '../lib/notifications';

// Default categories for new users
const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'DSA', color: 'bg-blue-500' },
  { name: 'Aptitude', color: 'bg-green-500' },
  { name: 'CS Fundamentals', color: 'bg-purple-500' },
  { name: 'Resume', color: 'bg-yellow-500' },
  { name: 'Projects', color: 'bg-pink-500' },
  { name: 'Mock Interviews', color: 'bg-red-500' },
];

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  currentDay: number;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  getTasksByDay: (day: number) => Task[];
  resetProgress: () => Promise<void>;
  incrementDay: () => Promise<void>;
  decrementDay: () => Promise<void>;
  setCurrentDay: (day: number) => Promise<void>;
  streak: number;
  completionRate: number;
  notificationSettings: {
    emailNotifications: boolean;
    dailyReminders: boolean;
  };
  updateNotificationSettings: (settings: {
    emailNotifications: boolean;
    dailyReminders: boolean;
  }) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDay, setCurrentDayState] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    dailyReminders: true,
  });

  // Fetch user's data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // Reset state when user logs out
      setTasks([]);
      setCategories([]);
      setCurrentDayState(1);
      setStreak(0);
    }
  }, [user]);

  // Add notification settings fetch
  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('email_notifications, daily_reminders')
        .eq('user_id', user.id)
        .maybeSingle();

      // If settings exist, use them. Otherwise, create default settings
      if (data) {
        setNotificationSettings({
          emailNotifications: data.email_notifications,
          dailyReminders: data.daily_reminders,
        });
      } else {
        // Create default settings if none exist using upsert
        const { error } = await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: user.id,
              email_notifications: true,
              daily_reminders: true,
            },
            { onConflict: 'user_id' }
          );

        if (!error) {
          setNotificationSettings({
            emailNotifications: true,
            dailyReminders: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;

    // First ensure the user exists in the users table
    await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
        },
        { onConflict: 'id' }
      );

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (categoriesData) {
      setCategories(categoriesData);
    }

    // If no categories exist, create default ones
    if (!categoriesData?.length) {
      for (const category of defaultCategories) {
        await supabase
          .from('categories')
          .insert({ ...category, user_id: user.id });
      }
      
      // Fetch categories again after creating defaults
      const { data: newCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (newCategories) {
        setCategories(newCategories);
      }
    }

    // Fetch tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (tasksData) {
      setTasks(tasksData);
    }

    // Fetch progress - use maybeSingle() instead of single() to handle no rows gracefully
    const { data: progressData } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (progressData) {
      setCurrentDayState(progressData.current_day);
      setStreak(progressData.streak);
    } else {
      // Create initial progress record using upsert to avoid foreign key constraint issues
      await supabase
        .from('progress')
        .upsert(
          {
            user_id: user.id,
            current_day: 1,
            streak: 0,
            last_completed: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
    }
  };

  const updateNotificationSettings = async (settings: {
    emailNotifications: boolean;
    dailyReminders: boolean;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: settings.emailNotifications,
          daily_reminders: settings.dailyReminders,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Update local state immediately
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }
    if (data) {
      setTasks(prevTasks => [...prevTasks, data]);
      if (task.completed) {
        await updateStreak(true);
      }
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const toggleComplete = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(updatedTask);

    if (task.day === currentDay) {
      const dayTasks = tasks.filter(t => t.day === currentDay);
      const allCompleted = dayTasks.every(t => 
        t.id === id ? !task.completed : t.completed
      );
      
      if (allCompleted && dayTasks.length > 0) {
        await updateStreak(true);
      }
    }
  };

  const updateStreak = async (completed: boolean) => {
    if (!user) return;

    const newStreak = completed ? streak + 1 : 0;
    const { error } = await supabase
      .from('progress')
      .update({ 
        streak: newStreak,
        last_completed: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
    setStreak(newStreak);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...category, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }
      
      if (data) {
        setCategories(prevCategories => [...prevCategories, data]);
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
  };

  const updateCategory = async (updatedCategory: Category) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .update(updatedCategory)
      .eq('id', updatedCategory.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    setCategories(prevCategories => prevCategories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
  };

  const getTasksByDay = (day: number) => {
    return tasks.filter(task => task.day === day);
  };

  const resetProgress = async () => {
    if (!user || !window.confirm('Are you sure you want to reset your progress? This will delete all tasks and reset your day count.')) {
      return;
    }

    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id);

    if (tasksError) throw tasksError;

    const { error: progressError } = await supabase
      .from('progress')
      .update({ 
        current_day: 1,
        streak: 0,
        last_completed: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (progressError) throw progressError;

    setTasks([]);
    setCurrentDayState(1);
    setStreak(0);
  };

  const setCurrentDay = async (day: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('progress')
      .update({ current_day: day })
      .eq('user_id', user.id);

    if (error) throw error;
    setCurrentDayState(day);
  };

  const incrementDay = async () => {
    if (!user) return;

    const todayTasks = getTasksByDay(currentDay);
    const allCompleted = todayTasks.length > 0 && todayTasks.every(task => task.completed);

    if (!allCompleted && todayTasks.length > 0) {
      if (!window.confirm('Not all tasks for today are completed. Are you sure you want to move to the next day?')) {
        return;
      }
      await updateStreak(false);
    } else if (todayTasks.length > 0) {
      await updateStreak(true);
      
      // Send progress update if enabled
      if (notificationSettings.emailNotifications && user.email) {
        await sendProgressUpdate(user.email, currentDay, completionRate, streak);
      }
    }

    await setCurrentDay(currentDay + 1);

    // Send daily reminder for the next day if enabled
    if (notificationSettings.dailyReminders && user.email) {
      await sendDailyReminder(user.email, currentDay + 1);
    }
  };

  const decrementDay = async () => {
    if (currentDay > 1) {
      await setCurrentDay(currentDay - 1);
    }
  };

  // Calculate completion rate dynamically
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0;

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        currentDay,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        deleteCategory,
        updateCategory,
        getTasksByDay,
        resetProgress,
        incrementDay,
        decrementDay,
        setCurrentDay,
        streak,
        completionRate,
        notificationSettings,
        updateNotificationSettings,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};