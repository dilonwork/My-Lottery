
import React, { useState, useEffect } from 'react';

interface SlotProps {
  targetDigit: string;
  isSpinning: boolean;
  delay: number;
}

const Slot: React.FC<SlotProps> = ({ targetDigit, isSpinning, delay }) => {
  const [currentDigit, setCurrentDigit] = useState('0');
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    let interval: any;
    if (isSpinning) {
      interval = setInterval(() => {
        setCurrentDigit(digits[Math.floor(Math.random() * digits.length)]);
      }, 50);
    } else {
      setTimeout(() => {
        setCurrentDigit(targetDigit);
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isSpinning, targetDigit, delay]);

  return (
    <div className="w-16 h-24 sm:w-20 sm:h-32 bg-slate-800 border-2 border-yellow-600/50 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-10"></div>
      <span className={`text-4xl sm:text-6xl font-black text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)] transition-all duration-300`}>
        {currentDigit}
      </span>
    </div>
  );
};

export default Slot;
