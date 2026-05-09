import React from 'react';
import { Bell, Moon, ChevronRight, Sliders, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Settings = () => {
  const navigate = useNavigate();
  
  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <User size={18} />, label: 'Personal Information', value: 'Details', path: '/settings/profile' },
        { icon: <Lock size={18} />, label: 'Password & Security', value: '2FA Active', path: '/settings/security' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell size={18} />, label: 'Notifications', value: 'Push & Email', path: '/settings/notifications' },
        { icon: <Moon size={18} />, label: 'Appearance', value: 'Dark Mode', path: '/settings/appearance' },
        { icon: <Sliders size={18} />, label: 'Default Currency', value: 'INR (₹)', path: '/settings/currency' },
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#1F1F2B] pb-6">
          <h2 className="text-3xl font-bold text-[#EAEAF0] tracking-tight">Settings</h2>
        </div>

        {/* Setting Groups */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#A1A1AA] ml-1 uppercase tracking-wider opacity-60">{section.title}</h3>
              <div className="card p-0 overflow-hidden border-[#1F1F2B] rounded-2xl bg-[#12121A] shadow-[0_4px_20px_rgba(0,0,0,0.5)] divide-y divide-[#1F1F2B]">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => item.path && navigate(item.path)} 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1A1A24] transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#09090B] rounded-lg border border-[#1F1F2B] group-hover:border-[#A78BFA]/30 group-hover:text-[#A78BFA] transition-all duration-200">
                        {React.cloneElement(item.icon, { 
                           className: "text-[#A1A1AA] group-hover:text-[#A78BFA] transition-colors"
                        })}
                      </div>
                      <span className="font-semibold text-[#EAEAF0] text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-medium text-[#A1A1AA] bg-[#1F1F2B]/50 px-2.5 py-1 rounded-md">{item.value}</span>
                       <ChevronRight size={16} className="text-[#A1A1AA] group-hover:text-[#EAEAF0] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
