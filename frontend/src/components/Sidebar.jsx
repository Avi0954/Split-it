import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Clock, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { logout, getCurrentUser } from '../services/auth';
import { useCurrency } from '../contexts/CurrencyContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      setUserProfile(user);
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryMenuItems = [
    { icon: <Home size={18} strokeWidth={2.2} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={18} strokeWidth={2.2} />, label: 'Groups', path: '/groups' },
    { icon: <User size={18} strokeWidth={2.2} />, label: 'Friends', path: '/friends' },
    { icon: <Clock size={18} strokeWidth={2.2} />, label: 'Activity', path: '/activity' },
  ];

  const renderNavLinks = (items) => (
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 relative group
            ${isActive
              ? 'bg-white/[0.04] text-[#A78BFA] shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/[0.02]'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#A78BFA] rounded-r-full shadow-[2px_0_8px_rgba(167,139,250,0.4)]" />
              )}
              <span className={`transition-all duration-300 ${isActive ? 'text-[#A78BFA]' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105 group-hover:text-[#A78BFA]/70'}`}>
                {item.icon}
              </span>
              <span className={`text-[14px] tracking-tight transition-all duration-300 ${isActive ? 'font-bold' : 'font-semibold group-hover:translate-x-0.5'}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-60 fixed left-0 bg-[#09090B]/40 backdrop-blur-md border-r border-white/[0.05] p-4 z-40 h-[calc(100vh-64px)] top-[64px] transition-all duration-300">
      <nav className="flex-1 overflow-y-auto no-scrollbar pb-4 mt-2">
        <div>
          <p className="px-4 text-[11px] font-extrabold text-white/40 uppercase tracking-[0.1em] mb-2.5">Platform</p>
          {renderNavLinks(primaryMenuItems)}
        </div>
      </nav>

      {/* Profile Section at Bottom */}
      <div className="mt-auto pt-4 border-t border-white/[0.05] relative px-0.5" ref={dropdownRef}>
        {/* Compact User Section Trigger */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all duration-300 group ${isDropdownOpen ? 'bg-white/[0.06] shadow-sm' : 'hover:bg-white/[0.03]'
            }`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#1F1F2B] to-[#15151F] border border-white/[0.05] rounded-lg flex items-center justify-center font-bold text-xs text-[#A78BFA] shrink-0 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#A78BFA]/10 to-transparent opacity-50" />
            {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-[13.5px] font-bold text-white truncate group-hover:text-[#A78BFA] transition-colors leading-tight">{userProfile?.name || 'Avi'}</p>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-tight">Free Account</p>
          </div>
          <ChevronDown size={14} className={`text-white/20 transition-all duration-300 ${isDropdownOpen ? 'rotate-180 text-[#A78BFA]' : 'group-hover:text-white/40'}`} />
        </button>

        {/* Lightweight Utility Dropdown */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-1.5 w-full bg-[#09090B]/95 border border-white/[0.08] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100] backdrop-blur-xl">
            <div className="p-1 space-y-0.5">

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-[#A1A1AA] group-hover:text-white transition-colors" />
                  <span className="text-[13px] font-semibold text-[#EAEAF0]">Profile</span>
                </div>
              </button>

              <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A1A1AA] group-hover:text-white transition-colors"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                  <span className="text-[13px] font-semibold text-[#EAEAF0]">Dark Mode</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative w-8 h-4.5 rounded-full transition-all duration-300 ease-out flex items-center p-0.5 outline-none ${isDarkMode 
                    ? 'bg-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.3)]' 
                    : 'bg-[#1F1F2B] border border-white/5'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-out ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Currency Accordion */}
              <div className="w-full flex flex-col">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 text-center font-bold text-sm text-[#A1A1AA] group-hover:text-[#A78BFA] transition-colors">{currency.symbol}</span>
                    <span className="text-[13px] font-semibold text-[#EAEAF0]">Currency</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-[#A1A1AA]">{currency.code}</span>
                    <ChevronDown size={12} className={`text-white/20 transition-transform duration-300 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isCurrencyDropdownOpen && (
                  <div className="px-2 pb-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr);
                          setIsCurrencyDropdownOpen(false);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${currency.code === curr.code
                          ? 'text-[#A78BFA] bg-[#A78BFA]/10 font-semibold'
                          : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] font-medium'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-4 text-center">{curr.symbol}</span>
                          <span>{curr.name}</span>
                        </div>
                        {currency.code === curr.code && <div className="w-1 h-1 rounded-full bg-[#A78BFA]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-white/[0.04] my-0.5" />

              <button
                onClick={() => logout(navigate)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10 transition-colors group"
              >
                <LogOut size={14} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-[13px] font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
