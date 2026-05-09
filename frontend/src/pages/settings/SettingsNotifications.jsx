import React, { useState, useEffect } from 'react';
import { ArrowLeft, BellRing, Mail, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsNotifications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [toggles, setToggles] = useState({
    push_notifications: true,
    email_notifications: false,
    new_expenses_alerts: true,
    settlement_alerts: true
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/preferences');
        setToggles({
          push_notifications: res.data.push_notifications,
          email_notifications: res.data.email_notifications,
          new_expenses_alerts: res.data.new_expenses_alerts,
          settlement_alerts: res.data.settlement_alerts
        });
      } catch (err) {
        showToast('Failed to load notifications preferences', 'error');
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
      showToast('Failed to save notification setting', 'error');
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
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Notifications</h2>
            <p className="text-[#A1A1AA] text-sm">Choose what we notify you about</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Channels */}
          <div className="card p-0 border-[#1F1F2B] overflow-hidden bg-[#12121A] divide-y divide-[#1F1F2B]">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-base font-semibold text-[#EAEAF0]">Push Notifications</h3>
              </div>
              <button disabled={loading} onClick={() => handleToggle('push_notifications')} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${toggles.push_notifications ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.push_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                  <Mail size={20} />
                </div>
                <h3 className="text-base font-semibold text-[#EAEAF0]">Email Digests</h3>
              </div>
              <button disabled={loading} onClick={() => handleToggle('email_notifications')} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${toggles.email_notifications ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles.email_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <h3 className="text-xs font-bold text-[#A1A1AA] ml-1 uppercase tracking-wider">Alert Preferences</h3>

          {/* Specific Alerts */}
          <div className="card p-0 border-[#1F1F2B] overflow-hidden bg-[#12121A] divide-y divide-[#1F1F2B]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
               <div>
                  <h3 className="text-sm font-semibold text-[#EAEAF0]">New Expenses Added</h3>
                  <p className="text-[#A1A1AA] text-xs mt-1">Get notified when someone adds a bill involving you.</p>
               </div>
               <button disabled={loading} onClick={() => handleToggle('new_expenses_alerts')} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${toggles.new_expenses_alerts ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles.new_expenses_alerts ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
               <div>
                  <h3 className="text-sm font-semibold text-[#EAEAF0]">Settlement Reminders</h3>
                  <p className="text-[#A1A1AA] text-xs mt-1">Receive alerts when balances have been cleared.</p>
               </div>
               <button disabled={loading} onClick={() => handleToggle('settlement_alerts')} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${toggles.settlement_alerts ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles.settlement_alerts ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default SettingsNotifications;
