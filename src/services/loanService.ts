import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loan, LoanReturnRecord } from '../types/loan';

const STORAGE_PREFIX = 'daily_expenses_loans_data_';

function getLocalStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'local'}`;
}

function getStoredLoans(userId: string): Loan[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) {
      return [];
    }
    const parsed: Loan[] = JSON.parse(raw);
    const cleaned = parsed.filter(
      (item) =>
        item &&
        item.id &&
        !item.id.startsWith('loan_init_') &&
        !item.id.startsWith('mock_') &&
        !item.id.startsWith('dummy_') &&
        !item.id.startsWith('sample_')
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveStoredLoans(userId: string, loans: Loan[]): void {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(loans));
  } catch (err) {
    console.warn('Could not persist loans locally:', err);
  }
}

export function subscribeToLoans(
  userId: string,
  onData: (loans: Loan[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/loans`;
  let localCache = getStoredLoans(userId);
  onData(localCache);

  try {
    const loansRef = collection(db, 'users', userId, 'loans');
    const q = query(loansRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreLoans: Loan[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreLoans.push({
            id: docSnap.id,
            personName: d.personName || '',
            amount: Number(d.amount) || 0,
            date: d.date || '',
            description: d.description || undefined,
            status: d.status || 'pending',
            totalReturned: Number(d.totalReturned) || 0,
            remainingAmount: Number(d.remainingAmount) !== undefined ? Number(d.remainingAmount) : (Number(d.amount) - (Number(d.totalReturned) || 0)),
            returns: Array.isArray(d.returns) ? d.returns : [],
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            syncStatus: snapshot.metadata.hasPendingWrites ? 'pending' : 'synced',
          });
        });

        saveStoredLoans(userId, firestoreLoans);
        onData(firestoreLoans);
      },
      (error) => {
        console.warn('Firestore loan sync fallback to local cache:', error);
        localCache = getStoredLoans(userId);
        onData(localCache);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not initialize firestore subscription, using local cache:', err);
    localCache = getStoredLoans(userId);
    onData(localCache);
    return () => {};
  }
}

