

import React, { useEffect, useRef } from 'react';
import { NoteEvent, AudioAnalysisResult, NoteName, NoteStatus, LoopRegion, AppSettings } from '../types';

interface SheetMusicProps {
  songNotes: NoteEvent[];
  isPlaying: boolean;
  currentTime: number; // in beats
  currentInput: AudioAnalysisResult;
  results: Map<number, NoteStatus>;
  bpm: number;
  loopRegion?: LoopRegion;
  settings?: AppSettings;
}

const SheetMusic: React.FC<SheetMusicProps> = ({ 
  songNotes = [], 
  currentTime, 
  currentInput,
  results,
  loopRegion,
  settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const STAFF_LINE_SPACING = 14;
  const NOTE_RADIUS = 6;
  const ZOOM_FACTOR = (settings?.sheetMusicZoom || 100) / 100;
  const BEATS_TO_PIXELS = 100 * ZOOM_FACTOR;
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
     const mapping: Record<string, string> = {
         'C': '1', 'C#': '1', 'D': '2', 'D#': '2', 'E': '3',
         'F': '4', 'F#': '4', 'G': '5', 'G#': '5', 'A': '6', 'A#': '6', 'B': '7'
     };
     return mapping[note] || '';
  };

  const formatAccidental = (note: string, style: 'Sharp' | 'Flat' = 'Sharp') => {
      if (!note.includes('#')) return null;
      return style === 'Sharp' ? '♯' : '♭';
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

      const displayStyle = settings?.noteDisplayStyle || 'Standard';
      const accidentalStyle = settings?.accidentalStyle || 'Sharp';

      ctx.clearRect(0, 0, width, height);

      // --- MEASURE GRID ---
      const beatsPerMeasure = 4; 
      const startMeasure = Math.floor((currentTime - (PLAY_HEAD_X / BEATS_TO_PIXELS)) / beatsPerMeasure);
      const endMeasure = Math.floor((currentTime + (width / BEATS_TO_PIXELS)) / beatsPerMeasure);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      for (let m = startMeasure; m <= endMeasure; m++) {
          const beatX = m * beatsPerMeasure;
          const x = PLAY_HEAD_X + ((beatX - currentTime) * BEATS_TO_PIXELS);
          
          if (x > 0 && x < width) {
              ctx.beginPath();
              ctx.moveTo(x, centerY - 100);
              ctx.lineTo(x, centerY + 100);
              ctx.stroke();
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.font = '10px Inter, sans-serif';
              ctx.fillText((m + 1).toString(), x + 5, centerY - 105);
          }
      }

      const trebleY = centerY - 50;
      const bassY = centerY + 50;

      const drawStaff = (baseY: number) => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          for (let i = -2; i <= 2; i++) {
            const y = baseY + (i * STAFF_LINE_SPACING);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
      };

      drawStaff(trebleY);
      drawStaff(bassY);
      
      // Draw Clefs with correct font stack to ensure symbols render
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'normal 50px "Times New Roman", serif'; // Explicit font family
      ctx.fillText('𝄞', 15, trebleY + 15);
      ctx.fillText('𝄢', 15, bassY + 12);

      // --- LOOP REGION ---
      if (loopRegion && loopRegion.active) {
         const loopStartX = PLAY_HEAD_X + ((loopRegion.start - currentTime) * BEATS_TO_PIXELS);
         const loopWidth = (loopRegion.end - loopRegion.start) * BEATS_TO_PIXELS;
         
         if (loopStartX < width && loopStartX + loopWidth > 0) {
             const grd = ctx.createLinearGradient(loopStartX, 0, loopStartX, height);
             grd.addColorStop(0, 'rgba(96, 165, 250, 0.05)');
             grd.addColorStop(0.5, 'rgba(96, 165, 250, 0.15)');
             grd.addColorStop(1, 'rgba(96, 165, 250, 0.05)');
             
             ctx.fillStyle = grd;
             ctx.fillRect(loopStartX, 0, loopWidth, height);
             
             ctx.strokeStyle = '#60a5fa';
             ctx.lineWidth = 2;
             // Left bracket
             ctx.beginPath(); ctx.moveTo(loopStartX + 10, 20); ctx.lineTo(loopStartX, 20); ctx.lineTo(loopStartX, height - 20); ctx.lineTo(loopStartX + 10, height - 20); ctx.stroke();
             // Right bracket
             ctx.beginPath(); ctx.moveTo(loopStartX + loopWidth - 10, 20); ctx.lineTo(loopStartX + loopWidth, 20); ctx.lineTo(loopStartX + loopWidth, height - 20); ctx.lineTo(loopStartX + loopWidth - 10, height - 20); ctx.stroke();

             ctx.fillStyle = '#60a5fa';
             ctx.font = 'bold 10px Inter, sans-serif';
             ctx.fillText('LOOP', loopStartX + 5, 35);
         }
      }

      // --- NOTES ---
      if (songNotes && songNotes.length > 0) {
        songNotes.forEach((noteEvent, index) => {
            const timeDiff = noteEvent.startTime - currentTime;
            const x = PLAY_HEAD_X + (timeDiff * BEATS_TO_PIXELS);

            if (x < -50 || x > width + 50) return;

            let targetStaffY = trebleY;
            const isLeftHand = noteEvent.hand === 'l' || (noteEvent.octave < 4 && !noteEvent.hand);
            if (isLeftHand) targetStaffY = bassY;

            let y = 0;
            if (targetStaffY === trebleY) {
                y = getStaffY(noteEvent.note, noteEvent.octave, trebleY);
            } else {
                const getBassY = (n: NoteName, o: number, cY: number) => {
                    const cOffsets: Record<string, number> = { 'C':0,'D':1,'E':2,'F':3,'G':4,'A':5,'B':6 };
                    const step = cOffsets[n] + (o - 3) * 7; 
                    return cY - ((step - 1) * (STAFF_LINE_SPACING / 2));
                };
                y = getBassY(noteEvent.note, noteEvent.octave, bassY);
            }

            const status = results.get(index) || NoteStatus.PENDING;
            
            let fillStyle = 'white';
            let shadowColor = 'transparent';
            let shadowBlur = 0;

            if (status === NoteStatus.CORRECT) {
                fillStyle = '#4ade80'; 
                shadowColor = '#4ade80';
                shadowBlur = 15;
            } else if (status === NoteStatus.HINTED) {
                fillStyle = '#facc15'; 
                shadowColor = '#facc15';
                shadowBlur = 20;
            } else if (status === NoteStatus.MISSED) {
                fillStyle = '#ef4444'; 
                shadowColor = '#ef4444';
                shadowBlur = 10;
            }

            // Draw Ledger Lines
            const staffTop = targetStaffY - 2 * STAFF_LINE_SPACING;
            const staffBottom = targetStaffY + 2 * STAFF_LINE_SPACING;
            
            if (y <= staffTop - STAFF_LINE_SPACING) {
                for (let ly = staffTop - STAFF_LINE_SPACING; ly >= y - 5; ly -= STAFF_LINE_SPACING) {
                    ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
                }
            } else if (y >= staffBottom + STAFF_LINE_SPACING) {
                for (let ly = staffBottom + STAFF_LINE_SPACING; ly <= y + 5; ly += STAFF_LINE_SPACING) {
                    ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly);
                    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.stroke();
                }
            }

            // Draw Note Head
            ctx.beginPath();
            // Tilted ellipse for realistic look
            ctx.ellipse(x, y, NOTE_RADIUS * 1.3, NOTE_RADIUS * 0.9, -0.2, 0, 2 * Math.PI);
            ctx.fillStyle = fillStyle;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;

            // Stem
            ctx.beginPath();
            const stemDir = (targetStaffY === trebleY && y < trebleY) || (targetStaffY === bassY && y < bassY) ? 1 : -1; 
            const stemX = x + (stemDir === 1 ? -NOTE_RADIUS + 1 : NOTE_RADIUS - 1);
            ctx.moveTo(stemX, y);
            ctx.lineTo(stemX, y + (35 * stemDir));
            ctx.strokeStyle = fillStyle;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Accidental
            const accidental = formatAccidental(noteEvent.note, accidentalStyle);
            if (accidental) {
                ctx.font = '20px serif'; // Larger font for accidentals
                ctx.fillStyle = fillStyle;
                ctx.fillText(accidental, x - 22, y + 8);
            }

            // --- FINGER NUMBERING ---
            if (noteEvent.finger) {
                ctx.fillStyle = status === NoteStatus.CORRECT ? '#4ade80' : 'rgba(255, 255, 255, 0.7)';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                
                // Position logic: Left Hand (Bass) -> Below note, Right Hand (Treble) -> Above note
                // Exception: if stem direction forces it elsewhere, but keeping it simple usually works best for learners
                const fingerY = isLeftHand ? y + 22 : y - 22;
                
                ctx.fillText(noteEvent.finger.toString(), x, fingerY);
            }

            // Labels (Scale Degree / Lyrics / Note Name)
            let labelText = '';
            if (displayStyle === 'ScaleDegree') {
                labelText = getScaleDegree(noteEvent.note);
                // Simple debounce for scale degree (don't repeat)
                for (let back = 1; back <= 3; back++) {
                    const prev = songNotes[index - back];
                    if (prev && prev.note === noteEvent.note) labelText = '';
                }
            } else if (displayStyle === 'Lyrics') {
                labelText = noteEvent.lyrics || ''; 
            } else if (displayStyle === 'NoteName') {
                labelText = noteEvent.note;
            }

            if (labelText && displayStyle !== 'Standard') {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                // Adjust label position if finger number is present to avoid overlap
                const labelOffset = noteEvent.finger ? (isLeftHand ? 34 : -34) : -14;
                ctx.fillText(labelText, x, y + labelOffset);
            }
        });
      }

      // --- PLAYHEAD ---
      ctx.beginPath();
      ctx.moveTo(PLAY_HEAD_X, 0);
      ctx.lineTo(PLAY_HEAD_X, height);
      
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Playhead Glow
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(PLAY_HEAD_X, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(render);
    };
    
    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [songNotes, currentTime, currentInput, results, loopRegion, settings]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-surface-secondary/40 backdrop-blur-lg border-b border-white/10">
       <div className="absolute inset-0 bg-gradient-to-r from-surface-primary via-transparent to-surface-primary z-10 pointer-events-none" />
       <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default SheetMusic;
