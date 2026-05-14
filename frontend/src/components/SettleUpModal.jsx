import React, { useState, useEffect, useCallback } from 'react';
import { X, HandCoins, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../contexts/CurrencyContext';

const SettleUpModal = ({ isOpen, onClose, groupId, currentUser, onSettled }) => {
  const { showToast } = useToast();
  const { formatAmount, currency } = useCurrency();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // stores index or id of currently paying item
  const [activePaymentIdx, setActivePaymentIdx] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/settlements`);
      const relevant = res.data.filter(
        s => s.from_user_id === currentUser?.id || s.to_user_id === currentUser?.id
      );
      setSettlements(relevant);
    } catch (err) {
      showToast('Failed to load settlements', 'error');
    } finally {
      setLoading(false);
    }
  }, [groupId, currentUser, showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchDebts();
      setActivePaymentIdx(null);
      setPaymentAmount('');
    }
  }, [isOpen, fetchDebts]);

  const handleConfirmPay = async (settlement, idx) => {
    setPaying(idx);
    const amountToPay = parseFloat(paymentAmount);

    if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay > settlement.amount + 0.01) {
      showToast('Enter a valid amount (up to the total owed)', 'warning');
      setPaying(null);
      return;
    }

    try {
      await api.post('/settlements/pay', {
        group_id: groupId,
        from_user_id: settlement.from_user_id,
        to_user_id: settlement.to_user_id,
        amount: amountToPay,
        currency: settlement.currency || 'INR'
      });
      showToast('Payment recorded successfully! 🎉', 'success');

      setActivePaymentIdx(null);
      fetchDebts();
      if (onSettled) onSettled();

    } catch (err) {
      showToast(err.response?.data?.detail || 'Payment failed', 'error');
    } finally {
      setPaying(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="card w-full max-w-md bg-[#12121A] border-[#1F1F2B] p-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#1F1F2B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] border border-[#A78BFA]/20">
              <HandCoins size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#EAEAF0] tracking-tight">Settle Up</h3>
              <p className="text-[#A1A1AA] text-xs font-medium">Record cash or external payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#09090B] border border-[#1F1F2B] flex items-center justify-center hover:bg-[#1A1A24] transition-colors text-[#A1A1AA] hover:text-[#EAEAF0]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-[#1F1F2B] rounded-xl animate-pulse" />
            ))
          ) : settlements.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">✨</span>
              <p className="text-[#EAEAF0] font-semibold">You're all settled up!</p>
              <p className="text-[#A1A1AA] text-sm mt-1">No pending balances for you right now.</p>
            </div>
          ) : (
            settlements.map((s, idx) => {
              const amIOwing = s.from_user_id === currentUser?.id;
              const isActive = activePaymentIdx === idx;

              return (
                <div key={idx} className="card p-4 border-[#1F1F2B] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#A1A1AA]">
                      {amIOwing ? 'You owe' : `${s.from_user_name} owes you`}
                    </span>
                    <span className={`text-lg font-bold tracking-tight ${amIOwing ? 'text-red-400' : 'text-emerald-400'}`}>
                      {formatAmount(s.amount, s.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-[#09090B] p-3 rounded-xl border border-[#1F1F2B]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1A1A24] text-[10px] font-bold flex items-center justify-center text-[#EAEAF0]">
                        {s.from_user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[#EAEAF0]">{amIOwing ? 'You' : s.from_user_name}</span>
                    </div>
                    <ArrowRight size={14} className="text-[#52525B]" />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#A78BFA]/20 text-[10px] font-bold flex items-center justify-center text-[#A78BFA]">
                        {s.to_user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[#EAEAF0]">{!amIOwing ? 'You' : s.to_user_name}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="mt-2 space-y-3 p-3 bg-[#09090B] border border-purple-500/30 rounded-xl relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                      <label className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold">Payment Amount</label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold" style={{ fontSize: '14px' }}>{currency.symbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          max={s.amount}
                          className="w-full bg-[#12121A] border border-[#1F1F2B] rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-[#A1A1AA]/50"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setActivePaymentIdx(null)}
                          disabled={paying === idx}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#1F1F2B] text-[#A1A1AA] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmPay(s, idx)}
                          disabled={paying === idx || !paymentAmount}
                          className="flex-[2] py-2 rounded-lg text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors flex justify-center items-center gap-2"
                        >
                          {paying === idx ? 'Processing...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActivePaymentIdx(idx);
                        setPaymentAmount(s.amount.toFixed(2));
                      }}
                      className="btn-primary w-full py-2.5 text-sm mt-1 border-t border-[#1F1F2B]/50 hover:border-transparent"
                    >
                      {amIOwing ? 'Record Payment' : 'Mark as Received'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SettleUpModal;
