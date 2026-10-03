import React from 'react';
import {
  User,
  Mail,
  Calendar,
  Smartphone,
  Wifi,
  WifiOff,
  Moon,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const { isOnline } = useOnlineStatus();
  const { isInstalled } = usePWAInstall();
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
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-xs text-[#B3B3B3] mt-0.5">
          User profile, progressive web application configuration, and preferences
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
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
            <h4 className="text-base font-bold text-white">
              {user?.displayName || 'Expense Tracker User'}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-[#B3B3B3]">
              <Mail className="w-3.5 h-3.5 text-[#FF9248]" />
              <span>{user?.email || 'Authenticated User'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Account created: {creationDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PWA & System Health Card */}
      <div className="bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#FF9248]" />
          <span>Progressive Web App (PWA) & Offline Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Installation Status */}
          <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-[#333333] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8A8A8A] font-semibold block">Installation State</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {isInstalled ? 'Installed as Native PWA' : 'Running in Web Browser'}
              </span>
            </div>
            {isInstalled ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2D211A] text-[#FF9248] text-xs font-bold border border-[#493426]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Installed</span>
              </div>
            ) : (
              <PWAInstallButton variant="navbar" />
            )}
          </div>

          {/* Network & Local Storage State */}
          <div className="p-4 rounded-2xl bg-[#1F1F1F] border border-[#333333] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8A8A8A] font-semibold block">Network Status</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {isOnline ? 'Online & Synchronized' : 'Offline (Local Persistence Active)'}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isOnline
                  ? 'bg-[#2D211A] text-[#FF9248] border border-[#493426]'
                  : 'bg-[#332A17] text-amber-300'
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
      <div className="bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#FF9248]" />
          <span>Appearance & Theme</span>
        </h3>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#242424] border border-[#333333]">
          <div className="p-2 rounded-xl bg-[#2D211A] text-[#FF9248]">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Dark theme enabled</p>
            <p className="text-xs text-[#B3B3B3] mt-0.5">
              The orange and dark appearance is used throughout the app.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Persistence Info */}
      <div className="bg-[#1F1F1F] rounded-3xl p-6 border border-[#333333] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FF9248]" />
          <span>Security & Data Architecture</span>
        </h3>
        <p className="text-xs text-[#B3B3B3] leading-relaxed">
          Current active session (UID:{' '}
          <code className="px-1.5 py-0.5 rounded-md bg-[#242424] text-[11px] font-mono text-[#FF9248]">
            {user?.uid.substring(0, 14)}...
          </code>
          ). Firebase Auth and Firestore functions have been prepared for your custom implementation.
        </p>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={signOutUser}
          className="w-full py-3.5 px-4 bg-[#2A171A] hover:bg-[#351A1F] border border-[#54252D] text-rose-300 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Expense Tracker</span>
        </button>
      </div>
    </div>
  );
};
