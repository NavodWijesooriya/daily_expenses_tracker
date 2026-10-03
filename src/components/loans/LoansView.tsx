import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  History,
  MoreVertical,
  Calendar,
  AlertCircle,
  Users,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Loan, LoanSummaryStats } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoanSummaryCard } from './LoanSummaryCard';
import { AddLoanModal } from './AddLoanModal';
import { RecordReturnModal } from './RecordReturnModal';
import { LoanDetailModal } from './LoanDetailModal';
import { PersonHistoryModal } from './PersonHistoryModal';

interface LoansViewProps {
  loans: Loan[];
  onAddLoan: (data: {
    personName: string;
    amount: number;
    date: string;
    description?: string;
  }) => Promise<string>;
  onRecordReturn: (
    loanId: string,
    data: {
      amount: number;
      date: string;
      note?: string;
    }
  ) => Promise<void>;
  onDeleteLoan?: (loanId: string) => Promise<void>;
  onDeleteLoanReturn?: (loanId: string, returnId: string) => Promise<void>;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  onAddLoan,
  onRecordReturn,
  onDeleteLoan,
  onDeleteLoanReturn,
}) => {
  // Navigation & View Mode
  const [viewTab, setViewTab] = useState<'loans' | 'people'>('loans');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'remaining_desc'>('date_desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeReturnLoan, setActiveReturnLoan] = useState<Loan | null>(null);
  const [activeDetailLoan, setActiveDetailLoan] = useState<Loan | null>(null);
  const [activePersonHistory, setActivePersonHistory] = useState<string | null>(null);

  // Compute overall summary stats
  const summaryStats: LoanSummaryStats = useMemo(() => {
    let totalLent = 0;
    let totalReturned = 0;
    let totalOwed = 0;
    let pendingCount = 0;
    let fullyReturnedCount = 0;
    let partialCount = 0;

    loans.forEach((l) => {
      totalLent += l.amount;
      totalReturned += l.totalReturned;
      totalOwed += l.remainingAmount;

      if (l.status === 'returned') fullyReturnedCount++;
      else if (l.status === 'partially_returned') partialCount++;
      else pendingCount++;
    });

    return {
      totalLent,
      totalReturned,
      totalOwed,
      pendingCount,
      fullyReturnedCount,
      partialCount,
      totalLoansCount: loans.length,
    };
  }, [loans]);

  // Unique person names for quick suggestions
  const existingPersons = useMemo(() => {
    const set = new Set<string>();
    loans.forEach((l) => {
      if (l.personName) set.add(l.personName);
    });
    return Array.from(set);
  }, [loans]);

  // Grouped by Person summary data
  const peopleSummary = useMemo(() => {
    const map: Record<
      string,
      {
        personName: string;
        totalLent: number;
        totalReturned: number;
        totalOwed: number;
        loansCount: number;
        pendingLoans: number;
        latestDate: string;
      }
    > = {};

    loans.forEach((l) => {
      const name = l.personName;
      if (!map[name]) {
        map[name] = {
          personName: name,
          totalLent: 0,
          totalReturned: 0,
          totalOwed: 0,
          loansCount: 0,
          pendingLoans: 0,
          latestDate: l.date,
        };
      }
      map[name].totalLent += l.amount;
      map[name].totalReturned += l.totalReturned;
      map[name].totalOwed += l.remainingAmount;
      map[name].loansCount += 1;
      if (l.status !== 'returned') map[name].pendingLoans += 1;
      if (l.date > map[name].latestDate) map[name].latestDate = l.date;
    });

    return Object.values(map)
      .filter((p) => p.personName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.totalOwed - a.totalOwed || b.totalLent - a.totalLent);
  }, [loans, searchQuery]);

  // Filtered & Sorted Loans List
  const filteredLoans = useMemo(() => {
    return loans
      .filter((l) => {
        // Status filter
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = l.personName.toLowerCase().includes(q);
          const matchDesc = l.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'remaining_desc') return b.remainingAmount - a.remainingAmount;
        return 0;
      });
  }, [loans, statusFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white flex items-center justify-center shadow-md shadow-[#FF9248]/25">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Loans & Money Returns
              </h1>
              <p className="text-xs text-[#B3B3B3]">
                Track money lent to friends and record full or partial repayments
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold rounded-2xl shadow-lg shadow-[#FF9248]/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Lend Money / Add Loan</span>
        </button>
      </div>

      {/* Loan Summary Metric Section */}
      <LoanSummaryCard
        stats={summaryStats}
        activeFilter={statusFilter}
        onFilterChange={(f) => setStatusFilter(f)}
      />

      {/* View Mode Tabs (All Loans vs By Person) */}
      <div className="flex items-center justify-between gap-4 border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'loans'
                ? 'bg-[#FF9248] text-[#0F0F0F] shadow-xs'
                : 'text-[#B3B3B3] hover:bg-[#242424]'
            }`}
          >
            All Loans ({loans.length})
          </button>
          <button
            onClick={() => setViewTab('people')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewTab === 'people'
                ? 'bg-[#FF9248] text-[#0F0F0F] shadow-xs'
                : 'text-[#B3B3B3] hover:bg-[#242424]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>By Person History ({peopleSummary.length})</span>
          </button>
        </div>

        {viewTab === 'loans' && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-[#8A8A8A] font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#1F1F1F] border border-[#333333] text-white focus:outline-none focus:ring-1 focus:ring-[#FF9248]"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="remaining_desc">Highest Owed</option>
              <option value="amount_desc">Largest Loan</option>
            </select>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder={viewTab === 'loans' ? 'Search by person name or note...' : 'Search contacts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-2xl text-xs text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] shadow-xs"
          />
        </div>

        {/* Status Filters (for Loans tab) */}
        {viewTab === 'loans' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'pending', label: 'Pending' },
              { id: 'partially_returned', label: 'Partial' },
              { id: 'returned', label: 'Returned' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#FF9248] text-[#0F0F0F] shadow-xs'
                    : 'bg-[#1F1F1F] text-[#B3B3B3] border border-[#333333] hover:bg-[#242424]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: ALL LOANS LIST */}
      {viewTab === 'loans' && (
        <div className="space-y-3">
          {filteredLoans.length === 0 ? (
            <div className="py-16 text-center bg-[#1F1F1F] rounded-3xl border border-[#333333] p-8">
              <HandCoins className="w-12 h-12 mx-auto text-[#8A8A8A] mb-3" />
              <h3 className="text-base font-bold text-white">No loan records found</h3>
              <p className="text-xs text-[#B3B3B3] mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'No loans match your search filter.'
                  : 'Start by clicking "Lend Money / Add Loan" to record money you lent to a friend.'}
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-[#FF9248] hover:bg-[#F07F30] text-[#0F0F0F] text-xs font-bold rounded-2xl shadow-md shadow-[#FF9248]/25 transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Loan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLoans.map((loan) => {
                const percent =
                  loan.amount > 0 ? Math.min(100, Math.round((loan.totalReturned / loan.amount) * 100)) : 0;

                return (
                  <div
                    key={loan.id}
                    className="bg-[#1F1F1F] rounded-3xl border border-[#333333] p-5 shadow-xs hover:border-[#493426] hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  >
                    {/* Top Row: Person & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white font-black text-base flex items-center justify-center shadow-xs">
                          {loan.personName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActivePersonHistory(loan.personName)}
                              className="text-base font-black text-white hover:text-[#FF9248] hover:underline text-left cursor-pointer"
                            >
                              {loan.personName}
                            </button>
                          </div>
                          <span className="text-[11px] text-[#8A8A8A] block mt-0.5">
                            Lent on {formatDate(loan.date)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {loan.status === 'returned' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Returned
                        </span>
                      )}
                      {loan.status === 'partially_returned' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#2B2415] text-amber-300 border border-[#5A451B]">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Partial ({percent}%)
                        </span>
                      )}
                      {loan.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#332A17] text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Loan Note */}
                    {loan.description && (
                      <p className="text-xs text-[#B3B3B3] bg-[#242424] p-2.5 rounded-xl border border-[#493426]">
                        {loan.description}
                      </p>
                    )}

                    {/* Progress Bar & Amount Breakdown */}
                    <div className="space-y-2">
                      <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full bg-[#FF9248]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div className="p-2 rounded-xl bg-[#242424]">
                          <span className="text-[10px] text-[#8A8A8A] font-semibold block uppercase">Lent</span>
                          <span className="text-xs font-black text-white mt-0.5 block">
                            {formatCurrency(loan.amount)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#2D211A]">
                          <span className="text-[10px] text-[#FF9248] font-bold block uppercase">Returned</span>
                          <span className="text-xs font-black text-[#FF9248] mt-0.5 block">
                            {formatCurrency(loan.totalReturned)}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-[#2B2415]">
                          <span className="text-[10px] text-amber-300 font-semibold block uppercase">Remaining</span>
                          <span className="text-xs font-black text-amber-300 mt-0.5 block">
                            {formatCurrency(loan.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-[#333333] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveDetailLoan(loan)}
                          className="px-3 py-1.5 rounded-xl border border-[#333333] text-xs font-bold text-[#B3B3B3] hover:bg-[#242424] hover:text-[#FF9248] transition flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History ({loan.returns?.length || 0})</span>
                        </button>
                        <button
                          onClick={() => setActivePersonHistory(loan.personName)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#B3B3B3] hover:text-[#FF9248] hover:bg-[#242424] transition cursor-pointer"
                          title="View all transactions for this person"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {loan.remainingAmount > 0 ? (
                        <button
                          onClick={() => setActiveReturnLoan(loan)}
                          className="px-4 py-2 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold shadow-xs shadow-[#FF9248]/30 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Returned</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#FF9248] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Settled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BY PERSON SUMMARY */}
      {viewTab === 'people' && (
        <div className="space-y-4">
          <p className="text-xs text-[#B3B3B3]">
            Click on any person to view their complete transaction history and running repayment balance.
          </p>

          {peopleSummary.length === 0 ? (
            <div className="py-16 text-center bg-[#1F1F1F] rounded-3xl border border-[#333333] p-8">
              <Users className="w-12 h-12 mx-auto text-[#8A8A8A] mb-3" />
              <h3 className="text-base font-bold text-white">No borrowers found</h3>
              <p className="text-xs text-[#B3B3B3] mt-1">
                Record loans to see per-person aggregated balances here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peopleSummary.map((p) => {
                const isSettled = p.totalOwed === 0;

                return (
                  <div
                    key={p.personName}
                    onClick={() => setActivePersonHistory(p.personName)}
                    className="p-5 rounded-3xl bg-[#1F1F1F] border border-[#333333] shadow-xs hover:border-[#493426] hover:shadow-md transition-all cursor-pointer space-y-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white font-black text-base flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          {p.personName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-white group-hover:text-[#FF9248] transition-colors">
                            {p.personName}
                          </h4>
                          <span className="text-[11px] text-[#8A8A8A]">
                            {p.loansCount} {p.loansCount === 1 ? 'loan' : 'loans'}
                          </span>
                        </div>
                      </div>

                      {isSettled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                          All Settled
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#332A17] text-amber-300">
                          Owes {formatCurrency(p.totalOwed)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#333333]">
                      <div>
                        <span className="text-[10px] text-[#8A8A8A] font-semibold block">Total Lent</span>
                        <span className="text-xs font-bold text-white mt-0.5 block">
                          {formatCurrency(p.totalLent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#FF9248] font-bold block">Returned</span>
                        <span className="text-xs font-bold text-[#FF9248] mt-0.5 block">
                          {formatCurrency(p.totalReturned)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-300 font-semibold block">Balance</span>
                        <span className="text-xs font-black text-amber-300 mt-0.5 block">
                          {formatCurrency(p.totalOwed)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-[#FF9248] font-bold group-hover:underline">
                      <span>View Complete History</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (data) => {
          await onAddLoan(data);
        }}
        existingPersons={existingPersons}
      />

      <RecordReturnModal
        isOpen={!!activeReturnLoan}
        loan={activeReturnLoan}
        onClose={() => setActiveReturnLoan(null)}
        onRecordReturn={async (loanId, data) => {
          await onRecordReturn(loanId, data);
        }}
      />

      <LoanDetailModal
        isOpen={!!activeDetailLoan}
        loan={activeDetailLoan}
        onClose={() => setActiveDetailLoan(null)}
        onOpenRecordReturn={(loan) => setActiveReturnLoan(loan)}
        onDeleteReturn={onDeleteLoanReturn}
        onDeleteLoan={onDeleteLoan}
      />

      <PersonHistoryModal
        isOpen={!!activePersonHistory}
        personName={activePersonHistory}
        loans={loans}
        onClose={() => setActivePersonHistory(null)}
        onOpenAddLoanForPerson={(name) => {
          setIsAddModalOpen(true);
        }}
        onOpenRecordReturn={(loan) => {
          setActiveReturnLoan(loan);
        }}
      />
    </div>
  );
};
