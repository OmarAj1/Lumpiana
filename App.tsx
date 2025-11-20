
import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { ToastContainer } from 'react-toastify';
import AppRouter from './components/AppRouter';
import { useAppLogic } from './hooks/useAppLogic';

const AppContent = () => {
    const logic = useAppLogic();
    return <AppRouter logic={logic} />;
};

export default function App() {
  return (
    <GameProvider>
        <ToastContainer position="top-center" theme="dark" />
        <AppContent />
    </GameProvider>
  );
}
