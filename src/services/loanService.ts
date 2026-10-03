import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loan, LoanReturnRecord } from '../types/loan';

function requireUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('You must be signed in to access your loans.');
  }
  return userId;
}

function loanDocument(userId: string, loanId: string) {
  return doc(db, 'users', userId, 'loans', loanId);
}

export function subscribeToLoans(
  onData: (loans: Loan[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const userId = requireUserId();
  const loansQuery = query(collection(db, 'users', userId, 'loans'), orderBy('date', 'desc'));

  return onSnapshot(
    loansQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((loanDoc) => ({
          ...loanDoc.data(),
          id: loanDoc.id,
          syncStatus: snapshot.metadata.hasPendingWrites ? 'pending' : 'synced',
        })) as Loan[]
      );
    },
    (error) => onError?.(error)
  );
}

export async function addLoan(data: {
  personName: string;
  amount: number;
  date: string;
  description?: string;
}): Promise<string> {
  const userId = requireUserId();
  const loanRef = doc(collection(db, 'users', userId, 'loans'));
  const amount = Math.round(Number(data.amount) * 100) / 100;
  const now = new Date().toISOString();
  const loanData = {
    personName: data.personName.trim().slice(0, 100),
    amount,
    date: data.date,
    status: 'pending' as const,
    totalReturned: 0,
    remainingAmount: amount,
    returns: [] as LoanReturnRecord[],
    createdAt: now,
    updatedAt: now,
    ...(data.description ? { description: data.description.trim().slice(0, 500) } : {}),
  };

  await setDoc(loanRef, loanData);
  return loanRef.id;
}

export async function recordLoanReturn(
  loanId: string,
  returnData: {
    amount: number;
    date: string;
    note?: string;
  }
): Promise<void> {
  const userId = requireUserId();
  const loanRef = loanDocument(userId, loanId);
  const returnAmount = Math.round(Number(returnData.amount) * 100) / 100;
  if (returnAmount <= 0) throw new Error('Returned amount must be greater than zero');

  await runTransaction(db, async (transaction) => {
    const loanSnapshot = await transaction.get(loanRef);
    if (!loanSnapshot.exists()) throw new Error('Loan not found');

    const loan = loanSnapshot.data() as Omit<Loan, 'id' | 'syncStatus'>;
    const returns = loan.returns || [];
    if (returns.length >= 200) throw new Error('This loan has reached the maximum number of return records.');

    const totalReturned = Math.round((loan.totalReturned + returnAmount) * 100) / 100;
    const remainingAmount = Math.max(0, Math.round((loan.amount - totalReturned) * 100) / 100);
    const status: Loan['status'] = remainingAmount <= 0 ? 'returned' : 'partially_returned';
    const returnRecord: LoanReturnRecord = {
      id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amount: returnAmount,
      date: returnData.date,
      ...(returnData.note ? { note: returnData.note.trim().slice(0, 300) } : {}),
      createdAt: new Date().toISOString(),
    };

    transaction.update(loanRef, {
      totalReturned,
      remainingAmount,
      status,
      returns: [...returns, returnRecord],
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function updateLoan(
  loanId: string,
  updates: {
    personName?: string;
    amount?: number;
    date?: string;
    description?: string;
  }
): Promise<void> {
  const userId = requireUserId();
  const loanRef = loanDocument(userId, loanId);

  await runTransaction(db, async (transaction) => {
    const loanSnapshot = await transaction.get(loanRef);
    if (!loanSnapshot.exists()) throw new Error('Loan not found');

    const loan = loanSnapshot.data() as Omit<Loan, 'id' | 'syncStatus'>;
    const amount = updates.amount !== undefined
      ? Math.round(Number(updates.amount) * 100) / 100
      : loan.amount;
    const remainingAmount = Math.max(0, Math.round((amount - loan.totalReturned) * 100) / 100);
    const status: Loan['status'] =
      loan.totalReturned === 0
        ? 'pending'
        : remainingAmount <= 0
          ? 'returned'
          : 'partially_returned';
    const firestoreUpdates: Record<string, string | number> = {
      amount,
      remainingAmount,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (updates.personName !== undefined) {
      firestoreUpdates.personName = updates.personName.trim().slice(0, 100);
    }
    if (updates.date !== undefined) firestoreUpdates.date = updates.date;
    if (updates.description !== undefined) {
      firestoreUpdates.description = updates.description.trim().slice(0, 500);
    }

    transaction.update(loanRef, firestoreUpdates);
  });
}

export async function deleteLoan(loanId: string): Promise<void> {
  const userId = requireUserId();
  await deleteDoc(loanDocument(userId, loanId));
}

export async function deleteLoanReturn(loanId: string, returnId: string): Promise<void> {
  const userId = requireUserId();
  const loanRef = loanDocument(userId, loanId);

  await runTransaction(db, async (transaction) => {
    const loanSnapshot = await transaction.get(loanRef);
    if (!loanSnapshot.exists()) throw new Error('Loan not found');

    const loan = loanSnapshot.data() as Omit<Loan, 'id' | 'syncStatus'>;
    const returnRecord = (loan.returns || []).find((item) => item.id === returnId);
    if (!returnRecord) throw new Error('Loan return not found');

    const returns = (loan.returns || []).filter((item) => item.id !== returnId);
    const totalReturned = Math.max(0, Math.round((loan.totalReturned - returnRecord.amount) * 100) / 100);
    const remainingAmount = Math.max(0, Math.round((loan.amount - totalReturned) * 100) / 100);
    const status: Loan['status'] =
      totalReturned === 0
        ? 'pending'
        : remainingAmount <= 0
          ? 'returned'
          : 'partially_returned';

    transaction.update(loanRef, {
      totalReturned,
      remainingAmount,
      status,
      returns,
      updatedAt: new Date().toISOString(),
    });
  });
}
