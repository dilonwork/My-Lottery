
import { Participant, Prize } from './types';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', department: 'R&D', employeeNo: '001234', name: 'James Wilson' },
  { id: '2', department: 'Sales', employeeNo: '005678', name: 'Sarah Parker' },
  { id: '3', department: 'Marketing', employeeNo: '009101', name: 'David Chen' },
  { id: '4', department: 'HR', employeeNo: '002345', name: 'Emily Brown' },
  { id: '5', department: 'Finance', employeeNo: '003456', name: 'Michael Scott' },
  { id: '6', department: 'IT', employeeNo: '004567', name: 'Dwight Schrute' },
  { id: '7', department: 'Operations', employeeNo: '006789', name: 'Pam Beesly' },
  { id: '8', department: 'Design', employeeNo: '007890', name: 'Jim Halpert' },
  { id: '9', department: 'Legal', employeeNo: '008901', name: 'Angela Martin' },
  { id: '10', department: 'Supply Chain', employeeNo: '001122', name: 'Stanley Hudson' }
];

export const INITIAL_PRIZES: Prize[] = [
  { id: 'p1', name: 'Grand Prize: MacBook Pro', totalCount: 1, remainingCount: 1 },
  { id: 'p2', name: 'First Prize: iPhone 15', totalCount: 3, remainingCount: 3 },
  { id: 'p3', name: 'Second Prize: AirPods Pro', totalCount: 5, remainingCount: 5 }
];

export const STORAGE_KEYS = {
  PARTICIPANTS: 'lottery_participants',
  PRIZES: 'lottery_prizes',
  WINNERS: 'lottery_winners_csv' // Simulated CSV storage
};
