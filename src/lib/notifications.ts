import { supabase } from './supabase';

const NOTIFICATIONS_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL || 'https://qtiakfqqfqbghytgzlcq.supabase.co'}/functions/v1/notifications`;

export const sendDailyReminder = async (email: string, currentDay: number) => {
  try {
    const response = await fetch(NOTIFICATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aWFrZnFxZnFiZ2h5dGd6bGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTI5NjQsImV4cCI6MjA2NjU4ODk2NH0.UhC8V4R4E2DhG0Tn27KZYnqojI1YKjM3imJ_HB6vlLc'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'daily_reminder',
        email,
        currentDay,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send daily reminder');
    }

    return true;
  } catch (error) {
    console.error('Error sending daily reminder:', error);
    return false;
  }
};

export const sendProgressUpdate = async (
  email: string,
  currentDay: number,
  completionRate: number,
  streak: number
) => {
  try {
    const response = await fetch(NOTIFICATIONS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aWFrZnFxZnFiZ2h5dGd6bGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTI5NjQsImV4cCI6MjA2NjU4ODk2NH0.UhC8V4R4E2DhG0Tn27KZYnqojI1YKjM3imJ_HB6vlLc'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'progress_update',
        email,
        currentDay,
        completionRate,
        streak,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send progress update');
    }

    return true;
  } catch (error) {
    console.error('Error sending progress update:', error);
    return false;
  }
};