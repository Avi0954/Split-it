import React, { useState } from 'react';
import { 
  Users, Plane, Home, Briefcase, Car, Wallet, ShoppingCart, 
  Utensils, Coffee, Gift, Gamepad2, Book, GraduationCap, 
  Heart, Building, Camera, Music, Train, Bus, Bike, 
  Mountain, Tent, Map, Hotel, Pizza, DollarSign, 
  CreditCard, PiggyBank, Globe, Ship
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Users', icon: Users },
  { name: 'Plane', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Car', icon: Car },
  { name: 'Wallet', icon: Wallet },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Coffee', icon: Coffee },
  { name: 'Gift', icon: Gift },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Book', icon: Book },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Heart', icon: Heart },
  { name: 'Building', icon: Building },
  { name: 'Camera', icon: Camera },
  { name: 'Music', icon: Music },
  { name: 'Train', icon: Train },
  { name: 'Bus', icon: Bus },
  { name: 'Bike', icon: Bike },
  { name: 'Mountain', icon: Mountain },
  { name: 'Tent', icon: Tent },
  { name: 'Map', icon: Map },
  { name: 'Hotel', icon: Hotel },
  { name: 'Pizza', icon: Pizza },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Globe', icon: Globe },
  { name: 'Ship', icon: Ship }
];

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#A78BFA', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#EF4444', // Red
  '#EAB308', // Yellow
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#6366F1'  // Indigo
];

const GroupIconPicker = ({ selectedIcon, selectedColor, onIconSelect, onColorSelect }) => {
  return (
    <div className="space-y-4 w-full">
      {/* Icon Grid */}
      <div>
        <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
          Select Icon
        </label>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 max-h-48 overflow-y-auto no-scrollbar p-1">
          {ICON_OPTIONS.map(({ name, icon: Icon }) => (
            <button
              type="button"
              key={name}
              onClick={() => onIconSelect(name)}
              aria-label={`Select ${name} icon`}
              className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                selectedIcon === name 
                  ? 'bg-[#A78BFA]/20 border border-[#A78BFA] text-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.2)]' 
                  : 'bg-[#12121A] border border-[#1F1F2B] text-[#A1A1AA] hover:bg-[#1A1A24] hover:text-[#EAEAF0]'
              } focus:outline-none focus:ring-2 focus:ring-[#A78BFA]`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Color Grid */}
      <div>
        <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
          Select Color
        </label>
        <div className="flex flex-wrap gap-2 p-1">
          {COLOR_OPTIONS.map(color => (
            <button
              type="button"
              key={color}
              onClick={() => onColorSelect(color)}
              aria-label={`Select color ${color}`}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#09090B] ${
                selectedColor === color 
                  ? 'scale-125 shadow-lg border-2 border-[#09090B] ring-2 ring-white/50' 
                  : 'scale-100 hover:scale-110 border border-transparent'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupIconPicker;
export { ICON_OPTIONS, COLOR_OPTIONS };
