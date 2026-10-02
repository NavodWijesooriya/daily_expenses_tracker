import React from 'react';
import { WifiOff, Wifi, CloudUpload } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface OfflineBannerProps {
  hasPendingWrites?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ hasPendingWrites }) => {
  const { isOnline, showReconnected } = useOnlineStatus();

  if (showReconnected) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-[#FF9248] text-white text-xs font-semibold rounded-full shadow-lg shadow-[#FF9248]/30 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
        <Wifi className="w-4 h-4 animate-bounce" />
        <span>Back online — All data synced</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] text-white text-xs font-semibold rounded-full shadow-lg shadow-black/30 transition-all duration-300 animate-in fade-in slide-in-from-top-4 border border-[#FF9248]">
        <WifiOff className="w-4 h-4 text-[#FF9248]" />
        <span>You are currently offline — Cached data enabled</span>
        {hasPendingWrites && (
          <span className="flex items-center gap-1 bg-[#FF9248] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CloudUpload className="w-3 h-3 animate-pulse" />
            Waiting for connection
          </span>
        )}
      </div>
    );
  }

  if (hasPendingWrites) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-[#FF9248] text-white text-xs font-medium rounded-full shadow-lg shadow-[#FF9248]/30 transition-all duration-300">
        <CloudUpload className="w-4 h-4 animate-spin" />
        <span>Saving changes...</span>
      </div>
    );
  }

  return null;
};
