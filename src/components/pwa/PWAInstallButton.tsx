import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'prominent' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm shadow-[#FF9248]/25 transition-all cursor-pointer ${className}`}
          title="Install Expense Tracker PWA"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#FF9248] hover:bg-[#F07F30] active:scale-[0.98] text-white text-sm font-bold rounded-2xl shadow-md shadow-[#FF9248]/25 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install Daily Expense Tracker</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`p-4 rounded-2xl bg-[#FFF9F5] border border-[#FFE3D0] ${className}`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#FFF3EA] text-[#FF9248] rounded-xl border border-[#FFE3D0]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#1F1F1F]">Install Expense Tracker</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Install the app for faster access, offline bookkeeping, and a native mobile experience.
              </p>
              <button
                onClick={handleInstallClick}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF9248] hover:bg-[#F07F30] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#FF9248]/25 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E5E5E5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF9248] flex items-center justify-center text-white font-bold text-sm">
                  ET
                </div>
                <h3 className="font-bold text-[#1F1F1F] text-base">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-[#1F1F1F] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FFF9F5] border border-[#FFE3D0]">
                <div className="p-2 bg-white rounded-lg text-[#FF9248] shadow-xs">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[#1F1F1F]">Step 1: Tap Share</strong>
                  Tap the standard Share icon in the Safari navigation bar at the bottom.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FFF9F5] border border-[#FFE3D0]">
                <div className="p-2 bg-white rounded-lg text-[#FF9248] shadow-xs">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[#1F1F1F]">Step 2: Add to Home Screen</strong>
                  Scroll down the menu list and select <strong>"Add to Home Screen"</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-[#FF9248] hover:bg-[#F07F30] text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
