
import { AudioAnalysisResult, NoteName, Instrument, DetectedNote } from '../types';
import { NOTE_FREQUENCIES, NOTES_ORDER } from '../constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  
  // DSP Nodes for Cleanup
  private inputGainNode: GainNode | null = null; 
  private highPassFilter: BiquadFilterNode | null = null; 
  private lowPassFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  private buffer: Float32Array = new Float32Array(2048);
  private frequencyBuffer: Uint8Array = new Uint8Array(8192); 
  
  private isListening: boolean = false;
  private mainGain: GainNode | null = null;
  private currentInstrument: Instrument = Instrument.PIANO;
  private _micEnabled: boolean = false;
  
  // Adaptive Noise Cancellation State
  private noiseFloorRMS: number = 0.01;
  
  // SPEECH REJECTION STATE
  // Maps MIDI Number -> Consecutive Frames Seen
  private noteHistory: Map<number, number> = new Map();
  private readonly FRAMES_TO_CONFIRM = 2; // Reduced from 3 for faster response
  private readonly DECAY_RATE = 1; // Reduced from 2 to prevent flickering

  private midiAccess: any = null;
  private activeMidiNotes: Map<number, number> = new Map(); 

  get micEnabled(): boolean {
    return this._micEnabled;
  }

  async initialize(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'closed') {
        this.audioContext = null;
    }
    if (this.audioContext && this.audioContext.state === 'running') {
        return;
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      try {
        if (this.mediaStreamSource) {
            this.mediaStreamSource.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStreamSource.disconnect();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false, 
            autoGainControl: false,  
            noiseSuppression: false, 
            channelCount: 1,
            sampleRate: { ideal: 48000 },
            latency: { ideal: 0.01 }
          } as any
        });
        
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        
        // --- DSP PIPELINE ---
        this.inputGainNode = this.audioContext.createGain();
        this.inputGainNode.gain.value = 3.0; // Boost input

        this.highPassFilter = this.audioContext.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = 80; 
        this.highPassFilter.Q.value = 0.7;

        this.lowPassFilter = this.audioContext.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = 6000;
        this.lowPassFilter.Q.value = 0.7;

        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -30;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 8192; 
        this.analyser.smoothingTimeConstant = 0.1;

        this.mediaStreamSource
            .connect(this.highPassFilter)
            .connect(this.lowPassFilter)
            .connect(this.compressor)
            .connect(this.inputGainNode)
            .connect(this.analyser);
        
        this._micEnabled = true;
      } catch (micErr) {
        console.warn("Microphone access failed", micErr);
        this._micEnabled = false;
      }

      this.mainGain = this.audioContext.createGain();
      this.mainGain.gain.value = 0.3; 
      this.mainGain.connect(this.audioContext.destination);

      await this.initMidi();

      this.isListening = true;
    } catch (error) {
      console.error("Error initializing AudioEngine:", error);
      throw error;
    }
  }

  async restart() {
      this.isListening = false;
      if (this.mediaStreamSource) {
          this.mediaStreamSource.mediaStream.getTracks().forEach(t => t.stop());
          this.mediaStreamSource.disconnect();
          this.mediaStreamSource = null;
      }
      if (this.audioContext) {
          await this.audioContext.close();
          this.audioContext = null;
      }
      this._micEnabled = false;
      await this.initialize();
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
    if (command >= 144 && command <= 159 && velocity > 0) {
      this.activeMidiNotes.set(note, velocity);
    } else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
      this.activeMidiNotes.delete(note);
    }
  }

  private detectPolyphonic(buf: Uint8Array, sampleRate: number): DetectedNote[] {
      const binSize = sampleRate / this.analyser!.fftSize;
      const harmonics = 4; 
      
      const hpsLen = Math.ceil(buf.length / harmonics);
      const hps = new Float32Array(hpsLen).fill(0);

      // Lower threshold slightly to catch quieter notes
      const floorVal = 15 + (this.noiseFloorRMS * 500); 

      for (let i = 0; i < hpsLen; i++) {
          if (buf[i] < floorVal) continue; 
          let product = buf[i];
          for (let h = 2; h <= harmonics; h++) {
              const downsampledIndex = i * h;
              if (downsampledIndex < buf.length) {
                  product += buf[downsampledIndex]; 
              }
          }
          hps[i] = product;
      }

      const peaks: { freq: number, mag: number }[] = [];
      const minMag = 200 + (this.noiseFloorRMS * 1000); 
      
      const startBin = Math.floor(60 / binSize); // Start ~60Hz

      for(let i = startBin; i < hpsLen - 1; i++) {
          if (hps[i] > minMag) {
              if (hps[i] > hps[i-1] && hps[i] > hps[i+1]) {
                  
                  // Calculate Harmonics FIRST
                  let harmonicScore = 0;
                  const h2Bin = i * 2;
                  const h3Bin = i * 3;
                  if (h2Bin < buf.length && buf[h2Bin] > floorVal) harmonicScore++;
                  if (h3Bin < buf.length && buf[h3Bin] > floorVal) harmonicScore++;

                  // Calculate Sharpness (Fundamental)
                  const neighborAvg = (buf[i-1] + buf[i+1]) / 2;
                  // +1 to avoid div by zero. 
                  const sharpness = buf[i] / (neighborAvg + 1); 

                  // Check 2nd Harmonic Sharpness (Piano often has stronger 2nd harmonic)
                  let isSharp = sharpness > 1.1;
                  if (!isSharp && h2Bin < buf.length - 1) {
                      const h2Neighbors = (buf[h2Bin-1] + buf[h2Bin+1]) / 2;
                      const h2Sharpness = buf[h2Bin] / (h2Neighbors + 1);
                      if (h2Sharpness > 1.2) isSharp = true;
                  }

                  // Vocal Range Check (85Hz - 300Hz)
                  const freq = i * binSize;
                  const isVocalRange = freq > 85 && freq < 300;

                  // --- SPEECH REJECTION LOGIC ---
                  if (isVocalRange) {
                      // In vocal range, we need EITHER high sharpness OR strong harmonics
                      // Speech has low sharpness AND usually weak harmonics relative to fundamental
                      if (!isSharp && harmonicScore < 1) {
                          // Allow if it's extremely loud (overpowering speech)
                          if (hps[i] < minMag * 4) continue;
                      }
                  } else {
                      // Outside vocal range (e.g. high notes), just check minimal signal quality
                      if (!isSharp && hps[i] < minMag * 1.5) continue; 
                  }

                  peaks.push({ freq, mag: hps[i] });
              }
          }
      }

      peaks.sort((a, b) => b.mag - a.mag);
      
      // Octave Error Correction
      const cleanedPeaks = peaks.filter((p, idx) => {
          for (let j = 0; j < idx; j++) {
              const ratio = p.freq / peaks[j].freq;
              if (Math.abs(ratio - Math.round(ratio)) < 0.05 && Math.round(ratio) > 1) {
                  return false; // Discard harmonic
              }
          }
          return true;
      });

      return cleanedPeaks.slice(0, 4).map(p => {
          const midiNum = 12 * (Math.log(p.freq / 440) / Math.log(2)) + 69;
          const roundedMidi = Math.round(midiNum);
          const noteNameIndex = roundedMidi % 12;
          const note = NOTES_ORDER[noteNameIndex];
          const octave = Math.floor(roundedMidi / 12) - 1;
          const cents = Math.floor(100 * (midiNum - roundedMidi));
          const confidence = Math.min(1, p.mag / (255 * harmonics)); 

          return { note, octave, cents, frequency: p.freq, confidence, midi: roundedMidi };
      });
  }

  private detectChord(notes: DetectedNote[]): string | undefined {
      if (!notes || notes.length < 2) return undefined;
      const sorted = [...notes].sort((a, b) => a.frequency - b.frequency);
      const root = sorted[0];
      const intervals = sorted.slice(1).map(n => Math.round(12 * Math.log2(n.frequency / root.frequency)));
      const rootName = root.note;
      
      const intervalSet = new Set(intervals);
      if (intervalSet.has(4) && intervalSet.has(7)) return `${rootName} Major`;
      if (intervalSet.has(3) && intervalSet.has(7)) return `${rootName} Minor`;
      if (intervalSet.has(4) && intervalSet.has(7) && intervalSet.has(11)) return `${rootName} Maj7`;
      if (intervalSet.has(4) && intervalSet.has(7) && intervalSet.has(10)) return `${rootName} Dom7`;
      if (intervalSet.has(3) && intervalSet.has(7) && intervalSet.has(10)) return `${rootName} m7`;
      if (intervalSet.has(2) && intervalSet.has(7)) return `${rootName} sus2`;
      if (intervalSet.has(5) && intervalSet.has(7)) return `${rootName} sus4`;

      return undefined;
  }

  analyze(): AudioAnalysisResult {
    // MIDI Priority
    if (this.activeMidiNotes.size > 0) {
        const detected: DetectedNote[] = [];
        this.activeMidiNotes.forEach((vel, midiNum) => {
            detected.push({
                note: NOTES_ORDER[midiNum % 12],
                octave: Math.floor(midiNum / 12) - 1,
                cents: 0,
                frequency: 440 * Math.pow(2, (midiNum - 69) / 12),
                confidence: 1.0,
                midi: midiNum
            });
        });
        return { 
            activeNotes: detected, volume: 0.8, snr: 100, clarity: 1, harmonicity: 1, spectralCentroid: 1000, source: 'midi',
            chordName: this.detectChord(detected)
        };
    }

    if (!this.analyser || !this.isListening || !this._micEnabled) {
      return { activeNotes: [], volume: 0, snr: 0, clarity: 0, harmonicity: 0, spectralCentroid: 0, source: 'none' };
    }

    this.analyser.getFloatTimeDomainData(this.buffer);
    this.analyser.getByteFrequencyData(this.frequencyBuffer);

    // Visual Spectrum
    const spectrum = new Array(64).fill(0);
    const step = Math.floor(this.frequencyBuffer.length / 2 / 64); 
    for (let i = 0; i < 64; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
            sum += this.frequencyBuffer[i * step + j];
        }
        spectrum[i] = sum / step / 255;
    }

    // RMS Calculation
    let rms = 0;
    for (let i = 0; i < this.buffer.length; i++) {
        rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / this.buffer.length);

    // Adaptive Noise Floor
    if (rms < this.noiseFloorRMS) {
        this.noiseFloorRMS = (this.noiseFloorRMS * 0.99) + (rms * 0.01);
    } else {
        this.noiseFloorRMS = (this.noiseFloorRMS * 0.9995) + (rms * 0.0005);
    }
    this.noiseFloorRMS = Math.max(0.001, Math.min(0.05, this.noiseFloorRMS));

    const snr = 20 * Math.log10(rms / this.noiseFloorRMS);
    
    // Silence Gate
    if (rms < this.noiseFloorRMS * 1.5) {
        this.noteHistory.clear();
        return { activeNotes: [], volume: rms, snr, clarity: 0, harmonicity: 0, spectralCentroid: 0, source: 'mic', spectrum };
    }

    const rawActiveNotes = this.detectPolyphonic(this.frequencyBuffer, this.audioContext?.sampleRate || 44100);

    // --- TEMPORAL STABILITY ---
    const currentFrameMidis = new Set<number>();
    
    rawActiveNotes.forEach(note => {
        const midi = note.midi;
        const count = this.noteHistory.get(midi) || 0;
        this.noteHistory.set(midi, Math.min(count + 1, 10)); 
        currentFrameMidis.add(midi);
    });

    // Decay
    for (const [midi, count] of this.noteHistory.entries()) {
        if (!currentFrameMidis.has(midi)) {
            const newCount = count - this.DECAY_RATE;
            if (newCount <= 0) {
                this.noteHistory.delete(midi);
            } else {
                this.noteHistory.set(midi, newCount);
            }
        }
    }

    // Filter by consistency
    const stableNotes = rawActiveNotes.filter(n => {
        const count = this.noteHistory.get(n.midi) || 0;
        return count >= this.FRAMES_TO_CONFIRM;
    });

    // Dummy stats for UI
    const clarity = stableNotes.length > 0 ? stableNotes[0].confidence : 0;
    
    return { 
        activeNotes: stableNotes, 
        volume: rms, 
        snr, 
        clarity, 
        harmonicity: 0.8, // placeholder
        spectralCentroid: 1000, // placeholder
        source: 'mic',
        chordName: this.detectChord(stableNotes),
        spectrum
    };
  }

  // --- AUDIO PLAYBACK ---
  playTone(frequency: number, duration: number, type: OscillatorType = 'sine', time: number = 0) {
    if (!this.audioContext || !this.mainGain) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.frequency.value = frequency;
    const t = this.audioContext.currentTime + time;
    gain.gain.setValueAtTime(0, t);
    osc.type = type;
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    osc.connect(gain);
    gain.connect(this.mainGain);
    osc.start(t);
    osc.stop(t + duration + 0.1);
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
    const noteStr = `${note}${octave}`;
    const targetFreq = NOTE_FREQUENCIES[noteStr];
    if (!targetFreq) return null;
    const strings = [
      { base: 329.63, idx: 0 }, { base: 246.94, idx: 1 }, { base: 196.00, idx: 2 },
      { base: 146.83, idx: 3 }, { base: 110.00, idx: 4 }, { base: 82.41,  idx: 5 }
    ];
    for (let s of strings) {
        const semitones = Math.round(12 * Math.log2(targetFreq / s.base));
        if (semitones >= 0 && semitones <= 15) return { stringIdx: s.idx, fret: semitones };
    }
    return null;
  }

  calibrateNoiseFloor(volume: number) {
      if (volume > 0.001) this.noiseFloorRMS = volume * 1.2;
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
