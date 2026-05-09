import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, Shield, CheckCircle2, Loader2, Sparkles, Fingerprint, Calendar, QrCode, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setFormData({ name: res.data.name, email: res.data.email });
        if (res.data.avatar) {
          setAvatar(`http://localhost:8000${res.data.avatar}`);
        }
      } catch (err) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/update', formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await api.post('/users/upload-avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatar(`http://localhost:8000${res.data.avatar_url}`);
      showToast('Avatar updated successfully!', 'success');
      window.dispatchEvent(new CustomEvent('USER_UPDATED'));
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
        
        {/* Dynamic Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A78BFA]/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/settings')} 
              className="group flex items-center justify-center w-12 h-12 bg-[#12121A] border border-white/5 rounded-2xl hover:border-[#A78BFA]/40 hover:bg-[#1A1A24] transition-all duration-300 active:scale-90"
            >
              <ArrowLeft size={20} className="text-[#A1A1AA] group-hover:text-[#A78BFA] transition-colors" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[#A78BFA] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA]/80">Account Configuration</span>
              </div>
              <h2 className="text-3xl font-black text-[#EAEAF0] tracking-tighter leading-none">Identity</h2>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.1)] relative z-10">
            <ShieldCheck size={12} strokeWidth={3} />
            Layer 7 Secured
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: IDENTITY CARD (Dashboard Style) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="premium-card p-0 overflow-hidden group/card relative">
              {/* Internal Glow like Dashboard cards */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#A78BFA]/10 blur-[80px] -mr-24 -mt-24 group-hover/card:bg-[#A78BFA]/20 transition-all duration-700" />
              
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                
                {/* Avatar with Dashboard Premium Styling */}
                <div className="relative mb-8">
                  <div 
                    onClick={handleAvatarClick}
                    className="relative w-36 h-36 rounded-[2.5rem] p-1 bg-gradient-to-tr from-[#1E1B4B] to-[#A78BFA]/30 shadow-2xl transition-all duration-500 hover:rotate-2 group-hover/card:scale-105 cursor-pointer overflow-hidden"
                  >
                    <div className="w-full h-full bg-[#09090B] rounded-[2.2rem] overflow-hidden flex items-center justify-center border border-white/5 relative">
                      {avatar ? (
                        <img src={avatar} alt="Identity" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                      ) : (
                        <div className="text-5xl font-black text-[#A78BFA]/20 select-none">
                          {formData.name?.charAt(0) || <User size={56} strokeWidth={1} />}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-[#A78BFA]/30 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500">
                        <Camera className="text-white mb-2" size={28} strokeWidth={2.5} />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Edit Sync</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#34D399] border-4 border-[#09090B] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={12} className="text-[#09090B]" strokeWidth={4} />
                  </div>
                </div>

                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-white tracking-tighter group-hover/card:text-[#A78BFA] transition-colors duration-500">
                     {formData.name || 'Anonymous Node'}
                   </h3>
                   <p className="text-[11px] font-black text-[#A1A1AA] uppercase tracking-[0.3em] opacity-60 truncate w-full px-4">{formData.email}</p>
                </div>

                {/* Dashboard-style Insight Badges */}
                <div className="grid grid-cols-2 w-full mt-10 pt-8 border-t border-white/5 gap-4">
                   <div className="text-left space-y-1">
                      <p className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest opacity-50">Identity Level</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <p className="text-xs font-black text-white uppercase tracking-tighter">Verified Node</p>
                      </div>
                   </div>
                   <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest opacity-50">Member Since</p>
                      <div className="flex items-center justify-end gap-1.5">
                         <Calendar size={12} className="text-[#A78BFA]" />
                         <p className="text-xs font-black text-white uppercase tracking-tighter">APR 2026</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Extra Stats Card like in Dashboard */}
            <div className="card bg-[#12121A] border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-[#A78BFA]/30 transition-all duration-300">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] group-hover:bg-[#A78BFA] group-hover:text-black transition-all">
                     <Fingerprint size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Sync Integrity</h5>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">High Frequency</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-xl font-black text-white tracking-tighter">98.4</span>
               </div>
            </div>
          </div>

          {/* RIGHT: SETTINGS PANEL (Dashboard Style) */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="premium-card p-10 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A78BFA] via-transparent to-transparent opacity-30" />
               
               <div className="space-y-2">
                 <h4 className="text-xl font-black text-white tracking-tight uppercase tracking-wider">Core Protocol</h4>
                 <p className="text-xs text-[#A1A1AA] font-bold leading-relaxed opacity-60">Synchronize your identity metadata across the global network.</p>
               </div>

               <div className="space-y-8">
                  {/* Field 1 */}
                  <div className="group/field space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] group-focus-within/field:text-[#A78BFA] transition-colors">Display Identity</label>
                      <span className="text-[9px] font-black text-[#A78BFA]/60 bg-[#A78BFA]/10 px-2 py-0.5 rounded uppercase tracking-widest">Public</span>
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within/field:text-[#A78BFA] transition-colors duration-300">
                        <User size={18} strokeWidth={2.5} />
                      </div>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#09090B]/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#A78BFA]/50 focus:bg-[#12121A] transition-all duration-300 shadow-inner" 
                        placeholder="IDENT_ALIAS"
                      />
                    </div>
                  </div>

                  {/* Field 2 */}
                  <div className="group/field space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] group-focus-within/field:text-[#A78BFA] transition-colors">Network Portal</label>
                      <Globe size={12} className="text-[#A1A1AA]/30" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within/field:text-[#A78BFA] transition-colors duration-300">
                        <Mail size={18} strokeWidth={2.5} />
                      </div>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#09090B]/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4.5 text-sm font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#A78BFA]/50 focus:bg-[#12121A] transition-all duration-300 shadow-inner" 
                        placeholder="NETWORK_ADDRESS"
                      />
                    </div>
                  </div>
               </div>

               {/* Action Footer */}
               <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
                  <div className="flex flex-col gap-1 opacity-40">
                     <p className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-[0.3em]">Protocol Status</p>
                     <p className="text-[10px] font-black text-white uppercase tracking-tighter">Active Sync Channel 01</p>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="btn-vibrant w-full sm:w-auto min-w-[200px] py-4 rounded-2xl flex items-center justify-center gap-3 group/btn active:scale-95 disabled:opacity-30 transition-all shadow-[0_10px_30px_rgba(167,139,250,0.2)] hover:shadow-[0_15px_40px_rgba(167,139,250,0.3)]"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                    ) : (
                      <Sparkles size={16} strokeWidth={3} className="group-hover/btn:animate-pulse" />
                    )}
                    <span className="font-black uppercase tracking-widest text-[11px]">{saving ? 'Syncing...' : 'Authorize Update'}</span>
                  </button>
               </div>
            </div>

            {/* Quick Access Grid Dashboard style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="card p-6 bg-[#09090B] border-white/5 hover:border-rose-500/20 group transition-all cursor-pointer">
                  <h6 className="text-[9px] font-black text-rose-400/50 uppercase tracking-widest mb-2">Protocol Override</h6>
                  <p className="text-xs font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-tighter">Deactivate Identity Node</p>
               </div>
               <div className="card p-6 bg-[#09090B] border-white/5 hover:border-[#A78BFA]/30 group transition-all cursor-pointer">
                  <h6 className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Metadata</h6>
                  <p className="text-xs font-black text-white group-hover:text-[#A78BFA] transition-colors uppercase tracking-tighter">Export Sync Protocol Logs</p>
               </div>
            </div>

          </div>

        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*" 
        />
      </div>
    </Layout>
  );
};

export default SettingsProfile;
