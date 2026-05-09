import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Clock, User, Settings, LogOut, CreditCard, Sliders, HelpCircle, UserPlus } from 'lucide-react';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const primaryMenuItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Groups', path: '/groups' },
    { icon: <User size={20} />, label: 'Friends', path: '/friends' },
    { icon: <Clock size={20} />, label: 'Activity', path: '/activity' },
  ];

  const secondaryMenuItems = [
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    { icon: <CreditCard size={20} />, label: 'Payments', path: '/settings/payment' },
    { icon: <Sliders size={20} />, label: 'Preferences', path: '/settings/preferences' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/help' },
  ];

  const renderNavLinks = (items) => (
    <div className="space-y-1.5">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium hover:scale-[1.01] text-sm
            ${isActive
              ? 'bg-[#A78BFA]/10 text-[#A78BFA]'
              : 'text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#12121A]'}
          `}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 bg-[#09090B] border-r border-[#1F1F2B] p-5 z-40 h-[calc(100vh-72px)] top-[72px]">
      <nav className="flex-1 overflow-y-auto no-scrollbar pb-4 space-y-8 mt-2">
        <div>
          <p className="px-3 text-xs font-semibold text-[#A1A1AA]/50 uppercase tracking-wider mb-2">Main</p>
          {renderNavLinks(primaryMenuItems)}
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-[#A1A1AA]/50 uppercase tracking-wider mb-2">Manage</p>
          {renderNavLinks(secondaryMenuItems)}
        </div>
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-[#1F1F2B]">
        {/* Invite Card */}
        <div className="bg-[#12121A] border border-[#1F1F2B] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#A78BFA]/10 rounded-full flex items-center justify-center text-[#A78BFA]">
              <UserPlus size={16} />
            </div>
            <p className="text-sm font-semibold text-[#EAEAF0]">Invite Friends</p>
          </div>
          <p className="text-xs text-[#A1A1AA] mb-3">Share SplitIt and split bills effortlessly.</p>
          <button className="w-full btn-primary py-1.5 text-xs">Copy Link</button>
        </div>

        <button
          onClick={() => logout(navigate)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 font-medium text-sm hover:scale-[1.01]"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
