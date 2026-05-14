import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Search, User } from 'lucide-react';
import MobileTopNavbar from './MobileTopNavbar';
import { useSearch } from '../contexts/SearchContext';
import TopNavbar from './TopNavbar';
import AddExpenseModal from './AddExpenseModal';

const Layout = ({ children }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [addModalProps, setAddModalProps] = useState({});

  useEffect(() => {
    const handleAddAction = (e) => {
      if (e.detail) {
        setAddModalProps(e.detail);
      } else {
        setAddModalProps({});
      }
      setIsGlobalAddOpen(true);
    };
    window.addEventListener('OPEN_ADD_ACTION', handleAddAction);
    return () => window.removeEventListener('OPEN_ADD_ACTION', handleAddAction);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row bg-[#09090B] h-screen overflow-hidden text-[#EAEAF0] font-sans selection:bg-[#A78BFA]/30">

      {/* 1. DESKTOP TOP NAVBAR */}
      <TopNavbar />

      {/* 2. MOBILE TOP NAVBAR (Contextual) */}
      <div className="lg:hidden shrink-0 z-[100]">
        <MobileTopNavbar />
      </div>

      {/* 3. DESKTOP SIDEBAR (Strict Visibility) */}
      <div className="hidden lg:block fixed left-0 top-[64px] h-[calc(100vh-64px)] z-40">
        <Sidebar />
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto transition-all duration-300 flex flex-col lg:ml-60 lg:mt-[64px] no-scrollbar">
        {/* PAGE CONTENT WINDOW */}
        <div className="px-6 lg:px-10 py-4 lg:py-8 max-w-[1400px] mx-auto w-full flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION (Strict Visibility) */}
      <div className="lg:hidden z-50">
        <BottomNav />
      </div>

      {/* GLOBAL ADD EXPENSE MODAL */}
      <AddExpenseModal
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        initialGroupId={addModalProps?.groupId}
        initialMembers={addModalProps?.members || []}
        editExpense={addModalProps?.editExpense}
        onExpenseAdded={() => {
          window.dispatchEvent(new CustomEvent('EXPENSE_ADDED'));
        }}
      />
    </div>
  );
};

export default Layout;
