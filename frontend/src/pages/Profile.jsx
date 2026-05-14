import React, { useState, useEffect } from 'react';
import { Mail, Shield, TrendingUp, TrendingDown, Users, ChevronRight, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { getCurrentUser, logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ total_owed: 0, total_owing: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currency, setCurrency, formatAmount, CURRENCIES } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, groupsRes, statsRes] = await Promise.all([
          getCurrentUser(),
          api.get('/groups/'),
          api.get('/dashboard/')
        ]);
        setUser(userData);
        setGroups(groupsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          {/* Skeleton for Profile */}
          <div className="card w-full max-w-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 rounded-3xl border-[#1F1F2B]">
            <div className="w-28 h-28 bg-[#1F1F2B] rounded-full animate-pulse" />
            <div className="space-y-4 flex-1 w-full text-center md:text-left">
              <div className="w-48 h-8 bg-[#1F1F2B] rounded animate-pulse mx-auto md:mx-0" />
              <div className="w-32 h-4 bg-[#1F1F2B] rounded animate-pulse mx-auto md:mx-0" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

        {/* Profile Header Card */}
        <div className="card bg-[#12121A] border border-[#1F1F2B] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="w-28 h-28 bg-[#09090B] rounded-full border border-[#1F1F2B] flex items-center justify-center text-4xl font-bold text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.15)] relative shrink-0">
            {user?.name?.charAt(0) || 'U'}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#A78BFA] border-2 border-[#12121A] rounded-full flex items-center justify-center">
              <Shield size={14} className="text-black" strokeWidth={3} />
            </div>
          </div>

          <div className="text-center md:text-left flex-1 space-y-3">
            <div>
              <h2 className="text-3xl font-bold text-[#EAEAF0] tracking-tight">{user?.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#A1A1AA] text-sm mt-1">
                <Mail size={14} />
                {user?.email}
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] rounded-full text-xs font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse"></span>
              Verified Account
            </div>
          </div>

          <button
            onClick={() => logout(navigate)}
            className="btn-ghost border border-[#1F1F2B] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Financial Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card border-[#1F1F2B] bg-[#12121A] p-6 rounded-2xl group hover:border-[#A78BFA]/30 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#A1A1AA] text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Total Receivables</p>
                <h3 className="text-3xl font-bold text-[#A78BFA] tracking-tight">{formatAmount(stats.total_owed)}</h3>
              </div>
              <div className="p-3 bg-[#09090B] border border-[#1F1F2B] text-[#A78BFA] rounded-xl group-hover:scale-[1.05] transition-transform">
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="card border-[#1F1F2B] bg-[#12121A] p-6 rounded-2xl group hover:border-[#A78BFA]/30 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#A1A1AA] text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Total Liabilities</p>
                <h3 className="text-3xl font-bold text-[#EAEAF0] tracking-tight">{formatAmount(stats.total_owing)}</h3>
              </div>
              <div className="p-3 bg-[#09090B] border border-[#1F1F2B] text-[#EAEAF0] rounded-xl group-hover:scale-[1.05] transition-transform">
                <TrendingDown size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="card bg-[#12121A] border border-[#1F1F2B] p-6 rounded-2xl space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight">Display Currency</h3>
              <p className="text-[#A1A1AA] text-sm font-medium">Choose your preferred currency for all financial views.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr)}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 group ${
                  currency.code === curr.code
                    ? 'bg-[#A78BFA]/10 border-[#A78BFA] text-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.1)]'
                    : 'bg-[#09090B] border-[#1F1F2B] text-[#A1A1AA] hover:border-[#1F1F2B]/80 hover:bg-[#12121A]'
                }`}
              >
                <span className="text-2xl font-bold mb-1 group-hover:scale-110 transition-transform">{curr.symbol}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{curr.name}</span>
                <span className="text-[10px] opacity-40 mt-0.5">({curr.code})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Associated Groups */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight">Your Groups</h3>
            <span className="text-[#A1A1AA] text-sm font-medium bg-[#1F1F2B] px-2 py-0.5 rounded-lg">{groups.length} active</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="card p-4 flex items-center justify-between cursor-pointer hover:bg-[#1A1A24] border-[#1F1F2B] transition-all duration-200 rounded-xl group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#09090B] border border-[#1F1F2B] rounded-lg flex items-center justify-center text-[#A78BFA] group-hover:shadow-[0_0_15px_rgba(167,139,250,0.15)] transition-shadow">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#EAEAF0] text-base">{group.name}</h4>
                    <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">{group.members_count || 1} members</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#A1A1AA] group-hover:text-[#EAEAF0] transition-colors" />
              </div>
            ))}

            {groups.length === 0 && (
              <div className="card py-16 flex flex-col items-center justify-center text-center bg-transparent border-dashed border-[#1F1F2B]">
                <span className="text-4xl mb-4 inline-block">🚀</span>
                <p className="text-[#A1A1AA] text-sm font-medium mb-4">You aren't in any groups yet.</p>
                <button
                  onClick={() => navigate('/groups')}
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Create or join a group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
