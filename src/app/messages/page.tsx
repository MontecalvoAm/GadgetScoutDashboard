'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Components
import Sidebar from '@/components/Navigation/Sidebar';
import Header from '@/components/Navigation/Header';

export default function MessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Helper to get role name (Same as Dashboard)
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

  // 2. Protect Route: Only Allow Admin (1) or Editor (2)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roleId = (user as any).roleId;
      // If role is NOT Admin AND NOT Editor, kick them out
      if (roleId !== 1 && roleId !== 2) {
        router.push('/dashboard'); // Redirect unauthorized users to dashboard
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Prevent flash of content if not authenticated
  if (!isAuthenticated || !user) return null;

  // Prepare User Data
  const roleName = getRoleName((user as any)?.roleId);
  const fullName = `${(user as any).firstName} ${(user as any).lastName}`;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Sidebar Component */}
      {/* Positioned absolute/fixed. Since we removed the padding below,
          this will slide ON TOP of your content when you open it. */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={roleName}
        username={fullName}
        email={(user as any).email}
      />

      {/* 2. Main Content Wrapper */}
      {/* FIX: Removed 'lg:pl-72'. The header now starts at 0px left. */}
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
               <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            </div>
            
            {/* --- Chat Interface --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-140px)] flex">
              
              {/* Chat List */}
              <div className="w-1/3 border-r border-gray-100 p-4">
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 mb-4"
                />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">JD</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">John Doe</h4>
                        <p className="text-xs text-gray-500 truncate">Hey, about the new product...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="text-center p-8 bg-gray-50 rounded-2xl">
                  <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                  <p className="text-sm">Choose a message from the list to view details.</p>
                </div>
              </div>

            </div>
            {/* --- End Chat Interface --- */}

          </div>
        </main>
      </div>
    </div>
  );
}