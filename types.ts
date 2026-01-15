
export interface Participant {
  id: string;
  department: string;
  employeeNo: string;
  name: string;
}

export interface Prize {
  id: string;
  name: string;
  totalCount: number;
  remainingCount: number;
}

export interface Winner {
  id: string;
  prizeId: string;
  prizeName: string;
  employeeNo: string;
  name: string;
  department: string;
  drawTime: string;
}

export enum Page {
  DRAW = 'draw',
  ADMIN = 'admin',
  RESULTS = 'results'
}
