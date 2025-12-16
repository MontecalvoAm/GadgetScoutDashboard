'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TicketIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

// Components
import Sidebar from '@/components/Navigation/Sidebar';
import Header from '@/components/Navigation/Header';

export default function TicketsPage() {
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
               <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
            </div>

            {/* --- Stats Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <TicketIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <h3 className="text-2xl font-bold text-gray-800">12</h3>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                 <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <h3 className="text-2xl font-bold text-gray-800">5</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                 <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <h3 className="text-2xl font-bold text-gray-800">128</h3>
                </div>
              </div>
            </div>

            {/* --- Ticket List Table --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Recent Tickets</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/50 text-gray-900 font-semibold">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">#TR-8852</td>
                      <td className="px-6 py-4">Login issue on mobile app</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span></td>
                      <td className="px-6 py-4">Oct 24, 2025</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">#TR-8853</td>
                      <td className="px-6 py-4">Payment gateway timeout</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Resolved</span></td>
                      <td className="px-6 py-4">Oct 23, 2025</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}