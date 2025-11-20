
import { AudioAnalysisResult, NoteName, Instrument } from '../types';
import { NOTE_FREQUENCIES, NOTES_ORDER } from '../constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private buffer: Float32Array = new Float32Array(2048);
  private isListening: boolean = false;
  private mainGain: GainNode | null = null;
  private currentInstrument: Instrument = Instrument.PIANO;
  
  // Config
  private noiseThreshold: number = 0.02;
  
  // MIDI State
  private midiAccess: any = null;
  private activeMidiNotes: Map<number, number> = new Map(); // Midi Note Number -> Velocity

  async initialize(): Promise<void> {
    if (this.audioContext) {
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();
        return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 1. Setup Microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false, // Important for music processing
            autoGainControl: false,
            noiseSuppression: false
          }
        });
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8; // Smooth out jitter
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.mediaStreamSource.connect(this.analyser);
      } catch (micErr) {
        console.warn("Microphone access denied or failed. MIDI only mode available if connected.", micErr);
      }

      // 2. Setup Output
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

  async initMidi() {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        this.midiAccess.inputs.forEach((input: any) => {
          input.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
        });
        this.midiAccess.onstatechange = (e: any) => {
           // Re-bind if new device connected
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
    // Note On: 144 (channel 1), Note Off: 128
    if (command >= 144 && command <= 159 && velocity > 0) {
      this.activeMidiNotes.set(note, velocity);
    } else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
      this.activeMidiNotes.delete(note);
    }
  }

  setInstrument(inst: Instrument) {
    this.currentInstrument = inst;
  }

  calibrateNoiseFloor(volume: number) {
      // Simple dynamic adjustment: slightly above ambient noise
      this.noiseThreshold = Math.max(0.01, volume * 1.2);
  }

  stop() {
    this.isListening = false;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine', time: number = 0) {
    if (!this.audioContext || !this.mainGain) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.value = frequency;
    
    const t = this.audioContext.currentTime + time;
    gain.gain.setValueAtTime(0, t);

    if (this.currentInstrument === Instrument.GUITAR) {
      osc.type = 'sawtooth'; 
      gain.gain.linearRampToValueAtTime(0.4, t + 0.02); 
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration); 
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.type = 'triangle';
      gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration + 0.5);
      osc.connect(gain);
    }

    gain.connect(this.mainGain);
    osc.start(t);
    osc.stop(t + duration + 1.0);
  }

  // New Method for Backing Tracks (Softer, pad-like)
  playBackingTrackChord(notes: string[], duration: number) {
    if (!this.audioContext || !this.mainGain) return;
    
    notes.forEach(note => {
       const freq = NOTE_FREQUENCIES[note];
       if (!freq) return;

       const osc = this.audioContext!.createOscillator();
       const gain = this.audioContext!.createGain();
       
       // Use 'sine' for smooth backing, slightly detuned for richness
       osc.type = 'sine';
       osc.frequency.value = freq;

       const t = this.audioContext!.currentTime;
       
       // Very slow attack and release (pad style)
       gain.gain.setValueAtTime(0, t);
       gain.gain.linearRampToValueAtTime(0.15, t + 0.2); 
       gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

       osc.connect(gain);
       gain.connect(this.mainGain!);
       osc.start(t);
       osc.stop(t + duration + 1.0);
    });
  }
  
  playPedal(note: string, volume: number = 0.1) {
    if (!this.audioContext || !this.mainGain) return;
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = this.currentInstrument === Instrument.GUITAR ? 'sawtooth' : 'sine';
    osc.frequency.value = freq;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2.0); 
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.mainGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 2.0);
  }

  playChord(notes: string[], duration: number) {
    notes.forEach(note => {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        const detune = (Math.random() - 0.5) * 2; 
        this.playTone(freq + detune, duration, 'triangle');
      }
    });
  }

  getGuitarPosition(note: NoteName, octave: number): { stringIdx: number, fret: number } | null {
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
        if (semitones >= 0 && semitones <= 15) {
            return { stringIdx: s.idx, fret: semitones };
        }
    }
    return null;
  }

  private autoCorrelate(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < this.noiseThreshold) return -1; // Noise Gate

    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    const buf2 = buf.slice(r1, r2);
    const c = new Array(buf2.length).fill(0);
    for (let i = 0; i < buf2.length; i++) {
      for (let j = 0; j < buf2.length - i; j++) {
        c[i] = c[i] + buf2[j] * buf2[j + i];
      }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < buf2.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }

  private getNoteFromPitch(frequency: number): { note: NoteName; octave: number; centsOff: number } {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const midiNum = Math.round(noteNum) + 69;
    const noteNameIndex = midiNum % 12;
    const note = NOTES_ORDER[noteNameIndex];
    const octave = Math.floor(midiNum / 12) - 1;
    const centsOff = Math.floor(1200 * Math.log(frequency / this.getFrequency(midiNum)) / Math.log(2));
    return { note, octave, centsOff };
  }

  private getFrequency(midiNum: number): number {
    return 440 * Math.pow(2, (midiNum - 69) / 12);
  }

  analyze(): AudioAnalysisResult {
    // 1. MIDI (Priority)
    if (this.activeMidiNotes.size > 0) {
        const midiNums = Array.from(this.activeMidiNotes.keys()).sort((a,b) => b-a);
        const midiNum = midiNums[0]; 
        const noteNameIndex = midiNum % 12;
        const note = NOTES_ORDER[noteNameIndex];
        const octave = Math.floor(midiNum / 12) - 1;
        const freq = this.getFrequency(midiNum);
        return { pitch: freq, note, octave, clarity: 1, volume: 0.8, source: 'midi' };
    }

    // 2. Audio/Mic
    if (!this.analyser || !this.isListening) {
      return { pitch: 0, note: null, octave: null, clarity: 0, volume: 0 };
    }

    this.analyser.getFloatTimeDomainData(this.buffer);
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const pitch = this.autoCorrelate(this.buffer, sampleRate);

    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i] * this.buffer[i];
    }
    const volume = Math.sqrt(sum / this.buffer.length);

    if (pitch === -1) {
      return { pitch: 0, note: null, octave: null, clarity: 0, volume, source: 'mic' };
    }

    const { note, octave } = this.getNoteFromPitch(pitch);
    return { pitch, note, octave, clarity: 1, volume, source: 'mic' };
  }

  getIsMidiConnected(): boolean {
      return !!this.midiAccess && this.midiAccess.inputs.size > 0;
  }
}

export const audioEngine = new AudioEngine();
