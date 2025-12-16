'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardStats, Conversation, User } from '@/types'; // Added User type

// Components
import Sidebar from '@/components/Navigation/Sidebar';
import Header from '@/components/Navigation/Header';
import StatsCard from '@/components/Dashboard/StatsCard';
import ConversationCard from '@/components/Dashboard/ConversationCard';
import UserList from '@/components/Dashboard/UserList'; // Import the new component

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // We need state for BOTH lists now
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]); 
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const getRoleName = (id?: number) => {
    switch(id) {
      case 1: return 'Administrator';
      case 2: return 'Editor';
      case 3: return 'Viewer';
      default: return 'User';
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      // 1. Determine if Admin
      const isAdmin = (user as any)?.roleId === 1;

      // 2. Define the promises array. 
      // We always fetch stats. 
      // If Admin -> Fetch Users. If not -> Fetch Conversations.
      const promises = [
        fetch('/api/dashboard'),
        isAdmin ? fetch('/api/users') : fetch('/api/conversations')
      ];

      const [statsRes, listRes] = await Promise.all(promises);

      // 3. Handle Stats
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // 4. Handle List Data (Users OR Conversations)
      if (listRes.ok) {
        const data = await listRes.json();
        
        if (isAdmin) {
          // If Admin, fill the User List
          setUsersList(data.users || []);
        } else {
          // If NOT Admin, fill the Conversations List
          setConversations(data.conversations || []);
        }
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  if (!isAuthenticated) return null;

  const fullName = user ? `${(user as any).firstName} ${(user as any).lastName}` : 'User';
  const isAdmin = (user as any)?.roleId === 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        firstName={(user as any)?.firstName || ''}
        lastName={(user as any)?.lastName || ''}
        roleName={getRoleName((user as any)?.roleId)}
      />

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          username={fullName}
          email={user?.email}
          userRole={getRoleName((user as any)?.roleId)}
        />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            username={fullName}
            email={user?.email}
            userRole={getRoleName((user as any)?.roleId)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 lg:p-6 pt-20">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-white p-8 mb-8 shadow-2xl mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {fullName}!</h1>
                  <p className="text-indigo-200 text-lg">Here's what's happening today</p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-3xl">👋</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content Loading State */}
            {!stats && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading dashboard data...</p>
              </div>
            )}

            {/* Render Data */}
            {stats && (
              <>
                {/* 1. STATS GRID (Shows for everyone) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatsCard title="USERS" value={stats.users} icon="👥" color="from-indigo-500 to-purple-600" gradient="from-indigo-100 to-purple-100" delay={0} />
                  <StatsCard title="CUSTOMERS" value={stats.customers} icon="👤" color="from-purple-500 to-pink-600" gradient="from-purple-100 to-pink-100" delay={100} />
                  <StatsCard title="CONVERSATIONS" value={stats.conversations} icon="💬" color="from-green-500 to-emerald-600" gradient="from-green-100 to-emerald-100" delay={200} />
                  <StatsCard title="OPEN TICKETS" value={stats.openConversations} icon="📞" color="from-amber-500 to-orange-600" gradient="from-amber-100 to-orange-100" delay={300} />
                </div>

                {/* 2. DYNAMIC SECTION: Users List (Admin) OR Conversations (Others) */}
                {isAdmin ? (
                   // --- ADMIN VIEW: USERS LIST ---
                   <UserList users={usersList} />
                ) : (
                   // --- STANDARD VIEW: CONVERSATIONS LIST ---
                   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                          <span className="text-2xl mr-3">💬</span>
                          Recent Conversations
                        </h2>
                        <span className="text-sm text-gray-500">{conversations.length} total</span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {conversations.length === 0 && (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🤷‍♂️</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                        </div>
                      )}

                      {conversations.map((conv, index) => (
                        <ConversationCard 
                          key={conv.ID} 
                          data={conv} 
                          delay={index * 50} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}