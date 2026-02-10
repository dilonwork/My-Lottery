
import React, { useState, useEffect, useMemo } from 'react';
import { Winner } from '../types';
import { dataService } from '../services/dataService';

const ResultsPage: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);

  useEffect(() => {
    const loadData = () => {
      const latestFromCSV = dataService.getWinners().reverse();
      setWinners(latestFromCSV);
    };

    loadData();
    const dataInterval = setInterval(loadData, 5000);
    return () => clearInterval(dataInterval);
  }, []);

  const groupedWinners = useMemo(() => {
    const groups: Record<string, Winner[]> = {};
    winners.forEach((w) => {
      if (!groups[w.prizeName]) groups[w.prizeName] = [];
      groups[w.prizeName].push(w);
    });
    return groups;
  }, [winners]);

  const prizeNames = useMemo(() => Object.keys(groupedWinners), [groupedWinners]);

  useEffect(() => {
    if (prizeNames.length <= 1) {
      setCurrentPrizeIndex(0);
      return;
    }

    const cycleInterval = setInterval(() => {
      setCurrentPrizeIndex((prev) => (prev + 1) % prizeNames.length);
    }, 10000);

    return () => clearInterval(cycleInterval);
  }, [prizeNames.length]);

  const currentPrizeName = prizeNames[currentPrizeIndex];
  const currentWinners = currentPrizeName ? groupedWinners[currentPrizeName] : [];

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/70 text-[10px] font-black uppercase tracking-[0.3em]">
               <i className="fas fa-sync-alt animate-spin-slow"></i> Yield Log Active
            </div>
            
            <div className="flex gap-3">
              {prizeNames.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-700 ${
                    idx === currentPrizeIndex ? 'w-12 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'w-3 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
            YIELD <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">RECIPIENTS</span>
          </h1>

          {currentPrizeName && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
               <span className="text-slate-600 text-xs font-black uppercase tracking-[0.5em]">Inventory Segment</span>
               <h2 className="text-4xl md:text-5xl font-black text-yellow-500 uppercase mt-2 drop-shadow-glow">
                 {currentPrizeName}
               </h2>
            </div>
          )}
        </header>

        {winners.length === 0 ? (
          <div className="bg-slate-900/30 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-32 text-center space-y-6 shadow-2xl">
            <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto border border-slate-800">
               <i className="fas fa-file-csv text-4xl text-slate-700"></i>
            </div>
            <h3 className="text-xl text-slate-600 font-bold tracking-[0.4em] uppercase">Syncing with Mainframe Log...</h3>
          </div>
        ) : (
          <div key={currentPrizeName} className="overflow-x-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <table className="min-w-full divide-y divide-slate-700 rounded-lg shadow-xl overflow-hidden">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Operator ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                    Batch Recorded
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-800">
                {currentWinners.map((winner, idx) => (
                  <tr key={winner.id} className="hover:bg-slate-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white/80">
                      {winner.employeeNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-black text-white">
                      {winner.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {winner.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {winner.drawTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="fixed bottom-12 right-12 z-50">
            <button 
                onClick={() => dataService.exportToCSV()}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-10 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 group"
            >
                <i className="fas fa-file-export text-xl"></i>
                <span className="tracking-[0.2em] uppercase text-xs">Export Yield Log</span>
            </button>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .drop-shadow-glow {
          text-shadow: 0 0 30px rgba(234, 179, 8, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;
