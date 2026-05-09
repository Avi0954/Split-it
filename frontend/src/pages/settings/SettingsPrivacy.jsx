import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Activity, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsPrivacy = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [toggles, setToggles] = useState({
    public_profile_visibility: true,
    activity_status: true,
    data_collection: false
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/preferences');
        setToggles({
          public_profile_visibility: res.data.public_profile_visibility,
          activity_status: res.data.activity_status,
          data_collection: res.data.data_collection
        });
      } catch (err) {
        showToast('Failed to load privacy settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [showToast]);

  const handleToggle = async (key) => {
    const newValue = !toggles[key];
    setToggles({...toggles, [key]: newValue});
    try {
      await api.put('/preferences', { [key]: newValue });
    } catch (err) {
      setToggles({...toggles, [key]: !newValue}); // revert
      showToast('Failed to update setting', 'error');
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
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Privacy Options</h2>
            <p className="text-[#A1A1AA] text-sm">Control your visibility and data</p>
          </div>
        </div>

        <div className="card p-0 border-[#1F1F2B] overflow-hidden bg-[#12121A] divide-y divide-[#1F1F2B]">
          
          <div className="flex items-center justify-between p-6">
             <div className="flex items-start gap-4 pr-4">
               <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                 <Eye size={20} />
               </div>
               <div>
                  <h3 className="text-base font-semibold text-[#EAEAF0]">Public Profile Visibility</h3>
                  <p className="text-[#A1A1AA] text-sm mt-1 leading-snug">Allow friends and contacts to find you using your email address.</p>
               </div>
             </div>
             <button disabled={loading} onClick={() => handleToggle('public_profile_visibility')} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${toggles.public_profile_visibility ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.public_profile_visibility ? 'translate-x-6' : 'translate-x-1'} ${loading && 'opacity-50'}`} />
             </button>
          </div>

          <div className="flex items-center justify-between p-6">
             <div className="flex items-start gap-4 pr-4">
               <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                 <Activity size={20} />
               </div>
               <div>
                  <h3 className="text-base font-semibold text-[#EAEAF0]">Activity Status</h3>
                  <p className="text-[#A1A1AA] text-sm mt-1 leading-snug">Show others when you were last active or recently cleared balances.</p>
               </div>
             </div>
             <button disabled={loading} onClick={() => handleToggle('activity_status')} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${toggles.activity_status ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.activity_status ? 'translate-x-6' : 'translate-x-1'} ${loading && 'opacity-50'}`} />
             </button>
          </div>

          <div className="flex items-center justify-between p-6">
             <div className="flex items-start gap-4 pr-4">
               <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                 <Database size={20} />
               </div>
               <div>
                  <h3 className="text-base font-semibold text-[#EAEAF0]">Data Collection</h3>
                  <p className="text-[#A1A1AA] text-sm mt-1 leading-snug">Help us improve the app by anonymously sharing crash and usage data.</p>
               </div>
             </div>
             <button disabled={loading} onClick={() => handleToggle('data_collection')} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${toggles.data_collection ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.data_collection ? 'translate-x-6' : 'translate-x-1'} ${loading && 'opacity-50'}`} />
             </button>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default SettingsPrivacy;
