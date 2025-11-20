
import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none ring-2 ring-transparent focus:ring-blue-500"
      aria-label="Toggle Theme"
    >
      <div
        className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-[8px] ${
          isDark ? 'translate-x-6 bg-gray-800 text-yellow-300' : 'translate-x-0 bg-white text-orange-500'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default ThemeToggle;
