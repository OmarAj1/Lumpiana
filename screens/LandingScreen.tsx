
import React from 'react';
import { SparklesIcon } from '../components/Icons';
import AuthModal from '../components/AuthModal';
import { AppState, AuthView, User } from '../types';

interface LandingScreenProps {
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalView: AuthView;
  openAuthModal: (view: AuthView) => void;
  setCurrentUser: (user: User) => void;
  setAppState: (state: AppState) => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  isAuthModalOpen, setAuthModalOpen, authModalView, openAuthModal, setCurrentUser, setAppState
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-primary dark:bg-dark-surface-primary text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full" />
        </div>
        <div className="z-10 text-center space-y-8 max-w-md p-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6">
                <SparklesIcon />
            </div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Luma</h1>
            <p className="text-gray-400 text-lg">Sign in to unlock your personal AI music tutor.</p>
            
            <div className="space-y-4 w-full">
                <button 
                    onClick={() => openAuthModal('signIn')}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                >
                    Sign In
                </button>
                <button 
                    onClick={() => openAuthModal('signUp')}
                    className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                    Create Account
                </button>
            </div>
        </div>
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
  );
};

export default LandingScreen;
    