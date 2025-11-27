

import React, { useEffect, useState, useRef } from 'react';
import { CogIcon, RefreshIcon } from '../components/Icons';
import { AppState, AppSettings } from '../types';
import { storageService } from '../services/storageService';
import { audioEngine } from '../services/audioEngine';
import { useAudioPoll } from '../hooks/useAudioPoll';
import { toast } from 'react-toastify';

interface SettingsScreenProps {
    setAppState: (state: AppState) => void;
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    currentInput: any; 
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setAppState, settings, setSettings }) => {
    const [isRestarting, setIsRestarting] = useState(false);
    const zeroSignalTimeRef = useRef(0);
    const currentInput = useAudioPoll();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-retry logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentInput.source === 'mic' && currentInput.volume < 0.001 && !isRestarting) {
                zeroSignalTimeRef.current += 1000;
                if (zeroSignalTimeRef.current > 5000) {
                    handleRestartMic();
                    zeroSignalTimeRef.current = 0;
                }
            } else {
                zeroSignalTimeRef.current = 0;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentInput.volume, currentInput.source, isRestarting]);

    const handleRestartMic = async () => {
        setIsRestarting(true);
        try {
            await audioEngine.restart();
        } catch (e) {
            console.error("Restart failed", e);
        } finally {
            setTimeout(() => setIsRestarting(false), 1000);
        }
    };

    const handleExport = () => {
        const json = storageService.exportUserData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `luma-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data exported!");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            if (storageService.importUserData(content)) {
                toast.success("Data imported! Reloading...");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error("Invalid backup file.");
            }
        };
        reader.readAsText(file);
    };

  return (
     <div className="h-screen bg-surface-primary text-text-primary overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setAppState(AppState.MENU)} className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-surface-tertiary">← Back</button>
                <h2 className="text-3xl font-bold flex items-center gap-2"><CogIcon /> Admin Settings</h2>
             </div>

             {/* Gameplay Settings */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-blue-400 border-b border-white/10 dark:border-border-default pb-2">Gameplay</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-surface-secondary rounded-xl border border-white/10 dark:border-border-default">
                    <div>
                        <p className="font-bold text-text-primary">Flow Mode (No Waiting)</p>
                        <p className="text-xs text-text-secondary">If on, song continues even if you miss a note.</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.flowMode}
                        onChange={(e) => setSettings(s => ({ ...s, flowMode: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-surface-secondary rounded-xl border border-white/10 dark:border-border-default">
                    <div>
                        <p className="font-bold text-text-primary">Enable Touch Piano</p>
                        <p className="text-xs text-text-secondary">Click or tap keys to play (Virtual Piano mode).</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableTouchPiano}
                        onChange={(e) => setSettings(s => ({ ...s, enableTouchPiano: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">Playback Speed ({settings.defaultSpeed}x)</label>
                        <input 
                          type="range" min="0.5" max="1.5" step="0.1" 
                          value={settings.defaultSpeed}
                          onChange={(e) => setSettings(s => ({ ...s, defaultSpeed: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">Mic Sensitivity (Gain)</label>
                        <input 
                          type="range" min="0.1" max="3.0" step="0.1" 
                          value={settings.micSensitivity}
                          onChange={(e) => setSettings(s => ({ ...s, micSensitivity: parseFloat(e.target.value) }))}
                          className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-surface-secondary rounded-xl">
                    <div>
                        <p className="font-bold text-text-primary">Enable Looping by Default</p>
                        <p className="text-xs text-text-secondary">Start every song with loop region active</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.enableLooping}
                        onChange={(e) => setSettings(s => ({ ...s, enableLooping: e.target.checked }))}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>
             </section>

             {/* Visual Settings */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-purple-400 border-b border-white/10 dark:border-border-default pb-2">Visuals</h3>
                
                <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2">Sheet Music Zoom ({settings.sheetMusicZoom}%)</label>
                    <input 
                      type="range" min="50" max="200" step="10" 
                      value={settings.sheetMusicZoom}
                      onChange={(e) => setSettings(s => ({ ...s, sheetMusicZoom: parseInt(e.target.value) }))}
                      className="w-full accent-purple-500"
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-surface-secondary rounded-xl">
                    <div>
                        <p className="font-bold text-text-primary">Dark Mode</p>
                        <p className="text-xs text-text-secondary">Toggle application theme</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.darkMode}
                        onChange={(e) => setSettings(s => ({ ...s, darkMode: e.target.checked }))}
                        className="w-6 h-6 accent-purple-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-bold text-text-secondary mb-2">Sheet Music Style</label>
                         <select 
                            value={settings.noteDisplayStyle}
                            onChange={(e) => setSettings(s => ({ ...s, noteDisplayStyle: e.target.value as any }))}
                            className="w-full p-3 rounded-xl bg-white/10 dark:bg-surface-tertiary border border-white/10 dark:border-border-default focus:outline-none text-text-primary"
                         >
                             <option value="Standard">Standard</option>
                             <option value="ScaleDegree">Scale Degrees (1, 2, 3)</option>
                             <option value="Lyrics">Lyrics</option>
                             <option value="NoteName">Note Names (C, D, E)</option>
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-text-secondary mb-2">Accidental Style</label>
                         <select 
                            value={settings.accidentalStyle}
                            onChange={(e) => setSettings(s => ({ ...s, accidentalStyle: e.target.value as any }))}
                            className="w-full p-3 rounded-xl bg-white/10 dark:bg-surface-tertiary border border-white/10 dark:border-border-default focus:outline-none text-text-primary"
                         >
                             <option value="Sharp">Sharps (♯)</option>
                             <option value="Flat">Flats (♭)</option>
                         </select>
                    </div>
                </div>
             </section>

             {/* Audio & Data (Keep existing) */}
             <section className="space-y-6">
                <h3 className="text-xl font-bold text-orange-400 border-b border-white/10 dark:border-border-default pb-2">Audio & Voice</h3>
                
                {/* Pitch Detection Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-surface-secondary rounded-xl border border-white/10 dark:border-border-default">
                    <div>
                        <p className="font-bold text-text-primary">Pitch Detection (Microphone)</p>
                        <p className="text-xs text-text-secondary">Enable real-time audio analysis.</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.pitchDetectionEnabled}
                        onChange={(e) => {
                            const val = e.target.checked;
                            setSettings(s => ({ ...s, pitchDetectionEnabled: val }));
                            audioEngine.setEnabled(val);
                        }}
                        className="w-6 h-6 accent-blue-500"
                    />
                </div>

                {/* Audio Check */}
                <div className={`p-4 bg-white/5 dark:bg-surface-secondary rounded-xl space-y-4 border border-white/10 dark:border-border-default ${!settings.pitchDetectionEnabled ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-text-primary">Microphone Check</p>
                        <div className="flex items-center gap-2">
                            {currentInput.source === 'midi' && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">MIDI Connected</span>}
                            <button 
                                onClick={handleRestartMic}
                                disabled={isRestarting || !settings.pitchDetectionEnabled}
                                className="p-2 bg-white/10 dark:bg-surface-tertiary rounded-lg hover:bg-white/20 dark:hover:bg-surface-interactive transition-colors flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshIcon /> {isRestarting ? 'Restarting...' : 'Force Reconnect'}
                            </button>
                        </div>
                    </div>
                    <div className="h-16 bg-black/40 dark:bg-surface-tertiary rounded-lg relative overflow-hidden flex items-center justify-center border border-white/5 dark:border-border-default">
                        <div 
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-75 ease-out ${currentInput.volume < 0.001 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ height: `${Math.min(100, currentInput.volume * 2000)}%`, opacity: 0.3 }} 
                        />
                        <div className="z-10 font-mono font-bold text-xl flex items-center gap-2">
                             {currentInput.activeNotes[0] ? (
                                 <>
                                    <span className="text-blue-400">{currentInput.activeNotes[0].note}{currentInput.activeNotes[0].octave}</span>
                                    <span className="text-xs text-text-secondary">({Math.round(currentInput.activeNotes[0].frequency)}Hz)</span>
                                 </>
                             ) : (
                                 <span className={currentInput.volume < 0.001 ? "text-red-400" : "text-text-secondary"}>
                                     {settings.pitchDetectionEnabled ? (currentInput.volume < 0.001 ? "No Signal - Retrying..." : "Listening...") : "Detection Disabled"}
                                 </span>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition">
                        Export Progress (Backup)
                    </button>
                    <div className="flex-1 relative">
                        <button className="w-full py-3 border border-white/20 dark:border-border-default text-white dark:text-text-primary rounded-xl font-bold hover:bg-white/10 dark:hover:bg-surface-tertiary transition">
                            Import Backup
                        </button>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
             </section>
        </div>
     </div>
  );
};

export default SettingsScreen;