import React, { useState } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AddMemberModal = ({ isOpen, onClose, groupId, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;

    setFoundUser(null);
    setIsSearching(true);

    try {
      const response = await api.get(`/users/search?email=${email}`);
      setFoundUser(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        showToast("We couldn't find a user with that email. Make sure they are registered on SplitIt.", 'error');
      } else {
        showToast('Error searching for user. Please try again.', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser) return;

    setIsAdding(true);

    try {
      await api.post(`/groups/${groupId}/add-member`, { user_id: foundUser.id });
      showToast(`${foundUser.name} added to the group!`, 'success');
      onMemberAdded();

      onClose();
      setTimeout(resetForm, 200);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to add member to the group.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFoundUser(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12121A] w-full max-w-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1F1F2B]">

        <div className="flex items-center justify-between p-5 border-b border-[#1F1F2B]">
          <div>
            <h3 className="text-lg font-bold text-[#EAEAF0] leading-none mb-1.5">Add Member</h3>
            <p className="text-sm font-medium text-[#A1A1AA]">Invite someone to join this group.</p>
          </div>
          <button onClick={() => { onClose(); resetForm(); }} className="p-2 hover:bg-[#1F1F2B] rounded-lg text-[#A1A1AA] hover:text-[#EAEAF0] transition-colors hover:scale-[1.05] active:scale-95">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <form onSubmit={handleSearch} className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1A1AA] ml-1">Email Address</label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !email}
                className="btn-primary px-4 bg-[#1F1F2B] hover:bg-[#1F1F2B]/80 text-[#EAEAF0] shadow-none flex-shrink-0"
              >
                {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
              </button>
            </div>
          </form>

          {foundUser && (
            <div className="bg-[#12121A] border border-[#1F1F2B] p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#A78BFA]/10 text-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-lg border border-[#A78BFA]/20">
                  {foundUser.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[#EAEAF0] text-base leading-none">{foundUser.name}</span>
                  <span className="text-xs text-[#A1A1AA] mt-1">{foundUser.email}</span>
                </div>
              </div>
              <button
                onClick={handleAddMember}
                disabled={isAdding}
                className="btn-primary h-auto py-2 px-4 rounded-lg bg-[#A78BFA] text-black shadow-none text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isAdding ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} className="mr-1.5" />}
                <span>{isAdding ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
