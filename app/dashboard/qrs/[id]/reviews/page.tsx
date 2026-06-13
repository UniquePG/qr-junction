'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Loader2, Star, MessageSquareWarning, BarChart, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ReviewAnalyticsPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const token = await currentUser.getIdToken();
        const res = await fetch(`/api/qrs/${id}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load review analytics.');
      } finally {
        setLoading(false);
      }
    };
    
    // Wait for auth to be ready
    const unsub = auth.onAuthStateChanged(user => {
      if (user) fetchData();
      else setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-slate-500">Failed to load analytics.</div>;

  const { stats, reviews } = data;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#001B50]">Review Analytics</h1>
        <p className="text-slate-500">Track your customer satisfaction and negative feedback.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-xl text-primary">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase">Avg Rating</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.averageRating.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase">Total Ratings</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalRatings}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 lg:col-span-2">
          <div className="p-4 bg-red-50 rounded-xl text-red-500">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase">Private Feedbacks (≤3 Stars)</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.negativeFeedbackCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-[#001B50] mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.ratingDistribution[star] || 0;
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="font-semibold text-sm">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#001B50]" />
            <h3 className="font-bold text-[#001B50]">Private Feedback Responses</h3>
          </div>
          
          <div className="flex-1 overflow-auto">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No feedback received yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Rating</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-800">{r.name || 'Anonymous'}</div>
                        {r.phone && <div className="text-xs text-slate-500">{r.phone}</div>}
                      </td>
                      <td className="p-4 text-sm text-slate-700 max-w-xs">
                        <p className="line-clamp-3" title={r.feedback}>{r.feedback || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
