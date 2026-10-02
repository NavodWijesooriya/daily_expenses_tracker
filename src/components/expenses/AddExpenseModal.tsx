import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { getTodayDateString } from '../../utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    expenseName: string;
    amount: number;
    category: string;
    personName?: string;
    description?: string;
    date: string;
  }) => Promise<void>;
  existingCategories: string[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingCategories,
}) => {
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Home Needs');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = expenseName.trim();
    const numAmount = parseFloat(amount);
    const chosenCategory = isCustomCategory ? customCategory.trim() : category;

    if (!trimmedName) {
      setError('Please enter an expense name.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!chosenCategory) {
      setError('Please select or provide a category.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        expenseName: trimmedName,
        amount: numAmount,
        category: chosenCategory,
        personName: personName.trim() || undefined,
        description: description.trim() || undefined,
        date,
      });

      // Reset form
      setExpenseName('');
      setAmount('');
      setCategory('Home Needs');
      setCustomCategory('');
      setIsCustomCategory(false);
      setPersonName('');
      setDescription('');
      setDate(getTodayDateString());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save expense. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultCategoryList = Array.from(
    new Set(['Home Needs', 'Wife', 'Personal', 'Other', ...existingCategories.filter((c) => c !== 'Wife Personal')])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E5E5] p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div>
            <h3 className="text-xl font-bold text-[#1F1F1F]">Add Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record a new expense in Sri Lankan Rupees (Rs.)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#1F1F1F] rounded-xl hover:bg-[#F5F5F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Expense Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Expense Name <span className="text-[#FF9248]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g., Grocery Shopping, Money Given"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
                Amount (Rs.) <span className="text-[#FF9248]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF9248]">
                  Rs.
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
                Date <span className="text-[#FF9248]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
                />
              </div>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1F1F1F]">
                Category <span className="text-[#FF9248]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-xs font-medium text-[#FF9248] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isCustomCategory ? 'Choose from list' : '+ Custom category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Enter custom category name"
                maxLength={50}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {defaultCategoryList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center truncate cursor-pointer ${
                      category === cat
                        ? 'bg-[#FF9248] text-white border-[#FF9248] shadow-sm shadow-[#FF9248]/30 font-bold'
                        : 'bg-white border-[#E5E5E5] text-slate-700 hover:bg-[#FFF9F5] hover:text-[#FF9248] hover:border-[#FFE3D0]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Person Name (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Person Associated (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={100}
                placeholder="e.g., Kasun, Nimal, Amal"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Track money given, spent on behalf of, or associated with specific individuals.
            </p>
          </div>

          {/* Description / Note (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Description / Note (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="e.g., Gave money to friend for repair"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#E5E5E5] text-xs font-semibold text-slate-600 hover:bg-[#F5F5F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-98 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-[#FF9248]/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
