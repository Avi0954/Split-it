import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Receipt, HandCoins, Plus, Loader2, AlertCircle, TrendingUp, TrendingDown, CheckCircle2, Users, Pencil, Trash2, LogOut, Trash } from 'lucide-react';
import Layout from '../components/Layout';
import AddExpenseModal from '../components/AddExpenseModal';
import AddMemberModal from '../components/AddMemberModal';
import SettleUpModal from '../components/SettleUpModal';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';
import { useToast } from '../contexts/ToastContext';
import { useHeader } from '../contexts/HeaderContext';
import { useCurrency } from '../contexts/CurrencyContext';
import LocalReceiptThumbnail from '../components/LocalReceiptThumbnail';
import { deleteReceiptByExpenseId } from '../services/receiptDb';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('expenses');
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const { showToast } = useToast();
  const { setTitle, setActions } = useHeader();
  const { currency, formatAmount } = useCurrency();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [groupRes, expenseRes, settlementRes, userProfile] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/expenses`),
        api.get(`/groups/${id}/settlements`),
        getCurrentUser()
      ]);
      setGroup(groupRes.data);
      setExpenses(expenseRes.data);
      setSettlements(settlementRes.data);
      setCurrentUser(userProfile);
    } catch (err) {
      console.error('[API Error] Failed to fetch group details:', err);
      showToast('Failed to load group details.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchData();
    window.addEventListener('EXPENSE_ADDED', fetchData);
    return () => {
      window.removeEventListener('EXPENSE_ADDED', fetchData);
      setTitle(null);
      setActions([]);
    };
  }, [fetchData, setTitle, setActions]);

  useEffect(() => {
    if (group) {
      setTitle(group.name);
      const isCreator = group.created_by === currentUser?.id;
      const headerActions = [
        { label: 'Add Members', icon: UserPlus, onClick: () => setIsMemberModalOpen(true) },
        { label: 'Settle Up', icon: HandCoins, onClick: () => setIsSettleModalOpen(true) },
      ];

      if (isCreator) {
        headerActions.push({ label: 'Delete Group', icon: Trash, onClick: handleDeleteGroup, danger: true });
      } else {
        headerActions.push({ label: 'Leave Group', icon: LogOut, onClick: handleLeaveGroup, danger: true });
      }

      setActions(headerActions);
    }
  }, [group, currentUser, setTitle, setActions]);

  const handleDeleteExpense = async (e, expenseId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this expense? This will recalculate all balances.")) {
      try {
        await api.delete(`/groups/${id}/expenses/${expenseId}`);
        await deleteReceiptByExpenseId(expenseId);
        showToast('Expense deleted successfully', 'success');
        fetchData();
      } catch (err) {
        console.error("Delete failed:", err);
        showToast('Failed to delete expense', 'error');
      }
    }
  };

  const handleEditExpense = (e, exp) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION', {
      detail: { groupId: id, members: group.members.map(m => m.user), editExpense: exp }
    }));
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group? You must have a zero balance to leave.")) {
      try {
        await api.delete(`/groups/${id}/members/me`);
        showToast('You have successfully left the group.', 'success');
        navigate('/groups');
      } catch (err) {
        showToast(err.response?.data?.detail || 'Failed to leave group.', 'error');
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("DANGER: Are you sure you want to permanently delete this group? All expenses and debts will be wiped out forever.")) {
      try {
        await api.delete(`/groups/${id}`);
        showToast('Group deleted successfully.', 'success');
        navigate('/groups');
      } catch (err) {
        showToast(err.response?.data?.detail || 'Failed to delete group.', 'error');
      }
    }
  };

  // Calculate personal balance from settlements
  const personalOwedToYou = settlements
    .filter(s => s.to_user_id === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0);

  const personalYouOwe = settlements
    .filter(s => s.from_user_id === currentUser?.id)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-[#1F1F2B]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/groups')}
              className="hidden md:flex w-10 h-10 items-center justify-center bg-[#12121A] border border-[#1F1F2B] rounded-xl hover:bg-[#1F1F2B] transition-all duration-200 text-[#A1A1AA] hover:text-[#EAEAF0] active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              {isLoading && !group ? (
                <div className="w-48 h-8 bg-[#1F1F2B] rounded animate-pulse" />
              ) : (
                <h2 className="text-2xl md:text-3xl font-semibold text-[#EAEAF0] tracking-tight hidden md:block">{group?.name}</h2>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-medium bg-[#12121A] border border-[#1F1F2B] px-2.5 py-1 rounded-lg">
                  <Users size={12} />
                  {group ? group.members.length : '-'} members
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-medium bg-[#12121A] border border-[#1F1F2B] px-2.5 py-1 rounded-lg">
                  <Receipt size={12} />
                  {expenses.length} expenses
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {group?.created_by === currentUser?.id ? (
              <button
                onClick={handleDeleteGroup}
                className="w-11 h-11 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-xl transition-all duration-200 active:scale-95"
                title="Delete Group"
              >
                <Trash size={18} />
              </button>
            ) : (group && currentUser && (
              <button
                onClick={handleLeaveGroup}
                className="w-11 h-11 flex items-center justify-center bg-[#1F1F2B] text-[#A1A1AA] border border-[#1F1F2B] rounded-xl hover:bg-[#1A1A24] hover:text-white transition-all duration-200 active:scale-95"
                title="Leave Group"
              >
                <LogOut size={18} />
              </button>
            ))}

            <button
              onClick={() => setIsSettleModalOpen(true)}
              className="hidden md:flex items-center justify-center px-5 h-11 bg-[#09090B] border border-[#1F1F2B] text-[#A78BFA] hover:bg-[#1A1A24] font-semibold text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <HandCoins size={18} strokeWidth={2.5} className="mr-1.5" />
              <span>Settle Up</span>
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION', {
                  detail: { groupId: id, members: group.members.map(m => m.user) }
                }));
              }}
              className="hidden md:flex btn-primary px-5 h-11 text-sm rounded-xl shadow-[0_0_20px_rgba(167,139,250,0.15)]"
            >
              <Plus size={18} strokeWidth={2.5} className="mr-1.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1.5 bg-[#12121A] border border-[#1F1F2B] rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: 'expenses', icon: <Receipt size={16} />, label: 'Expenses' },
            { id: 'settlements', icon: <HandCoins size={16} />, label: 'Balances' },
            { id: 'members', icon: <UserPlus size={16} />, label: 'Members' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm hover:scale-[1.02] active:scale-95 ${activeTab === tab.id
                ? 'bg-[#1F1F2B] text-[#EAEAF0] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#1F1F2B]'
                : 'text-[#A1A1AA] hover:text-[#EAEAF0] hover:bg-[#1F1F2B]/50 border border-transparent'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Balance Status Header Cards */}
        {activeTab !== 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-5 rounded-2xl flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-[#A1A1AA] mb-1">You are owed</p>
                {isLoading ? (
                  <div className="w-24 h-9 bg-[#1F1F2B] rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-semibold text-[#EAEAF0] tracking-tight">{formatAmount(personalOwedToYou)}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-[#09090B] border border-[#1F1F2B] text-[#A78BFA] rounded-full flex items-center justify-center group-hover:border-[#A78BFA]/30 transition-all duration-200">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="card p-5 rounded-2xl flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-[#A1A1AA] mb-1">You owe</p>
                {isLoading ? (
                  <div className="w-24 h-9 bg-[#1F1F2B] rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-semibold text-[#EAEAF0] tracking-tight">{formatAmount(personalYouOwe)}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-[#09090B] border border-[#1F1F2B] text-[#A78BFA] rounded-full flex items-center justify-center group-hover:border-[#A78BFA]/30 transition-all duration-200">
                <TrendingDown size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card p-5 flex items-center justify-between border-[#1F1F2B]">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#1F1F2B] rounded-xl animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-[#1F1F2B] rounded animate-pulse" />
                        <div className="w-48 h-3 bg-[#1F1F2B] rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-[#1F1F2B] rounded animate-pulse" />
                  </div>
                ))
              ) : expenses.length === 0 ? (
                <div className="text-center py-20 card bg-transparent border-dashed border-[#1F1F2B]">
                  <span className="text-4xl mb-4 inline-block">📝</span>
                  <h3 className="text-lg font-semibold text-[#EAEAF0]">No expenses yet</h3>
                  <p className="text-[#A1A1AA] mt-2 mb-6 max-w-xs mx-auto text-sm">Add an expense to start splitting costs with the group.</p>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('OPEN_ADD_ACTION', {
                        detail: { groupId: id, members: group.members.map(m => m.user) }
                      }));
                    }}
                    className="btn-primary px-6 py-2.5 h-auto text-sm rounded-xl"
                  >
                    Add an Expense
                  </button>
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="card p-5 cursor-pointer hover:bg-[#1A1A24] transition-colors active:scale-[0.99] group">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-[#09090B] rounded-xl flex items-center justify-center text-[#A1A1AA] border border-[#1F1F2B] group-hover:bg-[#12121A] transition-colors">
                          <Receipt size={20} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-semibold text-[#EAEAF0] text-base mb-1">{exp.description}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                            <span>Paid by</span>
                            <span className={exp.payer_id === currentUser?.id ? 'text-[#A78BFA] font-semibold' : 'text-[#EAEAF0] font-semibold'}>
                              {exp.payer_id === currentUser?.id ? 'you' : exp.payer_name}
                            </span>
                            <span className="text-[#1F1F2B] px-1">•</span>
                            <span>{new Date(exp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xl font-semibold text-[#EAEAF0]">{formatAmount(exp.amount, exp.currency)}</p>
                        {exp.currency !== currency.code && (
                          <p className="text-[10px] text-[#A1A1AA] font-bold mt-1 uppercase tracking-tight opacity-50">
                            ≈ {exp.currency === 'INR' ? '₹' : 'रु'}{exp.amount.toFixed(2)}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-200">
                          <LocalReceiptThumbnail expenseId={exp.id} />
                          
                          {(exp.payer_id === currentUser?.id || group?.created_by === currentUser?.id) && (
                            <>
                              <button
                                onClick={(e) => handleEditExpense(e, exp)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1F1F2B] text-purple-400 hover:bg-purple-500/20 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteExpense(e, exp.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1F1F2B] text-red-500 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="space-y-4">
              <div className="card flex items-center gap-3 py-3 px-5 rounded-xl">
                <AlertCircle className="text-[#A1A1AA] flex-shrink-0" size={18} />
                <p className="text-sm font-medium text-[#A1A1AA]">Balances show the simplest way to settle up current debts.</p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="card p-5 border-[#1F1F2B]">
                      <div className="flex justify-between items-center">
                        <div className="space-y-3 w-1/2">
                          <div className="h-4 w-16 bg-[#1F1F2B] rounded animate-pulse" />
                          <div className="h-4 w-20 bg-[#1F1F2B] rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-[#1F1F2B] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : settlements.length === 0 ? (
                <div className="text-center py-20 card bg-transparent border-2 border-dashed border-[#1F1F2B] rounded-2xl">
                  <span className="text-4xl mb-4 inline-block">✨</span>
                  <h3 className="text-lg font-semibold text-[#EAEAF0]">You're all settled up!</h3>
                  <p className="text-[#A1A1AA] mt-2 text-sm max-w-xs mx-auto">There are no outstanding balances in this group.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settlements.map((s, idx) => {
                    const isYouInvolved = s.from_user_id === currentUser?.id || s.to_user_id === currentUser?.id;
                    const youAreDebtor = s.from_user_id === currentUser?.id;

                    return (
                      <div key={idx} className={`card p-5 rounded-2xl transition-all duration-200 hover:scale-[1.01] ${isYouInvolved
                        ? (youAreDebtor ? 'border-[#1F1F2B]/50' : 'border-l-[3px] border-l-[#A78BFA] bg-[#12121A]/80')
                        : 'bg-[#12121A] border-[#1F1F2B]'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col">
                              <span className={`text-base font-semibold ${youAreDebtor ? 'text-[#EAEAF0]' : 'text-[#A1A1AA]'}`}>
                                {s.from_user_id === currentUser?.id ? 'You' : s.from_user_name}
                              </span>
                              <span className="text-xs font-medium text-[#A1A1AA] mt-0.5">owes</span>
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-base font-semibold ${!youAreDebtor && s.to_user_id === currentUser?.id ? 'text-[#EAEAF0]' : 'text-[#A1A1AA]'}`}>
                                {s.to_user_id === currentUser?.id ? 'You' : s.to_user_name}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <p className={`text-2xl font-semibold ${isYouInvolved ? 'text-[#A78BFA]' : 'text-[#EAEAF0]'}`}>{formatAmount(s.amount)}</p>
                            {isYouInvolved && (
                              <button className={`mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 ${youAreDebtor
                                ? 'bg-[#1F1F2B] text-[#EAEAF0] hover:bg-[#1F1F2B]/80'
                                : 'bg-[#1F1F2B] text-[#A78BFA] hover:bg-[#1F1F2B]/80'
                                }`}>
                                {youAreDebtor ? 'Record Payment' : 'Send Reminder'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card p-4 flex items-center justify-between border-[#1F1F2B]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1F1F2B] rounded-xl animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-[#1F1F2B] rounded animate-pulse" />
                        <div className="w-32 h-3 bg-[#1F1F2B] rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {group?.members.map((member) => (
                    <div key={member.id} className="card p-4 flex items-center justify-between border-[#1F1F2B] hover:scale-[1.01] transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#09090B] rounded-xl flex items-center justify-center text-[#A1A1AA] font-bold text-lg border border-[#1F1F2B]">
                          {member.user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#EAEAF0] text-base">{member.user.name}</span>
                            {member.user.id === currentUser?.id && (
                              <span className="px-2 py-0.5 bg-[#1F1F2B] text-[#A78BFA] rounded text-[10px] font-bold tracking-wider">YOU</span>
                            )}
                          </div>
                          <span className="text-xs text-[#A1A1AA] mt-0.5">{member.user.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setIsMemberModalOpen(true)}
                    className="card border-dashed border-2 border-[#1F1F2B] hover:border-[#A78BFA]/50 transition-colors flex items-center gap-4 p-4 rounded-2xl text-left bg-transparent group active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#1F1F2B] flex items-center justify-center group-hover:border-[#A78BFA]/30 transition-colors text-[#A1A1AA] group-hover:text-[#A78BFA]">
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-[#A1A1AA] group-hover:text-[#EAEAF0] transition-colors">Add Member</span>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">Invite someone to this group</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </div>




        {/* Add Member Modal */}
        {group && (
          <AddMemberModal
            isOpen={isMemberModalOpen}
            onClose={() => setIsMemberModalOpen(false)}
            groupId={id}
            onMemberAdded={fetchData}
          />
        )}

        {/* Settle Up Modal */}
        {group && currentUser && (
          <SettleUpModal
            isOpen={isSettleModalOpen}
            onClose={() => setIsSettleModalOpen(false)}
            groupId={id}
            currentUser={currentUser}
            onSettled={fetchData}
          />
        )}
      </div>
    </Layout>
  );
};

export default GroupDetails;
