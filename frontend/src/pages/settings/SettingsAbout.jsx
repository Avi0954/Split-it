import React from 'react';
import { ArrowLeft, Rocket, Code, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const SettingsAbout = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        
        <div className="flex items-center gap-4 border-b border-[#1F1F2B] pb-4">
          <button onClick={() => navigate('/settings')} className="p-2 bg-[#12121A] border border-[#1F1F2B] rounded-xl hover:bg-[#1F1F2B] transition-colors text-[#A1A1AA] hover:text-[#EAEAF0]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">About SplitIt</h2>
            <p className="text-[#A1A1AA] text-sm">App info and credits</p>
          </div>
        </div>

        <div className="card p-8 border-[#1F1F2B] flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-20 h-20 bg-[#A78BFA] rounded-2xl flex items-center justify-center font-bold text-black text-4xl shadow-[0_0_30px_rgba(167,139,250,0.3)]">
              S
           </div>
           <div>
             <h3 className="text-2xl font-bold text-[#EAEAF0] tracking-tight mt-2">SplitIt Frontend</h3>
             <p className="text-[#A1A1AA] font-medium mt-1">Version 1.4.2 (Premium Lavender)</p>
           </div>
           <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20 mt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Systems Operational
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="card p-5 border-[#1F1F2B] flex gap-4 hover:bg-[#1A1A24] transition-colors cursor-pointer">
              <div className="text-[#A78BFA]"><Code size={24} /></div>
              <div>
                 <h4 className="font-semibold text-[#EAEAF0]">Changelog</h4>
                 <p className="text-xs text-[#A1A1AA] mt-1">See what's new</p>
              </div>
           </div>
           <div className="card p-5 border-[#1F1F2B] flex gap-4 hover:bg-[#1A1A24] transition-colors cursor-pointer">
              <div className="text-[#A78BFA]"><HeartHandshake size={24} /></div>
              <div>
                 <h4 className="font-semibold text-[#EAEAF0]">Terms of Service</h4>
                 <p className="text-xs text-[#A1A1AA] mt-1">Legal and policies</p>
              </div>
           </div>
        </div>

        <div className="text-center pt-8">
           <p className="text-xs text-[#A1A1AA]">Crafted with passion for clean UX.</p>
        </div>

      </div>
    </Layout>
  );
};

export default SettingsAbout;
