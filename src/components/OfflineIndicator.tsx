import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      className="bg-[#142420] text-[#F7F8F7] px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 border-b border-white/10"
    >
      <WifiOff className="w-4 h-4 text-[#D9A441] shrink-0" />
      <span>
        Offline mode — saved Session Journal entries and NLP technique guides remain available. Reconnect to generate new tailored sessions.
      </span>
    </div>
  );
};
