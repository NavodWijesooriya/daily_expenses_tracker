import React, { useState, useMemo } from 'react';
import { Users, Search, ChevronRight, X } from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PeopleViewProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ expenses, onOpenAddExpense, onEditExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Group expenses by person
  const peopleMap = useMemo(() => {
    const map: Record<string, { total: number; expenses: Expense[] }> = {};

    expenses.forEach((exp) => {
      if (exp.personName && exp.personName.trim()) {
        const name = exp.personName.trim();
        if (!map[name]) {
          map[name] = { total: 0, expenses: [] };
        }
        map[name].total += exp.amount || 0;
        map[name].expenses.push(exp);
      }
    });

    return map;
  }, [expenses]);

  // Filtered person list
  const filteredPeople = useMemo(() => {
    return Object.entries(peopleMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.expenses.length,
        expenses: data.expenses.sort((a, b) => b.date.localeCompare(a.date)),
      }))
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.total - a.total);
  }, [peopleMap, searchQuery]);

  const activePersonData = useMemo(() => {
    if (!selectedPerson || !peopleMap[selectedPerson]) return null;
    return {
      name: selectedPerson,
      total: peopleMap[selectedPerson].total,
      count: peopleMap[selectedPerson].expenses.length,
      expenses: [...peopleMap[selectedPerson].expenses].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [selectedPerson, peopleMap]);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            People Tracking
          </h1>
          <p className="text-xs text-[#B3B3B3] mt-0.5">
            Keep track of money given, shared expenses, and individual balances
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold rounded-xl shadow-sm shadow-[#FF9248]/25 transition cursor-pointer"
        >
          <span>+ Add Person Expense</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[#1F1F1F] rounded-2xl p-3 border border-[#333333] shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search by person name (e.g. Kasun, Nimal, Amal)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-xs text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-[#FF9248]"
          />
        </div>
      </div>

      {/* People Grid */}
      {filteredPeople.length === 0 ? (
        <div className="bg-[#1F1F1F] rounded-3xl p-12 text-center border border-[#333333]">
          <Users className="w-10 h-10 mx-auto text-[#8A8A8A] mb-3" />
          <h3 className="text-base font-bold text-white">No people tracked yet</h3>
          <p className="text-xs text-[#B3B3B3] mt-1 max-w-sm mx-auto">
            When you add an expense and include a person's name in the "Person Associated" field, they will automatically appear here.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="mt-4 px-4 py-2 bg-[#FF9248] hover:bg-[#F07F30] text-[#0F0F0F] text-xs font-bold rounded-xl shadow-sm shadow-[#FF9248]/25 transition cursor-pointer"
          >
            + Add Expense with Person
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <div
              key={person.name}
              onClick={() => setSelectedPerson(person.name)}
              className="bg-[#1F1F1F] rounded-3xl p-5 border border-[#333333] shadow-sm hover:border-[#493426] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2D211A] text-[#FF9248] border border-[#493426] flex items-center justify-center font-bold text-base shadow-xs">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#FF9248] transition-colors">
                        {person.name}
                      </h3>
                      <span className="text-[11px] text-[#8A8A8A]">
                        {person.count} {person.count === 1 ? 'transaction' : 'transactions'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:translate-x-1 group-hover:text-[#FF9248] transition" />
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-[#242424] border border-[#493426]">
                  <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block">
                    Total Associated
                  </span>
                  <span className="text-lg font-black text-[#FF9248]">
                    {formatCurrency(person.total)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#333333] flex items-center justify-between text-xs text-[#B3B3B3]">
                <span>Latest: {formatDate(person.expenses[0]?.date)}</span>
                <span className="font-semibold text-[#FF9248] group-hover:underline">
                  View History →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Transaction History Drawer / Modal */}
      {activePersonData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#1F1F1F] rounded-3xl shadow-2xl border border-[#333333] p-6 md:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#333333]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white font-black text-lg flex items-center justify-center shadow-md shadow-[#FF9248]/25">
                  {activePersonData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {activePersonData.name}
                  </h3>
                  <p className="text-xs text-[#B3B3B3]">
                    {activePersonData.count} transactions recorded
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPerson(null)}
                className="p-2 text-[#8A8A8A] hover:text-white rounded-xl hover:bg-[#242424] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#242424] border border-[#493426] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#B3B3B3] font-medium">Cumulative Total</span>
                <div className="text-xl font-black text-[#FF9248]">
                  {formatCurrency(activePersonData.total)}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPerson(null);
                  onOpenAddExpense();
                }}
                className="px-3.5 py-1.5 bg-[#FF9248] hover:bg-[#F07F30] text-[#0F0F0F] text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + Add Transaction
              </button>
            </div>

            {/* List of expenses for this person */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                Transaction History
              </h4>
              <div className="divide-y divide-[#333333]">
                {activePersonData.expenses.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {exp.expenseName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#B3B3B3] mt-0.5">
                        <span className="font-semibold text-[#B3B3B3]">
                          {exp.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(exp.date)}</span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-[#8A8A8A] italic mt-1">"{exp.description}"</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(exp.amount)}
                      </span>
                      <div className="mt-1">
                        <button
                          onClick={() => {
                            setSelectedPerson(null);
                            onEditExpense(exp);
                          }}
                          className="text-[11px] text-[#FF9248] hover:underline font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
