import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';

interface RecordReturnModalProps {
  isOpen: boolean;
  loan: Loan | null;
  onClose: () => void;
  onRecordReturn: (
    loanId: string,
    data: {
      amount: number;
      date: string;
      note?: string;
    }
  ) => Promise<void>;
}

export const RecordReturnModal: React.FC<RecordReturnModalProps> = ({
  isOpen,
  loan,
  onClose,
  onRecordReturn,
}) => {
  const [returnAmount, setReturnAmount] = useState('');
  const [returnDate, setReturnDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default return amount to remaining balance when modal opens
  useEffect(() => {
    if (loan) {
      setReturnAmount(loan.remainingAmount > 0 ? loan.remainingAmount.toString() : '');
      setReturnDate(getTodayDateString());
      setNote('');
      setError(null);
    }
  }, [loan]);

  const parsedAmount = useMemo(() => {
    const val = parseFloat(returnAmount);
    return isNaN(val) ? 0 : val;
  }, [returnAmount]);

  if (!isOpen || !loan) return null;

  const remainingAfterPayment = Math.max(0, Math.round((loan.remainingAmount - parsedAmount) * 100) / 100);
  const willBeFullyReturned = parsedAmount >= loan.remainingAmount && parsedAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a returned amount greater than zero.');
      return;
    }

    if (parsedAmount > loan.remainingAmount) {
      setError(`Returned amount cannot exceed the remaining balance of ${formatCurrency(loan.remainingAmount)}.`);
      return;
    }

    if (!returnDate) {
      setError('Please specify the return date.');
      return;
    }

    setSubmitting(true);
    try {
      await onRecordReturn(loan.id, {
        amount: parsedAmount,
        date: returnDate,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record return.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1F1F1F] w-full max-w-lg rounded-3xl border border-[#333333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333]">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF9248]" />
              <span>Record Money Returned</span>
            </h2>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              Record repayment from <strong className="text-white">{loan.personName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-white rounded-xl hover:bg-[#242424] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-[#2A171A] border border-[#54252D] text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Loan State Breakdown */}
          <div className="p-4 rounded-2xl bg-[#242424] border border-[#493426] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#B3B3B3]">Borrower:</span>
              <span className="font-bold text-white">{loan.personName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#493426]">
              <div className="text-center p-2 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                <span className="text-[10px] text-[#8A8A8A] font-semibold block">Original Loan</span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {formatCurrency(loan.amount)}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-[#1F1F1F] border border-[#333333]">
                <span className="text-[10px] text-[#8A8A8A] font-semibold block">Already Returned</span>
                <span className="text-xs font-bold text-[#FF9248] mt-0.5 block">
                  {formatCurrency(loan.totalReturned)}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-[#2D211A] border border-[#493426]">
                <span className="text-[10px] text-[#FF9248] font-bold block">Current Balance</span>
                <span className="text-xs font-extrabold text-[#FF9248] mt-0.5 block">
                  {formatCurrency(loan.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Returned Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white">
                Returned Amount (Rs.) <span className="text-[#FF9248]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setReturnAmount(loan.remainingAmount.toString())}
                className="text-[11px] font-bold text-[#FF9248] hover:underline cursor-pointer"
              >
                Set Full Remaining ({formatCurrency(loan.remainingAmount)})
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF9248] font-bold text-xs pointer-events-none">
                Rs.
              </div>
              <input
                type="number"
                step="any"
                min="1"
                max={loan.remainingAmount}
                required
                placeholder="e.g. 5000"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs sm:text-sm text-[#FF9248] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] font-bold"
              />
            </div>
          </div>

          {/* Projected Status Preview */}
          {parsedAmount > 0 && (
            <div className="p-3.5 rounded-2xl border border-[#493426] bg-[#2D211A] text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#B3B3B3]">Repayment Type:</span>
                <span className="font-bold flex items-center gap-1 text-[#FF9248]">
                  {willBeFullyReturned ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9248]" />
                      Full Return (Pending → Returned)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#FF9248]" />
                      Partial Return (Status → Partially Returned)
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#493426]">
                <span className="text-[#B3B3B3]">Remaining amount after this:</span>
                <span className="font-mono font-bold text-sm text-white">
                  {formatCurrency(remainingAfterPayment)}
                </span>
              </div>
            </div>
          )}

          {/* Return Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              Return Date <span className="text-[#FF9248]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              Optional Note <span className="text-[#8A8A8A] font-normal">(Payment method, reference, etc.)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-[#8A8A8A] pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Bank transfer, cash at office"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs sm:text-sm text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#333333] text-xs font-bold text-[#B3B3B3] hover:bg-[#242424] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || parsedAmount <= 0}
              className="px-6 py-2.5 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-[#0F0F0F] shadow-md shadow-[#FF9248]/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : willBeFullyReturned ? 'Mark as Returned' : 'Save Partial Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
