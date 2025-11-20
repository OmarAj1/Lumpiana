
import React from 'react';
import { NoteName } from '../types';

interface PianoKeyProps {
  note: NoteName;
  isBlack: boolean;
  isTarget: boolean; // The note the game wants
  isInput: boolean; // The note the user is pressing
  label?: string; // Optional: Only show if settings allow
  style?: React.CSSProperties;
  className?: string;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, isTarget, isInput, label, style, className }) => {
  
  // Base physics/layout
  const commonClasses = "relative flex items-end justify-center transition-colors duration-75 ease-out select-none cursor-default overflow-visible";
  
  // Determine Feedback Color State
  // Priority: Input (Red/Green) > Target (Blue waiting)
  let bgClass = "";
  let shadowClass = "";
  let translateClass = "";
  let borderClass = "";

  if (isTarget && isInput) {
      // HIT (Correct)
      bgClass = isBlack 
        ? "bg-green-500 from-green-400 to-green-600" 
        : "bg-green-400 from-green-300 to-green-500";
      shadowClass = "shadow-[0_0_30px_rgba(74,222,128,0.8)] z-50";
      translateClass = "translate-y-1"; // Physical press
  } else if (isInput) {
      // WRONG (User error)
      bgClass = isBlack 
        ? "bg-red-600 from-red-500 to-red-700" 
        : "bg-red-400 from-red-300 to-red-500";
      shadowClass = "shadow-[0_0_30px_rgba(248,113,113,0.8)] z-50";
      translateClass = "translate-y-1";
  } else if (isTarget) {
      // WAITING (Guide)
      bgClass = isBlack 
        ? "bg-blue-600 from-blue-500 to-blue-700" 
        : "bg-blue-400 from-blue-300 to-blue-500";
      shadowClass = "shadow-[0_0_25px_rgba(96,165,250,0.6)] animate-pulse z-40";
      translateClass = "translate-y-0.5";
  } else {
      // IDLE (Realistic Piano Look)
      if (isBlack) {
          bgClass = "bg-gray-900 bg-[linear-gradient(145deg,#2a2a2a_0%,#000000_100%)]";
          // Realistic glossy highlight on top
          shadowClass = "shadow-[4px_8px_8px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.2)]";
      } else {
          bgClass = "bg-white bg-[linear-gradient(to_bottom,#ffffff_0%,#f3f4f6_100%)]";
          shadowClass = "shadow-[inset_0_-1px_3px_rgba(0,0,0,0.2)]";
          borderClass = "border-l border-r border-b border-gray-300";
      }
  }

  const whiteKeyLayout = `
    z-0 h-full rounded-b-[6px] text-gray-400 
    active:bg-gray-100 
    ${bgClass} ${borderClass} ${shadowClass} ${translateClass}
  `;
  
  // Black keys are typically ~60-65% height of white keys
  const blackKeyLayout = `
    z-20 h-[65%] absolute top-0 w-[60%] -translate-x-1/2 left-1/2 rounded-b-[4px] 
    ${bgClass} ${shadowClass} ${translateClass}
  `;

  return (
    <div 
      className={`${commonClasses} ${isBlack ? blackKeyLayout : whiteKeyLayout} ${className || ''}`}
      style={style}
    >
      {/* Glossy Reflection for Black Keys */}
      {isBlack && !isTarget && !isInput && (
          <div className="absolute top-[2%] left-[10%] w-[80%] h-[90%] rounded-b-[3px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}

      {/* Note Label (Only visible on White keys for cleanliness if prop passed) */}
      {!isBlack && label && (
        <span className={`mb-3 text-[10px] font-bold tracking-widest uppercase ${isTarget || isInput ? 'text-white opacity-100' : 'text-gray-400 opacity-60'} transition-opacity`}>
          {label}
        </span>
      )}
      
      {/* Highlight marker for guide on black keys */}
      {isBlack && (isTarget || isInput) && (
         <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white/80" />
      )}
    </div>
  );
};

export default PianoKey;
