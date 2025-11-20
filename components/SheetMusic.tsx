
import React, { useEffect, useRef } from 'react';
import { NoteEvent, AudioAnalysisResult, NoteName, NoteStatus, LoopRegion } from '../types';

interface SheetMusicProps {
  songNotes: NoteEvent[];
  isPlaying: boolean;
  currentTime: number; // in beats
  currentInput: AudioAnalysisResult;
  results: Map<number, NoteStatus>;
  bpm: number;
  loopRegion?: LoopRegion;
}

const SheetMusic: React.FC<SheetMusicProps> = ({ 
  songNotes, 
  currentTime, 
  currentInput,
  results,
  loopRegion
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CONSTANTS
  const STAFF_LINE_SPACING = 14;
  const NOTE_RADIUS = 6;
  const BEATS_TO_PIXELS = 100;
  const PLAY_HEAD_X = 150;

  const getStaffY = (note: NoteName, octave: number, centerY: number) => {
    const cMajorOffsets: Record<string, number> = {
        'C': 0, 'C#': 0,
        'D': 1, 'D#': 1, 'E': 2, 'F': 3, 'F#': 3, 'G': 4, 'G#': 4, 'A': 5, 'A#': 5, 'B': 6
    };
    const baseStep = cMajorOffsets[note];
    const octaveStep = (octave - 4) * 7;
    const totalSteps = baseStep + octaveStep;
    const stepsFromB4 = totalSteps - 6;
    return centerY - (stepsFromB4 * (STAFF_LINE_SPACING / 2));
  };

  const getScaleDegree = (note: NoteName): string => {
     // Simple C-Major based degree mapping as requested ("Do" = 1)
     const mapping: Record<string, string> = {
         'C': '1', 'C#': '1',
         'D': '2', 'D#': '2',
         'E': '3',
         'F': '4', 'F#': '4',
         'G': '5', 'G#': '5',
         'A': '6', 'A#': '6',
         'B': '7'
     };
     return mapping[note] || '';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = rect.width;
      const height = rect.height;
      const centerY = height / 2;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // --- DRAW LOOP REGION ---
      if (loopRegion && loopRegion.active) {
         const loopStartX = PLAY_HEAD_X + ((loopRegion.start - currentTime) * BEATS_TO_PIXELS);
         const loopWidth = (loopRegion.end - loopRegion.start) * BEATS_TO_PIXELS;
         
         ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
         ctx.fillRect(loopStartX, 0, loopWidth, height);
         
         ctx.beginPath();
         ctx.moveTo(loopStartX, 0);
         ctx.lineTo(loopStartX, height);
         ctx.moveTo(loopStartX + loopWidth, 0);
         ctx.lineTo(loopStartX + loopWidth, height);
         ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
         ctx.lineWidth = 1;
         ctx.stroke();
         
         ctx.fillStyle = '#60a5fa';
         ctx.font = '10px sans-serif';
         ctx.fillText('LOOP', loopStartX + 5, 20);
      }

      // --- DRAW STAFF LINES ---
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        const y = centerY + (i * STAFF_LINE_SPACING);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Clef
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = 'italic bold 120px serif';
      ctx.fillText('𝄞', 20, centerY + 40);

      // --- DRAW NOTES ---
      songNotes.forEach((noteEvent, index) => {
         const timeDiff = noteEvent.startTime - currentTime;
         const x = PLAY_HEAD_X + (timeDiff * BEATS_TO_PIXELS);

         // Clipping optimization
         if (x < -50 || x > width + 50) return;

         const y = getStaffY(noteEvent.note, noteEvent.octave, centerY);
         const status = results.get(index) || NoteStatus.PENDING;
         
         // Determine Color based on Status
         let fillStyle = 'white';
         let shadowColor = 'transparent';
         let shadowBlur = 0;

         if (status === NoteStatus.CORRECT) {
             fillStyle = '#4ade80'; // Green-400 (Correct/Hit)
             shadowColor = '#4ade80';
             shadowBlur = 15;
         } else if (status === NoteStatus.HINTED) {
             fillStyle = '#facc15'; // Yellow (Waiting/Hint)
             shadowColor = '#facc15';
             shadowBlur = 20;
         } else if (status === NoteStatus.MISSED) {
             fillStyle = '#ef4444'; // Red (Missed)
             shadowColor = '#ef4444';
             shadowBlur = 10;
         }

         // Draw Note Head
         ctx.beginPath();
         ctx.ellipse(x, y, NOTE_RADIUS * 1.2, NOTE_RADIUS, 0, 0, 2 * Math.PI);
         ctx.fillStyle = fillStyle;
         ctx.shadowColor = shadowColor;
         ctx.shadowBlur = shadowBlur;
         ctx.fill();

         // Reset Shadow
         ctx.shadowBlur = 0;

         // Draw Stem
         ctx.beginPath();
         const stemDir = y < centerY ? 1 : -1; 
         ctx.moveTo(x + (stemDir === 1 ? -NOTE_RADIUS : NOTE_RADIUS), y);
         ctx.lineTo(x + (stemDir === 1 ? -NOTE_RADIUS : NOTE_RADIUS), y + (35 * stemDir));
         ctx.strokeStyle = fillStyle;
         ctx.lineWidth = 1.5;
         ctx.stroke();
         
         // Draw Accidental (#)
         if (noteEvent.note.includes('#')) {
             ctx.font = '14px serif';
             ctx.fillText('♯', x - 20, y + 5);
         }

         // Draw Scale Degree (Number)
         let showDegree = true;
         // Check previous 3 notes for repetition to reduce clutter
         for (let back = 1; back <= 3; back++) {
             const prev = songNotes[index - back];
             if (prev && prev.note === noteEvent.note) {
                 showDegree = false;
                 break;
             }
         }
         
         if (showDegree) {
             const degree = getScaleDegree(noteEvent.note);
             if (degree) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 2;
                // Draw slightly above the note head
                ctx.fillText(degree, x, y - 14);
                ctx.shadowBlur = 0;
             }
         }

         // Draw Ledger Lines
         const topStaffY = centerY - 2 * STAFF_LINE_SPACING;
         const bottomStaffY = centerY + 2 * STAFF_LINE_SPACING;
         if (y <= topStaffY - STAFF_LINE_SPACING) {
             for (let ly = topStaffY - STAFF_LINE_SPACING; ly >= y - 5; ly -= STAFF_LINE_SPACING) {
                 ctx.beginPath();
                 ctx.moveTo(x - 12, ly);
                 ctx.lineTo(x + 12, ly);
                 ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                 ctx.lineWidth = 1;
                 ctx.stroke();
             }
         } else if (y >= bottomStaffY + STAFF_LINE_SPACING) {
             for (let ly = bottomStaffY + STAFF_LINE_SPACING; ly <= y + 5; ly += STAFF_LINE_SPACING) {
                 ctx.beginPath();
                 ctx.moveTo(x - 12, ly);
                 ctx.lineTo(x + 12, ly);
                 ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                 ctx.lineWidth = 1;
                 ctx.stroke();
             }
         }
      });

      // --- DRAW PLAYHEAD ---
      ctx.beginPath();
      ctx.moveTo(PLAY_HEAD_X, 0);
      ctx.lineTo(PLAY_HEAD_X, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- VISUALIZE INPUT ---
      if (currentInput.note && currentInput.octave) {
          const inputY = getStaffY(currentInput.note, currentInput.octave, centerY);
          
          ctx.beginPath();
          ctx.arc(PLAY_HEAD_X, inputY, NOTE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fill();
          
          if (currentInput.note.includes('#')) {
              ctx.fillStyle = 'rgba(255,255,255,0.5)';
              ctx.font = '14px serif';
              ctx.fillText('♯', PLAY_HEAD_X - 20, inputY + 5);
          }
      }

      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [songNotes, currentTime, currentInput, results, loopRegion]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-surface-secondary/40 backdrop-blur-lg border-b border-white/10">
       <div className="absolute inset-0 bg-gradient-to-r from-surface-primary via-transparent to-surface-primary z-10 pointer-events-none" />
       <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default SheetMusic;
