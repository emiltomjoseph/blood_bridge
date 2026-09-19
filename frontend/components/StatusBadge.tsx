import React from 'react';

export const BloodGroupBadge = ({ group }: { group: string }) => {
  const formatted = group.replace('_POS', '+').replace('_NEG', '-');
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
      {formatted}
    </span>
  );
};

export const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (urgency === 'CRITICAL') {
    color = 'bg-red-500 text-white font-bold animate-pulse shadow-sm shadow-red-200';
  } else if (urgency === 'URGENT') {
    color = 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider ${color}`}>
      {urgency}
    </span>
  );
};

export const RequestStatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-slate-100 text-slate-700';
  if (status === 'OPEN') color = 'bg-blue-100 text-blue-700 border border-blue-200';
  if (status === 'MATCHING') color = 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse';
  if (status === 'FULFILLED') color = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (status === 'CANCELLED') color = 'bg-slate-100 text-slate-500 line-through';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

export const AvailabilityBadge = ({ status }: { status: string }) => {
  let color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'UNAVAILABLE') color = 'bg-slate-100 text-slate-600 border-slate-200';
  if (status === 'PAUSED') color = 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
};
