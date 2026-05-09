import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsAppearance = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/preferences');
        setTheme(res.data.theme || 'dark');
      } catch (err) {
        showToast('Failed to load appearance setting', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [showToast]);

  const handleUpdate = async (newTheme) => {
    setTheme(newTheme);
    try {
      await api.put('/preferences', { theme: newTheme });
    } catch (err) {
      showToast('Failed to save appearance setting', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        
        <div className="flex items-center gap-4 border-b border-[#1F1F2B] pb-4">
          <button onClick={() => navigate('/settings')} className="p-2 bg-[#12121A] border border-[#1F1F2B] rounded-xl hover:bg-[#1F1F2B] transition-colors text-[#A1A1AA] hover:text-[#EAEAF0]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Appearance</h2>
            <p className="text-[#A1A1AA] text-sm">Customize how SplitIt looks on your device</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold text-[#A1A1AA] ml-1 uppercase tracking-wider">Themes</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div onClick={() => !loading && handleUpdate('dark')} className={`card p-4 cursor-pointer border-2 transition-all ${theme === 'dark' ? 'border-[#A78BFA] bg-[#1A1A24]' : 'border-[#1F1F2B] hover:border-[#1F1F2B]/80'}`}>
                <div className="h-10 w-10 rounded-full bg-[#09090B] flex items-center justify-center text-[#A78BFA] mb-4 shadow-inner">
                  <Moon size={20} />
                </div>
                <h4 className="font-bold text-[#EAEAF0]">Lavender Dark</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">Default</p>
             </div>

             <div onClick={() => !loading && handleUpdate('light')} className={`card p-4 cursor-pointer border-2 transition-all ${theme === 'light' ? 'border-[#A78BFA] bg-[#1A1A24]' : 'border-[#1F1F2B] hover:border-[#1F1F2B]/80 opacity-50'}`}>
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-500 mb-4 shadow-inner">
                  <Sun size={20} />
                </div>
                <h4 className="font-bold text-[#EAEAF0]">Light Mode</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">Coming Soon</p>
             </div>

             <div onClick={() => !loading && handleUpdate('system')} className={`card p-4 cursor-pointer border-2 transition-all ${theme === 'system' ? 'border-[#A78BFA] bg-[#1A1A24]' : 'border-[#1F1F2B] hover:border-[#1F1F2B]/80 opacity-50'}`}>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-200 flex items-center justify-center text-black mb-4 shadow-inner">
                  <Monitor size={20} />
                </div>
                <h4 className="font-bold text-[#EAEAF0]">System Settings</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">Matches Device</p>
             </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default SettingsAppearance;
