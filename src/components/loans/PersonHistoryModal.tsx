import React, { useMemo } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, CheckCircle2, Plus } from 'lucide-react';
import { Loan } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PersonHistoryModalProps {
  isOpen: boolean;
  personName: string | null;
  loans: Loan[];
  onClose: () => void;
  onOpenAddLoanForPerson?: (name: string) => void;
  onOpenRecordReturn?: (loan: Loan) => void;
}

export const PersonHistoryModal: React.FC<PersonHistoryModalProps> = ({
  isOpen,
  personName,
  loans,
  onClose,
  onOpenAddLoanForPerson,
  onOpenRecordReturn,
}) => {
  if (!isOpen || !personName) return null;

  // Filter loans for this person
  const personLoans = useMemo(() => {
    return loans.filter((l) => l.personName.toLowerCase() === personName.toLowerCase());
  }, [loans, personName]);

  const stats = useMemo(() => {
    let totalLent = 0;
    let totalReturned = 0;
    let totalOwed = 0;

    personLoans.forEach((l) => {
      totalLent += l.amount;
      totalReturned += l.totalReturned;
      totalOwed += l.remainingAmount;
    });

    return { totalLent, totalReturned, totalOwed };
  }, [personLoans]);

  // Build combined chronological ledger of all events (loans given and payments received)
  const ledger = useMemo(() => {
    const events: {
      id: string;
      type: 'lent' | 'returned';
      date: string;
      amount: number;
      note?: string;
      loanId: string;
    }[] = [];

    personLoans.forEach((l) => {
      // Event: Money lent
      events.push({
        id: `loan_${l.id}`,
        type: 'lent',
        date: l.date,
        amount: l.amount,
        note: l.description,
        loanId: l.id,
      });

      // Events: Returns
      l.returns?.forEach((r) => {
        events.push({
          id: `ret_${r.id}`,
          type: 'returned',
          date: r.date,
          amount: r.amount,
          note: r.note,
          loanId: l.id,
        });
      });
    });

    // Sort by date desc
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [personLoans]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1F1F1F] w-full max-w-2xl rounded-3xl border border-[#333333] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-[#FF9248]/25">
              {personName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                {personName}
                {stats.totalOwed === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                    All Settled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                    Owes {formatCurrency(stats.totalOwed)}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#B3B3B3] mt-0.5">
                Complete transaction & repayment history
              </p>
            </div>
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
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-[#333333] text-center">
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">Total Lent</span>
              <span className="text-base sm:text-lg font-black text-white mt-1 block">
                {formatCurrency(stats.totalLent)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#242424] border border-[#493426] text-center">
              <span className="text-[10px] font-bold text-[#FF9248] uppercase tracking-wider block">Total Returned</span>
              <span className="text-base sm:text-lg font-black text-[#FF9248] mt-1 block">
                {formatCurrency(stats.totalReturned)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#2D211A] border border-[#493426] text-center">
              <span className="text-[10px] font-bold text-[#FF9248] uppercase tracking-wider block">Currently Owed</span>
              <span className="text-base sm:text-lg font-black text-[#FF9248] mt-1 block">
                {formatCurrency(stats.totalOwed)}
              </span>
            </div>
          </div>

          {/* Active Loans Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                Loans Associated With {personName} ({personLoans.length})
              </h3>
              {onOpenAddLoanForPerson && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddLoanForPerson(personName);
                  }}
                  className="text-xs font-bold text-[#FF9248] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Lend More Money
                </button>
              )}
            </div>

            <div className="space-y-2">
              {personLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3.5 rounded-2xl bg-[#1F1F1F] border border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(loan.amount)}
                      </span>
                      <span className="text-xs text-[#8A8A8A]">• {formatDate(loan.date)}</span>
                      {loan.status === 'returned' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                          Returned
                        </span>
                      )}
                      {loan.status === 'partially_returned' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D211A] text-[#FF9248] border border-[#493426]">
                          Partially Returned
                        </span>
                      )}
                      {loan.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2B2415] text-amber-300 border border-[#5A451B]">
                          Pending
                        </span>
                      )}
                    </div>
                    {loan.description && (
                      <p className="text-xs text-[#B3B3B3] mt-1">{loan.description}</p>
                    )}
                    <div className="text-[11px] text-[#B3B3B3] mt-1">
                      Returned: <strong className="text-[#FF9248]">{formatCurrency(loan.totalReturned)}</strong> | Balance:{' '}
                      <strong className="text-[#FF9248]">{formatCurrency(loan.remainingAmount)}</strong>
                    </div>
                  </div>

                  {loan.remainingAmount > 0 && onOpenRecordReturn && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRecordReturn(loan);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-[#0F0F0F] shadow-xs transition flex items-center justify-center gap-1 self-start sm:self-auto shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Return
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Full Transaction History Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
              Complete Activity Timeline ({ledger.length} events)
            </h3>

            {ledger.length === 0 ? (
              <p className="text-xs text-[#8A8A8A] text-center py-4">No transactions recorded.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#333333]">
                {ledger.map((event) => {
                  const isLent = event.type === 'lent';
                  return (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white ${
                          isLent ? 'bg-amber-500' : 'bg-[#FF9248]'
                        }`}
                      >
                        {isLent ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3" />
                        )}
                      </div>

                      <div className="p-3 rounded-2xl bg-[#242424] border border-[#493426]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-black ${
                                isLent
                                  ? 'text-amber-300'
                                  : 'text-[#FF9248]'
                              }`}
                            >
                              {isLent ? `Lent money to ${personName}` : `Money returned by ${personName}`}
                            </span>
                            <span className="text-[11px] text-[#8A8A8A]">• {formatDate(event.date)}</span>
                          </div>
                          <span
                            className={`text-xs font-extrabold font-mono ${
                              isLent ? 'text-white' : 'text-[#FF9248]'
                            }`}
                          >
                            {isLent ? `- ${formatCurrency(event.amount)}` : `+ ${formatCurrency(event.amount)}`}
                          </span>
                        </div>

                        {event.note && (
                          <p className="text-[11px] text-[#B3B3B3] mt-1 italic">
                            "{event.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#333333] flex items-center justify-end shrink-0 bg-[#1F1F1F]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#242424] text-xs font-bold text-white hover:bg-[#333333] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
