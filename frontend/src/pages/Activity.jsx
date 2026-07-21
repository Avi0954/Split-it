import React, { useState, useEffect, useCallback } from 'react';
import { Activity as ActivityIcon, Receipt, HandCoins, Calendar, Users } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAllRealtimeEvents } from '../hooks/useRealtimeEvents';

const timeAgo = (dateStr) => {
  const diffInSeconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Activity = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { currency, formatAmount } = useCurrency();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get('/users/me/activity');
        setFeed(res.data);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        showToast('Failed to load recent activity.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [showToast]);

  const fetchActivityOnly = useCallback(async () => {
    try {
      const res = await api.get('/users/me/activity');
      setFeed(res.data);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  }, []);

  useAllRealtimeEvents((payload) => {
    console.log('Realtime event received, refetching activity page:', payload.type);
    fetchActivityOnly();
  }, [fetchActivityOnly]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 lg:pb-0">
        <div className="flex items-center gap-3 border-b border-[#1F1F2B] pb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <ActivityIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#EAEAF0] tracking-tight">Recent Activity</h2>
            <p className="text-[#A1A1AA] font-medium text-sm mt-1">Track all your group expenses and settlements</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-5 border-[#1F1F2B] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1F1F2B] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-[#1F1F2B] rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-[#1F1F2B] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-24 card bg-transparent border-dashed border-2 border-[#1F1F2B] rounded-2xl">
            <span className="text-4xl mb-4 inline-block">📭</span>
            <h3 className="text-xl font-bold text-[#EAEAF0]">No Activity Yet</h3>
            <p className="text-[#A1A1AA] mt-2 text-sm max-w-sm mx-auto">
              Once you start adding expenses and settling up in your groups, they will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feed.map((item) => {
              const isExpense = item.type === "expense";
              return (
                <div
                  key={item.id}
                  className="card p-5 border-[#1F1F2B] hover:border-[#1F1F2B] hover:bg-[#1A1A24] transition-colors rounded-2xl group flex items-start sm:items-center gap-4 cursor-default"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${isExpense
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                    {isExpense ? <Receipt size={20} /> : <HandCoins size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <p className="font-semibold text-base text-[#EAEAF0] truncate pr-4">
                        {isExpense ? (
                          <>
                            <span className="text-white">{item.by_user}</span> added "{item.description}"
                          </>
                        ) : (
                          <>
                            <span className="text-white">{item.by_user}</span> paid <span className="text-white">{item.to_user}</span>
                          </>
                        )}
                      </p>
                      <span className="text-lg font-bold tracking-tight text-[#EAEAF0] flex-shrink-0 text-right">
                        {formatAmount(item.amount, item.currency)}
                        {item.currency !== currency.code && (
                          <div className="text-[9px] text-[#A1A1AA] font-bold uppercase tracking-tighter opacity-50 leading-none mt-1">
                            ≈ {item.currency === 'INR' ? '₹' : 'रु'}{item.amount.toFixed(2)}
                          </div>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#A1A1AA]">
                      <span className="flex items-center gap-1 bg-[#12121A] border border-[#1F1F2B] px-2 py-1 rounded-md text-[#EAEAF0]">
                        <Users size={10} className="text-[#52525B]" />
                        {item.group_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Activity;
