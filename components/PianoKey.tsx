
import React from 'react';
import { NoteName } from '../types';

interface PianoKeyProps {
  note: NoteName;
  isBlack: boolean;
  isActive: boolean;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, isActive, label, style, className }) => {
  const baseClasses = "relative flex items-end justify-center rounded-b-sm transition-all duration-75 ease-out select-none cursor-default shadow-lg";
  
  const colorClasses = isBlack
    ? `bg-surface-primary text-white border-x border-b border-gray-800 ${isActive ? 'bg-gradient-to-b from-violet-500 to-violet-700 shadow-[0_0_20px_rgba(139,92,246,0.8)]' : 'bg-gray-900'}`
    : `bg-white text-gray-900 border border-gray-300 ${isActive ? 'bg-gradient-to-b from-violet-200 to-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.5)]' : 'hover:bg-gray-50'}`;

  // Height is handled by parent or defaults
  const heightClass = isBlack ? 'h-[60%]' : 'h-full';
  const zIndex = isBlack ? 'z-10' : 'z-0';

  return (
    <div 
      className={`${baseClasses} ${colorClasses} ${heightClass} ${zIndex} ${className || ''}`}
      style={style}
    >
      {!isBlack && <span className="mb-4 text-[10px] font-bold text-gray-400/50">{label}</span>}
    </div>
  );
};

export default PianoKey;
