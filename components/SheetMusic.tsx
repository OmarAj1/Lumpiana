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

  // Helper to fetch variable and wrap in rgb() since our vars are just numbers
  const getThemeColor = (varName: string, alpha: number = 1) => {
    if (typeof window !== 'undefined') {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (val) {
        // Fix: CSS vars are space-separated (e.g. "10 132 255") for Tailwind compatibility.
        // Canvas 'rgba' requires comma-separated (e.g. "10, 132, 255").
        const parts = val.split(/\s+/);
        if (parts.length >= 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
        // Fallback if parsing fails (unlikely given correct setup)
        return `rgba(${val}, ${alpha})`;
      }
    }
    return `rgba(255, 255, 255, ${alpha})`; // Fallback
  };
  
  // Dynamically set colors based on CSS variables
  const COLORS = {
      staffLines: getThemeColor('--color-border-default', 0.5),
      barLines: getThemeColor('--color-border-default', 0.3),
      text: getThemeColor('--color-text-primary', 0.9),
      playHead: getThemeColor('--color-brand-primary', 0.8),
      measureNumber: getThemeColor('--color-text-secondary', 0.6),
      ledgerLines: getThemeColor('--color-text-secondary', 0.5),
      noteDefault: getThemeColor('--color-text-primary', 1.0),
      lyricText: getThemeColor('--color-text-primary', 0.95),
      hintText: getThemeColor('--color-brand-primary', 0.9),
      
      // Note Status Colors
      noteCorrect: getThemeColor('--color-accent-success', 1.0),
      noteHint: getThemeColor('--color-accent-warning', 1.0),
      noteMissed: getThemeColor('--color-accent-error', 1.0),
  };

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

      const accidentalStyle = settings?.accidentalStyle || 'Sharp';

      ctx.clearRect(0, 0, width, height);

      // --- MEASURE GRID ---
      const beatsPerMeasure = 4; 
      const startMeasure = Math.floor((currentTime - (PLAY_HEAD_X / BEATS_TO_PIXELS)) / beatsPerMeasure);
      const endMeasure = Math.floor((currentTime + (width / BEATS_TO_PIXELS)) / beatsPerMeasure);

      ctx.strokeStyle = COLORS.barLines;
      ctx.lineWidth = 1;

      for (let m = startMeasure; m <= endMeasure; m++) {
          const beatX = m * beatsPerMeasure;
          const x = PLAY_HEAD_X + ((beatX - currentTime) * BEATS_TO_PIXELS);
          
          if (x > 0 && x < width) {
              ctx.beginPath();
              ctx.moveTo(x, centerY - 100);
              ctx.lineTo(x, centerY + 100);
              ctx.stroke();
              
              ctx.fillStyle = COLORS.measureNumber;
              ctx.font = '10px Inter, sans-serif';
              ctx.fillText((m + 1).toString(), x + 5, centerY - 105);
          }
      }

      const trebleY = centerY - 50;
      const bassY = centerY + 50;

      const drawStaff = (baseY: number) => {
          ctx.strokeStyle = COLORS.staffLines;
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
      ctx.fillStyle = COLORS.text;
      ctx.font = 'normal 50px "Times New Roman", serif'; 
      ctx.fillText('𝄞', 15, trebleY + 15);
      ctx.fillText('𝄢', 15, bassY + 12);

      // --- LOOP REGION ---
      if (loopRegion && loopRegion.active) {
         const loopStartX = PLAY_HEAD_X + ((loopRegion.start - currentTime) * BEATS_TO_PIXELS);
         const loopWidth = (loopRegion.end - loopRegion.start) * BEATS_TO_PIXELS;
         
         if (loopStartX < width && loopStartX + loopWidth > 0) {
             const grd = ctx.createLinearGradient(loopStartX, 0, loopStartX, height);
             // iOS Blue #007AFF
             grd.addColorStop(0, 'rgba(0, 122, 255, 0.05)');
             grd.addColorStop(0.5, 'rgba(0, 122, 255, 0.15)');
             grd.addColorStop(1, 'rgba(0, 122, 255, 0.05)');
             
             ctx.fillStyle = grd;
             ctx.fillRect(loopStartX, 0, loopWidth, height);
             
             ctx.strokeStyle = '#007AFF';
             ctx.lineWidth = 2;
             ctx.beginPath(); ctx.moveTo(loopStartX + 10, 20); ctx.lineTo(loopStartX, 20); ctx.lineTo(loopStartX, height - 20); ctx.lineTo(loopStartX + 10, height - 20); ctx.stroke();
             ctx.beginPath(); ctx.moveTo(loopStartX + loopWidth - 10, 20); ctx.lineTo(loopStartX + loopWidth, 20); ctx.lineTo(loopStartX + loopWidth, height - 20); ctx.lineTo(loopStartX + loopWidth - 10, height - 20); ctx.stroke();

             ctx.fillStyle = '#007AFF';
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
            
            let fillStyle = COLORS.noteDefault;
            let shadowColor = 'transparent';
            let shadowBlur = 0;

            if (status === NoteStatus.CORRECT) {
                fillStyle = COLORS.noteCorrect;
                shadowColor = COLORS.noteCorrect;
                shadowBlur = 15;
            } else if (status === NoteStatus.HINTED) {
                fillStyle = COLORS.noteHint;
                shadowColor = COLORS.noteHint;
                shadowBlur = 20;
            } else if (status === NoteStatus.MISSED) {
                fillStyle = COLORS.noteMissed;
                shadowColor = COLORS.noteMissed;
                shadowBlur = 10;
            }

            // Draw Ledger Lines
            const staffTop = targetStaffY - 2 * STAFF_LINE_SPACING;
            const staffBottom = targetStaffY + 2 * STAFF_LINE_SPACING;
            
            if (y <= staffTop - STAFF_LINE_SPACING) {
                for (let ly = staffTop - STAFF_LINE_SPACING; ly >= y - 5; ly -= STAFF_LINE_SPACING) {
                    ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly);
                    ctx.strokeStyle = COLORS.ledgerLines; ctx.lineWidth = 1; ctx.stroke();
                }
            } else if (y >= staffBottom + STAFF_LINE_SPACING) {
                for (let ly = staffBottom + STAFF_LINE_SPACING; ly <= y + 5; ly += STAFF_LINE_SPACING) {
                    ctx.beginPath(); ctx.moveTo(x - 12, ly); ctx.lineTo(x + 12, ly);
                    ctx.strokeStyle = COLORS.ledgerLines; ctx.lineWidth = 1; ctx.stroke();
                }
            }

            // Draw Note Head
            ctx.beginPath();
            ctx.ellipse(x, y, NOTE_RADIUS * 1.3, NOTE_RADIUS * 0.9, -0.2, 0, 2 * Math.PI);
            ctx.fillStyle = fillStyle;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            ctx.fill();
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
                ctx.font = '20px serif';
                ctx.fillStyle = fillStyle;
                ctx.fillText(accidental, x - 22, y + 8);
            }

            // --- FINGER NUMBERING ---
            if (noteEvent.finger) {
                ctx.fillStyle = status === NoteStatus.CORRECT ? COLORS.noteCorrect : COLORS.hintText;
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                const fingerY = isLeftHand ? y + 22 : y - 22;
                ctx.fillText(noteEvent.finger.toString(), x, fingerY);
            }

            ctx.textAlign = 'center';
            
            // --- INSTRUCTIONAL TEXT (LYRICS - BELOW) ---
            if (noteEvent.lyrics) {
                ctx.fillStyle = COLORS.lyricText;
                ctx.font = 'bold 14px Inter, sans-serif';
                // Standardize lyric position well below the staff area
                const lyricY = targetStaffY === trebleY ? trebleY + 100 : bassY + 100; 
                ctx.fillText(noteEvent.lyrics, x, lyricY);
            }

            // --- NOTE LETTER HINT (ABOVE) ---
            if (settings?.showNoteLabels || noteEvent.lyrics) {
                ctx.fillStyle = COLORS.hintText; 
                ctx.font = 'bold 12px monospace';
                const hintY = y - 30;
                ctx.fillText(noteEvent.note, x, hintY);
            }
        });
      }

      // --- PLAYHEAD ---
      ctx.beginPath();
      ctx.moveTo(PLAY_HEAD_X, 0);
      ctx.lineTo(PLAY_HEAD_X, height);
      
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      const playHeadPrimaryColor = COLORS.playHead;
      
      // Use the playHead color. Since getThemeColor now returns valid rgba string, this works fine.
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, playHeadPrimaryColor);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Playhead Glow
      ctx.shadowColor = playHeadPrimaryColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = playHeadPrimaryColor;
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
    <div className="w-full h-full relative overflow-hidden bg-surface-secondary/40 backdrop-blur-lg border-b border-white/10 dark:border-border-default">
       <div className="absolute inset-0 bg-gradient-to-r from-surface-primary via-transparent to-surface-primary z-10 pointer-events-none" />
       <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default SheetMusic;