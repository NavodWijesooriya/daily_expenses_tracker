import React, { useState } from 'react';
import { X, User, Calendar, FileText, Clock, AlertCircle } from 'lucide-react';
import { getTodayDateString } from '../../utils/formatters';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    personName: string;
    amount: number;
    date: string;
    description?: string;
  }) => Promise<void>;
  existingPersons?: string[];
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingPersons = [],
}) => {
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = personName.trim();
    if (!trimmedName) {
      setError("Please specify the person's name.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid loan amount greater than zero.');
      return;
    }

    if (!date) {
      setError('Please select the date the money was lent.');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        personName: trimmedName,
        amount: numAmount,
        date,
        description: description.trim() || undefined,
      });
      // Reset form
      setPersonName('');
      setAmount('');
      setDate(getTodayDateString());
      setDescription('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record loan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-[#E5E5E5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-lg font-black text-[#1F1F1F]">Lend Money / Add Loan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record money given to a friend with pending return status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#1F1F1F] rounded-xl hover:bg-[#F5F5F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF3EA] border border-[#FFE3D0]">
            <span className="text-xs font-semibold text-[#1F1F1F]">Initial Status:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF9248] text-white shadow-xs">
              <Clock className="w-3.5 h-3.5" />
              Pending
            </span>
          </div>

          {/* Person's Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">
              Person's Name <span className="text-[#FF9248]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Kasun"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>

            {/* Quick Contact Chips */}
            {existingPersons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 self-center mr-1">Frequent:</span>
                {existingPersons.slice(0, 5).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersonName(p)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#F5F5F5] text-slate-700 hover:bg-[#FFF3EA] hover:text-[#FF9248] transition cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">
              Amount (Rs.) <span className="text-[#FF9248]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF9248] font-bold text-xs pointer-events-none">
                Rs.
              </div>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] font-bold"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">
              Date Given <span className="text-[#FF9248]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
          </div>

          {/* Description / Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">
              Description / Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Travel money, to be returned next Friday"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5E5] text-xs font-bold text-slate-600 hover:bg-[#F5F5F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-white shadow-md shadow-[#FF9248]/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
