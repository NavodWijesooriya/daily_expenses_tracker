import React from 'react';
import {
  HandCoins,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { LoanSummaryStats } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

interface LoanSummaryCardProps {
  stats: LoanSummaryStats;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const LoanSummaryCard: React.FC<LoanSummaryCardProps> = ({
  stats,
  activeFilter = 'all',
  onFilterChange,
}) => {
  return (
    <div className="space-y-4">
      {/* 3 Main Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Money Given */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1F1F1F] p-5 border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">
              Total Money Given
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#2D211A] text-[#FF9248] flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatCurrency(stats.totalLent)}
            </h3>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">
              Across {stats.totalLoansCount} {stats.totalLoansCount === 1 ? 'record' : 'records'}
            </p>
          </div>
        </div>

        {/* Total Money Returned */}
        <div className="relative overflow-hidden rounded-3xl bg-[#242424] p-5 border border-[#493426] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF9248]">
              Total Money Returned
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#1F1F1F] text-[#FF9248] shadow-xs border border-[#493426] flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-[#FF9248] tracking-tight">
              {formatCurrency(stats.totalReturned)}
            </h3>
            <p className="text-[11px] text-[#FF9248]/80 font-medium mt-0.5">
              {stats.totalLent > 0
                ? `${Math.round((stats.totalReturned / stats.totalLent) * 100)}% recovery rate`
                : 'No money given yet'}
            </p>
          </div>
        </div>

        {/* Total Money Currently Owed */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1F1F1F] p-5 border border-[#333333] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">
              Currently Owed to Me
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#2B2415] text-amber-300 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {formatCurrency(stats.totalOwed)}
            </h3>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">
              Pending collection
            </p>
          </div>
        </div>
      </div>

      {/* Money Given Status Count Chips (Pending, Partial, Fully Returned) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onFilterChange && onFilterChange('pending')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'pending'
              ? 'bg-[#2D211A] border-[#FF9248] shadow-xs ring-2 ring-[#FF9248]/20'
              : 'bg-[#1F1F1F] border-[#333333] hover:border-[#493426]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            {stats.pendingCount}
          </div>
          <span className="text-[10px] text-[#8A8A8A] block mt-0.5">Awaiting first payment</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange && onFilterChange('partially_returned')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'partially_returned'
              ? 'bg-[#2D211A] border-[#FF9248] shadow-xs ring-2 ring-[#FF9248]/20'
              : 'bg-[#1F1F1F] border-[#333333] hover:border-[#493426]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[#FF9248]">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Partial Repayments</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            {stats.partialCount}
          </div>
          <span className="text-[10px] text-[#8A8A8A] block mt-0.5">Partially paid back</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange && onFilterChange('returned')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'returned'
              ? 'bg-[#2D211A] border-[#FF9248] shadow-xs ring-2 ring-[#FF9248]/20'
              : 'bg-[#1F1F1F] border-[#333333] hover:border-[#493426]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[#FF9248]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Fully Returned</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            {stats.fullyReturnedCount}
          </div>
          <span className="text-[10px] text-[#8A8A8A] block mt-0.5">Completely settled</span>
        </button>
      </div>
    </div>
  );
};
