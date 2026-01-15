
import React, { useState, useEffect, useRef } from 'react';
import Slot from './Slot';
import { dataService } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { Participant, Prize, Winner } from '../types';

const DrawPage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerInfo, setShowWinnerInfo] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');
  const [winner, setWinner] = useState<Winner | null>(null);
  const [targetEmployeeNo, setTargetEmployeeNo] = useState('      ');
  const [aiMessage, setAiMessage] = useState('');
  
  const tensionAudioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadedPrizes = dataService.getPrizes().filter(p => p && p.remainingCount > 0);
    setPrizes(loadedPrizes);
    if (loadedPrizes.length > 0) {
      setSelectedPrizeId(loadedPrizes[0].id);
    }

    // Setup Audio
    tensionAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    tensionAudioRef.current.loop = true;
    
    successAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
  }, []);

  useEffect(() => {
    if (prizes.length > 0 && !prizes.find(p => p.id === selectedPrizeId)) {
      setSelectedPrizeId(prizes[0].id);
    } else if (prizes.length === 0) {
      setSelectedPrizeId('');
    }
  }, [prizes, selectedPrizeId]);

  const handleStartDraw = async () => {
    if (isSpinning || !selectedPrizeId) return;

    const currentPrizes = dataService.getPrizes().filter(p => p && p.remainingCount > 0);
    const selectedPrize = currentPrizes.find(p => p.id === selectedPrizeId);
    
    if (!selectedPrize) {
      alert("Selected prize is no longer available.");
      setPrizes(currentPrizes);
      return;
    }

    const participants = dataService.getParticipants();
    const winners = dataService.getWinners();
    const winnerIds = winners.map(w => w.employeeNo);
    
    const availableParticipants = participants.filter(p => p && !winnerIds.includes(p.employeeNo));
    
    if (availableParticipants.length === 0) {
      alert("No participants left!");
      return;
    }

    setWinner(null);
    setShowWinnerInfo(false);
    setAiMessage('');
    setIsSpinning(true);
    
    if (tensionAudioRef.current) {
      tensionAudioRef.current.currentTime = 0;
      tensionAudioRef.current.play().catch(e => console.log("Audio failed to play", e));
    }

    const luckyOne = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
    const empNo = luckyOne.employeeNo.padStart(6, '0').slice(0, 6);
    setTargetEmployeeNo(empNo);

    // Initial spin duration
    setTimeout(async () => {
      setIsSpinning(false);
      
      if (tensionAudioRef.current) {
        tensionAudioRef.current.pause();
      }
      
      const newWinner: Winner = {
        id: Date.now().toString(),
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        employeeNo: luckyOne.employeeNo,
        name: luckyOne.name,
        department: luckyOne.department,
        drawTime: new Date().toLocaleString()
      };

      dataService.addWinner(newWinner);
      setWinner(newWinner);
      
      const updatedPrizes = dataService.getPrizes().filter(p => p && p.remainingCount > 0);
      setPrizes(updatedPrizes);

      const message = await geminiService.generateCongratulation(newWinner);
      setAiMessage(message);

      // Wait for all slots to finish their staggered lock-in (5 * 200ms = 1000ms)
      // Added a small buffer (1200ms) for visual smoothness
      setTimeout(() => {
        setShowWinnerInfo(true);
        if (successAudioRef.current) {
          successAudioRef.current.currentTime = 0;
          successAudioRef.current.play().catch(e => console.log("Success audio failed", e));
        }
      }, 1200);

    }, 3000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="relative z-10 max-w-4xl w-full text-center space-y-12 mt-16">
        <header className="space-y-4">
          <div className="flex items-center justify-center gap-4 mb-2">
             <div className="h-[1px] w-12 bg-yellow-500/30 rounded-full"></div>
             <span className="text-yellow-500/80 font-black tracking-[0.5em] text-[10px] uppercase">TSMC AZ Fab Site</span>
             <div className="h-[1px] w-12 bg-yellow-500/30 rounded-full"></div>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
            WAFER <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600">FORTUNE</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-[0.4em] uppercase">Yield Performance Recognition</p>
        </header>

        <div className="bg-slate-900/40 p-8 md:p-12 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] space-y-10 relative overflow-hidden">
          {isSpinning && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-yellow-500/70 shadow-[0_0_20px_rgba(234,179,8,1)] animate-[scan_1.5s_linear_infinite] z-20"></div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <div className="relative w-full md:w-auto">
              <select
                value={selectedPrizeId}
                onChange={(e) => setSelectedPrizeId(e.target.value)}
                disabled={isSpinning}
                className="bg-slate-950/60 text-white px-6 py-4 rounded-2xl border border-slate-800/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg w-full md:w-[380px] appearance-none cursor-pointer transition-all hover:bg-slate-900/90 backdrop-blur-md"
              >
                {prizes.length > 0 ? (
                  prizes.map(p => p && (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} ({p.remainingCount} Unit)
                    </option>
                  ))
                ) : (
                  <option value="">Zero Inventory</option>
                )}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <i className="fas fa-microchip"></i>
              </div>
            </div>

            <button
              onClick={handleStartDraw}
              disabled={isSpinning || !selectedPrizeId}
              className={`group relative px-12 py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all transform active:scale-95 overflow-hidden shadow-2xl ${
                isSpinning || !selectedPrizeId
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-[length:200%_auto] hover:bg-right text-slate-950 hover:shadow-yellow-500/20'
              }`}
            >
              <span className="relative z-10">{isSpinning ? 'REFINING...' : 'INITIATE CYCLE'}</span>
            </button>
          </div>

          <div className="flex gap-2 sm:gap-4 justify-center py-8">
            {targetEmployeeNo.split('').map((char, idx) => (
              <Slot key={idx} targetDigit={char || '0'} isSpinning={isSpinning} delay={idx * 200} />
            ))}
          </div>

          <div className="h-44 flex flex-col items-center justify-center relative">
            {winner && showWinnerInfo ? (
              <div className="animate-in fade-in zoom-in duration-700 space-y-4">
                <div className="flex items-center justify-center gap-3">
                   <span className="h-[1px] w-8 bg-slate-800"></span>
                   <p className="text-yellow-500 font-black tracking-[0.3em] uppercase" style={{ fontSize: '20px' }}>
                     {winner.department}
                   </p>
                   <span className="h-[1px] w-8 bg-slate-800"></span>
                </div>
                <h2 className="font-black text-white uppercase tracking-tighter drop-shadow-2xl" style={{ fontSize: '20px' }}>
                  {winner.name}
                </h2>
                <div className="mt-6 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem] max-w-xl mx-auto backdrop-blur-3xl">
                   <p className="text-yellow-400 font-bold text-lg italic tracking-tight">
                     "{aiMessage || 'Analyzing yield success...'}"
                   </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {isSpinning && (
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping [animation-delay:0.4s]"></div>
                  </div>
                )}
                <p className="text-slate-600 text-xs font-black tracking-[0.5em] uppercase">
                  {isSpinning ? 'Scanning Production Batch...' : 'Awaiting Fabrication Signal'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DrawPage;
