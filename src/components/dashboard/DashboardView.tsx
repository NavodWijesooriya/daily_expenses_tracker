import React, { useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Home,
  Heart,
  Layers,
  ArrowUpRight,
  Plus,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  Receipt,
  FileSpreadsheet,
  User as UserIcon,
  HandCoins,
  ArrowDownLeft,
  Coins,
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { Loan } from '../../types/loan';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';

interface DashboardViewProps {
  expenses: Expense[];
  loans?: Loan[];
  userName: string;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  navigate: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  loans = [],
  userName,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  navigate,
}) => {
  const todayStr = getTodayDateString();
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g., '2026-10'

  // Calculate metrics
  const {
    todayTotal,
    thisMonthTotal,
    homeNeedsTotal,
    wifeTotal,
    personalTotal,
    otherTotal,
    recentExpenses,
    topPeople,
  } = useMemo(() => {
    let todaySum = 0;
    let monthSum = 0;
    let homeSum = 0;
    let wifeSum = 0;
    let personalSum = 0;
    let otherSum = 0;
    const peopleMap: Record<string, { total: number; count: number }> = {};

    for (const exp of expenses) {
      const amt = exp.amount || 0;

      // Today's total
      if (exp.date === todayStr) {
        todaySum += amt;
      }

      // This Month's total
      if (exp.date.startsWith(currentMonthPrefix)) {
        monthSum += amt;

        // Category breakdown for this month
        if (exp.category === 'Home Needs') {
          homeSum += amt;
        } else if (exp.category === 'Wife' || exp.category === 'Wife Personal') {
          wifeSum += amt;
        } else if (exp.category === 'Personal') {
          personalSum += amt;
        } else {
          otherSum += amt;
        }
      }

      // Person tracking
      if (exp.personName && exp.personName.trim()) {
        const pName = exp.personName.trim();
        if (!peopleMap[pName]) {
          peopleMap[pName] = { total: 0, count: 0 };
        }
        peopleMap[pName].total += amt;
        peopleMap[pName].count += 1;
      }
    }

    const sortedPeople = Object.entries(peopleMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    return {
      todayTotal: todaySum,
      thisMonthTotal: monthSum,
      homeNeedsTotal: homeSum,
      wifeTotal: wifeSum,
      personalTotal: personalSum,
      otherTotal: otherSum,
      recentExpenses: expenses.slice(0, 6),
      topPeople: sortedPeople,
    };
  }, [expenses, todayStr, currentMonthPrefix]);

  const loanStats = useMemo(() => {
    let lent = 0;
    let returned = 0;
    let owed = 0;
    let pending = 0;
    loans.forEach((l) => {
      lent += l.amount;
      returned += l.totalReturned;
      owed += l.remainingAmount;
      if (l.status !== 'returned') pending += 1;
    });
    return {
      totalLent: lent,
      totalReturned: returned,
      totalOwed: owed,
      pendingCount: pending,
    };
  }, [loans]);

  const currentMonthName = useMemo(() => {
    const d = new Date();
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Top Banner / Mobile Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#242424] via-[#1F1F1F] to-[#181818] rounded-3xl p-6 sm:p-8 text-white border border-[#333333] shadow-xl shadow-black/20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-[#FF9248]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-48 h-48 bg-[#FF9248]/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D211A] border border-[#493426] backdrop-blur-md text-[11px] font-bold text-[#FF9248] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9248]" />
            <span>{currentMonthName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            <span className="text-[#FF9248]">{userName}&apos;s</span> Daily Expense Tracker
          </h1>
          <p className="text-white/90 text-xs sm:text-sm max-w-md">
            Manage your daily transactions, keep track of family expenses, and monitor person loans seamlessly.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-5 py-3 bg-[#FF9248] text-[#0F0F0F] hover:bg-[#F07F30] active:scale-95 text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-[#FF9248]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Today's Expenses */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Today's</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatCurrency(todayTotal)}
            </div>
            <p className="text-[11px] text-[#8A8A8A] mt-1">Recorded for {formatDate(todayStr)}</p>
          </div>
        </div>

        {/* This Month */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">This Month</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatCurrency(thisMonthTotal)}
            </div>
            <p className="text-[11px] text-[#8A8A8A] mt-1">Total in {currentMonthName}</p>
          </div>
        </div>

        {/* Home Needs */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Home Needs</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatCurrency(homeNeedsTotal)}
            </div>
            <div className="w-full bg-[#242424] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#FF9248] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${thisMonthTotal > 0 ? Math.min(100, (homeNeedsTotal / thisMonthTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Wife */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Wife</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatCurrency(wifeTotal)}
            </div>
            <div className="w-full bg-[#242424] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#FF9248] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${thisMonthTotal > 0 ? Math.min(100, (wifeTotal / thisMonthTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Personal */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Personal</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatCurrency(personalTotal)}
            </div>
            <div className="w-full bg-[#242424] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#FF9248] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${thisMonthTotal > 0 ? Math.min(100, (personalTotal / thisMonthTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Other */}
        <div className="p-5 rounded-2xl bg-[#1F1F1F] border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between text-[#B3B3B3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Other</span>
            <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatCurrency(otherTotal)}
            </div>
            <div className="w-full bg-[#242424] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#FF9248] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${thisMonthTotal > 0 ? Math.min(100, (otherTotal / thisMonthTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Money Given to People Overview Card */}
      <div className="bg-gradient-to-br from-[#1F1F1F] via-[#2A2A2A] to-[#1F1F1F] text-white rounded-3xl p-6 sm:p-7 border border-[#333333] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] flex items-center justify-center text-white shadow-lg shadow-[#FF9248]/25 shrink-0">
              <HandCoins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">Money Given to People</h3>
                {loanStats.pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9248]/20 text-[#FF9248] border border-[#FF9248]/30">
                    {loanStats.pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8A8A] mt-0.5">
                Track money given to people, partial returns, and balances owed
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/loans')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-5 py-2.5 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold rounded-xl shadow-md shadow-[#FF9248]/25 transition cursor-pointer"
          >
            <span>View Money Given to People</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 pt-5 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center sm:text-left">
            <span className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider block">Total Lent</span>
            <span className="text-base sm:text-xl font-black text-white mt-1 block">
              {formatCurrency(loanStats.totalLent)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FF9248]/10 border border-[#FF9248]/20 text-center sm:text-left">
            <span className="text-[10px] text-[#FF9248] font-bold uppercase tracking-wider block">Returned</span>
            <span className="text-base sm:text-xl font-black text-[#FF9248] mt-1 block">
              {formatCurrency(loanStats.totalReturned)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-[#5A451B] text-center sm:text-left">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Owed to Me</span>
            <span className="text-base sm:text-xl font-black text-amber-300 mt-1 block">
              {formatCurrency(loanStats.totalOwed)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Expenses & Analytics Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses List (2 Cols) */}
        <div className="lg:col-span-2 bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#2D211A] text-[#FF9248] rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Recent Expenses</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/expenses')}
              className="text-xs font-bold text-[#FF9248] hover:text-[#FF9248] flex items-center gap-1 group cursor-pointer"
            >
              <span>View all ({expenses.length})</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#2D211A] text-[#FF9248] flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No expenses recorded yet</h4>
              <p className="text-xs text-[#B3B3B3] max-w-sm mx-auto mt-1">
                Start tracking your daily expenses by clicking the Add Expense button above.
              </p>
              <button
                onClick={onOpenAddExpense}
                className="mt-4 px-5 py-2.5 bg-[#FF9248] hover:bg-[#F07F30] text-[#0F0F0F] text-xs font-bold rounded-xl shadow-md shadow-[#FF9248]/25 transition cursor-pointer"
              >
                + Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {recentExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="py-3.5 flex items-center justify-between gap-3 group hover:bg-[#242424] -mx-2 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-[#2D211A] text-[#FF9248]">
                      {exp.category === 'Home Needs' ? (
                        <Home className="w-4 h-4" />
                      ) : exp.category === 'Wife' || exp.category === 'Wife Personal' ? (
                        <Heart className="w-4 h-4" />
                      ) : exp.category === 'Personal' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {exp.expenseName}
                        </span>
                        {exp.syncStatus === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#332A17] text-amber-300 font-medium">
                            offline
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#B3B3B3] mt-0.5">
                        <span className="font-semibold text-[#B3B3B3]">
                          {exp.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(exp.date)}</span>
                        {exp.personName && (
                          <>
                            <span>•</span>
                            <span className="text-[#FF9248] font-bold flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {exp.personName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white">
                      {formatCurrency(exp.amount)}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 justify-end mt-1">
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="text-[11px] text-[#FF9248] hover:underline font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp)}
                        className="text-[11px] text-[#8A8A8A] hover:text-rose-300 underline font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Widgets: Person Tracking */}
        <div className="space-y-6">
          <div className="bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#2D211A] text-[#FF9248] rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Person Tracking</h3>
              </div>
              <button
                onClick={() => navigate('/dashboard/people')}
                className="text-xs font-bold text-[#FF9248] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {topPeople.length === 0 ? (
              <p className="text-xs text-[#B3B3B3] py-4 text-center">
                No person associated with expenses yet. Specify a person name when adding an expense.
              </p>
            ) : (
              <div className="space-y-3">
                {topPeople.map((person) => (
                  <div
                    key={person.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#242424] border border-[#493426]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2D211A] text-[#FF9248] font-black text-xs flex items-center justify-center border border-[#493426]">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {person.name}
                        </div>
                        <div className="text-[10px] text-[#8A8A8A]">
                          {person.count} {person.count === 1 ? 'transaction' : 'transactions'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-[#FF9248]">
                      {formatCurrency(person.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Analytics & Monthly Summary Shortcut */}
          <div className="bg-gradient-to-br from-[#1F1F1F] to-[#2A2A2A] text-white rounded-3xl p-6 shadow-md border border-[#333333] relative overflow-hidden">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#FF9248]" />
              <span>Monthly Summary Report</span>
            </h4>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Explore month-over-month charts, category ratios, and transaction averages.
            </p>
            <button
              onClick={() => navigate('/dashboard/monthly-summary')}
              className="mt-4 w-full py-2.5 px-4 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-[#0F0F0F] rounded-xl shadow-md shadow-[#FF9248]/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open Monthly Report</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for Instant Add Expense */}
      <button
        onClick={onOpenAddExpense}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[#FF9248] hover:bg-[#F07F30] text-[#0F0F0F] flex items-center justify-center shadow-xl shadow-[#FF9248]/40 active:scale-95 transition-transform border border-white/30 cursor-pointer"
        aria-label="Add Expense"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
