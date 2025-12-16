'use client';

import { useState } from 'react';
import { BellIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuToggle: () => void;
  onLogout: () => void;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export default function Header({ onMenuToggle, onLogout, firstName, lastName, roleName = "Administrator" }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  const fullName = `${firstName} ${lastName}`;
  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  return (
    // Header stays sticky at the top
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={onMenuToggle}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            {/* ------------------------------------------ */}

            {/* Title / Logo Text */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GADGETSCOUT PH
              </h1>
              {/* Optional: Show role on mobile header */}
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider lg:hidden">
                {roleName}
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notification bell */}
            <button className="p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 relative cursor-pointer">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                className="cursor-pointer flex items-center space-x-3 text-sm bg-gray-50 rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 focus:outline-none"
                onClick={toggleProfile}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                  {initial}
                </div>
                <span className="font-medium text-gray-700 hidden md:inline">
                  {fullName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${profileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{roleName}</p>
                    </div>

                    <div className="py-1">
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                        <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
                        Profile
                      </a>
                      <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                        Settings
                      </a>
                      <button
                        onClick={() => {
                          onLogout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}