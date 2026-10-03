import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Expense } from '../types/expense';

function requireUserId(): string {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('You must be signed in to access your expenses.');
  }
  return userId;
}

function expensesCollection(userId: string) {
  return collection(db, 'users', userId, 'expenses');
}

export function subscribeToExpenses(
  onData: (expenses: Expense[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const userId = requireUserId();
  const expensesQuery = query(expensesCollection(userId), orderBy('date', 'desc'));

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((expenseDoc) => ({
          ...expenseDoc.data(),
          id: expenseDoc.id,
          syncStatus: snapshot.metadata.hasPendingWrites ? 'pending' : 'synced',
        })) as Expense[]
      );
    },
    (error) => onError?.(error)
  );
}

export async function addExpense(
  data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const userId = requireUserId();
  const now = new Date().toISOString();
  const expenseData = {
    expenseName: data.expenseName.trim().slice(0, 150),
    amount: Math.round(Number(data.amount) * 100) / 100,
    category: data.category.trim().slice(0, 50),
    date: data.date,
    createdAt: now,
    updatedAt: now,
    ...(data.personName ? { personName: data.personName.trim().slice(0, 100) } : {}),
    ...(data.description ? { description: data.description.trim().slice(0, 500) } : {}),
  };

  const created = await addDoc(expensesCollection(userId), expenseData);
  return created.id;
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>>
): Promise<void> {
  const userId = requireUserId();
  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
  const firestoreUpdates: Record<string, string | number> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.expenseName !== undefined) firestoreUpdates.expenseName = updates.expenseName.trim().slice(0, 150);
  if (updates.amount !== undefined) firestoreUpdates.amount = Math.round(Number(updates.amount) * 100) / 100;
  if (updates.category !== undefined) firestoreUpdates.category = updates.category.trim().slice(0, 50);
  if (updates.date !== undefined) firestoreUpdates.date = updates.date;
  if (updates.personName !== undefined) firestoreUpdates.personName = updates.personName.trim().slice(0, 100);
  if (updates.description !== undefined) firestoreUpdates.description = updates.description.trim().slice(0, 500);

  await updateDoc(expenseRef, firestoreUpdates);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const userId = requireUserId();
  await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
}
