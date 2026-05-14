import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Plus, Clock, User } from 'lucide-react';

const BottomNav = () => {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Groups', path: '/groups', icon: Users },
    { label: 'Add', isAction: true },
    { label: 'Friends', path: '/friends', icon: User },
    { label: 'Activity', path: '/activity', icon: Clock },
  ];

  const handleAddAction = () => {
    window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION'));
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center px-4 z-50 pointer-events-none">
      <nav className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl w-full max-w-md pointer-events-auto transition-all duration-300">
        {navItems.map((item, index) => {
          if (item.isAction) {
            return (
              <div key="add-action" className="relative -top-6">
                <button
                  onClick={handleAddAction}
                  className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] text-black shadow-[0_4px_15px_rgba(167,139,250,0.3)] transition-all duration-300 hover:scale-105 active:scale-90 hover:rotate-90 z-10"
                >
                  <Plus size={26} strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-full bg-[#A78BFA]/10 blur-md group-hover:blur-lg transition-all -z-10" />
                </button>
              </div>
            );
          }

          const { path, label, icon: Icon } = item;
          return (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) => `
                group flex flex-col items-center justify-center p-2 w-16 transition-all duration-200 active:scale-90
                ${isActive ? 'text-[#A78BFA]' : 'text-[#A1A1AA] hover:text-[#EAEAF0]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-all duration-300 rounded-2xl p-1.5 ${isActive ? 'bg-[#A78BFA]/10 shadow-[0_0_15px_rgba(167,139,250,0.15)]' : 'bg-transparent'}`}>
                    <Icon
                      size={22}
                      className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    />
                  </div>
                  <span className={`text-[9px] mt-1 font-bold tracking-tighter uppercase transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;


