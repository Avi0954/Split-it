import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Search, Bell, User, X, Menu, Home,
  Users, Activity, Settings, CreditCard, Sliders,
  HelpCircle, UserPlus, LogOut, ChevronRight, Clock
} from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { logout, getCurrentUser } from '../services/auth';
import api from '../services/api';
import { useHeader } from '../contexts/HeaderContext';
import { MoreVertical } from 'lucide-react';

const MobileTopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const { title: contextTitle, actions } = useHeader();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);
  const pathname = location.pathname;

  // Drawer and Search States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Search Data & User States
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingSearchData, setIsLoadingSearchData] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Goa Trip', 'Avni', 'Dinner']);

  // Swipe Gesture Ref
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  // Detect if current page is the Dashboard (Home)
  const isHomePage = pathname === '/dashboard';

  // Helper to get page title based on route
  const getPageTitle = () => {
    if (contextTitle) return contextTitle;
    const titles = {
      '/dashboard': 'Dashboard',
      '/groups': 'Groups',
      '/activity': 'Activity',
      '/profile': 'Profile',
      '/friends': 'Friends',
      '/settings': 'Settings'
    };
    if (pathname.includes('/groups/')) return 'Group Details';
    return titles[pathname] || 'SplitIt';
  };

  // Prevent background scrolling when search or drawer is open
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (isSearchExpanded || isDrawerOpen) {
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
  }, [isSearchExpanded, isDrawerOpen]);

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

  // Swipe handlers
  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      setIsDrawerOpen(false);
    }
  };

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

  const DrawerLink = ({ icon: Icon, label, path, onClick, danger }) => {
    const isActive = pathname === path;
    return (
      <div
        onClick={() => {
          if (onClick) onClick();
          else if (path) {
            navigate(path);
            setIsDrawerOpen(false);
          }
        }}
        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] relative group ${isActive
          ? 'bg-[#A78BFA]/10 text-[#A78BFA]'
          : danger
            ? 'hover:bg-rose-500/10 text-rose-500'
            : 'hover:bg-[#1A1A24] text-[#EAEAF0]'
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#A78BFA] rounded-r-full" />
        )}
        <div className="flex items-center gap-3">
          <Icon size={20} className={isActive ? 'text-[#A78BFA]' : danger ? 'text-rose-500' : 'text-[#A1A1AA]'} />
          <span className="font-semibold text-sm">{label}</span>
        </div>
        {!danger && <ChevronRight size={14} className={isActive ? 'text-[#A78BFA]' : 'text-[#1F1F2B] group-hover:text-[#A1A1AA] transition-colors'} />}
      </div>
    );
  };

  return (
    <>
      <nav className="lg:hidden relative h-16 bg-[#09090B]/90 backdrop-blur-xl border-b border-[#1F1F2B] z-40 px-4 flex items-center justify-between transition-all duration-300 shadow-md">
        {!isHomePage && !['/groups', '/friends', '/activity', '/profile', '/settings'].includes(pathname) ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#EAEAF0] active:scale-95 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-bold text-[#EAEAF0] tracking-tight truncate px-2">
              {getPageTitle()}
            </h1>
            
            {/* Contextual Action Menu */}
            <div className="relative" ref={actionMenuRef}>
              {actions && actions.length > 0 ? (
                <>
                  <button
                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#EAEAF0] active:scale-95 transition-all"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {isActionMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#12121A] border border-[#1F1F2B] rounded-2xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        {actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              action.onClick();
                              setIsActionMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                              action.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#1F1F2B]'
                            }`}
                          >
                            {action.icon && <action.icon size={16} />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#EAEAF0] active:scale-95 transition-all"
              >
                <Menu size={20} />
              </button>
              <span className="text-lg font-extrabold tracking-tight text-[#EAEAF0] hidden sm:block ml-1">SplitIt</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#EAEAF0] active:scale-95 transition-all bg-[#1F1F2B]/50 hover:bg-[#1F1F2B]"
              >
                <Search size={18} />
              </button>


              <div
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <User size={18} className="text-black" />
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Slide-in Hamburger Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div
            className="relative w-[85%] max-w-xs h-full bg-[#09090B] border-r border-[#1F1F2B] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Header: User Profile */}
            <div className="p-6 border-b border-[#1F1F2B] relative">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-6 right-4 w-9 h-9 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#A1A1AA] active:scale-95 transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] rounded-2xl flex items-center justify-center font-bold text-2xl text-black shadow-[0_8px_20px_rgba(167,139,250,0.3)]">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#EAEAF0] tracking-tight">{userProfile?.name || 'Guest User'}</h2>
                  <p className="text-xs text-[#A1A1AA] font-medium truncate">{userProfile?.email || 'Sign in to manage groups'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar pb-24">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-3 mb-2 opacity-50">Main</p>
                <DrawerLink icon={Home} label="Dashboard" path="/dashboard" />
                <DrawerLink icon={Users} label="Groups" path="/groups" />
                <DrawerLink icon={UserPlus} label="Friends" path="/friends" />
                <DrawerLink icon={Activity} label="Activity" path="/activity" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-3 mb-2 opacity-50">Account</p>
                <DrawerLink icon={Settings} label="Settings" path="/settings" />
                <DrawerLink icon={CreditCard} label="Payments" />
                <DrawerLink icon={Sliders} label="Preferences" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-3 mb-2 opacity-50">Support</p>
                <DrawerLink icon={HelpCircle} label="Help & Support" />
                <DrawerLink icon={UserPlus} label="Invite Friends" />
              </div>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-[#1F1F2B]">
              <DrawerLink icon={LogOut} label="Log Out" onClick={handleLogout} danger />
            </div>
          </div>
        </div>
      )}

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
                                  {group.avatar ? (
                                    <img src={`http://localhost:8000${group.avatar}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                  ) : <Users size={18} />}
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
    </>
  );
};

export default MobileTopNavbar;
