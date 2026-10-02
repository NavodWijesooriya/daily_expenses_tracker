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
  const { user, loading: authLoading } = useAuth();
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
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoadingExpenses(false);
      return;
    }

    setLoadingExpenses(true);
    setExpensesError(null);

    const unsubscribe = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data);
        setLoadingExpenses(false);
      },
      (err) => {
        console.error('Subscription error', err);
        setExpensesError('Unable to sync with Firestore. Using offline local cache.');
        setLoadingExpenses(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Loans State & subscription
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (!user) {
      setLoans([]);
      return;
    }
    const unsubscribe = subscribeToLoans(
      user.uid,
      (data) => setLoans(data),
      (err) => console.warn('Loans sync error:', err)
    );
    return () => unsubscribe();
  }, [user]);

  // Loan handlers
  const handleAddLoan = async (data: {
    personName: string;
    amount: number;
    date: string;
    description?: string;
  }) => {
    if (!user) throw new Error('You must be signed in.');
    return await addLoan(user.uid, data);
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
    await recordLoanReturn(user.uid, loanId, data);
  };

  const handleDeleteLoan = async (loanId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteLoan(user.uid, loanId);
  };

  const handleDeleteLoanReturn = async (loanId: string, returnId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteLoanReturn(user.uid, loanId, returnId);
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Distinct categories available in user's data
  const existingCategories = useMemo(() => {
    const set = new Set<string>(['Home Needs', 'Wife', 'Personal', 'Other']);
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [expenses]);

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
    await addExpense(user.uid, data);
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!user) throw new Error('You must be signed in.');
    await updateExpense(user.uid, expenseId, updates);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteExpense(user.uid, expenseId);
  };

  // Determine if there are pending offline writes
  const hasPendingWrites = useMemo(() => {
    return expenses.some((e) => e.syncStatus === 'pending');
  }, [expenses]);

  // Authentication Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#1F1F1F]">
        <div className="w-16 h-16 rounded-3xl bg-[#FF9248] flex items-center justify-center text-white shadow-xl shadow-[#FF9248]/30 animate-pulse mb-4">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold tracking-tight">Daily Expense Tracker</p>
        <span className="text-xs text-slate-400 mt-1">Initializing secure PWA session...</span>
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
    if (loadingExpenses && expenses.length === 0) {
      return (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#FF9248] animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            Loading your expense records...
          </p>
          <span className="text-xs text-slate-400 mt-0.5">Ready for custom Firestore functions</span>
        </div>
      );
    }

    if (currentPath === '/dashboard/expenses') {
      return (
        <ExpensesListView
          expenses={expenses}
          onOpenAddExpense={() => setIsAddModalOpen(true)}
          onEditExpense={(exp) => setEditingExpense(exp)}
          onDeleteExpense={(exp) => setDeletingExpense(exp)}
        />
      );
    }

    if (currentPath === '/dashboard/loans') {
      return (
        <LoansView
          loans={loans}
          onAddLoan={handleAddLoan}
          onRecordReturn={handleRecordLoanReturn}
          onDeleteLoan={handleDeleteLoan}
          onDeleteLoanReturn={handleDeleteLoanReturn}
        />
      );
    }

    if (currentPath === '/dashboard/monthly-summary') {
      return <MonthlySummaryView expenses={expenses} />;
    }

    if (currentPath === '/dashboard/people') {
      return (
        <PeopleView
          expenses={expenses}
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
        expenses={expenses}
        loans={loans}
        onOpenAddExpense={() => setIsAddModalOpen(true)}
        onEditExpense={(exp) => setEditingExpense(exp)}
        onDeleteExpense={(exp) => setDeletingExpense(exp)}
        navigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] flex flex-col selection:bg-[#FF9248] selection:text-white">
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
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] text-[#E26E1D] text-xs flex items-center justify-between">
            <span>{expensesError}</span>
            <button
              onClick={() => setExpensesError(null)}
              className="text-xs font-bold underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
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
