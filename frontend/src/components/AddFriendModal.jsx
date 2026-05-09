import React, { useState } from 'react';
import { X, UserPlus, Mail } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AddFriendModal = ({ isOpen, onClose, onFriendAdded }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await api.post('/friends/', { email: email.trim() });
      showToast('Friend added successfully!', 'success');
      setEmail('');
      onFriendAdded();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to add friend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="card w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#1F1F2B] flex items-center justify-between bg-[#09090B] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A78BFA]/10 rounded-xl flex items-center justify-center text-[#A78BFA]">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#EAEAF0]">Add a Friend</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">Friend's Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="email"
                required
                placeholder="Enter their email address..."
                className="input-field pl-11 text-lg font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 btn-primary"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Add Friend'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
