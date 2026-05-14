import React, { useState, useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { useNavigate, Link } from 'react-router-dom';
import CreateGroupModal from './CreateGroupModal';

const TopNavbar = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      <header className="hidden lg:flex fixed top-0 left-0 w-full h-[64px] bg-[#09090B]/80 backdrop-blur-md border-b border-white/[0.05] z-50">
        <div className="max-w-[1400px] mx-auto w-full px-8 flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center w-[200px] lg:w-60 shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-all group">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#A78BFA] to-[#8B5CF6] rounded-lg flex items-center justify-center shadow-lg shadow-[#A78BFA]/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-black font-black text-xs">S</span>
              </div>
              <span className="text-[22px] font-extrabold tracking-tight text-white">SplitIt</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-[320px] px-4">
            <div className="relative group flex items-center">
              <Search className="absolute left-3.5 text-white/40 group-focus-within:text-[#A78BFA] transition-colors duration-300" size={14} />
              <input
                id="desktop-search"
                type="text"
                placeholder="Search..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-12 py-1.5 text-[13px] focus:outline-none focus:border-[#A78BFA]/30 focus:bg-white/[0.05] transition-all duration-300 font-medium placeholder:text-white/20 text-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 flex items-center pointer-events-none opacity-40">
                <span className="text-[9px] font-bold text-white/30 border border-white/[0.1] px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/[0.02]">⌘K</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="h-8 px-4 flex items-center gap-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all font-semibold text-[12px] active:scale-95 border border-transparent hover:border-white/[0.05]"
            >
              <Users size={14} />
              <span>New Group</span>
            </button>
            <button
              onClick={handleAddExpense}
              className="h-8 px-5 flex items-center gap-2 rounded-xl bg-[#A78BFA] text-black font-bold text-[12px] uppercase tracking-wider shadow-[0_0_20px_rgba(167,139,250,0.15)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(167,139,250,0.25)] active:scale-95 transition-all duration-300"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add Expense</span>
            </button>
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
