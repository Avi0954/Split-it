import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, Receipt, HandCoins, TrendingUp, Filter, CheckCircle2, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '../components/Layout';
import CreateGroupModal from '../components/CreateGroupModal';
import api from '../services/api';
import GroupAvatar from '../components/groups/GroupAvatar';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { useToast } from '../contexts/ToastContext';
import { useSearch } from '../contexts/SearchContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAllRealtimeEvents } from '../hooks/useRealtimeEvents';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ total_balance: 0, total_owed: 0, total_owing: 0, total_groups: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { searchQuery } = useSearch();
  const { formatAmount } = useCurrency();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [userProfile, groupsRes, dashboardRes, activityRes] = await Promise.all([
        getCurrentUser(),
        api.get('/groups/'),
        api.get('/dashboard/'),
        api.get('/users/me/activity')
      ]);
      setUser(userProfile);
      setGroups(groupsRes.data);
      setDashboardStats(dashboardRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error('[API Error] Dashboard sync failed:', err);
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('EXPENSE_ADDED', fetchDashboardData);
    return () => window.removeEventListener('EXPENSE_ADDED', fetchDashboardData);
  }, [fetchDashboardData]);

  useAllRealtimeEvents((payload) => {
    console.log('Realtime event received, refetching dashboard:', payload.type);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredGroups = (groups || []).filter(group =>
    (group.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const topGroups = filteredGroups.slice(0, 4);

  return (
    <Layout>
      {/* Container switches from 1 column on mobile to 3 columns on Desktop */}
      <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-28 lg:pb-0">

        {/* ========================================================================= */}
        {/* LEFT / CENTER: MAIN CONTENT (Cards + Groups) */}
        {/* ========================================================================= */}
        <div className="flex-1 space-y-8 xl:max-w-[800px] w-full">

          {/* Greeting */}
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#EAEAF0] tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-[#A1A1AA] text-sm font-medium">Here is your financial overview.</p>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Balance (Primary) */}
            <div className="premium-card relative p-6 border-0 bg-gradient-to-br from-[#1E1B4B] to-[#09090B] shadow-[0_12px_40px_rgba(0,0,0,0.5)] group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A78BFA]/10 blur-3xl rounded-full group-hover:bg-[#A78BFA]/20 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div>
                  <p className="text-[#A78BFA] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 opacity-80">Total Balance</p>
                  {loading ? (
                    <div className="h-10 w-32 bg-[#A78BFA]/20 rounded-xl animate-pulse" />
                  ) : (
                    <div className="space-y-1.5">
                      <h3 className="text-4xl font-bold text-white tracking-tighter leading-none">
                        {formatAmount(dashboardStats.total_balance)}
                      </h3>
                      <p className="text-[#C4B5FD] text-xs font-semibold opacity-60">
                        {dashboardStats.total_balance > 0
                          ? 'You are owed overall'
                          : dashboardStats.total_balance < 0
                            ? 'You owe overall'
                            : 'You are all settled up!'}
                      </p>
                    </div>
                  )}
                </div>
                {dashboardStats.total_balance >= 0 ? (
                  <div className="flex items-center gap-2 text-[#C4B5FD] text-[10px] font-bold bg-[#A78BFA]/10 w-fit px-3 py-1.5 rounded-lg border border-[#A78BFA]/10">
                    <TrendingUp size={12} strokeWidth={3} />
                    LOOKING GOOD
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-300 text-[10px] font-bold bg-rose-500/10 w-fit px-3 py-1.5 rounded-lg border border-rose-500/10">
                    <ArrowUpRight size={12} strokeWidth={3} />
                    TIME TO PAY BACK
                  </div>
                )}
              </div>
            </div>

            {/* You are owed (Green) */}
            <div className="card p-5 flex flex-col justify-between group h-full">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">You are owed</p>
                  <div className="w-8 h-8 bg-[#34D399]/10 rounded-xl flex items-center justify-center group-hover:bg-[#34D399]/20 group-hover:scale-110 transition-all duration-300">
                    <ArrowDownLeft className="text-[#34D399]" size={16} strokeWidth={2.5} />
                  </div>
                </div>
                {loading ? (
                  <div className="h-8 w-24 bg-[#1F1F2B] rounded-lg animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-[#34D399] tracking-tight leading-none mb-2">{formatAmount(dashboardStats.total_owed)}</h3>
                    <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest opacity-40">From your friends</p>
                  </div>
                )}
              </div>
            </div>

            {/* You owe (Red) */}
            <div className="card p-5 flex flex-col justify-between group h-full">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">You owe</p>
                  <div className="w-8 h-8 bg-[#F87171]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F87171]/20 group-hover:scale-110 transition-all duration-300">
                    <ArrowUpRight className="text-[#F87171]" size={16} strokeWidth={2.5} />
                  </div>
                </div>
                {loading ? (
                  <div className="h-8 w-24 bg-[#1F1F2B] rounded-lg animate-pulse" />
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-[#F87171] tracking-tight leading-none mb-2">{formatAmount(dashboardStats.total_owing)}</h3>
                    <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest opacity-40">Across your groups</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Smart Insights */}
          {!loading && activities.length > 0 && (
            <div className="flex items-center gap-3 px-1 py-2 text-sm">
              <div className="w-1 h-4 bg-[#A78BFA] rounded-full" />
              <p className="text-[#A1A1AA]">
                Insight: You have <strong className="text-[#EAEAF0]">{activities.length} recent activities</strong> waiting to be reviewed.
              </p>
            </div>
          )}

          {/* Recent Groups List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight">
                Recent Groups
              </h3>
              <button
                onClick={() => navigate('/groups')}
                className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors flex items-center"
              >
                View all <ChevronRight size={14} className="ml-0.5" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="card p-4 flex gap-4 h-24 border-[#1F1F2B] animate-pulse">
                    <div className="w-12 h-12 bg-[#1F1F2B] rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#1F1F2B] rounded w-1/2" />
                      <div className="h-3 bg-[#1F1F2B] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="card py-12 flex flex-col items-center justify-center text-center bg-transparent border-dashed border-[#1F1F2B]">
                <h3 className="text-[#EAEAF0] font-semibold mb-1">No groups yet</h3>
                <p className="text-[#A1A1AA] text-xs mb-4">Create a group to start splitting bills easily.</p>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary py-1.5 px-4 text-xs rounded-lg">
                  Create Group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="premium-card flex flex-col cursor-pointer group h-full"
                  >
                    {/* Subtle Internal Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#A78BFA]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#A78BFA]/10 transition-all duration-700" />

                    <div className="p-5 flex flex-col justify-between h-full relative z-10">
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-[#09090B] rounded-xl flex items-center justify-center text-[#A78BFA] border border-[#1F1F2B] overflow-hidden group-hover:scale-110 group-hover:border-[#A78BFA]/30 transition-all duration-500 relative shadow-xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <GroupAvatar 
                                iconName={group.icon_name} 
                                iconColor={group.icon_color} 
                                className="w-full h-full" 
                                size={20} 
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#EAEAF0] text-sm leading-tight group-hover:text-[#A78BFA] transition-colors truncate pr-2">{group.name}</h4>
                              <p className="text-[10px] text-[#A1A1AA] mt-1 font-bold uppercase tracking-widest opacity-40">
                                {group.members_count || 1} members
                              </p>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#1F1F2B]/30 group-hover:bg-[#A78BFA]/10 transition-colors">
                            <ChevronRight size={14} className="text-[#A1A1AA] group-hover:text-[#A78BFA] transition-all transform group-hover:translate-x-0.5" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-5">
                          <div className="flex-1">
                            {Math.round(group.user_balance || 0) === 0 ? (
                              <div className="glass-pill px-3 py-1 rounded-lg w-fit border-[#34D399]/20 shadow-[0_0_15px_rgba(52,211,153,0.05)]">
                                <span className="text-[9px] font-bold text-[#34D399] uppercase tracking-[0.2em] text-glow-green">Settled ✓</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ${group.user_balance > 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                                  }`}>
                                  {group.user_balance > 0 ? 'You get back' : 'You owe'}
                                </p>
                                <div className="flex items-baseline gap-1 max-w-full overflow-hidden">
                                  <span className={`text-2xl font-bold tracking-tighter truncate ${group.user_balance > 0 ? 'text-[#34D399] text-glow-green' : 'text-[#F87171] text-glow-red'
                                    }`}>
                                    {group.user_balance > 0 ? '+' : ''}{formatAmount(group.user_balance)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Visual Balance: Mini Avatar Stack */}
                          <div className="flex -space-x-2">
                            {[1, 2].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#09090B] bg-[#12121A] flex items-center justify-center text-[8px] font-bold text-white shadow-md">
                                <User size={10} strokeWidth={3} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="glass-pill px-3 py-2 rounded-xl flex items-center gap-2 group-hover:bg-white/[0.05] transition-colors duration-300 border-white/[0.03]">
                        <Clock size={10} className="text-[#A78BFA]/60" strokeWidth={3} />
                        <p className="text-[10px] text-[#A1A1AA] font-bold leading-tight truncate opacity-80 group-hover:opacity-100 transition-opacity">
                          {group.last_activity || "No activity yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: INSIGHTS & ACTIVITY */}
        {/* ========================================================================= */}
        <div className="xl:w-[320px] w-full flex flex-col gap-6 shrink-0 lg:pb-0">

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION'))} className="xl:hidden bg-[#12121A] hover:bg-[#1A1A24] border border-[#1F1F2B] rounded-xl p-3 flex flex-col items-center gap-2 transition-colors active:scale-95 group">
              <div className="w-8 h-8 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center group-hover:bg-[#A78BFA] group-hover:text-black transition-colors">
                <Receipt size={16} />
              </div>
              <span className="text-[10px] font-bold text-[#EAEAF0] uppercase tracking-wider">Add Expense</span>
            </button>
            <button onClick={() => navigate('/friends')} className="xl:col-span-2 bg-[#12121A] hover:bg-[#1A1A24] border border-[#1F1F2B] rounded-xl p-3 xl:py-2 xl:px-5 flex flex-col items-center gap-2 xl:gap-1 transition-colors active:scale-95 group">
              <div className="w-8 h-8 rounded-full bg-[#34D399]/10 text-[#34D399] flex items-center justify-center group-hover:bg-[#34D399] group-hover:text-black transition-colors">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-[10px] font-bold text-[#EAEAF0] uppercase tracking-wider">Settle Up</span>
            </button>
          </div>

          {/* Spending Overview Donut Chart */}
          <div className="card p-5 border-[#1F1F2B]">
            <h3 className="text-xs font-bold text-[#A1A1AA] mb-4 uppercase tracking-wider flex items-center gap-2">
              <PieChart size={14} /> Spending Overview
            </h3>
            <div className="h-[180px] w-full relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#A78BFA]/20 animate-spin" />
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardStats.spending_by_category || {}).map(([name, value], index) => ({
                          name,
                          value,
                          color: ['#A78BFA', '#34D399', '#F472B6', '#60A5FA', '#FBBF24'][index % 5]
                        }))}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {Object.entries(dashboardStats.spending_by_category || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#A78BFA', '#34D399', '#F472B6', '#60A5FA', '#FBBF24'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1F1F2B', borderRadius: '8px' }}
                        itemStyle={{ color: '#EAEAF0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2">
                    <p className="text-[#A1A1AA] text-[9px] uppercase font-bold tracking-[0.2em] mb-0.5 opacity-60">Total</p>
                    <p className="text-[#EAEAF0] font-bold text-sm md:text-base tracking-tight text-center w-full max-w-[80px] leading-tight break-words">
                      {formatAmount(dashboardStats.total_spending)}
                    </p>
                  </div>
                </>
              )}
            </div>
            {/* Legend */}
            <div className="mt-2 space-y-2">
              {!loading && Object.entries(dashboardStats.spending_by_category || {}).slice(0, 3).map(([name, value], index) => (
                <div key={name} className="flex items-center justify-between text-xs min-w-0 gap-2">
                  <div className="flex items-center gap-2 text-[#A1A1AA] font-medium min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ['#A78BFA', '#34D399', '#F472B6', '#60A5FA', '#FBBF24'][index % 5] }} />
                    <span className="truncate">{name}</span>
                  </div>
                  <span className="text-[#EAEAF0] font-bold shrink-0">{formatAmount(value)}</span>
                </div>
              ))}
              {!loading && Object.keys(dashboardStats.spending_by_category || {}).length === 0 && (
                <p className="text-[10px] text-[#A1A1AA] italic text-center py-2 opacity-50">No spending data yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-5 border-[#1F1F2B] flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Recent Activity</h3>
              <button className="text-[#A1A1AA] hover:text-[#EAEAF0]"><Filter size={14} /></button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 h-10 w-full animate-pulse bg-[#1F1F2B] rounded-xl" />
                ))
              ) : activities.length === 0 ? (
                <p className="text-xs text-[#A1A1AA] italic text-center py-4">No recent activity found.</p>
              ) : (
                activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 group py-1">
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${act.type === 'expense' ? 'bg-[#A78BFA]/10 text-[#A78BFA]' : 'bg-[#34D399]/10 text-[#34D399]'}`}>
                      {act.type === 'expense' ? <Receipt size={14} /> : <HandCoins size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#EAEAF0] leading-snug truncate">
                        {act.type === 'expense' ? (
                          <>{act.by_user} added <span className="text-white font-bold">"{act.description}"</span></>
                        ) : (
                          <>{act.by_user} paid <span className="text-[#34D399] font-bold">{formatAmount(act.amount)}</span> to {act.to_user}</>
                        )}
                      </p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5 font-bold uppercase tracking-widest opacity-40">
                        {new Date(act.created_at).toLocaleDateString()} • {act.group_name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/activity')}
              className="mt-4 w-full py-2 text-xs font-bold text-[#A1A1AA] hover:text-[#EAEAF0] border-t border-[#1F1F2B] pt-4 transition-colors"
            >
              View All Activity
            </button>
          </div>

        </div>

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGroupCreated={fetchDashboardData}
        />
      </div>
    </Layout>
  );
};


export default Dashboard;
