import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Plus, Users, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/auth';
import CreateGroupModal from './CreateGroupModal';

const TopNavbar = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('desktop-search').focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddExpense = () => {
    window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION'));
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <>
      <header className="hidden lg:flex fixed top-0 left-0 w-full h-[72px] items-center justify-between bg-[#09090B]/80 backdrop-blur-xl border-b border-[#1F1F2B] z-50 px-6">

        {/* Left: Logo */}
        <div className="flex items-center gap-3 w-64 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] rounded-xl flex items-center justify-center font-bold text-lg text-black shadow-[0_0_15px_rgba(167,139,250,0.3)]">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-[#EAEAF0]">SplitIt</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl px-4">
          <div className="relative group flex items-center">
            <Search className="absolute left-4 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors duration-200" size={18} />
            <input
              id="desktop-search"
              type="text"
              placeholder="Search for groups, friends or expenses..."
              className="w-full bg-[#12121A] border border-[#1F1F2B] rounded-2xl pl-11 pr-14 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A78BFA]/50 focus:border-[#A78BFA]/50 transition-all duration-300 font-medium placeholder:text-[#A1A1AA] text-[#EAEAF0] shadow-[0_2px_10px_rgba(0,0,0,0.2)] group-focus-within:shadow-[0_4px_20px_rgba(167,139,250,0.1)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 flex items-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#A1A1AA] bg-[#1F1F2B] px-1.5 py-0.5 rounded uppercase tracking-wider">⌘K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-5 shrink-0">

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="h-[38px] px-3 flex items-center gap-2 rounded-xl text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#12121A] border border-transparent hover:border-[#1F1F2B] transition-all font-semibold text-xs active:scale-95"
              title="Create Group"
            >
              <Users size={16} />
              <span>New Group</span>
            </button>
            <button
              onClick={handleAddExpense}
              className="h-[38px] px-4 flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-[#A78BFA] to-indigo-500 text-black font-bold text-xs shadow-[0_4px_15px_rgba(167,139,250,0.25)] hover:shadow-[0_6px_20px_rgba(167,139,250,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="w-px h-6 bg-[#1F1F2B] mx-1" />

          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-[#12121A] transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(167,139,250,0.2)]">
                <User size={18} className="text-black" />
              </div>
              <ChevronDown size={14} className={`text-[#A1A1AA] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-[#09090B] border border-[#1F1F2B] rounded-2xl shadow-2xl shadow-black overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#12121A] transition-colors">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#12121A] transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="w-full h-px bg-[#1F1F2B] my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={() => { }}
      />
    </>
  );
};

export default TopNavbar;
