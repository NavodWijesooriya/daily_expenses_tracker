import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DeleteExpenseDialogProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: (expenseId: string) => Promise<void>;
}

export const DeleteExpenseDialog: React.FC<DeleteExpenseDialogProps> = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(expense.id);
      onClose();
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#E5E5E5] p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#1F1F1F]">
          Are you sure you want to delete this expense?
        </h3>

        <div className="mt-3 p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] text-left text-xs">
          <div className="font-semibold text-[#1F1F1F] truncate">
            {expense.expenseName}
          </div>
          <div className="text-[#FF9248] font-bold mt-0.5">
            {formatCurrency(expense.amount)}
          </div>
          <div className="text-slate-500 mt-1 flex items-center justify-between">
            <span>{expense.category}</span>
            <span>{formatDate(expense.date)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          This action will immediately update your dashboard, monthly summary, and category totals.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E5E5] text-xs font-semibold text-slate-700 hover:bg-[#F5F5F5] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {deleting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
