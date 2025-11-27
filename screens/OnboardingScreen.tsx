import React, { useEffect, useRef, useState } from 'react';
import { SparklesIcon, CableIcon, CheckIcon } from '../components/Icons';
import AuthModal from '../components/AuthModal';
import { OnboardingStep, Instrument, User, AppState, AuthView } from '../types';
import { audioEngine } from '../services/audioEngine';
import { useAudioPoll } from '../hooks/useAudioPoll';

interface OnboardingScreenProps {
    onboardingStep: OnboardingStep;
    handleOnboardingNext: () => void;
    selectedInstrument: Instrument;
    setSelectedInstrument: (inst: Instrument) => void;
    micError: string;
    midiConnected: boolean;
    openAuthModal: (view: AuthView) => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (val: boolean) => void;
    authModalView: AuthView;
    setCurrentUser: (user: User) => void;
    setAppState: (state: AppState) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    onboardingStep, handleOnboardingNext, selectedInstrument, setSelectedInstrument,
    micError, midiConnected, openAuthModal, isAuthModalOpen, setAuthModalOpen,
    authModalView, setCurrentUser, setAppState
}) => {
    const zeroSignalTimeRef = useRef(0);
    const [isRetrying, setIsRetrying] = useState(false);
    
    // Use the hook for live audio data
    const currentInput = useAudioPoll();

    // Auto-retry logic
    useEffect(() => {
        let interval: any;
        if (onboardingStep === OnboardingStep.AUDIO_SETUP) {
            interval = setInterval(() => {
                if (currentInput.volume < 0.001 && !midiConnected) {
                    zeroSignalTimeRef.current += 1000;
                    if (zeroSignalTimeRef.current > 3000 && !isRetrying) {
                        setIsRetrying(true);
                        audioEngine.restart().then(() => {
                             setTimeout(() => setIsRetrying(false), 1000);
                             zeroSignalTimeRef.current = 0;
                        });
                    }
                } else {
                    zeroSignalTimeRef.current = 0;
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [onboardingStep, currentInput.volume, midiConnected, isRetrying]);

  return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-primary text-center p-8">
          <div className="w-full max-w-md">
              {onboardingStep === OnboardingStep.WELCOME && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30">
                           <SparklesIcon />
                       </div>
                       <h1 className="text-4xl font-bold text-text-primary">Welcome to Luma</h1>
                       <p className="text-text-secondary">Your AI-powered music tutor. Let's get you set up.</p>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-white dark:bg-surface-interactive text-black dark:text-text-primary rounded-full font-bold text-lg hover:scale-105 transition-all">Get Started</button>
                       <p className="text-xs text-text-secondary">
                           Already have an account? <button onClick={() => openAuthModal('signIn')} className="text-blue-400 font-bold">Sign In</button>
                       </p>
                       <AuthModal 
                            isOpen={isAuthModalOpen} 
                            onClose={() => setAuthModalOpen(false)} 
                            initialView={authModalView} 
                            onAuthSuccess={(user) => {
                                setCurrentUser(user);
                                setAuthModalOpen(false);
                                setAppState(AppState.MENU);
                            }}
                        />
                  </div>
              )}
              
              {onboardingStep === OnboardingStep.INSTRUMENT && (
                   <div className="space-y-8 animate-fade-in">
                       <h2 className="text-3xl font-bold text-text-primary">Choose your instrument</h2>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.PIANO)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.PIANO ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 dark:border-border-default bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎹</div>
                               <div className="font-bold text-text-primary">Piano</div>
                           </button>
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.GUITAR)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.GUITAR ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 dark:border-border-default bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎸</div>
                               <div className="font-bold text-text-primary">Guitar</div>
                           </button>
                       </div>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all">Next</button>
                   </div>
              )}

              {onboardingStep === OnboardingStep.AUDIO_SETUP && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-3xl font-bold text-text-primary">Sound Check</h2>
                      <p className="text-text-secondary">Play a note or connect MIDI.</p>
                      
                      {micError && (
                          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                              {micError}
                          </div>
                      )}
                      
                      {isRetrying && (
                          <div className="text-yellow-400 text-sm animate-pulse">
                              Trying to access microphone again...
                          </div>
                      )}

                      <div className="h-32 bg-black/40 dark:bg-surface-tertiary rounded-2xl border border-white/10 dark:border-border-default flex items-center justify-center relative overflow-hidden">
                          <div 
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-75 ease-out ${currentInput.volume < 0.001 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ height: `${Math.min(100, currentInput.volume * 2000)}%`, opacity: 0.5 }} 
                          />
                          <div className="z-10 text-2xl font-mono font-bold text-text-primary">
                              {currentInput.activeNotes[0] ? `${currentInput.activeNotes[0].note}${currentInput.activeNotes[0].octave}` : '...'}
                          </div>
                      </div>
                      
                      {midiConnected && (
                          <div className="flex items-center gap-2 justify-center text-green-400 bg-green-400/10 py-2 rounded-lg">
                              <CableIcon /> MIDI Connected
                          </div>
                      )}

                      <button onClick={handleOnboardingNext} className="w-full py-4 bg-white dark:bg-surface-interactive text-black dark:text-text-primary rounded-full font-bold hover:scale-105 transition-all">Looks Good</button>
                  </div>
              )}
              
              {onboardingStep === OnboardingStep.COMPLETE && (
                  <div className="space-y-6 animate-fade-in text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-text-primary">
                          <CheckIcon />
                      </div>
                      <h2 className="text-3xl font-bold text-text-primary">All Set!</h2>
                  </div>
              )}
          </div>
      </div>
  );
};

export default OnboardingScreen;