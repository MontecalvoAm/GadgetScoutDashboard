'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChatBubbleLeftEllipsisIcon,
  UsersIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  email?: string;
  userRole?: string; 
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon, color: 'text-indigo-400' },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftEllipsisIcon, color: 'text-green-400' },
  { name: 'Leads', href: '/leads', icon: UsersIcon, color: 'text-blue-400' },
  { name: 'Tickets', href: '/tickets', icon: ChartBarIcon, color: 'text-purple-400' },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon, color: 'text-pink-400' },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, color: 'text-gray-400' },
];

export default function Sidebar({ isOpen, onClose, username, email, userRole }: SidebarProps) {
  const pathname = usePathname();

  const handleNavigation = () => {
    // Only close on mobile when clicking a link
    if (window.innerWidth < 1024) {
       onClose();
    }
  };

  const filteredNavigation = useMemo(() => {
    return navigation.filter((item) => {
      if (item.name === 'Settings') return true;
      if (userRole === 'Administrator') return true;
      if (userRole === 'Editor') return ['Messages', 'Customers', 'Dashboard'].includes(item.name);
      if (userRole === 'Viewer') return ['Tickets', 'Calendar', 'Dashboard'].includes(item.name);
      return item.name === 'Dashboard';
    });
  }, [userRole]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header with YOUR Hide Button */}
          <div className="relative p-6 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            
            {/* --- RESTORED: Center Hide Button --- */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white transition-all duration-200 group cursor-pointer"
                title="Close sidebar"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            {/* ------------------------------------- */}

            <div className="flex items-center space-x-3 pr-8">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">
                    {(username || 'G').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GADGETSCOUT</h1>
                <p className="text-xs text-gray-400">{userRole || 'User'} Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            <div className="px-3 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
            </div>
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/50'} group-hover:bg-white/10 transition-colors`}>
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl">
              <div className="h-9 w-9 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{(username || 'U').charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{username || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{email || 'user@email.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}