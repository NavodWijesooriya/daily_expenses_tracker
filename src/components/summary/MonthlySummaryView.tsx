import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Home,
  Heart,
  Layers,
  Users,
  BarChart2,
  PieChart as PieIcon,
  ArrowUp,
  Percent,
  User as UserIcon,
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

interface MonthlySummaryViewProps {
  expenses: Expense[];
}

interface MonthlyStats {
  monthExpenses: Expense[];
  total: number;
  homeNeeds: number;
  wife: number;
  personal: number;
  other: number;
  categoryBreakdown: Record<string, number>;
  count: number;
  highest: number;
  highestExp: Expense | null;
  lowest: number;
  lowestExp: Expense | null;
  average: number;
  personTotal: number;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({ expenses }) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentDate.getFullYear()]);
    expenses.forEach((e) => {
      if (e.date) {
        const y = parseInt(e.date.split('-')[0], 10);
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses, currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Monthly stats calculation
  const monthlyStats: MonthlyStats = useMemo(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(monthPrefix));

    let total = 0;
    let homeNeeds = 0;
    let wife = 0;
    let personal = 0;
    let other = 0;
    const categoryBreakdown: Record<string, number> = {};
    let personTotal = 0;
    let highest = 0;
    let lowest = Infinity;
    let highestExp: Expense | null = null;
    let lowestExp: Expense | null = null;

    monthExpenses.forEach((exp) => {
      const amt = exp.amount || 0;
      total += amt;

      // Category breakdown
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + amt;
      if (exp.category === 'Home Needs') homeNeeds += amt;
      else if (exp.category === 'Wife' || exp.category === 'Wife Personal') wife += amt;
      else if (exp.category === 'Personal') personal += amt;
      else other += amt;

      // Person tracking
      if (exp.personName && exp.personName.trim()) {
        personTotal += amt;
      }

      // Min/Max
      if (amt > highest) {
        highest = amt;
        highestExp = exp;
      }
      if (amt < lowest) {
        lowest = amt;
        lowestExp = exp;
      }
    });

    const count = monthExpenses.length;
    const average = count > 0 ? total / count : 0;
    if (lowest === Infinity) lowest = 0;

    return {
      monthExpenses,
      total,
      homeNeeds,
      wife,
      personal,
      other,
      categoryBreakdown,
      count,
      highest,
      highestExp,
      lowest,
      lowestExp,
      average,
      personTotal,
    };
  }, [expenses, monthPrefix]);

  // Historical Monthly Spending Comparison (Last 6 months)
  const historicalMonths = useMemo(() => {
    const result: { label: string; key: string; total: number }[] = [];
    const dateCursor = new Date(selectedYear, selectedMonth - 1, 1);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateCursor.getFullYear(), dateCursor.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      const label = d.toLocaleString('en-US', { month: 'short' });

      const sum = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

      result.push({ label, key, total: sum });
    }

    return result;
  }, [expenses, selectedYear, selectedMonth]);

  const maxHistoryTotal = Math.max(...historicalMonths.map((m) => m.total), 1);

  // SVG Pie / Doughnut Chart Angles using consistent warm/orange-themed palette
  const doughnutSegments = useMemo(() => {
    const total = monthlyStats.total;
    if (total === 0) return [];

    const categories = [
      { name: 'Home Needs', value: monthlyStats.homeNeeds, color: '#FF9248' },
      { name: 'Wife', value: monthlyStats.wife, color: '#E26E1D' },
      { name: 'Personal', value: monthlyStats.personal, color: '#FFAE77' },
      { name: 'Other', value: monthlyStats.other, color: '#D86314' },
    ];

    let currentAngle = 0;
    return categories.map((cat) => {
      const percentage = (cat.value / total) * 100;
      const angle = (cat.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...cat,
        percentage,
        startAngle,
        angle,
      };
    });
  }, [monthlyStats]);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header and Month/Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F1F1F] tracking-tight">
            Monthly Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Spending performance, category breakdown, and historical comparison
          </p>
        </div>

        {/* Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] shadow-xs cursor-pointer"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#FF9248] shadow-xs cursor-pointer"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Expenses */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FF9248] via-[#FF8533] to-[#E26E1D] text-white shadow-lg shadow-[#FF9248]/20">
          <div className="flex items-center justify-between opacity-90 text-xs font-semibold">
            <span>Total Monthly Expenses</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatCurrency(monthlyStats.total)}
            </div>
            <p className="text-[11px] text-white/90 mt-1">
              {monthlyStats.count} {monthlyStats.count === 1 ? 'transaction' : 'transactions'} in{' '}
              {monthNames[selectedMonth - 1]} {selectedYear}
            </p>
          </div>
        </div>

        {/* Highest Expense */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Highest Expense</span>
            <div className="p-1.5 rounded-lg bg-[#FFF3EA] text-[#FF9248]">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-[#1F1F1F] tracking-tight">
              {formatCurrency(monthlyStats.highest)}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-1">
              {monthlyStats.highestExp ? monthlyStats.highestExp.expenseName : 'No expenses recorded'}
            </p>
          </div>
        </div>

        {/* Average Expense */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Expense</span>
            <div className="p-1.5 rounded-lg bg-[#FFF3EA] text-[#FF9248]">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-[#1F1F1F] tracking-tight">
              {formatCurrency(monthlyStats.average)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Per recorded transaction
            </p>
          </div>
        </div>

        {/* Money with People */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Money Given to People</span>
            <div className="p-1.5 rounded-lg bg-[#FFF3EA] text-[#FF9248]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-[#1F1F1F] tracking-tight">
              {formatCurrency(monthlyStats.personTotal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Associated with named contacts
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Home Needs */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]">Home Needs</span>
            </div>
            <span className="text-xs font-bold text-[#FF9248]">
              {monthlyStats.total > 0
                ? `${((monthlyStats.homeNeeds / monthlyStats.total) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <div className="mt-3 text-lg font-black text-[#1F1F1F]">
            {formatCurrency(monthlyStats.homeNeeds)}
          </div>
        </div>

        {/* Wife */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]">Wife</span>
            </div>
            <span className="text-xs font-bold text-[#FF9248]">
              {monthlyStats.total > 0
                ? `${((monthlyStats.wife / monthlyStats.total) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <div className="mt-3 text-lg font-black text-[#1F1F1F]">
            {formatCurrency(monthlyStats.wife)}
          </div>
        </div>

        {/* Personal */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]">Personal</span>
            </div>
            <span className="text-xs font-bold text-[#FF9248]">
              {monthlyStats.total > 0
                ? `${((monthlyStats.personal / monthlyStats.total) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <div className="mt-3 text-lg font-black text-[#1F1F1F]">
            {formatCurrency(monthlyStats.personal)}
          </div>
        </div>

        {/* Other */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#1F1F1F]">Other</span>
            </div>
            <span className="text-xs font-bold text-[#FF9248]">
              {monthlyStats.total > 0
                ? `${((monthlyStats.other / monthlyStats.total) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <div className="mt-3 text-lg font-black text-[#1F1F1F]">
            {formatCurrency(monthlyStats.other)}
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Historical Bar Chart + Category Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Monthly Comparison (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F1F1F]">
                Monthly Spending Comparison
              </h3>
            </div>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {historicalMonths.map((m) => {
              const heightPct = Math.max(10, Math.round((m.total / maxHistoryTotal) * 100));
              const isSelected = m.key === monthPrefix;

              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCompactCurrency(m.total)}
                  </div>
                  <div className="w-full max-w-[42px] bg-[#F5F5F5] rounded-2xl p-1 flex items-end h-full">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#FF9248] to-[#E26E1D] shadow-md shadow-[#FF9248]/25'
                          : 'bg-[#E5E5E5] hover:bg-[#FFAE77]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isSelected
                        ? 'text-[#FF9248]'
                        : 'text-slate-500'
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
            {historicalMonths.slice(-4).map((m) => (
              <div key={m.key} className="p-2 rounded-xl bg-[#F5F5F5]">
                <div className="text-[11px] text-slate-400">{m.label}</div>
                <div className="font-bold text-[#1F1F1F] mt-0.5">
                  {formatCompactCurrency(m.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share & Proportions (Doughnut / Pie Breakdown) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFF3EA] text-[#FF9248] rounded-xl">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F1F1F]">
                Category Spending Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Active Month</span>
          </div>

          {monthlyStats.total === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <PieIcon className="w-8 h-8 mb-2 stroke-[1.5] text-slate-300" />
              <span>No transactions recorded for this month</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
              {/* Responsive SVG Doughnut */}
              <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {doughnutSegments.map((seg, idx) => {
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((seg.startAngle / 360) * circumference);

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 ease-out"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-xs font-black text-[#1F1F1F]">
                    {formatCompactCurrency(monthlyStats.total)}
                  </span>
                </div>
              </div>

              {/* Legend & Details */}
              <div className="flex-1 w-full space-y-3 text-xs">
                {doughnutSegments.map((seg) => (
                  <div key={seg.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="font-semibold text-slate-800">{seg.name}</span>
                      </div>
                      <span className="font-bold text-[#1F1F1F]">
                        {formatCurrency(seg.value)} ({seg.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F5F5F5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
