
import React from 'react';
import { NoteName } from '../types';
import { audioEngine } from '../services/audioEngine'; // Import audioEngine
// Fix: Import NOTE_FREQUENCIES directly from constants
import { NOTE_FREQUENCIES } from '../constants';

interface PianoKeyProps {
  note: NoteName;
  isBlack: boolean;
  isTarget: boolean; 
  isInput: boolean; 
  label?: string; 
  style?: React.CSSProperties;
  className?: string;
  duration?: number; 
  interactive?: boolean;
  onPress?: (note: NoteName, octave: number) => void; // Update type to pass note and octave
  onRelease?: (note: NoteName, octave: number) => void; // Update type to pass note and octave
  octave: number; // New prop: octave
  useAppPianoSound?: boolean; // New prop: defaults to true
}

const PianoKey: React.FC<PianoKeyProps> = ({ 
    note, isBlack, isTarget, isInput, label, style, className, duration,
    interactive = false, onPress, onRelease, octave, useAppPianoSound = true // Default to true
}) => {
  
  // Handlers for interaction
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (!interactive) return;
      // Prevent default to stop ghost clicks on touch devices
      // e.preventDefault(); 
      
      // If `useAppPianoSound` is true, play the app's internal piano sound
      if (useAppPianoSound) {
          // Fix: Use imported NOTE_FREQUENCIES directly
          const freq = NOTE_FREQUENCIES[`${note}${octave}`];
          if (freq) {
              audioEngine.playPianoNote(freq);
          }
      }
      
      if (onPress) onPress(note, octave);
  };

  const handleMouseUp = () => {
      if (!interactive) return;
      if (onRelease) onRelease(note, octave);
  };

  // -------------------------
  // STYLE LOGIC
  // -------------------------

  // Common Layout
  const commonClasses = "relative flex items-end justify-center transition-all duration-75 select-none overflow-visible";
  
  let keyClasses = "";
  let shadowStyle = {};
  let transformStyle = {};
  let labelColor = "text-text-secondary";

  // Active State (Visual Depression)
  // We treat 'isInput' as the pressed state for local user interaction OR external MIDI
  const isPressed = isInput; 

  if (isBlack) {
      // --- BLACK KEY ---
      // Realistic 3D Black Key Look
      keyClasses = `
          z-20 absolute top-0 w-[60%] left-1/2 -translate-x-1/2 h-[65%]
          rounded-b-[4px]
      `;
      
      // Gradients and Colors
      const bgGradient = isPressed 
          ? "linear-gradient(to bottom, #111 0%, #222 100%)" // Darker/flatter when pressed
          : "linear-gradient(to bottom, #333 0%, #000 100%)"; // Shiny when idle

      // Visual Feedback Colors (Overlay)
      let overlayColor = "transparent";
      if (isTarget) overlayColor = "rgba(59, 130, 246, 0.7)"; // Blue hint
      if (isPressed && !isTarget) overlayColor = "rgba(50, 50, 50, 0.5)"; // Just pressed
      if (isPressed && isTarget) overlayColor = "rgba(16, 185, 129, 0.8)"; // Success Green

      // Box Shadow (Depth)
      const shadow = isPressed
          ? "inset 0 2px 5px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.5)"
          : "inset 0 1px 2px rgba(255,255,255,0.2), 2px 4px 5px rgba(0,0,0,0.5), 0 0 1px #000";

      // Transform (Depression)
      const transform = isPressed ? "translate(-50%, 2px)" : "translate(-50%, 0)";
      
      style = { 
          ...style, 
          background: bgGradient, 
          boxShadow: shadow,
          transform: transform,
      };

      // Specular Highlight (The "Gloss")
      return (
        <div 
            className={`${commonClasses} ${keyClasses} ${className || ''} ${interactive ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
            style={style}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
        >
             {/* Color Overlay for Gameplay Status */}
             <div className="absolute inset-0 rounded-b-[4px]" style={{ background: overlayColor }} />
             
             {/* Glossy Reflection (Top) */}
             {!isPressed && (
                 <div className="absolute top-1 left-1 right-1 h-[85%] rounded-[2px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
             )}
             
             {/* Bottom Reflection */}
             <div className="absolute bottom-2 left-1 right-1 h-2 bg-white/10 rounded-full blur-[1px] pointer-events-none" />

             {/* Active Dot */}
             {isPressed && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_white]" />
             )}
        </div>
      );

  } else {
      // --- WHITE KEY ---
      // Realistic White Key Look (Ivory)
      keyClasses = `
          z-0 h-full rounded-b-[6px] border-x border-b border-[#ccc] dark:border-[#333]
      `;
      
      // Gradients
      const bgGradient = isPressed
          ? "linear-gradient(to bottom, #ddd 0%, #fff 100%)" // Pressed: slight shadow at top
          : "linear-gradient(to bottom, #fff 0%, #f3f3f3 100%)"; // Idle: clean white

      // Visual Feedback Colors (Overlay)
      let overlayColor = "transparent";
      if (isTarget) overlayColor = "rgba(59, 130, 246, 0.4)"; // Blue hint (lighter for white keys)
      if (isPressed && isTarget) overlayColor = "rgba(74, 222, 128, 0.6)"; // Success Green
      if (isPressed && !isTarget) overlayColor = "rgba(200, 200, 200, 0.2)"; // Generic press

      // Box Shadow (The "Lip" at the bottom)
      const shadow = isPressed
          ? "inset 0 3px 5px rgba(0,0,0,0.2)"
          : "inset 0 -8px 0px rgba(0,0,0,0.05), inset 0 -1px 0px rgba(0,0,0,0.2)";

      // Transform (Depression)
      // For white keys, we usually simulate depression by changing the shadow lip and slight Y translate
      const transform = isPressed ? "translateY(2px) scale(0.99)" : "translateY(0)";

      style = {
          ...style,
          background: bgGradient,
          boxShadow: shadow,
          transform: transform,
      };

      return (
        <div 
            className={`${commonClasses} ${keyClasses} ${className || ''} ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
            style={style}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
        >
             {/* Color Overlay */}
             <div className="absolute inset-0 rounded-b-[6px]" style={{ background: overlayColor }} />

             {/* Duration Indicator */}
             {isTarget && duration && duration > 1 && (
                  <div className="absolute bottom-0 w-full bg-blue-500/20" style={{ height: `${Math.min(100, duration * 10)}%` }} />
             )}

             {/* Label */}
             {label && (
                <span className={`mb-6 text-[10px] font-bold tracking-wider uppercase ${isTarget ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} transition-colors z-10`}>
                  {label}
                </span>
             )}
        </div>
      );
  }
};

export default PianoKey;