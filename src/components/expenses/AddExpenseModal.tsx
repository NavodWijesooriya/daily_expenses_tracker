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
        date,
      });

      // Reset form
      setExpenseName('');
      setAmount('');
      setCategory('Home Needs');
      setCustomCategory('');
      setIsCustomCategory(false);
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
      <div className="relative w-full max-w-lg bg-[#1F1F1F] rounded-3xl shadow-2xl border border-[#333333] p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
          <div>
            <h3 className="text-xl font-bold text-white">Add Expense</h3>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              Record a new expense in Sri Lankan Rupees (Rs.)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-white rounded-xl hover:bg-[#242424] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#2A171A] border border-[#54252D] text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Expense Name */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1">
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
                className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm font-bold text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Date <span className="text-[#FF9248]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
                />
              </div>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-white">
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
                className="w-full px-4 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
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
                        ? 'bg-[#FF9248] text-[#0F0F0F] border-[#FF9248] shadow-sm shadow-[#FF9248]/30 font-bold'
                        : 'bg-[#1F1F1F] border-[#333333] text-[#B3B3B3] hover:bg-[#242424] hover:text-[#FF9248] hover:border-[#493426]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#333333] text-xs font-semibold text-[#B3B3B3] hover:bg-[#242424] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF9248] hover:bg-[#F07F30] active:scale-98 disabled:opacity-50 text-xs font-bold text-[#0F0F0F] shadow-md shadow-[#FF9248]/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
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
