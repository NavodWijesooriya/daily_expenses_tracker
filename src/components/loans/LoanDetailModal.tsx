import React from 'react';
import { X, Clock, CheckCircle2, RefreshCw, Trash2, ArrowDownLeft } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface LoanDetailModalProps {
  isOpen: boolean;
  loan: Loan | null;
  onClose: () => void;
  onOpenRecordReturn: (loan: Loan) => void;
  onDeleteReturn?: (loanId: string, returnId: string) => Promise<void>;
  onDeleteLoan?: (loanId: string) => Promise<void>;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen,
  loan,
  onClose,
  onOpenRecordReturn,
  onDeleteReturn,
  onDeleteLoan,
}) => {
  if (!isOpen || !loan) return null;

  const percentReturned = loan.amount > 0 ? Math.min(100, Math.round((loan.totalReturned / loan.amount) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1F1F1F] w-full max-w-xl rounded-3xl border border-[#333333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">{loan.personName}</h2>
              {loan.status === 'returned' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                  <CheckCircle2 className="w-3 h-3" />
                  Returned
                </span>
              )}
              {loan.status === 'partially_returned' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                  <RefreshCw className="w-3 h-3" />
                  Partially Returned
                </span>
              )}
              {loan.status === 'pending' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2B2415] text-amber-300 border border-[#5A451B]">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              Lent on {formatDate(loan.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-white rounded-xl hover:bg-[#242424] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Amount Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#1F1F1F] border border-[#333333] text-center">
              <span className="text-[10px] text-[#8A8A8A] font-bold block uppercase tracking-wider">Total Lent</span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-1 block">
                {formatCurrency(loan.amount)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#493426] text-center">
              <span className="text-[10px] text-[#FF9248] font-bold block uppercase tracking-wider">Returned</span>
              <span className="text-sm sm:text-base font-extrabold text-[#FF9248] mt-1 block">
                {formatCurrency(loan.totalReturned)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#2D211A] border border-[#493426] text-center">
              <span className="text-[10px] text-[#FF9248] font-bold block uppercase tracking-wider">Remaining</span>
              <span className="text-sm sm:text-base font-extrabold text-[#FF9248] mt-1 block">
                {formatCurrency(loan.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#B3B3B3]">Repayment Progress</span>
              <span className="text-white font-bold">{percentReturned}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#242424] overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full bg-[#FF9248]"
                style={{ width: `${percentReturned}%` }}
              />
            </div>
          </div>

          {/* Note / Description */}
          {loan.description && (
            <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#493426] space-y-1">
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">Initial Loan Note</span>
              <p className="text-xs text-white leading-relaxed">{loan.description}</p>
            </div>
          )}

          {/* Repayment History Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
                Repayment History ({loan.returns?.length || 0})
              </h3>
              {loan.remainingAmount > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecordReturn(loan);
                  }}
                  className="text-xs font-bold text-[#FF9248] hover:underline cursor-pointer"
                >
                  + Record Return
                </button>
              )}
            </div>

            {(!loan.returns || loan.returns.length === 0) ? (
              <div className="p-6 rounded-2xl bg-[#1F1F1F] border border-dashed border-[#333333] text-center">
                <Clock className="w-8 h-8 mx-auto text-[#8A8A8A] mb-2" />
                <p className="text-xs font-semibold text-[#B3B3B3]">No repayments recorded yet</p>
                <p className="text-[11px] text-[#8A8A8A] mt-0.5">Click "Record Return" when {loan.personName} pays back any money.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {loan.returns.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3 rounded-2xl bg-[#242424] border border-[#493426] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#2D211A] text-[#FF9248] flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white">
                            {formatCurrency(ret.amount)}
                          </span>
                          <span className="text-[11px] text-[#8A8A8A]">• {formatDate(ret.date)}</span>
                        </div>
                        {ret.note && (
                          <p className="text-[11px] text-[#B3B3B3] mt-0.5">{ret.note}</p>
                        )}
                      </div>
                    </div>

                    {onDeleteReturn && (
                      <button
                        onClick={() => onDeleteReturn(loan.id, ret.id)}
                        className="p-1.5 text-[#8A8A8A] hover:text-rose-300 rounded-lg hover:bg-[#2A171A] transition cursor-pointer"
                        title="Remove repayment entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#333333] flex items-center justify-between shrink-0 bg-[#1F1F1F]">
          {onDeleteLoan ? (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete this loan record for ${loan.personName}?`)) {
                  onDeleteLoan(loan.id);
                  onClose();
                }
              }}
              className="text-xs font-bold text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Loan
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#B3B3B3] hover:bg-[#242424] transition cursor-pointer"
            >
              Close
            </button>
            {loan.remainingAmount > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordReturn(loan);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-[#0F0F0F] shadow-md shadow-[#FF9248]/25 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Returned
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
