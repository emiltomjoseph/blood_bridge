'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { BloodGroupBadge, AvailabilityBadge, UrgencyBadge } from '../../../components/StatusBadge';

export default function DonorDashboardPage() {
  const { user, token, refreshUserProfile } = useAuth();

  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [latitude, setLatitude] = useState(9.9312);
  const [longitude, setLongitude] = useState(76.2673);
  const [availabilityStatus, setAvailabilityStatus] = useState<'AVAILABLE' | 'UNAVAILABLE' | 'PAUSED'>('AVAILABLE');

  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);

  const fetchDonorData = async () => {
    if (!token) return;
    setLoading(true);

    const profileRes = await api.getMyDonorProfile(token);
    if (profileRes.success && profileRes.data) {
      const data = profileRes.data;
      setDonorProfile(data);
      setBloodGroup(data.bloodGroup || 'O_POS');
      setLatitude(data.latitude || 9.9312);
      setLongitude(data.longitude || 76.2673);
      setAvailabilityStatus(data.availabilityStatus || 'AVAILABLE');
    }

    // Fetch live blood requests matching donor blood group
    const requestsRes = await api.getBloodRequests();
    if (requestsRes.success && requestsRes.data) {
      setMatchingRequests(requestsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonorData();
  }, [token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      bloodGroup,
      latitude: Number(latitude),
      longitude: Number(longitude),
      availabilityStatus,
    };

    let res;
    if (donorProfile) {
      res = await api.updateMyDonorProfile(token, payload);
    } else {
      res = await api.createDonorProfile(token, payload);
    }

    if (res.success) {
      setMessage('Donor profile saved successfully!');
      await fetchDonorData();
      await refreshUserProfile();
    } else {
      setMessage(res.error?.message || 'Failed to save donor profile.');
    }
    setSaving(false);
  };

  const handleToggleAvailability = async (newStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'PAUSED') => {
    if (!token) return;
    setSaving(true);
    const res = await api.updateDonorAvailability(token, newStatus);
    if (res.success) {
      setAvailabilityStatus(newStatus);
      await fetchDonorData();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Donor Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome, {user?.name || 'Donor'}</p>
          </div>

          {donorProfile && (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500 font-semibold">Availability:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => handleToggleAvailability('AVAILABLE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    availabilityStatus === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => handleToggleAvailability('UNAVAILABLE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    availabilityStatus === 'UNAVAILABLE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unavailable
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Form Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Donor Medical Profile</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="O_POS">O Positive (O+)</option>
                  <option value="O_NEG">O Negative (O-)</option>
                  <option value="A_POS">A Positive (A+)</option>
                  <option value="A_NEG">A Negative (A-)</option>
                  <option value="B_POS">B Positive (B+)</option>
                  <option value="B_NEG">B Negative (B-)</option>
                  <option value="AB_POS">AB Positive (AB+)</option>
                  <option value="AB_NEG">AB Negative (AB-)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {saving ? 'Saving...' : donorProfile ? 'Update Donor Profile' : 'Create Donor Profile'}
              </button>
            </form>
          </div>

          {/* Active Blood Requests List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Active District Emergency Requests</h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                Loading requests...
              </div>
            ) : matchingRequests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-600 text-sm">No emergency blood requests currently active in your district.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchingRequests.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BloodGroupBadge group={req.bloodGroup} />
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Needed by {new Date(req.requiredBy).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{req.hospital?.name || 'District Hospital'}</h3>
                      <p className="text-xs text-slate-500">{req.hospital?.address} • {req.unitsRequired} Units Required</p>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{req.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
