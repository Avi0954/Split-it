import React, { useState, useEffect } from 'react';
import { X, Receipt, Loader2, CheckCircle2, Users, ChevronDown, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../contexts/CurrencyContext';

const AddExpenseModal = ({ isOpen, onClose, initialGroupId = null, initialMembers = [], onExpenseAdded = () => { }, editExpense = null }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [participantIds, setParticipantIds] = useState([]);
  const [splitMode, setSplitMode] = useState('equal'); // equal, exact, percentage
  const [exactSplits, setExactSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupCurrency, setGroupCurrency] = useState('INR');
  const { showToast } = useToast();
  const { currency, formatAmount } = useCurrency();

  // Global Context State
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [members, setMembers] = useState(initialMembers);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCurrentUser().then(user => setCurrentUser(user));

      // If we don't have initial members or group, we need to fetch user's groups
      if (!initialGroupId && !editExpense) {
        setIsLoadingGroups(true);
        api.get('/groups/').then(res => {
          setGroups(res.data);
          if (res.data.length > 0) {
            setSelectedGroupId(res.data[0].id);
            fetchGroupMembers(res.data[0].id);
          }
          setIsLoadingGroups(false);
        }).catch(() => {
          showToast('Failed to load groups', 'error');
          setIsLoadingGroups(false);
        });
      } else if (initialGroupId && initialMembers.length === 0) {
        setSelectedGroupId(initialGroupId);
        fetchGroupMembers(initialGroupId);
      } else {
        setSelectedGroupId(initialGroupId);
        setMembers(initialMembers);
      }
    } else {
      // Reset state on close with delay for animation
      setTimeout(() => {
        setDescription('');
        setAmount('');
        setPayerId('');
        setParticipantIds([]);
        setSplitMode('equal');
        setExactSplits({});
        setPercentageSplits({});
        setReceiptFile(null);
        setIsGroupDropdownOpen(false);
        if (!initialGroupId) {
          setSelectedGroupId(null);
          setMembers([]);
        }
      }, 300);
    }
  }, [isOpen, initialGroupId, initialMembers, editExpense]);

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      setMembers(res.data.members.map(m => m.user));
      setGroupCurrency(res.data.currency || 'INR');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && members.length > 0) {
      if (editExpense) {
        setDescription(editExpense.description);
        setAmount(editExpense.amount.toString());
        setPayerId(editExpense.payer_id.toString());

        if (editExpense.currency) {
          setGroupCurrency(editExpense.currency);
        }

        const splitUserIds = editExpense.splits ? editExpense.splits.map(s => s.user_id) : [];
        setParticipantIds(splitUserIds);

        if (editExpense.splits) {
          const exact = {};
          let isEqual = true;
          const avg = editExpense.amount / editExpense.splits.length;
          editExpense.splits.forEach(s => {
            exact[s.user_id] = s.amount_owed.toString();
            if (Math.abs(s.amount_owed - avg) > 0.05) {
              isEqual = false;
            }
          });

          if (!isEqual || splitUserIds.length === 0) {
            setSplitMode('exact');
            setExactSplits(exact);
          } else {
            setSplitMode('equal');
          }
        }
      } else {
        // Default to current user as payer if member
        if (currentUser) {
          const isMember = members.find(m => m.id === currentUser.id);
          if (isMember) setPayerId(currentUser.id.toString());
        }
        setParticipantIds(members.map(m => m.id));
      }
    }
  }, [isOpen, members, editExpense, currentUser]);

  if (!isOpen) return null;

  const toggleParticipant = (userId) => {
    if (participantIds.includes(userId)) {
      setParticipantIds(participantIds.filter(id => id !== userId));
    } else {
      setParticipantIds([...participantIds, userId]);
    }
  };

  const handleSelectAll = () => {
    if (participantIds.length === members.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(members.map(m => m.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description) return showToast('Description is required', 'warning');
    if (!parsedAmount || parsedAmount <= 0) return showToast('Enter a valid amount', 'warning');
    if (!payerId) return showToast('Select who paid', 'warning');
    if (!selectedGroupId) return showToast('Select a group', 'warning');
    if (participantIds.length === 0 && splitMode === 'equal') return showToast('Select at least one person', 'warning');

    setIsLoading(true);
    try {
      let splits = [];
      if (splitMode === 'equal') {
        const splitAmount = parsedAmount / participantIds.length;
        splits = participantIds.map(userId => ({
          user_id: parseInt(userId),
          amount_owed: parseFloat(splitAmount.toFixed(2))
        }));

        // Handle rounding errors
        const totalSplit = splits.reduce((sum, s) => sum + s.amount_owed, 0);
        if (totalSplit !== parsedAmount) {
          const diff = parsedAmount - totalSplit;
          const payerSplitIdx = splits.findIndex(s => s.user_id === parseInt(payerId));
          const targetIdx = payerSplitIdx !== -1 ? payerSplitIdx : splits.length - 1;
          splits[targetIdx].amount_owed = parseFloat((splits[targetIdx].amount_owed + diff).toFixed(2));
        }
      } else if (splitMode === 'exact') {
        let customTotal = 0;
        Object.entries(exactSplits).forEach(([uid, val]) => {
          const v = parseFloat(val);
          if (!isNaN(v) && v > 0 && participantIds.includes(parseInt(uid))) {
            customTotal += v;
            splits.push({ user_id: parseInt(uid), amount_owed: v });
          }
        });
        if (Math.abs(customTotal - parsedAmount) > 0.01) {
          setIsLoading(false);
          return showToast(`Sum must be ${formatAmount(parsedAmount)} (Total: ${formatAmount(customTotal)})`, 'error');
        }
      } else if (splitMode === 'percentage') {
        let pctTotal = 0;
        let calculatedTotal = 0;

        Object.entries(percentageSplits).forEach(([uid, val]) => {
          const pct = parseFloat(val);
          if (!isNaN(pct) && pct > 0 && participantIds.includes(parseInt(uid))) {
            pctTotal += pct;
            const amt = parseFloat(((parsedAmount * pct) / 100).toFixed(2));
            calculatedTotal += amt;
            splits.push({ user_id: parseInt(uid), amount_owed: amt });
          }
        });

        if (Math.abs(pctTotal - 100) > 0.01) {
          setIsLoading(false);
          return showToast(`Percentages must add up to 100% (Current: ${pctTotal.toFixed(0)}%)`, 'error');
        }

        // Adjust rounding
        if (calculatedTotal !== parsedAmount && splits.length > 0) {
          const diff = parsedAmount - calculatedTotal;
          splits[0].amount_owed = parseFloat((splits[0].amount_owed + diff).toFixed(2));
        }
      }

      const payload = {
        description,
        amount: parsedAmount,
        payer_id: parseInt(payerId),
        currency: groupCurrency,
        splits: splits
      };

      if (editExpense) {
        await api.put(`/groups/${selectedGroupId}/expenses/${editExpense.id}`, payload);
        showToast('Expense updated successfully! 🎉');
      } else {
        await api.post(`/groups/${selectedGroupId}/expenses`, payload);
        showToast('Expense created successfully! 🎉');
      }

      // Dispatch global event for cross-component refresh
      window.dispatchEvent(new CustomEvent('EXPENSE_ADDED'));

      onExpenseAdded();
      onClose();
    } catch (err) {
      showToast('Failed to save expense.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Summary Calcs
  const parsedAmt = parseFloat(amount) || 0;
  let remainingExact = parsedAmt;
  let remainingPct = 100;

  if (splitMode === 'exact') {
    const total = participantIds.reduce((a, b) => a + parseFloat(exactSplits[b] || 0), 0);
    remainingExact = Math.max(0, parsedAmt - total);
  } else if (splitMode === 'percentage') {
    const total = participantIds.reduce((a, b) => a + parseFloat(percentageSplits[b] || 0), 0);
    remainingPct = Math.max(0, 100 - total);
  }

  // Calculate "You paid", "You get back", "You owe"
  let youPaid = 0;
  let youOwe = 0;
  let youGetBack = 0;

  if (currentUser) {
    if (payerId === currentUser.id.toString()) {
      youPaid = parsedAmt;
    }

    let currentUserOwedAmount = 0;
    if (splitMode === 'equal') {
      if (participantIds.includes(currentUser.id)) {
        currentUserOwedAmount = parsedAmt / (participantIds.length || 1);
      }
    } else if (splitMode === 'exact') {
      if (participantIds.includes(currentUser.id)) {
        currentUserOwedAmount = parseFloat(exactSplits[currentUser.id] || 0);
      }
    } else if (splitMode === 'percentage') {
      if (participantIds.includes(currentUser.id)) {
        const pct = parseFloat(percentageSplits[currentUser.id] || 0);
        currentUserOwedAmount = (parsedAmt * pct) / 100;
      }
    }

    if (payerId === currentUser.id.toString()) {
      youGetBack = Math.max(0, parsedAmt - currentUserOwedAmount);
    } else {
      youOwe = currentUserOwedAmount;
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#09090B] lg:bg-[#12121A]/90 lg:backdrop-blur-xl border border-[#1F1F2B] lg:border-[#1F1F2B]/50 rounded-t-3xl lg:rounded-3xl shadow-2xl flex flex-col bottom-sheet lg:animate-in lg:zoom-in-95 max-h-[95vh] h-full lg:h-auto overflow-hidden">
        <div className="w-12 h-1.5 bg-[#1F1F2B] rounded-full mx-auto mt-3 lg:hidden shrink-0" />
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#1F1F2B] shrink-0 bg-[#09090B]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A78BFA]/10 rounded-full flex items-center justify-center text-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.15)]">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight">{editExpense ? 'Edit Expense' : 'Add Expense'}</h3>
              <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest mt-0.5">Step 1 of 1 • Details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-[#1F1F2B]/50 hover:bg-[#1F1F2B] rounded-full text-[#A1A1AA] hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* SINGLE SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#09090B]">
          <form id="expense-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[#1F1F2B]">

            {/* Left Side: Core Inputs */}
            <div className="p-6 space-y-8">
              {/* Amount - Large & Centered */}
              <div className="space-y-3 flex flex-col items-center justify-center py-6 bg-[#12121A]/30 rounded-3xl border border-[#1F1F2B]/50">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest opacity-60">Enter Amount</label>
                <div className="flex items-center justify-center gap-2 group">
                  <span className="text-[#A78BFA] font-bold text-4xl lg:text-5xl drop-shadow-[0_0_12px_rgba(167,139,250,0.4)] transition-all group-focus-within:text-[#C4B5FD] mt-1">{currency.symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    className="bg-transparent border-none text-5xl lg:text-6xl font-black text-white focus:outline-none placeholder:text-[#A1A1AA]/20 tracking-tighter transition-all text-center"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: `${Math.max(4, amount.length + 1)}ch` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2.5 px-1">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 opacity-60">Description</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="What was this for?"
                    className="w-full bg-[#12121A]/50 border border-[#1F1F2B] focus:border-[#A78BFA] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#EAEAF0] focus:outline-none placeholder:text-[#A1A1AA]/50 transition-all shadow-inner"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {description.length > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#A1A1AA] font-bold opacity-40">
                      {description.length}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Group Selector */}
              {(!initialGroupId && !editExpense) && (
                <div className="space-y-2.5 px-1 relative">
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 opacity-60">Select Group</label>
                  <div
                    className={`w-full bg-[#12121A]/50 border ${isGroupDropdownOpen ? 'border-[#A78BFA] ring-1 ring-[#A78BFA]/30' : 'border-[#1F1F2B] hover:border-[#1F1F2B]/80'} rounded-xl px-4 py-3.5 text-sm transition-all font-semibold text-[#EAEAF0] cursor-pointer flex items-center justify-between shadow-inner`}
                    onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="text-[#A1A1AA]" size={16} />
                      <span>{groups.find(g => g.id.toString() === selectedGroupId?.toString())?.name || 'Choose a group...'}</span>
                    </div>
                    <ChevronDown className={`text-[#A1A1AA] transition-transform duration-300 ${isGroupDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                  </div>

                  {isGroupDropdownOpen && (
                    <div className="absolute top-[100%] mt-2 left-1 right-1 z-50 bg-[#12121A] border border-[#1F1F2B] rounded-xl shadow-2xl max-h-48 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2">
                      {groups.length === 0 ? (
                        <div className="px-4 py-4 text-xs text-[#A1A1AA] italic text-center">No groups found</div>
                      ) : (
                        groups.map(g => (
                          <div
                            key={g.id}
                            className="px-4 py-3.5 text-sm font-semibold text-[#EAEAF0] hover:bg-[#A78BFA]/10 hover:text-[#A78BFA] cursor-pointer transition-all border-b border-white/5 last:border-0 flex items-center gap-3"
                            onClick={() => {
                              setSelectedGroupId(g.id);
                              fetchGroupMembers(g.id);
                              setIsGroupDropdownOpen(false);
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#1F1F2B] flex items-center justify-center text-[10px] font-bold text-[#A78BFA]">
                              {g.name.charAt(0)}
                            </div>
                            {g.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Paid By */}
              <div className="space-y-3 px-1">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 opacity-60">Paid By</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
                  {members.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setPayerId(member.id.toString())}
                      className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all active:scale-95 ${payerId === member.id.toString()
                        ? 'bg-[#A78BFA] border-[#A78BFA] text-black font-bold shadow-[0_4px_15px_rgba(167,139,250,0.3)]'
                        : 'bg-[#12121A]/50 border-[#1F1F2B] text-[#A1A1AA] hover:border-[#1F1F2B]/80 hover:bg-[#1F1F2B] hover:text-[#EAEAF0]'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${payerId === member.id.toString() ? 'bg-black/20 text-black' : 'bg-[#1F1F2B] text-[#EAEAF0]'}`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-xs leading-none">{member.id === currentUser?.id ? 'You' : member.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest opacity-60">Split Strategy</label>
                  <div className="flex bg-[#12121A]/50 border border-[#1F1F2B] p-1 rounded-xl shadow-inner">
                    <button type="button" onClick={() => setSplitMode('equal')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${splitMode === 'equal' ? 'bg-[#1F1F2B] text-[#A78BFA] shadow-lg' : 'text-[#A1A1AA] hover:text-[#EAEAF0]'}`}>Equal</button>
                    <button type="button" onClick={() => setSplitMode('exact')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${splitMode === 'exact' ? 'bg-[#1F1F2B] text-[#A78BFA] shadow-lg' : 'text-[#A1A1AA] hover:text-[#EAEAF0]'}`}>Exact</button>
                    <button type="button" onClick={() => setSplitMode('percentage')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${splitMode === 'percentage' ? 'bg-[#1F1F2B] text-[#A78BFA] shadow-lg' : 'text-[#A1A1AA] hover:text-[#EAEAF0]'}`}>%</button>
                  </div>
                </div>

                {/* Participants Breakdown */}
                <div className="bg-[#12121A]/30 border border-[#1F1F2B] rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#1F1F2B] bg-[#09090B]/30 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">{participantIds.length} Participants</span>
                    <button type="button" onClick={handleSelectAll} className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest hover:text-[#C4B5FD] transition-colors">
                      {participantIds.length === members.length ? 'Clear' : 'Select All'}
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Participant Selectors */}
                    <div className="flex flex-wrap gap-2">
                      {members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleParticipant(member.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold active:scale-95 ${participantIds.includes(member.id)
                            ? 'bg-[#A78BFA]/10 border-[#A78BFA]/40 text-[#EAEAF0] shadow-sm'
                            : 'bg-white/5 border-transparent text-[#A1A1AA] hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${participantIds.includes(member.id) ? 'bg-[#A78BFA] text-black shadow-[0_0_8px_rgba(167,139,250,0.5)]' : 'bg-[#1F1F2B]'
                            }`}>
                            {member.name.charAt(0)}
                          </div>
                          {member.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Breakdown Details - NO NESTED SCROLL */}
                    <div className="pt-2 space-y-1">
                      {participantIds.length > 0 ? (
                        participantIds.map(id => {
                          const m = members.find(m => m.id === id);
                          if (!m) return null;
                          return (
                            <div key={m.id} className="flex items-center justify-between py-2.5 px-3 bg-white/[0.02] rounded-xl border border-transparent hover:border-white/5 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-[#1F1F2B] flex items-center justify-center font-bold text-[10px] text-[#A1A1AA]">
                                  {m.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-[#EAEAF0]">{m.name.split(' ')[0]}</span>
                              </div>

                              {splitMode === 'equal' ? (
                                <span className="text-xs font-black text-[#EAEAF0]">
                                  {formatAmount((parseFloat(amount) || 0) / participantIds.length)}
                                </span>
                              ) : (
                                <div className="relative w-28 group">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A78BFA] text-[10px] font-black">
                                    {splitMode === 'percentage' ? '%' : currency.symbol}
                                  </span>
                                  <input
                                    type="number" step="0.01" placeholder="0"
                                    className="w-full bg-[#09090B] border border-[#1F1F2B] group-hover:border-[#A1A1AA]/30 rounded-xl py-1.5 px-3 pl-6 text-xs font-black text-white focus:outline-none focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA]/30 transition-all"
                                    value={splitMode === 'percentage' ? (percentageSplits[m.id] || '') : (exactSplits[m.id] || '')}
                                    onChange={(e) => {
                                      if (splitMode === 'percentage') setPercentageSplits({ ...percentageSplits, [m.id]: e.target.value });
                                      else setExactSplits({ ...exactSplits, [m.id]: e.target.value });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-xs text-[#A1A1AA] italic font-medium opacity-50">Select participants to split the bill</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {splitMode !== 'equal' && participantIds.length > 0 && (
                    <div className="bg-[#09090B]/80 px-4 py-3 flex justify-between items-center text-[11px] font-bold border-t border-[#1F1F2B]">
                      <span className="text-[#A1A1AA] uppercase tracking-[0.2em]">Summary</span>
                      <span className={`${remainingExact === 0 && remainingPct === 0 ? "text-[#34D399]" : "text-rose-400"} font-black flex items-center gap-2`}>
                        {remainingExact === 0 && remainingPct === 0 ? (
                          <>Matches total <CheckCircle2 size={14} /></>
                        ) : (
                          <>Left: {splitMode === 'percentage' ? `${remainingPct.toFixed(1)}%` : formatAmount(remainingExact)}</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Summary & Uploads (Moves below on Mobile) */}
            <div className="bg-[#12121A]/20 p-6 space-y-8 pb-32 lg:pb-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 opacity-60">Settlement Preview</label>
                <div className="bg-[#09090B] border border-[#1F1F2B] rounded-2xl p-5 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-white tracking-tight">{formatAmount(parsedAmt)}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                        <span className="text-xs font-semibold text-[#EAEAF0]">You paid</span>
                      </div>
                      <span className="text-xs font-black text-[#EAEAF0]">{formatAmount(youPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        <span className="text-xs font-semibold text-[#34D399]">You get back</span>
                      </div>
                      <span className="text-xs font-black text-[#34D399]">{formatAmount(youGetBack)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        <span className="text-xs font-semibold text-rose-500">You owe</span>
                      </div>
                      <span className="text-xs font-black text-rose-500">{formatAmount(youOwe)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 opacity-60">Receipt / Image</label>
                <div
                  className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer group ${receiptFile ? 'border-[#A78BFA] bg-[#A78BFA]/5' : 'border-[#1F1F2B] bg-[#09090B] hover:border-[#A78BFA]/40 hover:bg-[#A78BFA]/5'
                    }`}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                >
                  <input
                    type="file"
                    id="receipt-upload"
                    className="hidden"
                    accept="image/png, image/jpeg, application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReceiptFile(e.target.files[0]);
                      }
                    }}
                  />
                  {receiptFile ? (
                    <div className="animate-in zoom-in-95 duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA] mx-auto mb-4">
                        {receiptFile.type.includes('pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
                      </div>
                      <p className="text-xs font-bold text-[#EAEAF0] truncate max-w-[180px] mb-1">{receiptFile.name}</p>
                      <p className="text-[10px] text-[#A1A1AA] font-bold">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 active:scale-95 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptFile(null);
                        }}
                      >
                        Remove Attachment
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#1F1F2B] flex items-center justify-center text-[#A1A1AA] mb-4 group-hover:text-[#A78BFA] transition-all group-hover:scale-110">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-xs font-bold text-[#EAEAF0] mb-1">Click to upload receipt</p>
                      <p className="text-[10px] text-[#A1A1AA] font-bold opacity-60 uppercase tracking-tighter">JPG, PNG, or PDF</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* STICKY FOOTER ACTION AREA */}
        <div className="p-6 bg-[#09090B]/95 backdrop-blur-md border-t border-white/5 z-20 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
          <div className="max-w-2xl mx-auto flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-form"
              disabled={isLoading}
              className="flex-[2] py-4 btn-primary rounded-2xl font-black text-sm flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-[0_10px_25px_rgba(167,139,250,0.3)]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{editExpense ? 'Update Expense' : 'Add Expense'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
