'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth-context';
import { api } from '../../../../lib/api';
import { BloodGroupBadge, UrgencyBadge, RequestStatusBadge, AvailabilityBadge } from '../../../../components/StatusBadge';

export default function RequestDetailsPage() {
  const params = useParams();
  const requestId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { token } = useAuth();
  const router = useRouter();

  const [requestData, setRequestData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingRunning, setMatchingRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRequestAndMatches = async () => {
    setLoading(true);

    const reqRes = await api.getBloodRequestById(requestId);
    if (reqRes.success && reqRes.data) {
      setRequestData(reqRes.data);
    }

    if (token) {
      const matchRes = await api.getMatchesForRequest(token, requestId);
      if (matchRes.success && matchRes.data) {
        setMatches(matchRes.data.matches || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestAndMatches();
    }
  }, [requestId, token]);

  const handleRunMatching = async () => {
    if (!token) {
      setMessage('Please log in as hospital to run matching engine.');
      return;
    }

    setMatchingRunning(true);
    setMessage(null);

    const res = await api.runMatchingForRequest(token, requestId);
    if (res.success && res.data) {
      setMatches(res.data.matches || []);
      setMessage(`Matching Engine Executed: Identified ${res.data.totalMatches} compatible & ranked donors!`);
      await fetchRequestAndMatches();
    } else {
      setMessage(res.error?.message || 'Failed to execute matching engine.');
    }
    setMatchingRunning(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!token) return;
    const res = await api.updateRequestStatus(token, requestId, newStatus);
    if (res.success) {
      setMessage(`Request status updated to ${newStatus}`);
      await fetchRequestAndMatches();
    } else {
      setMessage(res.error?.message || 'Failed to update request status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-400 font-medium">Loading request details...</div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <p className="text-slate-700 font-bold">Blood request not found.</p>
          <button onClick={() => router.push('/hospital/dashboard')} className="text-xs text-rose-600 font-bold">
            &larr; Back to Hospital Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <BloodGroupBadge group={requestData.bloodGroup} />
                <UrgencyBadge urgency={requestData.urgency} />
                <RequestStatusBadge status={requestData.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {requestData.unitsRequired} Units Required
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Hospital: {requestData.hospital?.name} • District: {requestData.hospital?.district}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRunMatching}
                disabled={matchingRunning}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02]"
              >
                {matchingRunning ? 'Running Matching Engine...' : '⚡ Run Matching Engine'}
              </button>

              {requestData.status !== 'FULFILLED' && requestData.status !== 'CANCELLED' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('FULFILLED')}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
                  >
                    Mark Fulfilled
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="px-3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {requestData.notes && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">Hospital Notes:</span>
              "{requestData.notes}"
            </div>
          )}
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl">
            {message}
          </div>
        )}

        {/* Ranked Candidate Matches UI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Ranked Compatible Donors</h2>
              <p className="text-xs text-slate-500">
                Filtered by ABO/Rh compatibility, verification, availability, and ranked by Haversine proximity
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              {matches.length} Matches Found
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center mx-auto text-xl">
                !
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">No matches generated yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the "Run Matching Engine" button above to execute compatibility, eligibility, and distance ranking algorithms.
                </p>
              </div>
              <button
                onClick={handleRunMatching}
                disabled={matchingRunning}
                className="px-6 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Execute Matching Engine Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m, index) => (
                <div
                  key={m.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400"># RANK {index + 1}</span>
                      {/* Priority Match Score Badge */}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-600/20">
                        Score: {m.matchScore} / 100
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {m.donor?.user?.name || 'Verified Donor'}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <BloodGroupBadge group={m.donor?.bloodGroup || requestData.bloodGroup} />
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          📍 {m.distanceKm} km away
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-400 font-medium">Availability:</span>
                      <AvailabilityBadge status={m.donor?.availabilityStatus || 'AVAILABLE'} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Match Response:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md ${
                          m.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block text-center">
                      Authorized Contact Dispatched
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
