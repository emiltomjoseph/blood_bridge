'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface UserSession {
  id: string; // Supabase Auth UID or mock token ID
  email: string;
  name: string;
  phone?: string | null;
  role: 'DONOR' | 'HOSPITAL' | 'ADMIN';
  token: string;
  donorProfile?: any;
  hospitalProfile?: any;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (token: string, role?: 'DONOR' | 'HOSPITAL' | 'ADMIN') => Promise<boolean>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  refreshUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await api.getMe(authToken);
      if (res.success && res.data) {
        const userData = res.data;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          token: authToken,
          donorProfile: userData.donor,
          hospitalProfile: userData.hospital,
        });
        return true;
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return false;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('bloodbridge_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (authToken: string, preferredRole?: 'DONOR' | 'HOSPITAL' | 'ADMIN') => {
    setLoading(true);
    setToken(authToken);
    localStorage.setItem('bloodbridge_token', authToken);

    const success = await fetchProfile(authToken);
    if (!success) {
      // Fallback user session for development/testing if not yet synced in DB
      const fallbackUserId = authToken.startsWith('mock-token-')
        ? authToken.replace('mock-token-', '')
        : 'user-' + Date.now();
      setUser({
        id: fallbackUserId,
        email: `${fallbackUserId}@bloodbridge.org`,
        name: 'BloodBridge User',
        role: preferredRole || 'DONOR',
        token: authToken,
      });
    }
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bloodbridge_token');
  };

  const refreshUserProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
