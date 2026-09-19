'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as 'DONOR' | 'HOSPITAL') || 'DONOR';

  const { login } = useAuth();
  const [role, setRole] = useState<'DONOR' | 'HOSPITAL'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address');
      return;
    }

    setLoading(true);
    setError(null);

    const mockToken = `mock-token-${role.toLowerCase()}-${Date.now()}`;
    await login(mockToken, role);

    const syncRes = await api.syncUser(mockToken, {
      name: name.trim(),
      phone: phone.trim() || undefined,
      role,
    });

    if (syncRes.success) {
      if (role === 'HOSPITAL') {
        router.push('/hospital/dashboard');
      } else {
        router.push('/donor/dashboard');
      }
    } else {
      setError(syncRes.error?.message || 'Failed to sync user profile with backend API.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30">
          B
        </div>
        <h2 className="text-2xl font-black text-slate-900">Get Started with BloodBridge</h2>
        <p className="text-xs text-slate-500">Create your account to submit requests or register availability</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('DONOR')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            role === 'DONOR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Blood Donor
        </button>
        <button
          type="button"
          onClick={() => setRole('HOSPITAL')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            role === 'HOSPITAL' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Hospital
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {role === 'HOSPITAL' ? 'Hospital / Organization Name' : 'Full Name'}
          </label>
          <input
            type="text"
            required
            placeholder={role === 'HOSPITAL' ? 'District Emergency Hospital' : 'John Doe'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="contact@org.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
          <input
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all mt-4"
        >
          {loading ? 'Creating Profile...' : `Register as ${role === 'HOSPITAL' ? 'Hospital' : 'Donor'}`}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-xs font-medium">Loading registration form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
