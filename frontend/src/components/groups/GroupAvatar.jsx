import React from 'react';
import { 
  Users, Plane, Home, Briefcase, Car, Wallet, ShoppingCart, 
  Utensils, Coffee, Gift, Gamepad2, Book, GraduationCap, 
  Heart, Building, Camera, Music, Train, Bus, Bike, 
  Mountain, Tent, Map, Hotel, Pizza, DollarSign, 
  CreditCard, PiggyBank, Globe, Ship
} from 'lucide-react';

const ICON_MAP = {
  Users, Plane, Home, Briefcase, Car, Wallet, ShoppingCart, 
  Utensils, Coffee, Gift, Gamepad2, Book, GraduationCap, 
  Heart, Building, Camera, Music, Train, Bus, Bike, 
  Mountain, Tent, Map, Hotel, Pizza, DollarSign, 
  CreditCard, PiggyBank, Globe, Ship
};

const hexToRgb = (hex) => {
  if (!hex) return '59, 130, 246'; // fallback to blue
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return isNaN(r) ? '59, 130, 246' : `${r}, ${g}, ${b}`;
};

const GroupAvatar = ({ 
  iconName = 'Users', 
  iconColor = '#3B82F6', 
  className = '', 
  size = 24 
}) => {
  const IconComponent = ICON_MAP[iconName] || Users;
  
  // Provide sensible fallback if no color is provided
  const bgColor = iconColor || '#3B82F6';
  const rgbColor = hexToRgb(bgColor);

  return (
    <div 
      className={`flex items-center justify-center rounded-xl overflow-hidden relative shadow-lg ${className}`}
      style={{ backgroundColor: bgColor, color: 'white' }}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%)` 
        }} 
      />
      <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
        <IconComponent size={size} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default GroupAvatar;
