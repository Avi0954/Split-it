import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Search } from 'lucide-react';
import { getReceiptByExpenseId } from '../services/receiptDb';
import ReceiptPreviewModal from './ReceiptPreviewModal';
import { useToast } from '../contexts/ToastContext';

const LocalReceiptThumbnail = ({ expenseId }) => {
  const [receipt, setReceipt] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setIsChecking(true);
    getReceiptByExpenseId(expenseId)
      .then(res => {
        if (isMounted && res) {
          setReceipt(res);
          setImageUrl(URL.createObjectURL(res.imageBlob));
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [expenseId]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleClick = (e) => {
    e.stopPropagation(); // prevent opening the edit modal
    if (receipt) {
      setIsModalOpen(true);
    } else {
      showToast('This receipt is stored only on the device where it was uploaded.', 'warning');
    }
  };

  if (isChecking) return null;

  return (
    <>
      <button 
        onClick={handleClick}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors group/receipt relative overflow-hidden ${
          receipt 
            ? 'bg-[#1F1F2B] border border-[#A78BFA]/30 hover:border-[#A78BFA]' 
            : 'bg-transparent hover:bg-[#1F1F2B] text-[#A1A1AA] hover:text-[#EAEAF0]'
        }`}
        title={receipt ? "View local receipt" : "Receipts are device-local"}
      >
        {receipt ? (
          <>
            <img 
              src={imageUrl} 
              alt="Receipt thumb" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/receipt:opacity-40 transition-opacity"
            />
            <Search size={14} className="relative z-10 text-white opacity-0 group-hover/receipt:opacity-100 transition-opacity drop-shadow-md" />
          </>
        ) : (
          <ImageIcon size={14} />
        )}
      </button>

      {receipt && (
        <ReceiptPreviewModal 
          isOpen={isModalOpen} 
          onClose={(e) => {
            if(e) e.stopPropagation();
            setIsModalOpen(false);
          }} 
          receipt={receipt} 
        />
      )}
    </>
  );
};

export default LocalReceiptThumbnail;
