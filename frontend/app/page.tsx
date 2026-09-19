'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { BloodGroupBadge, UrgencyBadge, RequestStatusBadge } from '../components/StatusBadge';

export default function HomePage() {
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBloodRequests({ limit: 5 }).then((res) => {
      if (res.success && res.data) {
        setActiveRequests(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-rose-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 bg-rose-100/80 border border-rose-200 text-rose-700 px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span>District Blood Donor Matching Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Connecting Urgent Hospital Requests with <span className="text-rose-600 underline decoration-rose-300 decoration-wavy">Verified Donors</span>
          </h1>

          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Instant deterministic blood group compatibility, eligibility filtering, and Haversine proximity ranking to fulfill critical blood needs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register?role=HOSPITAL"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-xl shadow-rose-600/25 transition-all hover:scale-[1.02] text-center"
            >
              Hospital Portal & Create Request
            </Link>
            <Link
              href="/register?role=DONOR"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base border border-slate-200 shadow-sm transition-all hover:scale-[1.02] text-center"
            >
              Register as Blood Donor
            </Link>
          </div>

        </div>
      </section>

      {/* Live Emergency Requests Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Active District Requests</h2>
            <p className="text-slate-500 text-sm">Real-time emergency blood requirements submitted by hospitals</p>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Live Feed
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Loading active requests...
          </div>
        ) : activeRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-600 font-medium">No active blood requests right now.</p>
            <p className="text-xs text-slate-400">Hospitals can log in to create an urgent request.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <BloodGroupBadge group={req.bloodGroup} />
                    <UrgencyBadge urgency={req.urgency} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{req.hospital?.name || 'District Hospital'}</h3>
                    <p className="text-xs text-slate-500">{req.hospital?.district || 'District'} • {req.unitsRequired} Units Required</p>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <RequestStatusBadge status={req.status} />
                  <Link
                    href={`/hospital/requests/${req.id}`}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3-Step Workflow Section */}
      <section className="bg-white py-16 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">How BloodBridge Works</h2>
            <p className="text-slate-500 text-sm mt-2">Deterministic, fast, and transparent donor matching</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-rose-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Hospital Submits Request</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospital inputs blood group, units required, urgency, and exact geographic coordinates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-rose-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Matching Engine Filters & Ranks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backend checks red-cell compatibility, donor eligibility, active availability, and calculates Haversine distance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md shadow-rose-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Donor Accepts & Fulfills</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches are dispatched to eligible donors. Donors accept, and hospital tracks fulfillment status in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
