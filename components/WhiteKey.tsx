import React from 'react';
import { ORIGINAL_WHITE_KEY_HEIGHT, NOTE_NAMES } from '../utils/constants';

interface WhiteKeyProps {
  midi: number;
  x: number; // x position in SVG coordinate system
  w: number; // width in SVG coordinate system
  height: number; // Actual height passed from VirtualPiano
  yOffset: number; // y offset from top of SVG
  isActive: boolean;
  keyLabel: string;
  playNote: (midi: number) => void;
  stopNote: (midi: number) => void;
  onPointerEnter: (e: React.PointerEvent, midi: number, playNote: (n: number) => void) => void;
}

const WhiteKey: React.FC<WhiteKeyProps> = React.memo(({
  midi, x, w, height, yOffset, isActive, keyLabel, playNote, stopNote, onPointerEnter
}) => {
  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    playNote(midi);
  };

  const handleUp = (e: React.PointerEvent) => {
    e.preventDefault();
    stopNote(midi);
  };

  const handleLeave = (e: React.PointerEvent) => {
    stopNote(midi);
  };

  // Calculate scaled font sizes and Y positions based on the current key height relative to original
  const scaleFactor = height / ORIGINAL_WHITE_KEY_HEIGHT;
  
  // Derive Octave for displaying
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[midi % 12];

  const keyLabelFontSize = 16 * scaleFactor; // User's desired size
  const keyLabelY = yOffset + height - (24 * scaleFactor); // User's desired position

  const noteNameFontSize = 10 * scaleFactor; // Added for note name + octave below key label
  const noteNameY = yOffset + height - (8 * scaleFactor);

  return (
    <g
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={handleLeave}
      onPointerEnter={(e) => onPointerEnter(e, midi, playNote)} // Glissando support
      className="whitekeybutton" // Apply className for targetting
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Shadow for depth */}
      <rect x={x + 2} y={yOffset + 2} width={w - 2} height={height} rx={4} ry={4} fill="rgb(var(--virtual-piano-black-key-shadow) / 0.15)" />
      {/* Main Key Body */}
      <rect
        x={x}
        y={yOffset}
        width={w - 1} 
        height={height}
        rx={4} ry={4}
        fill={isActive ? "rgb(var(--virtual-piano-white-key-bg-active))" : "rgb(var(--virtual-piano-white-key-bg-idle))"}
        stroke="rgb(var(--virtual-piano-white-key-border))"
        strokeWidth={1}
        className="cursor-pointer transition-transform duration-75 ease-out origin-top"
        style={{ 
          transform: isActive ? 'rotateX(2deg) translateY(2px)' : 'none', // Subtle 3D press effect
          filter: isActive ? 'drop-shadow(0px 1px 4px rgba(0,0,0,0.2))' : 'none', // Shadow for depth
        }}
      />
      {/* Front Lip Highlight */}
      <rect x={x} y={yOffset + height - (5 * scaleFactor)} width={w - 1} height={5 * scaleFactor} rx={4} ry={4} fill="rgb(var(--virtual-piano-black-key-highlight) / 0.05)" className="pointer-events-none" />

      {/* Key Label (Q, W, E...) */}
      {keyLabel && (
        <text x={x + w / 2} y={keyLabelY} textAnchor="middle" fontSize={keyLabelFontSize} fontWeight="bold" 
              fill={isActive ? "rgb(var(--virtual-piano-white-key-label-active))" : "rgb(var(--virtual-piano-white-key-label-idle))"} 
              className="pointer-events-none select-none uppercase font-sans">
          {keyLabel}
        </text>
      )}
      {/* Note Name (C4, D4...) */}
      <text x={x + w / 2} y={noteNameY} textAnchor="middle" fontSize={noteNameFontSize} fontWeight="500" 
            fill={isActive ? "rgb(var(--virtual-piano-white-key-note-active))" : "rgb(var(--virtual-piano-white-key-note-idle))"} 
            className="pointer-events-none select-none">
        {noteName}{octave}
      </text>
    </g>
  );
});

export default WhiteKey;