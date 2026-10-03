import React from 'react';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PieChart,
  Users,
  Settings,
  Wifi,
  WifiOff,
  LogOut,
  Plus,
  HandCoins,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenAddExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenAddExpense }) => {
  const { user, signOutUser } = useAuth();
  const { isOnline } = useOnlineStatus();
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
    { path: '/dashboard/loans', label: 'Money Given to People', icon: HandCoins },
    { path: '/dashboard/monthly-summary', label: 'Summary', icon: PieChart },
    { path: '/dashboard/people', label: 'People', icon: Users },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#333333] bg-[#181818]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] flex items-center justify-center text-white shadow-md shadow-[#FF9248]/25 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-left hidden xs:block">
              <span className="text-base font-black tracking-tight text-white leading-none block">
                Daily Expense
              </span>
              <span className="text-[11px] font-bold text-[#FF9248] tracking-wider uppercase">
                PWA Tracker
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2D211A] text-[#FF9248] font-bold'
                      : 'text-[#B3B3B3] hover:text-white hover:bg-[#242424]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span
                    className={
                      link.path === '/dashboard/loans'
                        ? 'max-w-[80px] text-[10px] leading-tight'
                        : ''
                    }
                  >
                    {link.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2.5">
          {/* Quick Add Expense Button (Desktop) */}
          <button
            onClick={onOpenAddExpense}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-[#0F0F0F] text-xs font-bold rounded-xl shadow-md shadow-[#FF9248]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Online / Offline status badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              isOnline
                ? 'bg-[#2D211A] text-[#FF9248] border border-[#493426]'
                : 'bg-[#2B2415] text-amber-300 border border-[#5A451B]'
            }`}
            title={isOnline ? 'Connected to internet' : 'Working offline with local cache'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9248] animate-pulse" />
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* User profile / Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-1 border-l border-[#333333]">
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="flex items-center gap-2 group focus:outline-none cursor-pointer"
                title={user.email || 'Settings'}
              >
                <div className="w-8 h-8 rounded-full bg-[#2D211A] text-[#FF9248] font-bold text-xs flex items-center justify-center border border-[#493426] group-hover:ring-2 ring-[#FF9248] transition">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              <button
                onClick={signOutUser}
                className="p-1.5 text-[#8A8A8A] hover:text-rose-300 rounded-lg hover:bg-[#242424] transition hidden sm:block cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
