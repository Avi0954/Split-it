import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsRegion = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [language, setLanguage] = useState('English (US)');
  const [region, setRegion] = useState('India');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/preferences');
        setLanguage(res.data.language || 'English (US)');
        setRegion(res.data.region || 'India');
      } catch (err) {
        showToast('Failed to load region settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [showToast]);

  const handleUpdate = async (key, val) => {
    try {
      if (key === 'language') setLanguage(val);
      if (key === 'region') setRegion(val);
      await api.put('/preferences', { [key]: val });
    } catch (err) {
      showToast('Failed to update region settings', 'error');
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
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Language & Region</h2>
            <p className="text-[#A1A1AA] text-sm">Select your local formatting</p>
          </div>
        </div>

        <div className="card p-6 border-[#1F1F2B] space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
               <Globe size={20} />
             </div>
             <h3 className="text-lg font-semibold text-[#EAEAF0]">Language</h3>
          </div>
          
          <div className="space-y-2">
             <select 
               value={language} 
               disabled={loading}
               onChange={(e) => handleUpdate('language', e.target.value)}
               className="input-field w-full appearance-none cursor-pointer disabled:opacity-50"
             >
               <option>English (US)</option>
               <option>English (UK)</option>
               <option>Spanish</option>
               <option>French</option>
               <option>Hindi</option>
             </select>
          </div>

          <hr className="border-[#1F1F2B]" />

          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
               <MapPin size={20} />
             </div>
             <h3 className="text-lg font-semibold text-[#EAEAF0]">Region Format</h3>
          </div>

          <div className="space-y-2">
             <select 
               value={region} 
               disabled={loading}
               onChange={(e) => handleUpdate('region', e.target.value)}
               className="input-field w-full appearance-none cursor-pointer disabled:opacity-50"
             >
               <option>India</option>
               <option>United States</option>
               <option>United Kingdom</option>
               <option>Canada</option>
               <option>Australia</option>
             </select>
             <p className="text-xs text-[#A1A1AA] mt-2 italic">This affects how dates and numbers are formatted.</p>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default SettingsRegion;
