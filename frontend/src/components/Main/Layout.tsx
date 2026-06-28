import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 relative ${
      isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      <div className="sticky top-0 h-screen z-40">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Navbar setSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 w-full">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;