import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Download,
  Plus,
  Trash2,
  Edit2,
  Users,
  Home,
  Heart,
  Layers,
  FileSpreadsheet,
  X,
  User as UserIcon,
} from 'lucide-react';
import { Expense, DateFilterPreset, SortOption } from '../../types/expense';
import { formatCurrency, formatDate, formatFullDate, getTodayDateString } from '../../utils/formatters';

interface ExpensesListViewProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

export const ExpensesListView: React.FC<ExpensesListViewProps> = ({
  expenses,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Extract distinct categories & people
  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [expenses]);

  const people = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.personName && e.personName.trim()) set.add(e.personName.trim());
    });
    return Array.from(set);
  }, [expenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    const todayStr = getTodayDateString();
    const todayDate = new Date();

    return expenses.filter((exp) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = exp.expenseName.toLowerCase().includes(q);
        const matchesPerson = exp.personName?.toLowerCase().includes(q) || false;
        const matchesDesc = exp.description?.toLowerCase().includes(q) || false;
        const matchesCat = exp.category.toLowerCase().includes(q);
        if (!matchesName && !matchesPerson && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'Wife') {
          if (exp.category !== 'Wife' && exp.category !== 'Wife Personal') return false;
        } else if (exp.category !== selectedCategory) {
          return false;
        }
      }

      // Person filter
      if (selectedPerson !== 'all') {
        if (!exp.personName || exp.personName.trim() !== selectedPerson) {
          return false;
        }
      }

      // Date preset filter
      if (dateFilter !== 'all') {
        const [expYear, expMonth, expDay] = exp.date.split('-').map(Number);
        const expDateObj = new Date(expYear, expMonth - 1, expDay);

        if (dateFilter === 'today') {
          if (exp.date !== todayStr) return false;
        } else if (dateFilter === 'yesterday') {
          const y = new Date(todayDate);
          y.setDate(y.getDate() - 1);
          const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
          if (exp.date !== yStr) return false;
        } else if (dateFilter === 'this_week') {
          const firstDayOfWeek = new Date(todayDate);
          const day = todayDate.getDay() || 7;
          firstDayOfWeek.setDate(todayDate.getDate() - day + 1);
          firstDayOfWeek.setHours(0, 0, 0, 0);
          if (expDateObj < firstDayOfWeek) return false;
        } else if (dateFilter === 'this_month') {
          const monthPrefix = todayStr.substring(0, 7);
          if (!exp.date.startsWith(monthPrefix)) return false;
        } else if (dateFilter === 'last_month') {
          const lastM = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
          const lastMPrefix = `${lastM.getFullYear()}-${String(lastM.getMonth() + 1).padStart(2, '0')}`;
          if (!exp.date.startsWith(lastMPrefix)) return false;
        } else if (dateFilter === 'custom') {
          if (customFromDate && exp.date < customFromDate) return false;
          if (customToDate && exp.date > customToDate) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '');
      if (sortBy === 'oldest') return a.date.localeCompare(b.date);
      if (sortBy === 'highest') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'lowest') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });
  }, [
    expenses,
    searchQuery,
    selectedCategory,
    selectedPerson,
    dateFilter,
    customFromDate,
    customToDate,
    sortBy,
  ]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  // Export filtered expenses as CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['Date', 'Expense Name', 'Amount (Rs)', 'Category', 'Person', 'Description'];
    const rows = filteredExpenses.map((exp) => [
      `"${exp.date}"`,
      `"${exp.expenseName.replace(/"/g, '""')}"`,
      exp.amount.toFixed(2),
      `"${exp.category.replace(/"/g, '""')}"`,
      `"${(exp.personName || '').replace(/"/g, '""')}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Expenses_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPerson('all');
    setDateFilter('all');
    setCustomFromDate('');
    setCustomToDate('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Expenses History
          </h1>
          <p className="text-xs text-[#B3B3B3] mt-0.5">
            Search, filter, categorize, and audit all recorded expenses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {filteredExpenses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F1F1F] border border-[#333333] hover:bg-[#242424] hover:text-[#FF9248] text-[#B3B3B3] text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold rounded-xl shadow-sm shadow-[#FF9248]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1F1F1F] rounded-3xl p-5 border border-[#333333] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Search expenses, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Home Needs">Home Needs</option>
              <option value="Wife">Wife</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
              {categories
                .filter((c) => !['Home Needs', 'Wife', 'Personal', 'Other', 'Wife Personal'].includes(c))
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Person Filter */}
          <div>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] cursor-pointer"
            >
              <option value="all">All People</option>
              {people.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3.5 py-2.5 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Date Presets Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#333333]">
          <span className="text-xs text-[#8A8A8A] mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as DateFilterPreset)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                dateFilter === item.id
                  ? 'bg-[#FF9248] text-[#0F0F0F] shadow-xs font-bold'
                  : 'bg-[#242424] text-[#B3B3B3] hover:bg-[#2D211A] hover:text-[#FF9248]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {(searchQuery || selectedCategory !== 'all' || selectedPerson !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#FF9248] hover:underline font-semibold ml-auto cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#333333]">
            <div>
              <label className="block text-[11px] font-semibold text-[#B3B3B3] mb-1">From Date</label>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#B3B3B3] mb-1">To Date</label>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#FF9248]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Results Summary Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-[#B3B3B3]">
          Showing <strong className="text-white">{filteredExpenses.length}</strong>{' '}
          {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
        </span>
        <div className="text-xs font-semibold text-[#B3B3B3]">
          Total:{' '}
          <strong className="text-base text-[#FF9248] font-black ml-1">
            {formatCurrency(totalFilteredAmount)}
          </strong>
        </div>
      </div>

      {/* Expenses Table (Desktop) / Cards (Mobile) */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-[#1F1F1F] rounded-3xl p-12 text-center border border-[#333333]">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-[#8A8A8A] mb-3" />
          <h3 className="text-base font-bold text-white">No expenses matched your filter</h3>
          <p className="text-xs text-[#B3B3B3] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing selected filters, or adding a new expense.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-[#242424] text-[#B3B3B3] hover:bg-[#2D211A] hover:text-[#FF9248] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout (< md) */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-[#1F1F1F] rounded-2xl p-4 border border-[#333333] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-[#2D211A] text-[#FF9248]">
                      {exp.category === 'Home Needs' ? (
                        <Home className="w-4 h-4" />
                      ) : exp.category === 'Wife' || exp.category === 'Wife Personal' ? (
                        <Heart className="w-4 h-4" />
                      ) : exp.category === 'Personal' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">
                        {exp.expenseName}
                      </div>
                      <div className="text-[11px] text-[#B3B3B3] mt-0.5">
                        {formatFullDate(exp.date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-white">
                      {formatCurrency(exp.amount)}
                    </div>
                  </div>
                </div>

                {/* Tags and details */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[#242424] text-[#B3B3B3] font-medium">
                    {exp.category}
                  </span>
                  {exp.personName && (
                    <span className="px-2 py-0.5 rounded-md bg-[#2D211A] text-[#FF9248] font-bold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {exp.personName}
                    </span>
                  )}
                  {exp.syncStatus === 'pending' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#332A17] text-amber-300 font-medium text-[10px]">
                      saving offline
                    </span>
                  )}
                </div>

                {exp.description && (
                  <p className="text-xs text-[#B3B3B3] bg-[#242424] p-2.5 rounded-xl border border-[#493426] italic">
                    "{exp.description}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#333333]">
                  <button
                    onClick={() => onEditExpense(exp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#B3B3B3] hover:text-[#FF9248] hover:bg-[#2D211A] rounded-lg transition cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteExpense(exp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-[#2A171A] rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout (>= md) */}
          <div className="hidden md:block bg-[#1F1F1F] rounded-3xl border border-[#333333] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#242424] text-[#B3B3B3] font-semibold border-b border-[#333333]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Expense Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Associated Person</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {filteredExpenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-[#242424] transition group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#B3B3B3]">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{exp.expenseName}</span>
                          {exp.syncStatus === 'pending' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#332A17] text-amber-300 font-medium">
                              offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-[#2D211A] text-[#FF9248]">
                          {exp.category === 'Wife Personal' ? 'Wife' : exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#B3B3B3]">
                        {exp.personName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#FF9248]">
                            <Users className="w-3.5 h-3.5" />
                            {exp.personName}
                          </span>
                        ) : (
                          <span className="text-[#8A8A8A]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-[#B3B3B3] max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 text-[#8A8A8A] hover:text-[#FF9248] hover:bg-[#2D211A] rounded-lg transition cursor-pointer"
                            title="Edit expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp)}
                            className="p-1.5 text-[#8A8A8A] hover:text-rose-300 hover:bg-[#2A171A] rounded-lg transition cursor-pointer"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
