import React, { useState } from 'react';
import { X, Users, MessageSquare, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import GroupIconPicker, { ICON_OPTIONS, COLOR_OPTIONS } from './groups/GroupIconPicker';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Users');
  const [iconColor, setIconColor] = useState('#3B82F6');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) return showToast('Group name is required', 'error');

    setIsLoading(true);
    const payload = {
      name,
      description,
      icon_name: iconName,
      icon_color: iconColor,
      currency: "INR"
    };

    try {
      await api.post('/groups/', payload);
      showToast('Group created successfully!');
      onGroupCreated();
      onClose();
      // Reset forms gracefully post-close
      setTimeout(() => {
        setName('');
        setDescription('');
        setIconName('Users');
        setIconColor('#3B82F6');
      }, 200);
    } catch (err) {
      console.error('[API Error] Group creation failed:', err.response?.data || err.message);
      const errorDetail = err.response?.data?.detail;
      showToast(typeof errorDetail === 'string' ? errorDetail : 'Failed to create group.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12121A] border border-[#1F1F2B] w-full max-w-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-5 border-b border-[#1F1F2B]">
          <div>
            <h3 className="text-lg font-bold text-[#EAEAF0] leading-none mb-1.5">New Group</h3>
            <p className="text-sm font-medium text-[#A1A1AA]">Create a space to split expenses.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1F1F2B] rounded-lg text-[#A1A1AA] hover:text-[#EAEAF0] transition-all duration-200 hover:scale-[1.05] active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Icon Picker Section */}
          <div className="pt-2 pb-4 border-b border-[#1F1F2B]">
            <GroupIconPicker
              selectedIcon={iconName}
              selectedColor={iconColor}
              onIconSelect={setIconName}
              onColorSelect={setIconColor}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1A1AA] ml-1">Group Name</label>
            <div className="relative group">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Trip to Paris, Apartment, etc."
                className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1A1AA] ml-1">Description (Optional)</label>
            <div className="relative group">
              <MessageSquare className="absolute left-3.5 top-5 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
              <textarea
                placeholder="What is this group for?"
                className="input-field w-full pl-10 min-h-[100px] py-3.5 resize-none focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#1F1F2B]/50 border border-[#1F1F2B] p-4 rounded-xl flex items-center gap-3 hover:bg-[#1F1F2B]/80 transition-colors">
            <p className="text-sm font-medium text-[#A1A1AA]">You will automatically be added as a member of this group.</p>
          </div>
        </form>

        <div className="p-5 bg-[#09090B]/50 border-t border-[#1F1F2B] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-ghost border border-[#1F1F2B]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] btn-primary"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            <span>{isLoading ? 'Creating...' : 'Create Group'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
