'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

// Components
import Sidebar from '@/components/Navigation/Sidebar';
import Header from '@/components/Navigation/Header';

interface Lead {
  first_name: string;
  last_name: string;
  messenger_link: string;
  queries: string;
  created_at: string;
}

export default function LeadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for dynamic data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isFetching, setIsFetching] = useState(true);

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

  // 2. Fetch Leads Data
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsFetching(false);
    }
  };

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
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage incoming leads from Messenger</p>
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all">
                <UsersIcon className="h-5 w-5 mr-2" />
                Add Lead
              </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Search leads..."
                  />
                </div>
                <button className="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Filters
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Messenger Link</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inquiry</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isFetching ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Loading leads...
                        </td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No leads found.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          
                          {/* 1. First Name | Last Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                  {lead.first_name ? lead.last_name.charAt(0) : 'U'}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {lead.first_name} {lead.last_name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Messenger Link */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a 
                              href={lead.messenger_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                              View Chat
                            </a>
                          </td>

                          {/* 3. Queries (Inquiry) */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.queries}>
                              {lead.queries || 'No inquiry text'}
                            </div>
                          </td>

                          {/* 4. Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-gray-400 hover:text-gray-600">
                              <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{leads.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          Previous
                        </button>
                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                          1
                        </button>
                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}