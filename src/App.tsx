/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Expense } from './types/expense';
import { Loan } from './types/loan';
import {
  subscribeToExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from './services/expenseService';
import {
  subscribeToLoans,
  addLoan,
  recordLoanReturn,
  deleteLoan,
  deleteLoanReturn,
} from './services/loanService';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { PWAUpdateNotification } from './components/pwa/PWAUpdateNotification';
import { AuthView } from './components/auth/AuthView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExpensesListView } from './components/expenses/ExpensesListView';
import { LoansView } from './components/loans/LoansView';
import { MonthlySummaryView } from './components/summary/MonthlySummaryView';
import { PeopleView } from './components/people/PeopleView';
import { SettingsView } from './components/settings/SettingsView';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { EditExpenseModal } from './components/expenses/EditExpenseModal';
import { DeleteExpenseDialog } from './components/expenses/DeleteExpenseDialog';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, displayName, loading: authLoading } = useAuth();
  // Initialize theme
  useTheme();

  // Simple, robust client-side routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/' ? '/dashboard' : p;
    }
    return '/dashboard';
  });

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p === '/' ? '/dashboard' : p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Expenses State & subscription
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesUserId, setExpensesUserId] = useState<string | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setExpensesUserId(null);
      setLoans([]);
      setLoadingExpenses(false);
      setExpensesError(null);
      return;
    }

    setExpenses([]);
    setLoadingExpenses(true);
    setExpensesError(null);

    const unsubscribe = subscribeToExpenses(
      (data) => {
        setExpenses(data);
        setExpensesUserId(user.uid);
        setLoadingExpenses(false);
      },
      (err) => {
        console.error('Subscription error', err);
        setExpenses([]);
        setExpensesUserId(user.uid);
        setExpensesError('Unable to load your expenses from Firestore. Please try again later.');
        setLoadingExpenses(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Loans State & subscription
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansUserId, setLoansUserId] = useState<string | null>(null);
  const [loansError, setLoansError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoans([]);
      setLoansUserId(null);
      setLoansError(null);
      return;
    }
    setLoans([]);
    setLoansError(null);
    const unsubscribe = subscribeToLoans(
      (data) => {
        setLoans(data);
        setLoansUserId(user.uid);
      },
      (err) => {
        console.error('Loans sync error:', err);
        setLoans([]);
        setLoansUserId(user.uid);
        setLoansError('Unable to load your loans from Firestore. Please try again later.');
      }
    );
    return () => unsubscribe();
  }, [user]);

  const visibleExpenses = expensesUserId === user?.uid ? expenses : [];
  const visibleLoans = loansUserId === user?.uid ? loans : [];

  // Loan handlers
  const handleAddLoan = async (data: {
    personName: string;
    amount: number;
    date: string;
    description?: string;
  }) => {
    if (!user) throw new Error('You must be signed in.');
    return await addLoan(data);
  };

  const handleRecordLoanReturn = async (
    loanId: string,
    data: {
      amount: number;
      date: string;
      note?: string;
    }
  ) => {
    if (!user) throw new Error('You must be signed in.');
    await recordLoanReturn(loanId, data);
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteLoan(loanId);
  };

  const handleDeleteLoanReturn = async (loanId: string, returnId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteLoanReturn(loanId, returnId);
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Distinct categories available in user's data
  const existingCategories = useMemo(() => {
    const set = new Set<string>(['Home Needs', 'Wife', 'Personal', 'Other']);
    visibleExpenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [visibleExpenses]);

  // Handlers for adding, editing, deleting
  const handleAddExpense = async (data: {
    expenseName: string;
    amount: number;
    category: string;
    personName?: string;
    description?: string;
    date: string;
  }) => {
    if (!user) throw new Error('You must be signed in.');
    await addExpense(data);
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!user) throw new Error('You must be signed in.');
    await updateExpense(expenseId, updates);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteExpense(expenseId);
  };

  // Determine if there are pending offline writes
  const hasPendingWrites = useMemo(() => {
    return visibleExpenses.some((e) => e.syncStatus === 'pending');
  }, [visibleExpenses]);

  // Authentication Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-white">
        <div className="w-16 h-16 rounded-3xl bg-[#FF9248] flex items-center justify-center text-[#0F0F0F] shadow-xl shadow-[#FF9248]/30 animate-pulse mb-4">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold tracking-tight">Daily Expense Tracker</p>
        <span className="text-xs text-[#8A8A8A] mt-1">Initializing secure PWA session...</span>
      </div>
    );
  }

  // Unauthenticated user -> render Login
  if (!user) {
    return (
      <AuthView
        onSuccess={() => navigate('/dashboard')}
      />
    );
  }

  // Active view resolver
  const renderCurrentView = () => {
    if ((loadingExpenses || expensesUserId !== user.uid) && visibleExpenses.length === 0) {
      return (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#FF9248] animate-spin mb-3" />
          <p className="text-sm font-semibold text-[#B3B3B3]">
            Loading your expense records...
          </p>
          <span className="text-xs text-[#8A8A8A] mt-0.5">Syncing securely with Firestore</span>
        </div>
      );
    }

    if (currentPath === '/dashboard/expenses') {
      return (
        <ExpensesListView
          expenses={visibleExpenses}
          onOpenAddExpense={() => setIsAddModalOpen(true)}
          onEditExpense={(exp) => setEditingExpense(exp)}
          onDeleteExpense={(exp) => setDeletingExpense(exp)}
        />
      );
    }

    if (currentPath === '/dashboard/loans') {
      return (
        <LoansView
          loans={visibleLoans}
          onAddLoan={handleAddLoan}
          onRecordReturn={handleRecordLoanReturn}
          onDeleteLoan={handleDeleteLoan}
          onDeleteLoanReturn={handleDeleteLoanReturn}
        />
      );
    }

    if (currentPath === '/dashboard/monthly-summary') {
      return <MonthlySummaryView expenses={visibleExpenses} />;
    }

    if (currentPath === '/dashboard/people') {
      return (
        <PeopleView
          expenses={visibleExpenses}
          onOpenAddExpense={() => setIsAddModalOpen(true)}
          onEditExpense={(exp) => setEditingExpense(exp)}
        />
      );
    }

    if (currentPath === '/dashboard/settings') {
      return <SettingsView />;
    }

    // Default: Dashboard
    return (
      <DashboardView
        expenses={visibleExpenses}
        loans={visibleLoans}
        userName={displayName || user.email?.split('@')[0] || 'User'}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
        onEditExpense={(exp) => setEditingExpense(exp)}
        onDeleteExpense={(exp) => setDeletingExpense(exp)}
        navigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col selection:bg-[#FF9248] selection:text-[#0F0F0F]">
      {/* Offline and Sync notification banners */}
      <OfflineBanner hasPendingWrites={hasPendingWrites} />

      {/* Service Worker update notification */}
      <PWAUpdateNotification />

      {/* Desktop and Top Navbar */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {expensesError && (
          <div className="mb-6 p-4 rounded-2xl bg-[#242424] border border-[#493426] text-[#FF9248] text-xs flex items-center justify-between">
            <span>{expensesError}</span>
            <button
              onClick={() => setExpensesError(null)}
              className="text-xs font-bold underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {loansError && (
          <div className="mb-6 p-4 rounded-2xl bg-[#242424] border border-[#493426] text-[#FF9248] text-xs">
            {loansError}
          </div>
        )}

        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentPath={currentPath}
        navigate={navigate}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
        existingCategories={existingCategories}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleUpdateExpense}
        existingCategories={existingCategories}
      />

      {/* Delete Expense Dialog */}
      <DeleteExpenseDialog
        isOpen={!!deletingExpense}
        expense={deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}
