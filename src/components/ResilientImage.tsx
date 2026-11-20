import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'eager',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EAEFEA] via-[#DDE6E2] to-[#CBD8D3] text-[#165B52] p-6 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-full border border-[#165B52]/25 flex items-center justify-center mb-3 bg-white/60">
          <Compass className="w-6 h-6 text-[#165B52]" strokeWidth={1.6} />
        </div>
        {fallbackTitle && (
          <p className="font-serif text-base font-medium text-[#131B19]">{fallbackTitle}</p>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
