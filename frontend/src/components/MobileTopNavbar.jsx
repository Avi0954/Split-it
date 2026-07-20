import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Search, Bell, User, X,
  Activity, Settings, CreditCard,
  LogOut, ChevronRight, Clock, Users
} from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { logout, getCurrentUser } from '../services/auth';
import api from '../services/api';
import GroupAvatar from './groups/GroupAvatar';
import { useHeader } from '../contexts/HeaderContext';
import { MoreVertical } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const MobileTopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { title: contextTitle, actions } = useHeader();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);
  const pathname = location.pathname;

  // Search and Settings States
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { currency, setCurrency, CURRENCIES } = useCurrency();

  // Search Data & User States
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Goa Trip', 'Avni', 'Dinner']);

  // Detect if current page is a top-level tab (no back button needed)
  const isTopLevelPage = ['/dashboard', '/groups', '/friends', '/activity', '/profile', '/settings'].includes(pathname);

  // Prevent background scrolling when search or settings sheet is open
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (isSearchExpanded || isSettingsSheetOpen) {
      document.body.style.overflow = 'hidden';
      if (mainElement) mainElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      if (mainElement) mainElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      if (mainElement) mainElement.style.overflow = 'auto';
    };
  }, [isSearchExpanded, isSettingsSheetOpen]);

  // Fetch search data & user profile
  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      setUserProfile(user);
    };
    loadData();

    if (isSearchExpanded && groups.length === 0 && friends.length === 0) {
      const fetchSearchData = async () => {
        setIsLoadingSearchData(true);
        try {
          const [groupsRes, friendsRes] = await Promise.all([
            api.get('/groups/'),
            api.get('/friends/')
          ]);
          setGroups(groupsRes.data);
          setFriends(friendsRes.data);
        } catch (err) {
          console.error('[Search Data Error]', err);
        } finally {
          setIsLoadingSearchData(false);
        }
      };
      fetchSearchData();
    }
  }, [isSearchExpanded, groups.length, friends.length]);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleSearchNavigation = (path, name) => {
    setRecentSearches(prev => [name, ...prev.filter(item => item !== name)].slice(0, 5));
    setIsSearchExpanded(false);
    setSearchQuery('');
    navigate(path);
  };

  const normalizedQuery = (searchQuery || "").toLowerCase();
  const filteredGroups = (groups || []).filter(g => (g?.name || "").toLowerCase().includes(normalizedQuery));
  const filteredFriends = (friends || []).filter(f => (f?.name || "").toLowerCase().includes(normalizedQuery));

  return (
    <>
      <nav className="lg:hidden sticky top-0 h-[64px] bg-[#09090B]/90 backdrop-blur-xl border-b border-white/[0.01] z-40 px-6 flex items-center justify-between transition-all duration-300">
        {/* Left Side: Back Button + Branding */}
        <div className="flex items-center gap-4">
          {!isTopLevelPage && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-full text-[#A1A1AA] hover:text-white active:scale-95 transition-all -ml-1"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <span
            className="text-[14px] font-black tracking-[0.12em] uppercase text-white cursor-pointer hover:text-[#A78BFA] transition-colors leading-none"
            onClick={() => navigate('/dashboard')}
          >
            SplitIt
          </span>
        </div>

        {/* Right Side: Profile / Actions */}
        <div className="flex items-center justify-end">
          {!isTopLevelPage && actions && actions.length > 0 ? (
            <div className="relative" ref={actionMenuRef}>
              <button
                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-full text-[#A1A1AA] hover:text-white active:scale-95 transition-all"
              >
                <MoreVertical size={14} />
              </button>
              {isActionMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-[#12121A] border border-white/[0.05] rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          action.onClick();
                          setIsActionMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${action.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-white/[0.03]'
                          }`}
                      >
                        {action.icon && <action.icon size={14} />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => setIsSettingsSheetOpen(true)}
              className="w-8 h-8 bg-gradient-to-br from-[#1F1F2B] to-[#15151F] border border-white/[0.08] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:border-white/20 shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#A78BFA]/10 to-transparent opacity-50" />
              <span className="text-[10px] font-black text-[#A78BFA]">
                {userProfile?.name?.charAt(0).toUpperCase() || <User size={12} />}
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Full Screen Search Overlay */}
      {isSearchExpanded && (
        <div className="fixed inset-0 z-[100] bg-[#09090B] animate-in fade-in duration-200 lg:hidden flex flex-col">
          <div className="h-16 border-b border-[#1F1F2B] px-4 flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setIsSearchExpanded(false);
                setSearchQuery('');
              }}
              className="w-10 h-10 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#EAEAF0] active:scale-95 transition-all shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative flex-1 group h-10">
              <input
                autoFocus
                type="text"
                placeholder="Search groups, friends..."
                className="w-full h-full bg-[#1F1F2B]/30 border-none rounded-xl pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#A78BFA] transition-all font-medium text-[#EAEAF0] placeholder:text-[#A1A1AA]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#EAEAF0]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {!searchQuery ? (
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-3">Recent Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] border border-[#1F1F2B] rounded-lg text-sm text-[#EAEAF0] transition-colors"
                        >
                          <Clock size={12} className="text-[#A1A1AA]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-3">Suggestions</h3>
                  {isLoadingSearchData ? (
                    <div className="space-y-2">
                      <div className="h-12 w-full bg-[#1F1F2B] rounded-xl animate-pulse" />
                      <div className="h-12 w-full bg-[#1F1F2B] rounded-xl animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groups.slice(0, 2).map(group => (
                        <div
                          key={`sugg-g-${group.id}`}
                          onClick={() => handleSearchNavigation(`/groups/${group.id}`, group.name)}
                          className="flex items-center gap-3 p-3 bg-[#1A1A24] rounded-xl active:scale-95 transition-transform"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#09090B] flex items-center justify-center text-[#A78BFA]">
                            <Users size={16} />
                          </div>
                          <span className="text-sm font-semibold text-[#EAEAF0]">{group.name}</span>
                        </div>
                      ))}
                      {friends.slice(0, 2).map(friend => (
                        <div
                          key={`sugg-f-${friend.id}`}
                          onClick={() => handleSearchNavigation(`/friends`, friend.name)}
                          className="flex items-center gap-3 p-3 bg-[#1A1A24] rounded-xl active:scale-95 transition-transform"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#34D399] to-[#10B981] flex items-center justify-center text-black font-bold text-xs shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                            {friend.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-[#EAEAF0]">{friend.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">Live Results</div>
                {isLoadingSearchData ? (
                  <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" /></div>
                ) : filteredGroups.length === 0 && filteredFriends.length === 0 ? (
                  <div className="text-center mt-10">
                    <div className="w-16 h-16 bg-[#1F1F2B]/50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A1A1AA]">
                      <Search size={24} />
                    </div>
                    <p className="text-sm text-[#A1A1AA] font-medium">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGroups.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-2 px-1">Groups</h4>
                        <div className="space-y-1">
                          {filteredGroups.map(group => (
                            <div
                              key={`res-g-${group.id}`}
                              onClick={() => handleSearchNavigation(`/groups/${group.id}`, group.name)}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A24] active:bg-[#1F1F2B] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-[#1F1F2B] flex items-center justify-center text-[#A78BFA]">
                                  <GroupAvatar 
                                    iconName={group.icon_name} 
                                    iconColor={group.icon_color} 
                                    className="w-full h-full" 
                                    size={18} 
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#EAEAF0]">{group.name}</p>
                                  <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">{group.members_count || 1} members</p>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-[#A1A1AA]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {filteredFriends.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-2 px-1 mt-4">Friends</h4>
                        <div className="space-y-1">
                          {filteredFriends.map(friend => (
                            <div
                              key={`res-f-${friend.id}`}
                              onClick={() => handleSearchNavigation(`/friends`, friend.name)}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A24] active:bg-[#1F1F2B] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#34D399] to-[#10B981] flex items-center justify-center text-black font-bold text-sm shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                  {friend.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#EAEAF0]">{friend.name}</p>
                                  <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                                    {friend.balance > 0 ? 'Owes you' : friend.balance < 0 ? 'You owe' : 'Settled'}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-[#A1A1AA]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Bottom Sheet */}
      {isSettingsSheetOpen && (
        <div className="fixed inset-0 z-[120] flex items-end lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsSettingsSheetOpen(false)}
          />
          {/* Sheet */}
          <div className="relative w-full bg-[#09090B] border-t border-white/10 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom duration-400 ease-out">
            {/* Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>

            {/* Content */}
            <div className="p-6 pt-2">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1F1F2B] to-[#15151F] border border-white/[0.08] rounded-2xl flex items-center justify-center font-bold text-2xl text-[#A78BFA] relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#A78BFA]/10 to-transparent opacity-50" />
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h2 className="text-lg font-bold text-white tracking-tight truncate">{userProfile?.name || 'Guest User'}</h2>
                  <p className="text-xs text-white/40 font-medium truncate mb-1">{userProfile?.email || 'premium@splitit.com'}</p>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#A78BFA]/10 text-[#A78BFA] text-[9px] font-bold uppercase tracking-wider">Premium Member</span>
                </div>
                <button
                  onClick={() => setIsSettingsSheetOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.05] rounded-full text-white/20 active:scale-90 transition-all hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Action List */}
              <div className="space-y-1.5">
                {/* Action List */}
                <div className="space-y-2">
                  <button
                    onClick={() => { setIsSettingsSheetOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] text-[#A1A1AA] group-active:text-[#A78BFA] transition-colors">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-white/90">My Profile</span>
                        <span className="text-[10px] font-medium text-white/30 tracking-tight">Manage your account details</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-white/40" />
                  </button>

                  <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] text-[#A1A1AA] group-active:text-[#A78BFA] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-white/90">Dark Mode</span>
                        <span className="text-[10px] font-medium text-white/30 tracking-tight">Customize your appearance</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-400 ease-out flex items-center px-1 outline-none ${isDarkMode
                        ? 'bg-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.3)]'
                        : 'bg-[#1F1F2B] border border-white/5'
                        }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] transform transition-transform duration-400 ease-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  <div className="w-full flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.03] overflow-hidden transition-all">
                    <button
                      onClick={() => setIsCurrencySelectorOpen(!isCurrencySelectorOpen)}
                      className="w-full flex items-center justify-between p-4 active:scale-[0.98] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] text-[#A1A1AA] group-active:text-[#A78BFA] transition-colors">
                          <span className="font-bold text-sm">{currency.symbol}</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-semibold text-white/90">Currency</span>
                          <span className="text-[10px] font-medium text-white/30 tracking-tight">Set your preferred currency</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[11px] font-bold text-white/70">
                        {currency.code}
                        <ChevronRight size={12} className={`opacity-30 transition-transform duration-300 ${isCurrencySelectorOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {isCurrencySelectorOpen && (
                      <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {CURRENCIES.map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              setCurrency(curr);
                              setIsCurrencySelectorOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${currency.code === curr.code
                              ? 'bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA]'
                              : 'bg-white/[0.01] border border-white/[0.03] text-white/50'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-center font-bold">{curr.symbol}</span>
                              <span className="text-xs font-semibold">{curr.name}</span>
                            </div>
                            {currency.code === curr.code && <div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-active:bg-rose-500/20 transition-colors">
                        <LogOut size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-rose-500">Sign Out</span>
                        <span className="text-[10px] font-medium text-rose-500/40 tracking-tight">Securely log out of your session</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-rose-500/20 group-hover:text-rose-500/40" />
                  </button>
                </div>
              </div>

              {/* Safe Area Spacer */}
              <div className="h-8" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopNavbar;
