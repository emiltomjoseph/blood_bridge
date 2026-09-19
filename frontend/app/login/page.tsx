'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const router = Router();
  const { login } = useAuth();

  const [role, setRole] = useState<'DONOR' | 'HOSPITAL' | 'ADMIN'>('HOSPITAL');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function Router() {
    return useRouter();
  }

  const handleQuickLogin = async (selectedRole: 'DONOR' | 'HOSPITAL' | 'ADMIN') => {
    setLoading(true);
    setError(null);

    const mockToken = `mock-token-${selectedRole.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const success = await login(mockToken, selectedRole);

    if (success) {
      if (selectedRole === 'HOSPITAL') {
        router.push('/hospital/dashboard');
      } else {
        router.push('/donor/dashboard');
      }
    } else {
      setError('Failed to authenticate session.');
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter your bearer token');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await login(tokenInput.trim(), role);
    if (success) {
      if (role === 'HOSPITAL') {
        router.push('/hospital/dashboard');
      } else {
        router.push('/donor/dashboard');
      }
    } else {
      setError('Failed to authenticate token.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30">
            B
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sign In to BloodBridge</h2>
          <p className="text-xs text-slate-500">Access hospital requests or donor availability dashboard</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Quick Demo Login Buttons */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
            Quick Portal Access (Demo)
          </label>
          <button
            onClick={() => handleQuickLogin('HOSPITAL')}
            disabled={loading}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            Hospital Portal Login &rarr;
          </button>
          <button
            onClick={() => handleQuickLogin('DONOR')}
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all"
          >
            Donor Portal Login &rarr;
          </button>
        </div>

        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold absolute">
            or Bearer Token
          </span>
        </div>

        {/* Token Input Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="HOSPITAL">Hospital</option>
              <option value="DONOR">Blood Donor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bearer Auth Token</label>
            <input
              type="text"
              placeholder="e.g. mock-token-hosp-1 or Supabase JWT"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In with Token'}
          </button>
        </form>

      </div>
    </div>
  );
}
