import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onStartCheckIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartCheckIn }) => {
  return (
    <header className="bg-[#F7F8F7]/95 backdrop-blur-md border-b border-[#E2E6E3] md:sticky md:top-0 md:z-30">
      {/* Desktop Top Bar: strictly 3 zones separated by gap-8 */}
      <div className="hidden md:flex max-w-7xl mx-auto items-center justify-between gap-8 px-6 lg:px-10 h-16">
        <a
          href="#consultation"
          className="font-serif text-lg lg:text-xl font-medium tracking-tight text-[#131B19] whitespace-nowrap shrink-0"
        >
          NLP Therapies Dave Chalton
        </a>

        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-7 text-sm font-medium text-[#4D5C58]"
        >
          <a
            href="#consultation"
            className="hover:text-[#131B19] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Check-In
          </a>
          <a
            href="#techniques"
            className="hover:text-[#131B19] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            NLP Techniques
          </a>
          <a
            href="#about"
            className="hover:text-[#131B19] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Dave Chalton
          </a>
          <a
            href="#journal"
            className="hover:text-[#131B19] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Journal
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onStartCheckIn}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#165B52] text-white text-sm font-medium hover:bg-[#0F463F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Check-In
          </button>
        </div>
      </div>

      {/* Mobile Android Top App Bar (non-sticky to preserve >=85% scroll viewport) */}
      <div className="flex md:hidden items-center justify-between gap-3 px-4 h-14">
        <a
          href="#consultation"
          className="font-serif text-base font-medium tracking-tight text-[#131B19] truncate"
        >
          NLP Therapies Dave Chalton
        </a>
        <div className="shrink-0">
          <PWAInstallButton variant="subtle" label="Install App" />
        </div>
      </div>
    </header>
  );
};
