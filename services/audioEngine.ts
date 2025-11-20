
import { AudioAnalysisResult, NoteName, Instrument, DetectedNote } from '../types';
import { NOTE_FREQUENCIES, NOTES_ORDER } from '../constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private inputGainNode: GainNode | null = null; 
  private filterNode: BiquadFilterNode | null = null; // High-pass filter
  
  private buffer: Float32Array = new Float32Array(2048);
  private frequencyBuffer: Uint8Array = new Uint8Array(1024); // 2048 fftSize / 2
  
  private isListening: boolean = false;
  private mainGain: GainNode | null = null;
  private currentInstrument: Instrument = Instrument.PIANO;
  private _micEnabled: boolean = false;
  
  // Config
  private noiseThreshold: number = 0.02; 
  
  // MIDI State
  private midiAccess: any = null;
  private activeMidiNotes: Map<number, number> = new Map(); // Midi Note Number -> Velocity

  get micEnabled(): boolean {
    return this._micEnabled;
  }

  async initialize(): Promise<void> {
    if (this.audioContext) {
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();
        return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // 1. Setup Microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false, // Vital for music
            autoGainControl: false,  // Vital for dynamic range
            noiseSuppression: false  // Vital for frequency accuracy
          }
        });
        
        // Audio Graph: Source -> HighPass -> Gain -> Analyser
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        
        // High Pass Filter (Remove rumble < 85Hz - approx E2)
        this.filterNode = this.audioContext.createBiquadFilter();
        this.filterNode.type = 'highpass';
        this.filterNode.frequency.value = 85;

        this.inputGainNode = this.audioContext.createGain();
        this.inputGainNode.gain.value = 1.5;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.2; // Faster response for game

        this.mediaStreamSource.connect(this.filterNode);
        this.filterNode.connect(this.inputGainNode);
        this.inputGainNode.connect(this.analyser);
        
        this._micEnabled = true;
      } catch (micErr) {
        console.warn("Microphone access failed.", micErr);
        this._micEnabled = false;
      }

      // 2. Setup Output (for synths)
      this.mainGain = this.audioContext.createGain();
      this.mainGain.gain.value = 0.3; 
      this.mainGain.connect(this.audioContext.destination);

      // 3. Setup MIDI
      await this.initMidi();

      this.isListening = true;
    } catch (error) {
      console.error("Error initializing AudioEngine:", error);
      throw error;
    }
  }

  setSensitivity(multiplier: number) {
      if (this.inputGainNode && this.audioContext) {
          const gain = Math.max(0.5, multiplier * 1.5);
          this.inputGainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
      }
  }

  async initMidi() {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        this.midiAccess.inputs.forEach((input: any) => {
          input.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
        });
        this.midiAccess.onstatechange = (e: any) => {
           if (e.port.type === 'input' && e.port.state === 'connected') {
             e.port.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
           }
        };
      } catch (e) {
        console.warn("MIDI Access Failed", e);
      }
    }
  }

  handleMidiMessage(message: any) {
    const [command, note, velocity] = message.data;
    // Note On (144) vs Note Off (128)
    if (command >= 144 && command <= 159 && velocity > 0) {
      this.activeMidiNotes.set(note, velocity);
    } else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
      this.activeMidiNotes.delete(note);
    }
  }

  setInstrument(inst: Instrument) {
    this.currentInstrument = inst;
  }

  // --- POLYPHONIC PITCH DETECTION (FFT PEAK FINDING) ---
  private detectPolyphonic(buf: Uint8Array, sampleRate: number): DetectedNote[] {
      const peaks: { freq: number, mag: number }[] = [];
      const binSize = sampleRate / (2 * buf.length);
      
      // 1. Find Peaks
      for(let i = 5; i < buf.length - 1; i++) {
          const mag = buf[i];
          if (mag > 100) { // Threshold (out of 255)
              if (mag > buf[i-1] && mag > buf[i+1]) {
                  // Parabolic interpolation for precision
                  const alpha = buf[i-1];
                  const beta = buf[i];
                  const gamma = buf[i+1];
                  const p = 0.5 * (alpha - gamma) / (alpha - 2*beta + gamma);
                  const freq = (i + p) * binSize;
                  peaks.push({ freq, mag });
              }
          }
      }
      
      // 2. Sort by Magnitude
      peaks.sort((a, b) => b.mag - a.mag);
      
      // 3. Harmonic Pruning (Basic)
      // Remove peaks that are integer multiples of stronger lower peaks
      const validPeaks: { freq: number, mag: number }[] = [];
      for (const peak of peaks) {
          let isHarmonic = false;
          for (const valid of validPeaks) {
              // Check if peak is ~2x, ~3x, ~4x of an existing strong fundamental
              const ratio = peak.freq / valid.freq;
              const deviation = Math.abs(ratio - Math.round(ratio));
              if (deviation < 0.05 && Math.round(ratio) > 1 && Math.round(ratio) <= 4) {
                  isHarmonic = true; 
                  break; 
              }
          }
          if (!isHarmonic) {
              validPeaks.push(peak);
          }
          if (validPeaks.length >= 3) break; // Max 3 notes polyphony
      }

      return validPeaks.map(p => {
          const midiNum = 12 * (Math.log(p.freq / 440) / Math.log(2)) + 69;
          const roundedMidi = Math.round(midiNum);
          const noteNameIndex = roundedMidi % 12;
          const note = NOTES_ORDER[noteNameIndex];
          const octave = Math.floor(roundedMidi / 12) - 1;
          const cents = Math.floor(100 * (midiNum - roundedMidi));
          return { note, octave, cents, frequency: p.freq };
      });
  }

  analyze(): AudioAnalysisResult {
    // 1. MIDI (Priority)
    if (this.activeMidiNotes.size > 0) {
        const detected: DetectedNote[] = [];
        this.activeMidiNotes.forEach((vel, midiNum) => {
            detected.push({
                note: NOTES_ORDER[midiNum % 12],
                octave: Math.floor(midiNum / 12) - 1,
                cents: 0,
                frequency: 440 * Math.pow(2, (midiNum - 69) / 12)
            });
        });
        return { activeNotes: detected, volume: 0.8, snr: 100, clarity: 1, source: 'midi' };
    }

    // 2. Mic
    if (!this.analyser || !this.isListening || !this._micEnabled) {
      return { activeNotes: [], volume: 0, snr: 0, clarity: 0, source: 'none' };
    }

    // Get Time Data for Volume/SNR
    this.analyser.getFloatTimeDomainData(this.buffer);
    let rms = 0;
    for (let i = 0; i < this.buffer.length; i++) rms += this.buffer[i] * this.buffer[i];
    rms = Math.sqrt(rms / this.buffer.length);
    
    // Noise Gate
    if (rms < this.noiseThreshold) {
        return { activeNotes: [], volume: rms, snr: 0, clarity: 0, source: 'mic' };
    }

    // Get Frequency Data for Polyphonic Pitch
    this.analyser.getByteFrequencyData(this.frequencyBuffer);
    const activeNotes = this.detectPolyphonic(this.frequencyBuffer, this.audioContext?.sampleRate || 44100);

    // Approximate SNR
    const snr = 20 * Math.log10(rms / 0.0001); // Relative to silence floor

    return { 
        activeNotes, 
        volume: rms, 
        snr, 
        clarity: activeNotes.length > 0 ? 0.9 : 0, 
        source: 'mic' 
    };
  }

  // ... (Keep Sound Synthesis methods like playTone, playBackingTrackChord same as before)
  playTone(frequency: number, duration: number, type: OscillatorType = 'sine', time: number = 0) {
    if (!this.audioContext || !this.mainGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.frequency.value = frequency;
    const t = this.audioContext.currentTime + time;
    gain.gain.setValueAtTime(0, t);
    osc.type = type;
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    osc.connect(gain);
    gain.connect(this.mainGain);
    osc.start(t);
    osc.stop(t + duration + 0.2);
  }

  playBackingTrackChord(notes: string[], duration: number) {
      notes.forEach(n => {
          const freq = NOTE_FREQUENCIES[n];
          if (freq) this.playTone(freq, duration, 'sine');
      });
  }
  
  playPedal(note: string, volume: number) {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) this.playTone(freq, 2.0, 'sine');
  }
  
  playChord(notes: string[], duration: number) {
       notes.forEach(n => {
          const freq = NOTE_FREQUENCIES[n];
          if (freq) this.playTone(freq, duration, 'triangle');
      });
  }

  getGuitarPosition(note: NoteName, octave: number): { stringIdx: number, fret: number } | null {
    // ... (Keep existing logic)
    const noteStr = `${note}${octave}`;
    const targetFreq = NOTE_FREQUENCIES[noteStr];
    if (!targetFreq) return null;
    const strings = [
      { base: 329.63, idx: 0 }, // e
      { base: 246.94, idx: 1 }, // B
      { base: 196.00, idx: 2 }, // G
      { base: 146.83, idx: 3 }, // D
      { base: 110.00, idx: 4 }, // A
      { base: 82.41,  idx: 5 }  // E
    ];
    for (let s of strings) {
        const semitones = Math.round(12 * Math.log2(targetFreq / s.base));
        if (semitones >= 0 && semitones <= 15) return { stringIdx: s.idx, fret: semitones };
    }
    return null;
  }

  calibrateNoiseFloor(volume: number) {
      if (volume > 0.001) this.noiseThreshold = volume * 1.2;
  }

  stop() {
    this.isListening = false;
    if (this.audioContext?.state !== 'closed') this.audioContext?.close();
    this._micEnabled = false;
  }

  getIsMidiConnected(): boolean {
      return !!this.midiAccess && this.midiAccess.inputs.size > 0;
  }
}

export const audioEngine = new AudioEngine();
