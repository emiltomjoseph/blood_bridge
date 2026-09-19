'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { BloodGroupBadge, UrgencyBadge, RequestStatusBadge } from '../../../components/StatusBadge';

export default function HospitalDashboardPage() {
  const { user, token, refreshUserProfile } = useAuth();

  const [hospitalProfile, setHospitalProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Hospital setup form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Ernakulam');
  const [latitude, setLatitude] = useState(9.9816);
  const [longitude, setLongitude] = useState(76.2999);

  // New blood request form state
  const [bloodGroup, setBloodGroup] = useState('O_POS');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [urgency, setUrgency] = useState('URGENT');
  const [notes, setNotes] = useState('');

  const fetchHospitalData = async () => {
    if (!token) return;
    setLoading(true);

    const profileRes = await api.getMyHospitalProfile(token);
    if (profileRes.success && profileRes.data) {
      const data = profileRes.data;
      setHospitalProfile(data);
      setName(data.name || '');
      setAddress(data.address || '');
      setDistrict(data.district || 'Ernakulam');
      setLatitude(data.latitude || 9.9816);
      setLongitude(data.longitude || 76.2999);
    }

    const requestsRes = await api.getBloodRequests();
    if (requestsRes.success && requestsRes.data) {
      setRequests(requestsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitalData();
  }, [token]);

  const handleSaveHospitalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setMessage(null);

    const payload = {
      name,
      address,
      district,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    let res;
    if (hospitalProfile) {
      res = await api.updateMyHospitalProfile(token, payload);
    } else {
      res = await api.createHospitalProfile(token, payload);
    }

    if (res.success) {
      setMessage('Hospital profile saved successfully!');
      await fetchHospitalData();
      await refreshUserProfile();
    } else {
      setMessage(res.error?.message || 'Failed to save hospital profile.');
    }
    setSubmitting(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setMessage(null);

    const requiredBy = new Date(Date.now() + 86400000).toISOString();
    const payload = {
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      urgency,
      latitude: hospitalProfile?.latitude || latitude,
      longitude: hospitalProfile?.longitude || longitude,
      requiredBy,
      notes,
    };

    const res = await api.createBloodRequest(token, payload);
    if (res.success) {
      setMessage('Emergency blood request created successfully!');
      setShowCreateModal(false);
      setNotes('');
      await fetchHospitalData();
    } else {
      setMessage(res.error?.message || 'Failed to create request.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Hospital Portal</h1>
            <p className="text-xs text-slate-500">{hospitalProfile?.name || user?.name || 'District Hospital'}</p>
          </div>

          {hospitalProfile && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02]"
            >
              + Create Emergency Blood Request
            </button>
          )}
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
            {message}
          </div>
        )}

        {/* Hospital Setup Card if not created */}
        {!hospitalProfile && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Set Up Hospital Profile</h2>
            <p className="text-xs text-slate-500">Provide hospital details to start submitting emergency blood requests.</p>

            <form onSubmit={handleSaveHospitalProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="District Emergency Hospital"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="Medical College Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  placeholder="Ernakulam"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {submitting ? 'Saving...' : 'Save Hospital Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Requests Grid */}
        {hospitalProfile && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Hospital Blood Requests</h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                Loading requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <p className="text-slate-600 text-sm font-medium">No blood requests created yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
                >
                  Create First Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <BloodGroupBadge group={req.bloodGroup} />
                        <UrgencyBadge urgency={req.urgency} />
                      </div>

                      <div>
                        <div className="text-lg font-black text-slate-900">{req.unitsRequired} Units Required</div>
                        <p className="text-xs text-slate-500">Needed by {new Date(req.requiredBy).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400 font-medium">Status:</span>
                        <RequestStatusBadge status={req.status} />
                      </div>
                    </div>

                    <Link
                      href={`/hospital/requests/${req.id}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center block transition-all"
                    >
                      View Matches & Details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">New Emergency Blood Request</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Units Required</label>
                    <input
                      type="number"
                      min="1"
                      value={unitsRequired}
                      onChange={(e) => setUnitsRequired(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Surgery requirement at ICU Block B"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
