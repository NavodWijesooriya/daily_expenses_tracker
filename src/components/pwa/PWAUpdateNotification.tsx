import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdateNotification: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 p-4 rounded-3xl bg-white text-[#1F1F1F] shadow-2xl border border-[#E5E5E5] backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#FFF3EA] text-[#FF9248] rounded-xl border border-[#FFE3D0]">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#1F1F1F]">New version available</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            An update is ready with improvements.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 py-2 px-3 bg-[#FF9248] hover:bg-[#F07F30] active:scale-95 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer"
        >
          Refresh to update
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="py-2 px-3 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-xs font-semibold text-slate-600 rounded-xl transition cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
