
import React from 'react';
import { SparklesIcon, CableIcon, CheckIcon } from '../components/Icons';
import AuthModal from '../components/AuthModal';
import { OnboardingStep, Instrument, AudioAnalysisResult, User, AppState, AuthView } from '../types';

interface OnboardingScreenProps {
    onboardingStep: OnboardingStep;
    handleOnboardingNext: () => void;
    selectedInstrument: Instrument;
    setSelectedInstrument: (inst: Instrument) => void;
    micError: string;
    currentInput: AudioAnalysisResult;
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
    micError, currentInput, midiConnected, openAuthModal, isAuthModalOpen, setAuthModalOpen,
    authModalView, setCurrentUser, setAppState
}) => {
  return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-primary text-center p-8">
          <div className="w-full max-w-md">
              {onboardingStep === OnboardingStep.WELCOME && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30">
                           <SparklesIcon />
                       </div>
                       <h1 className="text-4xl font-bold text-white">Welcome to Luma</h1>
                       <p className="text-gray-400">Your AI-powered music tutor. Let's get you set up.</p>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all">Get Started</button>
                       <p className="text-xs text-gray-500">
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
                       <h2 className="text-3xl font-bold text-white">Choose your instrument</h2>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.PIANO)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.PIANO ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎹</div>
                               <div className="font-bold text-white">Piano</div>
                           </button>
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.GUITAR)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.GUITAR ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎸</div>
                               <div className="font-bold text-white">Guitar</div>
                           </button>
                       </div>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all">Next</button>
                   </div>
              )}

              {onboardingStep === OnboardingStep.AUDIO_SETUP && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-3xl font-bold text-white">Sound Check</h2>
                      <p className="text-gray-400">Play a note or connect MIDI.</p>
                      
                      {micError && (
                          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                              {micError}
                          </div>
                      )}

                      <div className="h-32 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-75 ease-out" style={{ height: `${Math.min(100, currentInput.volume * 2000)}%`, opacity: 0.5 }} />
                          <div className="z-10 text-2xl font-mono font-bold text-white">
                              {currentInput.activeNotes[0] ? `${currentInput.activeNotes[0].note}${currentInput.activeNotes[0].octave}` : '...'}
                          </div>
                      </div>
                      
                      {midiConnected && (
                          <div className="flex items-center gap-2 justify-center text-green-400 bg-green-400/10 py-2 rounded-lg">
                              <CableIcon /> MIDI Connected
                          </div>
                      )}

                      <button onClick={handleOnboardingNext} className="w-full py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-all">Looks Good</button>
                  </div>
              )}
              
              {onboardingStep === OnboardingStep.COMPLETE && (
                  <div className="space-y-6 animate-fade-in text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">
                          <CheckIcon />
                      </div>
                      <h2 className="text-3xl font-bold text-white">All Set!</h2>
                  </div>
              )}
          </div>
      </div>
  );
};

export default OnboardingScreen;
