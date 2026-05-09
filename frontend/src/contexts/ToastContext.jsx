import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className="pointer-events-auto bg-[#12121A] border border-[#1F1F2B] shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 w-80 max-w-[90vw]"
            >
              {toast.type === 'success' && <CheckCircle2 className="text-[#A78BFA] shrink-0" size={20} />}
              {toast.type === 'error' && <AlertCircle className="text-rose-400 shrink-0" size={20} />}
              {toast.type === 'info' && <Info className="text-gray-400 shrink-0" size={20} />}
              
              <p className="text-sm font-medium text-[#EAEAF0] flex-1 break-words">{toast.message}</p>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-[#A1A1AA] hover:text-[#EAEAF0] transition-colors p-1 rounded-lg hover:bg-[#1F1F2B]"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
