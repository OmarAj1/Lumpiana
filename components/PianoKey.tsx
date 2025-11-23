
import React from 'react';
import { NoteName } from '../types';

interface PianoKeyProps {
  note: NoteName;
  isBlack: boolean;
  isTarget: boolean; 
  isInput: boolean; 
  label?: string; 
  style?: React.CSSProperties;
  className?: string;
  duration?: number; 
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, isTarget, isInput, label, style, className, duration }) => {
  
  // Base physics/layout
  const commonClasses = "relative flex items-end justify-center transition-all duration-100 ease-out select-none cursor-default overflow-visible";
  
  let bgClass = "";
  let shadowClass = "";
  let translateClass = "";
  let labelColor = "text-gray-400";

  if (isTarget && isInput) {
      // HIT (Correct) - Clean Green Glow
      bgClass = "bg-emerald-500";
      shadowClass = "shadow-[0_0_30px_rgba(16,185,129,0.6)] z-50";
      translateClass = isBlack ? "translate-y-1" : "translate-y-2 scale-[0.98]"; 
      labelColor = "text-white";
  } else if (isInput) {
      // WRONG (User error) - Soft Red
      bgClass = "bg-rose-500";
      shadowClass = "shadow-[0_0_20px_rgba(244,63,94,0.5)] z-50";
      translateClass = isBlack ? "translate-y-1" : "translate-y-2 scale-[0.98]";
      labelColor = "text-white";
  } else if (isTarget) {
      // WAITING (Guide) - Minimal Blue Indicator
      bgClass = isBlack ? "bg-blue-600" : "bg-blue-100";
      shadowClass = "shadow-[inset_0_0_20px_rgba(59,130,246,0.5)] z-40";
      labelColor = "text-blue-600";
  } else {
      // IDLE
      if (isBlack) {
          bgClass = "bg-zinc-900";
          shadowClass = "shadow-[2px_4px_8px_rgba(0,0,0,0.6)]";
      } else {
          bgClass = "bg-white";
          shadowClass = "shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05)]";
      }
  }

  const whiteKeyLayout = `
    z-0 h-full rounded-b-[8px] border-x border-b border-[#d4d4d8]
    ${bgClass} ${shadowClass} ${translateClass}
  `;
  
  const blackKeyLayout = `
    z-20 h-[65%] absolute top-0 w-[60%] -translate-x-1/2 left-1/2 rounded-b-[6px] border-x border-b border-black
    ${bgClass} ${shadowClass} ${translateClass}
  `;

  return (
    <div 
      className={`${commonClasses} ${isBlack ? blackKeyLayout : whiteKeyLayout} ${className || ''}`}
      style={style}
    >
      {/* Specular Highlight for Black Keys (Subtle) */}
      {isBlack && !isTarget && !isInput && (
          <div className="absolute top-2 left-1 right-1 h-full bg-gradient-to-b from-white/10 to-transparent rounded-b-[4px] pointer-events-none" />
      )}

      {/* Duration / Hold Indicator */}
      {isTarget && duration && duration > 1 && (
          <div className="absolute bottom-0 w-full bg-current opacity-20" style={{ height: `${Math.min(100, duration * 15)}%` }} />
      )}

      {/* Note Label */}
      {!isBlack && label && (
        <span className={`mb-4 text-[10px] font-medium tracking-wider uppercase ${labelColor} transition-colors`}>
          {label}
        </span>
      )}
      
      {/* Active Dot for Black Keys */}
      {isBlack && (isTarget || isInput) && (
         <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-white/90 shadow-glow" />
      )}
    </div>
  );
};

export default PianoKey;
