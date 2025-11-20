
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
  // Realistic Piano Styling
  const commonClasses = "relative flex items-end justify-center transition-all duration-100 ease-out select-none cursor-default";
  
  // White Key: Ivory look with 3D depth at bottom
  const whiteKeyClasses = `
    z-0 
    ${isActive 
      ? 'bg-gradient-to-b from-blue-300 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] border-b-4 border-blue-700 translate-y-1' 
      : 'bg-gradient-to-b from-white to-gray-200 border-b-8 border-gray-300 shadow-[inset_0_-5px_5px_rgba(0,0,0,0.05)] hover:bg-gray-50'} 
    border-x border-gray-300 rounded-b-[6px] text-gray-400
  `;

  // Black Key: Matte black with glossy top highlight
  const blackKeyClasses = `
    z-10 h-[65%] absolute top-0
    ${isActive 
      ? 'bg-gradient-to-b from-blue-600 to-blue-800 shadow-[0_0_20px_rgba(59,130,246,0.8)] border-b-2 border-blue-900' 
      : 'bg-gradient-to-b from-gray-800 via-black to-black border-x border-b border-gray-900 shadow-[2px_5px_10px_rgba(0,0,0,0.4),inset_0_5px_5px_rgba(255,255,255,0.15)]'}
    rounded-b-[4px]
  `;

  return (
    <div 
      className={`${commonClasses} ${isBlack ? blackKeyClasses : whiteKeyClasses} ${className || ''}`}
      style={style}
    >
      {!isBlack && (
        <span className={`mb-3 text-xs font-bold tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default PianoKey;
