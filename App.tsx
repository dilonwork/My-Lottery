
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DrawPage from './components/DrawPage';
import ResultsPage from './components/ResultsPage';
import AdminPage from './components/AdminPage';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DRAW);

  const renderPage = () => {
    switch (currentPage) {
      case Page.DRAW:
        return <DrawPage />;
      case Page.RESULTS:
        return <ResultsPage />;
      case Page.ADMIN:
        return <AdminPage />;
      default:
        return <DrawPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-yellow-500/30 overflow-x-hidden">
      {/* Global Tech Background Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-15 grayscale pointer-events-none"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Dark Overlay for Readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950 pointer-events-none"></div>

      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="relative z-10 transition-all duration-500 ease-in-out">
        {renderPage()}
      </main>
      
      {/* Decorative footer */}
      <footer className="relative z-10 py-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] pointer-events-none opacity-50">
        &copy; {new Date().getFullYear()} Advanced Yield Fortune System // TSMC AZ Site
      </footer>
    </div>
  );
};

export default App;
