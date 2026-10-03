import React from 'react';
import { LayoutDashboard, Receipt, HandCoins, PieChart, Users } from 'lucide-react';

interface BottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, navigate }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181818]/95 backdrop-blur-lg border-t border-[#333333] transition-colors"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            currentPath === '/dashboard'
              ? 'text-[#FF9248] font-bold'
              : 'text-[#8A8A8A] hover:text-[#B3B3B3]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Expenses */}
        <button
          onClick={() => navigate('/dashboard/expenses')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            currentPath === '/dashboard/expenses'
              ? 'text-[#FF9248] font-bold'
              : 'text-[#8A8A8A] hover:text-[#B3B3B3]'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Expenses</span>
        </button>

        {/* Loans */}
        <button
          onClick={() => navigate('/dashboard/loans')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            currentPath === '/dashboard/loans'
              ? 'text-[#FF9248] font-bold'
              : 'text-[#8A8A8A] hover:text-[#B3B3B3]'
          }`}
        >
          <HandCoins className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Loans</span>
        </button>

        {/* Summary */}
        <button
          onClick={() => navigate('/dashboard/monthly-summary')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            currentPath === '/dashboard/monthly-summary'
              ? 'text-[#FF9248] font-bold'
              : 'text-[#8A8A8A] hover:text-[#B3B3B3]'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Summary</span>
        </button>

        {/* People */}
        <button
          onClick={() => navigate('/dashboard/people')}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
            currentPath === '/dashboard/people' || currentPath === '/dashboard/settings'
              ? 'text-[#FF9248] font-bold'
              : 'text-[#8A8A8A] hover:text-[#B3B3B3]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">People</span>
        </button>
      </div>
    </nav>
  );
};
