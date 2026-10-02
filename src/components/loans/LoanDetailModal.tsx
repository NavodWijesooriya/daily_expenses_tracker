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
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#E5E5E5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#1F1F1F]">{loan.personName}</h2>
              {loan.status === 'returned' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF3EA] text-[#FF9248] border border-[#FFE3D0]">
                  <CheckCircle2 className="w-3 h-3" />
                  Returned
                </span>
              )}
              {loan.status === 'partially_returned' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF3EA] text-[#FF9248] border border-[#FFE3D0]">
                  <RefreshCw className="w-3 h-3" />
                  Partially Returned
                </span>
              )}
              {loan.status === 'pending' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lent on {formatDate(loan.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#1F1F1F] rounded-xl hover:bg-[#F5F5F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Amount Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Lent</span>
              <span className="text-sm sm:text-base font-extrabold text-[#1F1F1F] mt-1 block">
                {formatCurrency(loan.amount)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] text-center">
              <span className="text-[10px] text-[#FF9248] font-bold block uppercase tracking-wider">Returned</span>
              <span className="text-sm sm:text-base font-extrabold text-[#FF9248] mt-1 block">
                {formatCurrency(loan.totalReturned)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFF3EA] border border-[#FFE3D0] text-center">
              <span className="text-[10px] text-[#E26E1D] font-bold block uppercase tracking-wider">Remaining</span>
              <span className="text-sm sm:text-base font-extrabold text-[#E26E1D] mt-1 block">
                {formatCurrency(loan.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Repayment Progress</span>
              <span className="text-[#1F1F1F] font-bold">{percentReturned}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#F5F5F5] overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full bg-[#FF9248]"
                style={{ width: `${percentReturned}%` }}
              />
            </div>
          </div>

          {/* Note / Description */}
          {loan.description && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Initial Loan Note</span>
              <p className="text-xs text-[#1F1F1F] leading-relaxed">{loan.description}</p>
            </div>
          )}

          {/* Repayment History Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
              <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E5E5E5] text-center">
                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No repayments recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Record Return" when {loan.personName} pays back any money.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {loan.returns.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF3EA] text-[#FF9248] flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#1F1F1F]">
                            {formatCurrency(ret.amount)}
                          </span>
                          <span className="text-[11px] text-slate-400">• {formatDate(ret.date)}</span>
                        </div>
                        {ret.note && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{ret.note}</p>
                        )}
                      </div>
                    </div>

                    {onDeleteReturn && (
                      <button
                        onClick={() => onDeleteReturn(loan.id, ret.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
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
        <div className="p-4 px-6 border-t border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
          {onDeleteLoan ? (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete this loan record for ${loan.personName}?`)) {
                  onDeleteLoan(loan.id);
                  onClose();
                }
              }}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Loan
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E5E5] text-xs font-bold text-slate-600 hover:bg-[#F5F5F5] transition cursor-pointer"
            >
              Close
            </button>
            {loan.remainingAmount > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordReturn(loan);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-white shadow-md shadow-[#FF9248]/25 transition flex items-center gap-1.5 cursor-pointer"
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
