'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="main-wrapper flex-grow-1">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
