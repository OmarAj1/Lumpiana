import React from 'react';
import { BLACK_KEY_HEIGHT_RATIO, ORIGINAL_WHITE_KEY_HEIGHT, NOTE_NAMES } from '../utils/constants';

interface BlackKeyProps {
  midi: number;
  x: number; // x position in SVG coordinate system
  w: number; // width in SVG coordinate system
  height: number; // Actual height passed from VirtualPiano
  yOffset: number; // y offset from top of SVG
  isActive: boolean;
  keyLabel: string; // Still passed, but not rendered
  playNote: (midi: number) => void;
  stopNote: (midi: number) => void;
  onPointerEnter: (e: React.PointerEvent, midi: number, playNote: (n: number) => void) => void;
}

const BlackKey: React.FC<BlackKeyProps> = React.memo(({
  midi, x, w, height, yOffset, isActive, playNote, stopNote, onPointerEnter
}) => {
  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent white key from also triggering
    playNote(midi);
  };

  const handleUp = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopNote(midi);
  };

  const handleLeave = (e: React.PointerEvent) => {
    e.stopPropagation();
    stopNote(midi);
  };

  // Derive Octave for displaying (not used for label, but kept for context if needed later)
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[midi % 12];

  return (
    <g
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={handleLeave} // End note on mouse out
      onPointerEnter={(e) => onPointerEnter(e, midi, playNote)} // Glissando support
      style={{ touchAction: 'none' }}
      className="blackkeybutton" // Apply className for targetting
    >
      {/* Shadow */}
      <rect x={x + 2} y={yOffset + 2} width={w} height={height + 5} rx={3} ry={3} 
            fill="rgb(var(--virtual-piano-black-key-shadow) / 0.3)" />
      {/* Main Key Body */}
      <rect
        x={x}
        y={yOffset}
        width={w}
        height={height}
        rx={3} ry={3}
        fill={isActive ? 'rgb(var(--virtual-piano-black-key-bg-active))' : 'rgb(var(--virtual-piano-black-key-bg-idle))'}
        stroke="rgb(var(--virtual-piano-black-key-border))"
        strokeWidth={isActive ? 2 : 1} // Thicker stroke when active
        className="cursor-pointer transition-transform duration-75 ease-out origin-top"
        style={{ 
          transform: isActive ? 'rotateX(-3deg) translateY(1px)' : 'none',
          filter: isActive ? 'drop-shadow(0px 2px 6px rgba(0,255,255,0.4))' : 'none', // Subtle glow when active
        }}
      />
      {/* Top Highlight/Reflection */}
      <rect x={x + w*0.15} y={yOffset + 3} width={w*0.7} height={height * 0.8} rx={2} ry={2} 
            fill="rgb(var(--virtual-piano-black-key-highlight))" 
            opacity={isActive ? 0.2 : 0.05} className="pointer-events-none" />
      
      {/* Key Label on Black Key - REMOVED PER USER REQUEST */}
    </g>
  );
});

export default BlackKey;