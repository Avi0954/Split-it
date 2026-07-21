import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useNotifications } from '../notifications/NotificationProvider';
import { useToast } from '../contexts/ToastContext';

const NotificationSettings = () => {
  const { isSupported, permission, isSubscribed, isLoading, enableNotifications, disableNotifications } = useNotifications();
  const { showToast } = useToast();

  if (!isSupported) {
    return (
      <div className="card bg-[#12121A] border border-[#1F1F2B] p-6 rounded-2xl space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight flex items-center gap-2">
              <BellOff size={18} className="text-[#A1A1AA]" />
              Push Notifications
            </h3>
            <p className="text-[#A1A1AA] text-sm font-medium mt-1">
              Your browser does not support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await disableNotifications();
      if (success) {
        showToast('Push notifications disabled', 'success');
      } else {
        showToast('Failed to disable notifications', 'error');
      }
    } else {
      const success = await enableNotifications();
      if (success) {
        showToast('Push notifications enabled!', 'success');
      } else {
        if (Notification.permission === 'denied') {
          showToast('Please enable notifications in your browser settings.', 'warning');
        } else {
          showToast('Failed to enable notifications', 'error');
        }
      }
    }
  };

  return (
    <div className="card bg-[#12121A] border border-[#1F1F2B] p-6 rounded-2xl space-y-4 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#EAEAF0] tracking-tight flex items-center gap-2">
            <Bell size={18} className={isSubscribed ? "text-[#A78BFA]" : "text-[#A1A1AA]"} />
            Push Notifications
          </h3>
          <p className="text-[#A1A1AA] text-sm font-medium mt-1 pr-4">
            Receive instant alerts for new expenses, settlements, and group activities.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-[#52525B]">Browser Permission:</span>
            <span className={`font-bold capitalize ${
              permission === 'granted' ? 'text-[#34D399]' : 
              permission === 'denied' ? 'text-rose-400' : 'text-[#A1A1AA]'
            }`}>
              {permission}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            isSubscribed
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
              : 'bg-[#A78BFA]/10 text-[#A78BFA] hover:bg-[#A78BFA]/20 border border-[#A78BFA]/20'
          } ${(isLoading || permission === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isSubscribed ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