export async function addLoan(
  userId: string,
  data: {
    personName: string;
    amount: number;
    date: string;
    description?: string;
  }
): Promise<string> {
  const newId = 'loan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const path = `users/${userId}/loans/${newId}`;
  const now = new Date().toISOString();

  const payload: Loan = {
    id: newId,
    personName: data.personName.trim().slice(0, 100),
    amount: Math.round(Number(data.amount) * 100) / 100,
    date: data.date,
    description: data.description ? data.description.trim().slice(0, 500) : undefined,
    status: 'pending',
    totalReturned: 0,
    remainingAmount: Math.round(Number(data.amount) * 100) / 100,
    returns: [],
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  };

  // Local storage update
  const current = getStoredLoans(userId);
  const updated = [payload, ...current];
  saveStoredLoans(userId, updated);

  try {
    const docRef = doc(db, 'users', userId, 'loans', newId);
    const firestoreData: Record<string, unknown> = {
      personName: payload.personName,
      amount: payload.amount,
      date: payload.date,
      status: payload.status,
      totalReturned: payload.totalReturned,
      remainingAmount: payload.remainingAmount,
      returns: payload.returns,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
    if (payload.description) firestoreData.description = payload.description;
    await setDoc(docRef, firestoreData);
  } catch (error) {
    console.warn('Firestore addLoan error, preserved in local storage:', error);
  }

  return newId;
}

export async function recordLoanReturn(
  userId: string,
  loanId: string,
  returnData: {
    amount: number;
    date: string;
    note?: string;
  }
): Promise<void> {
  const current = getStoredLoans(userId);
  const loanIndex = current.findIndex((l) => l.id === loanId);
  if (loanIndex === -1) throw new Error('Loan not found');

  const loan = current[loanIndex];
  const returnAmount = Math.round(Number(returnData.amount) * 100) / 100;
  if (returnAmount <= 0) throw new Error('Returned amount must be greater than zero');

  const newTotalReturned = Math.round((loan.totalReturned + returnAmount) * 100) / 100;
  const newRemainingAmount = Math.max(0, Math.round((loan.amount - newTotalReturned) * 100) / 100);

  const newStatus: Loan['status'] = newRemainingAmount <= 0 ? 'returned' : 'partially_returned';

  const newReturnRecord: LoanReturnRecord = {
    id: 'ret_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    amount: returnAmount,
    date: returnData.date,
    note: returnData.note ? returnData.note.trim().slice(0, 300) : undefined,
    createdAt: new Date().toISOString(),
  };

  const updatedReturns = [...(loan.returns || []), newReturnRecord];
  const now = new Date().toISOString();

  const updatedLoan: Loan = {
    ...loan,
    totalReturned: newTotalReturned,
    remainingAmount: newRemainingAmount,
    status: newStatus,
    returns: updatedReturns,
    updatedAt: now,
  };

  current[loanIndex] = updatedLoan;
  saveStoredLoans(userId, current);

  try {
    const path = `users/${userId}/loans/${loanId}`;
    const docRef = doc(db, 'users', userId, 'loans', loanId);
    await updateDoc(docRef, {
      totalReturned: newTotalReturned,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      returns: updatedReturns,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('Firestore recordLoanReturn error, preserved locally:', error);
  }
}

export async function updateLoan(
  userId: string,
  loanId: string,
  updates: {
    personName?: string;
    amount?: number;
    date?: string;
    description?: string;
  }
): Promise<void> {
  const current = getStoredLoans(userId);
  const loanIndex = current.findIndex((l) => l.id === loanId);
  if (loanIndex === -1) throw new Error('Loan not found');

  const loan = current[loanIndex];
  const newAmount = updates.amount !== undefined ? Math.round(Number(updates.amount) * 100) / 100 : loan.amount;
  const newRemainingAmount = Math.max(0, Math.round((newAmount - loan.totalReturned) * 100) / 100);
  const newStatus: Loan['status'] =
    loan.totalReturned === 0
      ? 'pending'
      : newRemainingAmount <= 0
      ? 'returned'
      : 'partially_returned';

  const now = new Date().toISOString();
  const updatedLoan: Loan = {
    ...loan,
    personName: updates.personName ? updates.personName.trim().slice(0, 100) : loan.personName,
    amount: newAmount,
    date: updates.date || loan.date,
    description: updates.description !== undefined ? (updates.description ? updates.description.trim().slice(0, 500) : undefined) : loan.description,
    remainingAmount: newRemainingAmount,
    status: newStatus,
    updatedAt: now,
  };

  current[loanIndex] = updatedLoan;
  saveStoredLoans(userId, current);

  try {
    const docRef = doc(db, 'users', userId, 'loans', loanId);
    const firestoreUpdates: Record<string, unknown> = {
      personName: updatedLoan.personName,
      amount: updatedLoan.amount,
      date: updatedLoan.date,
      remainingAmount: updatedLoan.remainingAmount,
      status: updatedLoan.status,
      updatedAt: now,
    };
    if (updatedLoan.description !== undefined) {
      firestoreUpdates.description = updatedLoan.description || '';
    }
    await updateDoc(docRef, firestoreUpdates);
  } catch (error) {
    console.warn('Firestore updateLoan error, saved locally:', error);
  }
}

export async function deleteLoan(userId: string, loanId: string): Promise<void> {
  const current = getStoredLoans(userId);
  const updated = current.filter((l) => l.id !== loanId);
  saveStoredLoans(userId, updated);

  try {
    const docRef = doc(db, 'users', userId, 'loans', loanId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteLoan error:', error);
  }
}

export async function deleteLoanReturn(userId: string, loanId: string, returnId: string): Promise<void> {
  const current = getStoredLoans(userId);
  const loanIndex = current.findIndex((l) => l.id === loanId);
  if (loanIndex === -1) return;

  const loan = current[loanIndex];
  const returnToRemove = loan.returns.find((r) => r.id === returnId);
  if (!returnToRemove) return;

  const updatedReturns = loan.returns.filter((r) => r.id !== returnId);
  const newTotalReturned = Math.max(0, Math.round((loan.totalReturned - returnToRemove.amount) * 100) / 100);
  const newRemainingAmount = Math.max(0, Math.round((loan.amount - newTotalReturned) * 100) / 100);
  const newStatus: Loan['status'] =
    newTotalReturned === 0
      ? 'pending'
      : newRemainingAmount <= 0
      ? 'returned'
      : 'partially_returned';

  const now = new Date().toISOString();
  const updatedLoan: Loan = {
    ...loan,
    totalReturned: newTotalReturned,
    remainingAmount: newRemainingAmount,
    status: newStatus,
    returns: updatedReturns,
    updatedAt: now,
  };

  current[loanIndex] = updatedLoan;
  saveStoredLoans(userId, current);

  try {
    const docRef = doc(db, 'users', userId, 'loans', loanId);
    await updateDoc(docRef, {
      totalReturned: newTotalReturned,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      returns: updatedReturns,
      updatedAt: now,
    });
  } catch (error) {
    console.warn('Firestore deleteLoanReturn error:', error);
  }
}
