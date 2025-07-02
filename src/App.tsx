import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user exists but email is not confirmed, redirect to auth page
  if (user && !user.email_confirmed_at) {
    return <Auth />;
  }

  if (!user) {
    const isAuthPage = window.location.pathname === '/auth';
    return isAuthPage ? <Auth /> : <Landing />;
  }

  return (
    <ThemeProvider>
      <ProfileProvider>
        <TaskProvider>
          <Layout>
            <Dashboard />
          </Layout>
        </TaskProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;