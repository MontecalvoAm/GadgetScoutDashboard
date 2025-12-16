'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Components
import Sidebar from '@/components/Navigation/Sidebar';
import Header from '@/components/Navigation/Header';

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Helper to get role name
  const getRoleName = (id?: number) => {
    switch(id) {
      case 1: return 'Administrator';
      case 2: return 'Editor';
      case 3: return 'Viewer';
      default: return 'User';
    }
  };

  // 1. Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const roleName = getRoleName((user as any)?.roleId);
  const fullName = `${(user as any).firstName} ${(user as any).lastName}`;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Sidebar Component (Manual Overlay) */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={roleName}
        username={fullName}
        email={(user as any).email}
      />

      {/* 2. Main Content Wrapper (No Padding = Full Width Header) */}
      <div className="flex flex-col min-h-screen transition-all duration-300">
        
        <Header 
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          firstName={(user as any).firstName}
          lastName={(user as any).lastName}
          roleName={roleName}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full mx-auto">
            
            <div className="mb-6 md:hidden"> 
               <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
            </div>

            {/* --- Calendar UI --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">December 2025</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Today
                  </button>
                  <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    + Add Event
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Mock Days */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="bg-white min-h-[6rem] p-2 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                    <span className={`text-sm font-medium ${i + 1 === 15 ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                      {i + 1 <= 31 ? i + 1 : ''}
                    </span>
                    
                    {/* Mock Event */}
                    {i === 14 && (
                      <div className="mt-2 text-xs p-1.5 bg-purple-50 text-purple-700 rounded border-l-2 border-purple-500 truncate shadow-sm group-hover:bg-purple-100 transition-colors">
                        Meeting with Client
                      </div>
                    )}
                    
                    {/* Another Mock Event */}
                     {i === 24 && (
                      <div className="mt-2 text-xs p-1.5 bg-green-50 text-green-700 rounded border-l-2 border-green-500 truncate shadow-sm group-hover:bg-green-100 transition-colors">
                        Christmas Party
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
             {/* --- End Calendar UI --- */}

          </div>
        </main>
      </div>
    </div>
  );
}