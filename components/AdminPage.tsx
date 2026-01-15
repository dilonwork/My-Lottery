
import React, { useState, useEffect, useRef } from 'react';
import { ADMIN_CREDENTIALS } from '../constants';
import { Participant, Prize } from '../types';
import { dataService } from '../services/dataService';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  
  // Pagination state for participants
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prizeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  const refreshData = () => {
    setParticipants(dataService.getParticipants().filter(p => p !== null && p !== undefined));
    setPrizes(dataService.getPrizes().filter(p => p !== null && p !== undefined));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  // Participant CSV
  const downloadTemplate = () => {
    const header = "Department,EmployeeNo,Name\n";
    const sample = "Production,000001,John Doe\nQuality,000002,Jane Smith";
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "participant_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length === 0) return;
      const startIdx = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('dept') ? 1 : 0;
      const parsed: Participant[] = lines.slice(startIdx).map((line, idx) => {
        const parts = line.split(',').map(s => s.trim());
        const [department, employeeNo, name] = parts;
        return {
          id: `csv-${Date.now()}-${idx}`,
          department: department || 'Unknown',
          employeeNo: employeeNo || '000000',
          name: name || 'Unnamed'
        };
      }).filter(p => p.name !== 'Unnamed' && p.employeeNo !== '000000');

      if (parsed.length > 0) {
        setParticipants(parsed);
        dataService.saveParticipants(parsed);
        setCurrentPage(1);
        alert(`Successfully imported ${parsed.length} participants.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Prize CSV
  const downloadPrizeTemplate = () => {
    const header = "PrizeName,Quantity\n";
    const sample = "Grand Prize: MacBook,1\nFirst Prize: iPhone,3";
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "prize_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrizeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length === 0) return;
      
      const startIdx = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('qty') ? 1 : 0;
      
      const parsed: Prize[] = lines.slice(startIdx).map((line, idx) => {
        const parts = line.split(',').map(s => s.trim());
        const [name, qtyStr] = parts;
        const totalCount = parseInt(qtyStr) || 1;
        return {
          id: `prize-${Date.now()}-${idx}`,
          name: name || 'Unnamed Prize',
          totalCount: totalCount,
          remainingCount: totalCount
        };
      }).filter(p => p.name !== 'Unnamed Prize');

      if (parsed.length > 0) {
        setPrizes(parsed);
        dataService.savePrizes(parsed);
        alert(`Successfully imported ${parsed.length} prizes.`);
      }
    };
    reader.readAsText(file);
    if (prizeFileInputRef.current) prizeFileInputRef.current.value = '';
  };

  const deletePrize = (id: string) => {
    const updated = prizes.filter(p => p.id !== id);
    setPrizes(updated);
    dataService.savePrizes(updated);
  };

  const clearPrizes = () => {
    if (window.confirm("Are you sure you want to clear ALL prizes?")) {
      setPrizes([]);
      dataService.savePrizes([]);
    }
  };

  // Pagination Logic
  const validParticipants = participants.filter(p => p !== null);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParticipants = validParticipants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(validParticipants.length / itemsPerPage);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex justify-center mb-6">
             <i className="fas fa-user-shield text-4xl text-yellow-500"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center uppercase tracking-tight">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold py-3 rounded-lg transition-colors shadow-lg shadow-yellow-500/10"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-4xl font-black text-white tracking-tight">Management Console</h1>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/30 text-sm transition-all"
          >
            Logout
          </button>
        </div>

        {/* Section 1: Prizes */}
        <section className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-2xl font-bold text-orange-500 flex items-center gap-3 uppercase tracking-widest">
              <i className="fas fa-gift"></i> Inventory Control
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadPrizeTemplate}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-2 text-xs transition-all"
              >
                <i className="fas fa-download"></i> Prize Template
              </button>
              <button
                onClick={() => prizeFileInputRef.current?.click()}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white rounded-lg border border-orange-500/30 font-bold flex items-center gap-2 text-xs transition-all"
              >
                <i className="fas fa-file-import"></i> Import Prize CSV
              </button>
              <button
                onClick={clearPrizes}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg border border-red-500/30 text-xs transition-all"
              >
                <i className="fas fa-trash-alt"></i> Clear All
              </button>
              <input type="file" ref={prizeFileInputRef} onChange={handlePrizeFileUpload} accept=".csv" className="hidden" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Prize Name</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Total Stock</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Remaining</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {prizes.length > 0 ? (
                  prizes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-white">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-center text-slate-300 font-mono">{p.totalCount}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className={`px-2 py-1 rounded text-xs font-black ${p.remainingCount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {p.remainingCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => deletePrize(p.id)}
                          className="text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No prizes configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Participants */}
        <section className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-2xl font-bold text-yellow-500 flex items-center gap-3 uppercase tracking-widest">
              <i className="fas fa-users-cog"></i> Batch Roster
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-2 text-xs transition-all"
              >
                <i className="fas fa-download"></i> Roster Template
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 rounded-lg border border-yellow-500/30 font-bold flex items-center gap-2 text-xs transition-all"
              >
                <i className="fas fa-file-upload"></i> Import Roster CSV
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Emp ID (工號)</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentParticipants.length > 0 ? (
                  currentParticipants.map((p) => p && (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300 font-medium">{p.department}</td>
                      <td className="px-6 py-4 text-sm text-yellow-500/70 font-mono">{p.employeeNo}</td>
                      <td className="px-6 py-4 text-sm text-white font-bold">{p.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">No valid records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-slate-500">
                Total Participants: <span className="text-slate-300">{validParticipants.length}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="px-3 py-1 text-sm font-bold text-white bg-yellow-500/10 rounded border border-yellow-500/20">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
