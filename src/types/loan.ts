export type LoanStatus = 'pending' | 'partially_returned' | 'returned';

export interface LoanReturnRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  personName: string;
  amount: number; // Original amount lent
  date: string; // YYYY-MM-DD
  description?: string;
  status: LoanStatus;
  totalReturned: number;
  remainingAmount: number;
  returns: LoanReturnRecord[];
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'saving';
}

export interface LoanSummaryStats {
  totalLent: number;
  totalReturned: number;
  totalOwed: number;
  pendingCount: number;
  fullyReturnedCount: number;
  partialCount: number;
  totalLoansCount: number;
}

export interface PersonLoanHistory {
  personName: string;
  totalLent: number;
  totalReturned: number;
  totalOwed: number;
  loans: Loan[];
  allTransactions: {
    id: string;
    type: 'loan' | 'return';
    loanId: string;
    amount: number;
    date: string;
    note?: string;
    createdAt: string;
  }[];
}
