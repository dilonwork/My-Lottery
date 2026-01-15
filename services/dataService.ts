
import { Participant, Prize, Winner } from '../types';
import { STORAGE_KEYS, INITIAL_PARTICIPANTS, INITIAL_PRIZES } from '../constants';

const CSV_HEADER = 'id,prizeId,prizeName,employeeNo,name,department,drawTime';

export const dataService = {
  getParticipants: (): Participant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    return data ? JSON.parse(data) : INITIAL_PARTICIPANTS;
  },
  saveParticipants: (participants: Participant[]) => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  },
  getPrizes: (): Prize[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRIZES);
    return data ? JSON.parse(data) : INITIAL_PRIZES;
  },
  savePrizes: (prizes: Prize[]) => {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  },
  
  // Simulation: Reading from a "CSV File" stored in localStorage
  getWinners: (): Winner[] => {
    const csvContent = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (!csvContent) return [];
    
    const lines = csvContent.split('\n');
    // Skip the header line and filter out empty lines
    const dataRows = lines.slice(1).filter(line => line.trim() !== '');
    
    return dataRows.map(row => {
      const [id, prizeId, prizeName, employeeNo, name, department, drawTime] = row.split(',');
      return {
        id,
        prizeId,
        prizeName,
        employeeNo,
        name,
        department,
        drawTime: drawTime.replace(/\|/g, ',') // Restore commas if they were replaced during writing
      };
    });
  },

  // Simulation: Writing to a "CSV File"
  addWinner: (winner: Winner) => {
    let csvContent = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (!csvContent || csvContent.trim() === '') {
      csvContent = CSV_HEADER;
    }
    
    // Sanitize values to prevent CSV breakages (replace commas in names/times)
    const sanitize = (val: string) => val.replace(/,/g, '|');
    
    const newRow = `\n${winner.id},${winner.prizeId},${sanitize(winner.prizeName)},${winner.employeeNo},${sanitize(winner.name)},${sanitize(winner.department)},${sanitize(winner.drawTime)}`;
    
    localStorage.setItem(STORAGE_KEYS.WINNERS, csvContent + newRow);
    
    // Update prize inventory
    const prizes = dataService.getPrizes();
    const updatedPrizes = prizes.map(p => 
      p.id === winner.prizeId ? { ...p, remainingCount: Math.max(0, p.remainingCount - 1) } : p
    );
    dataService.savePrizes(updatedPrizes);
  },

  exportToCSV: () => {
    const csvContent = localStorage.getItem(STORAGE_KEYS.WINNERS);
    if (!csvContent) return;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "tsmc_az_winners_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
