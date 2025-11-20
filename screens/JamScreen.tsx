
import React from 'react';
import { HeadphonesIcon } from '../components/Icons';
import { AppState } from '../types';

interface JamScreenProps {
    setAppState: (state: AppState) => void;
    jamMood: string;
}

const JamScreen: React.FC<JamScreenProps> = ({ setAppState, jamMood }) => {
  return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
              <div className="animate-pulse-slow">
                  <div className="w-40 h-40 bg-pink-500/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <HeadphonesIcon />
              </div>
              <h2 className="text-4xl font-bold">Jam Session</h2>
              <p className="text-gray-300 max-w-md">Play anything. Luma is listening and will accompany you.</p>
              {jamMood && (
                  <div className="px-6 py-2 bg-white/10 rounded-full border border-white/20">
                      Mood: <span className="font-bold text-pink-400">{jamMood}</span>
                  </div>
              )}
              <button onClick={() => setAppState(AppState.MENU)} className="mt-8 text-gray-400 hover:text-white">Stop Jamming</button>
          </div>
          <div className="h-1/3 bg-black/50 backdrop-blur-lg border-t border-white/10">
          </div>
      </div>
  );
};

export default JamScreen;
    