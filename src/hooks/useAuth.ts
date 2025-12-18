'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  roleId: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        logout();
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage for user data
      const userData = localStorage.getItem('user');

      if (userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    // Clear cookies by calling a logout API (optional but recommended)
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      window.location.href = '/';
    });
  };


  const getUsername = () => {
    return authState.user?.username || '';
  };

  return {
    ...authState,
    login,
    logout,
    getUsername,
  };
};