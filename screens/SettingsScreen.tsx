
import React from 'react';
import { CogIcon } from '../components/Icons';
import { AppState, AppSettings, AudioAnalysisResult } from '../types';
import { storageService } from '../services/storageService';

interface SettingsScreenProps {
    setAppState: (state: AppState) => void;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    currentInput: AudioAnalysisResult;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setAppState, settings, setSettings, currentInput }) => {
  return (
     <div className="h-screen bg-surface-primary dark:bg-dark-surface-primary text-text-primary dark:text-dark-text-primary overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setAppState(AppState.MENU)} className="p-2 rounded-full hover:bg-white/10">← Back</button>
                <h2 className="text-3xl font-bold flex items-center gap-2"><CogIcon /> Admin Settings</h2>
             </div>

             {/* Gameplay Settings */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-blue-400 border-b border-white/10 pb-2">Gameplay</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Default Playback Speed ({settings.defaultSpeed}x)</label>
                        <input 
                          type="range" min="0.5" max="1.5" step="0.1" 
                          value={settings.defaultSpeed}
                          onChange={(e) => setSettings(s => ({ ...s, defaultSpeed: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Mic Sensitivity (Threshold)</label>
                        <input 
                          type="range" min="0.1" max="3.0" step="0.1" 
                          value={settings.micSensitivity}
                          onChange={(e) => setSettings(s => ({ ...s, micSensitivity: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Enable Looping by Default</p>
                        <p className="text-xs text-gray-500">Start every song with loop region active</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableLooping}
                        onChange={(e) => setSettings(s => ({ ...s, enableLooping: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Strict Mode</p>
                        <p className="text-xs text-gray-500">Requires 95% note clarity to register hits</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.strictMode}
                        onChange={(e) => setSettings(s => ({ ...s, strictMode: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>
             </section>

             {/* Visual Settings */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-purple-400 border-b border-white/10 pb-2">Visuals</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Dark Mode</p>
                        <p className="text-xs text-gray-500">Toggle application theme</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.darkMode}
                        onChange={(e) => setSettings(s => ({ ...s, darkMode: e.target.checked }))}
                        className="w-6 h-6 accent-purple-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Show Note Labels on Piano</p>
                        <p className="text-xs text-gray-500">Display C, D, E on piano keys</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.showNoteLabels}
                        onChange={(e) => setSettings(s => ({ ...s, showNoteLabels: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-bold text-gray-400 mb-2">Sheet Music Style</label>
                         <select 
                            value={settings.noteDisplayStyle}
                            onChange={(e) => setSettings(s => ({ ...s, noteDisplayStyle: e.target.value as any }))}
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-white dark:text-gray-200"
                         >
                             <option value="Standard">Standard</option>
                             <option value="ScaleDegree">Scale Degrees (1, 2, 3)</option>
                             <option value="Lyrics">Lyrics</option>
                             <option value="NoteName">Note Names (C, D, E)</option>
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-400 mb-2">Accidental Style</label>
                         <select 
                            value={settings.accidentalStyle}
                            onChange={(e) => setSettings(s => ({ ...s, accidentalStyle: e.target.value as any }))}
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none text-white dark:text-gray-200"
                         >
                             <option value="Sharp">Sharps (♯)</option>
                             <option value="Flat">Flats (♭)</option>
                         </select>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Particle Effects</p>
                        <p className="text-xs text-gray-500">Enable extra visual flair</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableParticleEffects}
                        onChange={(e) => setSettings(s => ({ ...s, enableParticleEffects: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>
             </section>

             {/* Audio Settings */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-orange-400 border-b border-white/10 pb-2">Audio & Voice</h3>
                
                {/* Audio Check Section */}
                <div className="p-4 bg-white/5 rounded-xl space-y-4 border border-white/10">
                    <div className="flex justify-between items-center">
                        <p className="font-bold">Microphone Check</p>
                        {currentInput.source === 'midi' && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">MIDI Connected</span>}
                    </div>
                    
                    <div className="h-16 bg-black/40 rounded-lg relative overflow-hidden flex items-center justify-center border border-white/5">
                        {/* Volume Bar */}
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-75 ease-out" 
                            style={{ height: `${Math.min(100, currentInput.volume * 2000)}%`, opacity: 0.3 }} 
                        />
                        
                        {/* Note Display */}
                        <div className="z-10 font-mono font-bold text-xl flex items-center gap-2">
                             {currentInput.activeNotes[0] ? (
                                 <>
                                    <span className="text-blue-400">{currentInput.activeNotes[0].note}{currentInput.activeNotes[0].octave}</span>
                                    <span className="text-xs text-gray-500">({Math.round(currentInput.activeNotes[0].frequency)}Hz)</span>
                                 </>
                             ) : (
                                 <span className="text-gray-600">Listening...</span>
                             )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div className="flex justify-between">
                            <span>Signal-to-Noise (SNR)</span>
                            <span className={currentInput.snr > 10 ? 'text-green-400' : 'text-red-400'}>{Math.round(currentInput.snr)} dB</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Clarity (Harmonics)</span>
                            <span className={currentInput.clarity > 0.8 ? 'text-green-400' : 'text-yellow-400'}>{Math.round(currentInput.clarity * 100)}%</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">Play a note to verify input detection. Ensure SNR is > 10dB for best results.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Master Volume</label>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={settings.masterVolume}
                      onChange={(e) => setSettings(s => ({ ...s, masterVolume: parseFloat(e.target.value) }))}
                      className="w-full accent-orange-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Enable TTS Lyrics</p>
                        <p className="text-xs text-gray-500">AI voice sings lyrics while playing</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableTTS}
                        onChange={(e) => setSettings(s => ({ ...s, enableTTS: e.target.checked }))}
                        className="w-6 h-6 accent-orange-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Enable Voice Interactions</p>
                        <p className="text-xs text-gray-500">Spoken feedback, greetings, and errors</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableVoiceFeedback}
                        onChange={(e) => setSettings(s => ({ ...s, enableVoiceFeedback: e.target.checked }))}
                        className="w-6 h-6 accent-orange-500"
                    />
                </div>
             </section>

             {/* System */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-400 border-b border-white/10 pb-2">System</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="font-bold">Auto-Save Generated Songs</p>
                        <p className="text-xs text-gray-500">Keep history of all AI compositions</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.autoSaveSongs}
                        onChange={(e) => setSettings(s => ({ ...s, autoSaveSongs: e.target.checked }))}
                        className="w-6 h-6 accent-gray-500"
                    />
                </div>

                <button 
                    onClick={() => setSettings(storageService.resetSettings())}
                    className="w-full py-3 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition"
                >
                    Reset All Settings to Default
                </button>
             </section>
        </div>
     </div>
  );
};

export default SettingsScreen;
