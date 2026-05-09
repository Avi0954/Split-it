import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsSecurity = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [twoFactor, setTwoFactor] = useState(true);
  
  const [passData, setPassData] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handlePasswordUpdate = async () => {
    if (passData.new_password !== passData.confirm) {
      return showToast('New passwords do not match', 'error');
    }
    setSaving(true);
    try {
      await api.put('/users/change-password', {
        current_password: passData.current_password,
        new_password: passData.new_password
      });
      showToast('Password updated successfully', 'success');
      setPassData({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
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
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Security</h2>
            <p className="text-[#A1A1AA] text-sm">Manage passwords and account protection</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card border-[#1F1F2B] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
                <KeyRound size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[#EAEAF0]">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-[#A1A1AA] ml-1">Current Password</label>
                 <input 
                   type="password" 
                   value={passData.current_password}
                   onChange={e => setPassData({...passData, current_password: e.target.value})}
                   placeholder="••••••••" 
                   className="input-field w-full" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-[#A1A1AA] ml-1">New Password</label>
                 <input 
                   type="password" 
                   value={passData.new_password}
                   onChange={e => setPassData({...passData, new_password: e.target.value})}
                   placeholder="••••••••" 
                   className="input-field w-full" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-[#A1A1AA] ml-1">Confirm New Password</label>
                 <input 
                   type="password" 
                   value={passData.confirm}
                   onChange={e => setPassData({...passData, confirm: e.target.value})}
                   placeholder="••••••••" 
                   className="input-field w-full" 
                 />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handlePasswordUpdate}
                disabled={saving || !passData.current_password || !passData.new_password}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          <div className="card border-[#1F1F2B] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                 <h3 className="text-base font-semibold text-[#EAEAF0]">Two-Factor Authentication</h3>
                 <p className="text-[#A1A1AA] text-sm mt-1">Add an extra layer of security to your account.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${twoFactor ? 'bg-[#A78BFA]' : 'bg-[#1F1F2B]'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default SettingsSecurity;
