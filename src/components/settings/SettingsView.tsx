import React from 'react';
import {
  User,
  Mail,
  Calendar,
  Smartphone,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useTheme, ThemeMode } from '../../hooks/useTheme';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const { isOnline } = useOnlineStatus();
  const { isInstalled } = usePWAInstall();
  const { theme, setTheme } = useTheme();

  const creationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Session';

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#1F1F1F] tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User profile, progressive web application configuration, and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1F1F1F] flex items-center gap-2">
          <User className="w-4 h-4 text-[#FF9248]" />
          <span>Account Profile</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-[#FF9248]/25">
            {user?.displayName
              ? user.displayName.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#1F1F1F]">
              {user?.displayName || 'Expense Tracker User'}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5 text-[#FF9248]" />
              <span>{user?.email || 'Authenticated User'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Account created: {creationDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PWA & System Health Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1F1F1F] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#FF9248]" />
          <span>Progressive Web App (PWA) & Offline Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Installation Status */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Installation State</span>
              <span className="text-sm font-bold text-[#1F1F1F] mt-0.5 block">
                {isInstalled ? 'Installed as Native PWA' : 'Running in Web Browser'}
              </span>
            </div>
            {isInstalled ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3EA] text-[#FF9248] text-xs font-bold border border-[#FFE3D0]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Installed</span>
              </div>
            ) : (
              <PWAInstallButton variant="navbar" />
            )}
          </div>

          {/* Network & Local Storage State */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Network Status</span>
              <span className="text-sm font-bold text-[#1F1F1F] mt-0.5 block">
                {isOnline ? 'Online & Synchronized' : 'Offline (Local Persistence Active)'}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isOnline
                  ? 'bg-[#FFF3EA] text-[#FF9248] border border-[#FFE3D0]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* PWA Promotion Card if not installed */}
        {!isInstalled && (
          <div className="mt-2">
            <PWAInstallButton variant="card" />
          </div>
        )}
      </div>

      {/* Theme Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1F1F1F] flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#FF9248]" />
          <span>Appearance & Theme</span>
        </h3>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as ThemeMode)}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition cursor-pointer ${
                  isSelected
                    ? 'border-[#FF9248] bg-[#FFF3EA] text-[#FF9248] shadow-xs'
                    : 'border-[#E5E5E5] bg-white text-slate-600 hover:bg-[#FFF9F5]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security & Persistence Info */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#1F1F1F] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FF9248]" />
          <span>Security & Data Architecture</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Current active session (UID:{' '}
          <code className="px-1.5 py-0.5 rounded-md bg-[#F5F5F5] text-[11px] font-mono text-[#FF9248]">
            {user?.uid.substring(0, 14)}...
          </code>
          ). Firebase Auth and Firestore functions have been prepared for your custom implementation.
        </p>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={signOutUser}
          className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Expense Tracker</span>
        </button>
      </div>
    </div>
  );
};
