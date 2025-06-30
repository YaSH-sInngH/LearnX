import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ profile, onProfileUpdate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 glass border-r border-white/20 dark:border-secondary-700/20 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <Sidebar 
          profile={profile} 
          onProfileUpdate={onProfileUpdate} 
        />
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header with sidebar toggle */}
        <div className="md:hidden glass border-b border-white/20 dark:border-secondary-700/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-700 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-secondary-700 dark:text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent font-display">
                LearnX
              </span>
            </div>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
        
        {/* Content area */}
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  );
} 