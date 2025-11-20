
import React, { useEffect, useRef, useState } from 'react';

interface MascotProps {
  onClick?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ onClick }) => {
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const updateEye = (eye: HTMLDivElement | null) => {
        if (!eye) return { x: 0, y: 0 };
        const rect = eye.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const distance = Math.min(3, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 20);
        
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        };
      };

      setLookAt({
        x: updateEye(leftEyeRef.current).x, // Simplified shared tracking
        y: updateEye(leftEyeRef.current).y
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <button 
      onClick={onClick}
      className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full relative shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
    >
      <div className="relative w-6 h-3 flex justify-between">
        {/* Left Eye */}
        <div className="w-2.5 h-2.5 bg-white rounded-full relative overflow-hidden" ref={leftEyeRef}>
            <div 
                className="w-1.5 h-1.5 bg-black rounded-full absolute top-1/2 left-1/2"
                style={{ transform: `translate(calc(-50% + ${lookAt.x}px), calc(-50% + ${lookAt.y}px))` }}
            />
        </div>
        {/* Right Eye */}
        <div className="w-2.5 h-2.5 bg-white rounded-full relative overflow-hidden" ref={rightEyeRef}>
             <div 
                className="w-1.5 h-1.5 bg-black rounded-full absolute top-1/2 left-1/2"
                style={{ transform: `translate(calc(-50% + ${lookAt.x}px), calc(-50% + ${lookAt.y}px))` }}
            />
        </div>
      </div>
    </button>
  );
};

export default Mascot;
