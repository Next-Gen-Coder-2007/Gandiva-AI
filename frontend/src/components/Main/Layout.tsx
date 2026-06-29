import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isSidebarOpen) {
      const scrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';      
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
    } else {
      const scrollY = document.body.style.top;
      
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 relative ${
      isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      <div className="lg:sticky lg:top-0 lg:h-screen z-40">
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