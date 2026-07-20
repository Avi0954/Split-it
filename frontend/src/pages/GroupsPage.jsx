import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, User, Search, ChevronRight, Receipt, HandCoins, TrendingUp, TrendingDown, Clock, Filter, MoreVertical, PlusCircle, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import CreateGroupModal from '../components/CreateGroupModal';
import SettleUpModal from '../components/SettleUpModal';
import api from '../services/api';
import GroupAvatar from '../components/groups/GroupAvatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { getCurrentUser } from '../services/auth';
import { useSearch } from '../contexts/SearchContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAllRealtimeEvents } from '../hooks/useRealtimeEvents';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ total_balance: 0, total_owed: 0, total_owing: 0, total_groups: 0 });
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleGroup, setSettleGroup] = useState(null);

  const { searchQuery, setSearchQuery } = useSearch();
  const [activeFilter, setActiveFilter] = useState('all'); // all, owe, owed, settled

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currency, formatAmount } = useCurrency();

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsRes, dashRes, actRes, user] = await Promise.all([
        api.get('/groups/'),
        api.get('/dashboard/'),
        api.get('/users/me/activity'),
        getCurrentUser()
      ]);
      setGroups(groupsRes.data);
      setDashboardStats(dashRes.data);
      setActivities(actRes.data);
      setCurrentUser(user);
    } catch (err) {
      console.error('[API Error] Failed to fetch groups:', err);
      showToast('Failed to load groups. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPageData();
    window.addEventListener('EXPENSE_ADDED', fetchPageData);
    return () => window.removeEventListener('EXPENSE_ADDED', fetchPageData);
  }, [fetchPageData]);

  useAllRealtimeEvents((payload) => {
    console.log('Realtime event received, refetching groups page:', payload.type);
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    let result = [...groups];
    const q = (searchQuery || "").trim().toLowerCase();

    if (q) {
      result = result.filter(g => (g.name || "").toLowerCase().includes(q));
    }

    if (activeFilter === 'owe') result = result.filter(g => (g.user_balance || 0) < 0);
    else if (activeFilter === 'owed') result = result.filter(g => (g.user_balance || 0) > 0);
    else if (activeFilter === 'settled') result = result.filter(g => (g.user_balance || 0) === 0);

    setFilteredGroups(result);
  }, [groups, searchQuery, activeFilter]);

  const handleSettleUp = (e, group) => {
    e.stopPropagation();
    setSettleGroup(group);
    setIsSettleModalOpen(true);
  };

  const handleAddExpense = (e, group) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION', {
      detail: { groupId: group.id }
    }));
  };

  const filters = [
    { id: 'all', label: 'All Groups' },
    { id: 'owed', label: 'You are owed' },
    { id: 'owe', label: 'You owe' },
    { id: 'settled', label: 'Settled' },
  ];

  return (
    <Layout>
      {/* Container switches from 1 column on mobile to 2-pane (Main + Right Panel) on Desktop */}
      <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-28 lg:pb-0">

        {/* ========================================================================= */}
        {/* LEFT / CENTER: MAIN CONTENT */}
        {/* ========================================================================= */}
        <div className="flex-1 space-y-6 xl:max-w-[800px] w-full">

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[#EAEAF0] tracking-tight">Your Groups</h2>
            <p className="text-[#A1A1AA] text-sm font-medium">Manage and track all your shared expenses.</p>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Filter groups..."
                className="w-full bg-[#12121A] border border-[#1F1F2B] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#A78BFA] transition-colors font-medium text-[#EAEAF0]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-2 shrink-0 items-center">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 border ${activeFilter === filter.id
                    ? 'bg-[#A78BFA]/10 border-[#A78BFA]/30 text-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.1)]'
                    : 'bg-[#12121A] border-[#1F1F2B] text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#1F1F2B]'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="card rounded-2xl border-[#1F1F2B] h-48 animate-pulse bg-[#12121A]" />
              ))
            ) : (
              <>
                {filteredGroups.map(group => {
                  const isSettled = Math.round(group.user_balance || 0) === 0;
                  return (
                    <div
                      key={group.id}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="premium-card flex flex-col cursor-pointer group h-full"
                    >
                      {/* Subtle Internal Glow */}
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-[#A78BFA]/[0.03] blur-2xl -mr-12 -mt-12 transition-all duration-700 ${isSettled ? 'xl:group-hover:bg-[#A78BFA]/[0.01]' : 'group-hover:bg-[#A78BFA]/[0.06]'
                        }`} />

                      {/* Top Section: Branding & Name */}
                      <div className="p-6 pb-4 xl:pb-2 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-[#09090B] border border-[#1F1F2B] rounded-2xl flex items-center justify-center text-[#A78BFA] shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden relative ${isSettled ? 'xl:group-hover:border-[#1F1F2B]' : 'group-hover:border-[#A78BFA]/40'
                              }`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <GroupAvatar 
                                iconName={group.icon_name} 
                                iconColor={group.icon_color} 
                                className="w-full h-full" 
                                size={22} 
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className={`text-lg font-bold text-white tracking-tight leading-tight truncate pr-4 transition-colors duration-300 ${isSettled ? 'xl:group-hover:text-[#EAEAF0]' : 'group-hover:text-[#A78BFA]'
                                }`}>
                                {group.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]/40" />
                                <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-[0.15em]">
                                  {group.members_count || 1} Members
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Avatars moved higher on desktop */}
                          <div className="hidden xl:flex items-center">
                            <div className="flex">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="avatar-stack-item !w-7 !h-7">
                                  <User size={12} strokeWidth={2.5} />
                                </div>
                              ))}
                              <div className="avatar-stack-item !w-7 !h-7 !bg-[#1F1F2B] !text-[#A1A1AA] !text-[9px]">
                                +{Math.max(0, (group.members_count || 1) - 3)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section: Balance Focal Point & Avatars */}
                      <div className="px-6 py-4 xl:py-1 flex items-center justify-between relative z-10">
                        <div className="flex-1">
                          {isSettled ? (
                            <div className="glass-pill px-3 py-1.5 rounded-full w-fit flex items-center gap-2 border-[#10B981]/10 shadow-sm">
                              <CheckCircle2 size={12} className="text-[#10B981]" />
                              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest text-glow-green">Settled Up</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ${group.user_balance > 0 ? 'text-[#10B981]' : 'text-[#F87171]'
                                }`}>
                                {group.user_balance > 0 ? "You are owed" : "You owe"}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <h3 className={`text-4xl font-bold tracking-tighter transition-all duration-500 group-hover:scale-105 origin-left ${group.user_balance > 0 ? 'text-[#10B981] text-glow-green' : 'text-[#F87171] text-glow-red'
                                  }`}>
                                  {group.user_balance > 0 ? '+' : ''}{formatAmount(group.user_balance)}
                                </h3>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Visual Balance: Avatar Stack (Mobile Only) */}
                        <div className="flex xl:hidden items-center pl-4">
                          <div className="flex">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="avatar-stack-item">
                                <User size={14} strokeWidth={2.5} />
                              </div>
                            ))}
                            <div className="avatar-stack-item !bg-[#1F1F2B] !text-[#A1A1AA]">
                              +{Math.max(0, (group.members_count || 1) - 3)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Activity & Actions */}
                      <div className="mt-auto p-6 pt-2 xl:pt-1 relative z-10">
                        {/* Activity Pill */}
                        <div className="glass-pill px-4 py-2.5 xl:py-2 rounded-xl flex items-center gap-3 mb-5 xl:mb-3.5 bg-white/[0.01] border-white/[0.01] group-hover:bg-white/[0.03] transition-colors duration-500">
                          <div className="w-7 h-7 rounded-full bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                            <Clock size={13} strokeWidth={2} />
                          </div>
                          <p className="text-[11px] font-semibold text-[#A1A1AA] leading-tight truncate group-hover:text-[#EAEAF0] transition-colors">
                            {group.last_activity || "Start splitting bills to see activity"}
                          </p>
                        </div>

                        {/* Action Grid */}
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => handleAddExpense(e, group)}
                            className="btn-vibrant flex-1 py-3.5 xl:py-2.5 rounded-xl flex items-center justify-center gap-2"
                          >
                            <Plus size={16} strokeWidth={3} /> Add Expense
                          </button>
                          {!isSettled && (
                            <button
                              onClick={(e) => handleSettleUp(e, group)}
                              className="btn-glass-outline flex-[1.2] py-3.5 xl:py-2.5 rounded-xl flex items-center justify-center gap-2"
                            >
                              <HandCoins size={16} /> Settle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Create New Group Card */}
                <div
                  onClick={() => setIsCreateModalOpen(true)}
                  className="card p-0 flex flex-col cursor-pointer transition-all duration-300 border-2 border-dashed border-[#1F1F2B] hover:border-[#A78BFA]/50 hover:bg-[#A78BFA]/5 group active:scale-[0.98] min-h-[280px]"
                >
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#12121A] border border-[#1F1F2B] flex items-center justify-center text-[#A1A1AA] mb-4 group-hover:scale-110 group-hover:text-[#A78BFA] group-hover:border-[#A78BFA]/30 transition-all shadow-lg shadow-black/20">
                      <PlusCircle size={28} />
                    </div>
                    <h4 className="text-base font-bold text-[#EAEAF0] mb-2 group-hover:text-white transition-colors">Create New Group</h4>
                    <p className="text-xs text-[#A1A1AA] font-medium">Start a new shared expense tracker with your friends.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: DESKTOP ONLY */}
        {/* ========================================================================= */}
        <div className="hidden xl:flex flex-col w-[320px] shrink-0 gap-6">

          {/* Group Overview */}
          <div className="card p-5 border-[#1F1F2B]">
            <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-4">Group Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#A1A1AA]">Total Groups</span>
                <span className="text-sm font-bold text-[#EAEAF0]">{dashboardStats.total_groups || groups.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#A1A1AA]">Total Owed to You</span>
                <span className="text-sm font-bold text-[#34D399]">{formatAmount(dashboardStats.total_owed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#A1A1AA]">Total You Owe</span>
                <span className="text-sm font-bold text-[#F87171]">{formatAmount(dashboardStats.total_owing)}</span>
              </div>
              <div className="w-full h-px bg-[#1F1F2B]" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#EAEAF0]">Net Balance</span>
                <span className={`text-sm font-bold ${dashboardStats.total_balance > 0 ? 'text-[#34D399]' : dashboardStats.total_balance < 0 ? 'text-[#F87171]' : 'text-[#EAEAF0]'}`}>
                  {dashboardStats.total_balance > 0 ? '+' : ''}{formatAmount(dashboardStats.total_balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION'))} className="bg-[#12121A] border border-[#1F1F2B] hover:bg-[#1A1A24] hover:border-[#A78BFA]/30 rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 group">
              <div className="text-[#A78BFA] group-hover:scale-110 transition-transform"><Receipt size={18} /></div>
              <span className="text-[10px] font-bold text-[#EAEAF0] uppercase tracking-wider">Add Expense</span>
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#12121A] border border-[#1F1F2B] hover:bg-[#1A1A24] hover:border-[#A78BFA]/30 rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 group">
              <div className="text-[#34D399] group-hover:scale-110 transition-transform"><Users size={18} /></div>
              <span className="text-[10px] font-bold text-[#EAEAF0] uppercase tracking-wider">New Group</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="card p-5 border-[#1F1F2B] flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-[#1F1F2B] rounded-xl" />)}
                </div>
              ) : activities.length === 0 ? (
                <p className="text-xs text-[#A1A1AA] italic text-center py-4">No recent activity.</p>
              ) : (
                activities.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${act.type === 'expense' ? 'bg-[#A78BFA]/10 text-[#A78BFA]' : 'bg-[#34D399]/10 text-[#34D399]'}`}>
                      {act.type === 'expense' ? <Receipt size={14} /> : <HandCoins size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#EAEAF0] leading-snug">
                        {act.type === 'expense' ? (
                          <>{act.by_user} added <span className="font-bold">"{act.description}"</span></>
                        ) : (
                          <>{act.by_user} paid <span className="text-[#34D399] font-bold">₹{act.amount.toFixed(2)}</span> to {act.to_user}</>
                        )}
                      </p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5 font-bold uppercase tracking-wider">
                        {act.group_name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate('/activity')}
              className="mt-4 w-full py-2 text-xs font-bold text-[#A1A1AA] hover:text-[#EAEAF0] border-t border-[#1F1F2B] pt-4 transition-colors text-left"
            >
              View All Activity →
            </button>
          </div>
        </div>

        {/* Modals */}
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGroupCreated={fetchPageData}
        />

        {settleGroup && currentUser && (
          <SettleUpModal
            isOpen={isSettleModalOpen}
            onClose={() => setIsSettleModalOpen(false)}
            groupId={settleGroup.id}
            currentUser={currentUser}
            onSettled={fetchPageData}
          />
        )}
      </div>
    </Layout>
  );
};

export default GroupsPage;
