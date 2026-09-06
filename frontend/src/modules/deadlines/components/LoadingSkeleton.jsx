import React from 'react';

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-2 w-2/3">
                <div className="h-5 bg-slate-200 rounded-md w-4/5" />
                <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
              </div>
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>

            <div className="bg-slate-100/60 rounded-xl p-3.5 my-3 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>

            <div className="h-3 bg-slate-100 rounded w-full mb-2" />
            <div className="h-3 bg-slate-100 rounded w-4/5 mb-4" />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
