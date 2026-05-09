import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { logout } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          S
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          SplitIt
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <User size={20} />
        </button>
        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors"
        >
          <span className="hidden md:inline">Logout</span>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
