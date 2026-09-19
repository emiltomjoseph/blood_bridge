'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">
            Blood<span className="text-rose-600">Bridge</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4 md:space-x-6">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          
          {user ? (
            <>
              {user.role === 'HOSPITAL' && (
                <Link href="/hospital/dashboard" className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                  Hospital Dashboard
                </Link>
              )}
              {user.role === 'DONOR' && (
                <Link href="/donor/dashboard" className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                  Donor Profile
                </Link>
              )}
              
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-md shadow-rose-600/20 transition-all hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
};
