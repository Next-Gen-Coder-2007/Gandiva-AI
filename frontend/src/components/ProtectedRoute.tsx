import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if(!isAuthenticated) {
      checkAuth();
    }
  }, [])

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login"
        state={{
          from: location,
          error: "Please Log in to access this page"
         }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;