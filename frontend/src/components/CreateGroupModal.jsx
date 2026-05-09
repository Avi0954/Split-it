import React, { useState, useRef } from 'react';
import { X, Users, MessageSquare, Loader2, ImagePlus, User } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return showToast('Image size should be less than 5MB', 'error');
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) return showToast('Group name is required', 'error');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (avatarFile) {
      formData.append('avatar_file', avatarFile);
    }

    try {
      await api.post('/groups/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Group created successfully!');
      onGroupCreated();
      onClose();
      // Reset forms gracefully post-close
      setTimeout(() => {
        setName('');
        setDescription('');
        setAvatarFile(null);
        setAvatarPreview(null);
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
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative w-24 h-24 bg-[#09090B] border-2 border-dashed border-[#1F1F2B] hover:border-[#A78BFA] rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-all group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-[#A1A1AA] group-hover:text-[#A78BFA]">
                  <ImagePlus size={24} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImagePlus size={20} className="text-[#EAEAF0]" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <p className="text-[11px] text-[#A1A1AA] mt-3 font-medium uppercase tracking-wider">Group Identity</p>
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
