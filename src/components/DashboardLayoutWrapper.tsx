'use client';

import { useState } from 'react';
import Sidebar from './Navigation/Sidebar'; 
import Header from './Navigation/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  title: string;
  isFullWidth?: boolean; // 1. Add this optional prop
}

export default function DashboardLayoutWrapper({ 
  children, 
  userRole = 'Viewer', 
  title,
  isFullWidth = false // 2. Default it to false
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock Data
  const userData = {
    firstName: "Aljon",
    lastName: "Montecalvo",
    email: "aljon@ctu.edu.ph"
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userRole}
        username={userData.firstName}
        email={userData.email}
      />

      {/* Main Layout Wrapper */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        
        <Header 
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          firstName={userData.firstName}
          lastName={userData.lastName}
          roleName={userRole}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
           {/* 3. Conditional Class here: If isFullWidth is true, use w-full, else use max-w-7xl */}
          <div className={`mx-auto ${isFullWidth ? 'w-full' : 'max-w-7xl'}`}>
            
             <div className="mb-6 md:hidden"> 
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
             </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}