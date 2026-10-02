import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Expense } from '../../types/expense';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  existingCategories: string[];
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
  onSave,
  existingCategories,
}) => {
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Home Needs');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense) {
      setExpenseName(expense.expenseName);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setPersonName(expense.personName || '');
      setDescription(expense.description || '');

      const normalizedCat = expense.category === 'Wife Personal' ? 'Wife' : expense.category;
      const isKnown = ['Home Needs', 'Wife', 'Personal', 'Other'].includes(normalizedCat);
      if (isKnown || existingCategories.includes(normalizedCat)) {
        setCategory(normalizedCat);
        setIsCustomCategory(false);
      } else {
        setIsCustomCategory(true);
        setCustomCategory(normalizedCat);
      }
    }
  }, [expense, existingCategories]);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = expenseName.trim();
    const numAmount = parseFloat(amount);
    const chosenCategory = isCustomCategory ? customCategory.trim() : category;

    if (!trimmedName) {
      setError('Expense name cannot be empty.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!chosenCategory) {
      setError('Category must be specified.');
      return;
    }
    if (!date) {
      setError('Date must be valid.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(expense.id, {
        expenseName: trimmedName,
        amount: numAmount,
        category: chosenCategory,
        personName: personName.trim() || undefined,
        description: description.trim() || undefined,
        date,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update expense.');
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
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div>
            <h3 className="text-xl font-bold text-[#1F1F1F]">Edit Expense</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update expense details and category
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Expense Name <span className="text-[#FF9248]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
            />
          </div>

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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
                Date <span className="text-[#FF9248]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
              />
            </div>
          </div>

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
                {isCustomCategory ? 'Choose from presets' : '+ Custom category'}
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

          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Person Associated (Optional)
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g., Kasun"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-1">
              Description / Note (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] resize-none"
            />
          </div>

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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
