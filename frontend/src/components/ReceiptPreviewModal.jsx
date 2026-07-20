import React, { useState, useEffect } from 'react';
import { X, Download, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

const ReceiptPreviewModal = ({ isOpen, onClose, receipt }) => {
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setScale(1);
        setIsFullscreen(false);
      }, 200);
    }
  }, [isOpen]);

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (receipt?.imageBlob) {
      const url = URL.createObjectURL(receipt.imageBlob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [receipt]);

  if (!isOpen || !receipt || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = receipt.fileName || 'receipt.jpg';
    a.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`relative bg-[#09090B] border border-[#1F1F2B] overflow-hidden flex flex-col transition-all duration-300 ${isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-4xl rounded-2xl shadow-2xl h-[85vh]'}`}>
        
        {/* Header Bar */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
          <div>
            <h3 className="text-white font-bold tracking-tight shadow-black drop-shadow-md">{receipt.fileName}</h3>
            <p className="text-[#A1A1AA] text-xs font-medium mt-0.5">Stored locally • {(receipt.imageBlob.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-[#1F1F2B] rounded-full text-white transition-all backdrop-blur-md">
              <ZoomOut size={18} />
            </button>
            <button onClick={zoomIn} className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-[#1F1F2B] rounded-full text-white transition-all backdrop-blur-md">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={handleDownload} className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-[#1F1F2B] rounded-full text-white transition-all backdrop-blur-md">
              <Download size={18} />
            </button>
            <button onClick={toggleFullscreen} className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-[#1F1F2B] rounded-full text-white transition-all backdrop-blur-md hidden sm:flex">
              <Maximize size={18} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-rose-500 rounded-full text-white transition-all backdrop-blur-md">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#09090B] custom-scrollbar">
          <img 
            src={imageUrl} 
            alt="Receipt Preview" 
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;
