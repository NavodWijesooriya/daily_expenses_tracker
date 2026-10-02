import { Expense } from '../types/expense';
// Firebase Firestore instances available in ../lib/firebase:
// import { db } from '../lib/firebase';
// import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

/**
 * Expense Service
 *
 * NOTE: Firebase Firestore functions have been removed as requested for you to build.
 * A local storage persistence layer is provided as a placeholder so the UI continues
 * functioning smoothly while you build your custom Firestore queries and mutations.
 */

const STORAGE_KEY = 'daily_expenses_data';

// Helper to retrieve local expenses
function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: Expense[] = JSON.parse(raw);
    const cleaned = parsed.filter(
      (item) =>
        item &&
        item.id &&
        !item.id.startsWith('exp_init_') &&
        !item.id.startsWith('mock_') &&
        !item.id.startsWith('dummy_') &&
        !item.id.startsWith('sample_')
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

// In-memory subscribers
type ExpenseListener = (expenses: Expense[]) => void;
const listeners: Set<ExpenseListener> = new Set();

function notifyListeners() {
  const current = getStoredExpenses();
  listeners.forEach((fn) => fn(current));
}

/**
 * TODO: Build your Firestore user profile sync function here
 */
export async function ensureUserProfile(
  userId: string,
  profile: { name: string; email: string }
): Promise<void> {
  // TODO: Build your Firestore setDoc/getDoc implementation here using doc(db, 'users', userId)
  console.log('[expenseService] ensureUserProfile placeholder:', userId, profile);
}

/**
 * TODO: Build your Firestore expense subscription / real-time listener function here
 */
export function subscribeToExpenses(
  userId: string,
  onData: (expenses: Expense[]) => void,
  _onError?: (err: unknown) => void
): () => void {
  // TODO: Build your Firestore onSnapshot implementation here using collection(db, 'users', userId, 'expenses')
  console.log('[expenseService] subscribeToExpenses placeholder called for userId:', userId);

  // Dispatch current records to caller
  onData(getStoredExpenses());

  listeners.add(onData);
  return () => {
    listeners.delete(onData);
  };
}

/**
 * TODO: Build your Firestore addExpense function here
 */
export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  // TODO: Build your Firestore addDoc or setDoc implementation here
  console.log('[expenseService] addExpense placeholder called for userId:', userId, expense);

  const newId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...expense,
    id: newId,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
  };

  const current = getStoredExpenses();
  const updated = [newExpense, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners();

  return newId;
}

/**
 * TODO: Build your Firestore updateExpense function here
 */
export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Promise<void> {
  // TODO: Build your Firestore updateDoc implementation here
  console.log('[expenseService] updateExpense placeholder called for:', expenseId, updates);

  const current = getStoredExpenses();
  const updated = current.map((item) => {
    if (item.id === expenseId) {
      return {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners();
}

/**
 * TODO: Build your Firestore deleteExpense function here
 */
export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  // TODO: Build your Firestore deleteDoc implementation here
  console.log('[expenseService] deleteExpense placeholder called for:', expenseId);

  const current = getStoredExpenses();
  const updated = current.filter((item) => item.id !== expenseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners();
}
