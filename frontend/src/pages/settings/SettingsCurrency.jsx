import React, { useState, useEffect } from 'react';
import { ArrowLeft, IndianRupee, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const SettingsCurrency = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/preferences');
        setCurrency(res.data.currency || 'INR');
      } catch (err) {
        showToast('Failed to load currency settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [showToast]);

  const handleUpdate = async (val) => {
    setCurrency(val);
    try {
      await api.put('/preferences', { currency: val });
    } catch (err) {
      showToast('Failed to update currency', 'error');
    }
  };

  const currencies = [
    { id: 'INR', label: 'Indian Rupee', icon: <IndianRupee size={20} /> },
    { id: 'USD', label: 'US Dollar', icon: <DollarSign size={20} /> },
    { id: 'EUR', label: 'Euro', icon: <Euro size={20} /> },
    { id: 'GBP', label: 'British Pound', icon: <PoundSterling size={20} /> },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        
        <div className="flex items-center gap-4 border-b border-[#1F1F2B] pb-4">
          <button onClick={() => navigate('/settings')} className="p-2 bg-[#12121A] border border-[#1F1F2B] rounded-xl hover:bg-[#1F1F2B] transition-colors text-[#A1A1AA] hover:text-[#EAEAF0]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#EAEAF0] tracking-tight">Default Currency</h2>
            <p className="text-[#A1A1AA] text-sm">Select the base currency for your groups</p>
          </div>
        </div>

        <div className="card p-0 border-[#1F1F2B] overflow-hidden bg-[#12121A] divide-y divide-[#1F1F2B]">
          {currencies.map(cur => (
            <div 
              key={cur.id} 
              onClick={() => !loading && handleUpdate(cur.id)}
              className={`flex items-center justify-between p-6 cursor-pointer transition-colors ${loading ? 'opacity-50' : 'hover:bg-[#1A1A24]'}`}
            >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg bg-[#09090B] border border-[#1F1F2B] flex items-center justify-center text-[#EAEAF0]">
                   {cur.icon}
                 </div>
                 <div>
                    <h3 className="text-base font-semibold text-[#EAEAF0]">{cur.id}</h3>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">{cur.label}</p>
                 </div>
               </div>
               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${currency === cur.id ? 'border-[#A78BFA]' : 'border-[#1F1F2B]'}`}>
                  {currency === cur.id && <div className="w-3 h-3 rounded-full bg-[#A78BFA]" />}
               </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsCurrency;
