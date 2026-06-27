import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
        <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;