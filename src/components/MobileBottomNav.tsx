import React from 'react';
import { BookOpen, Compass, MessageSquareHeart, UserCheck } from 'lucide-react';

export type MobileSectionId = 'consultation' | 'techniques' | 'journal' | 'about';

interface MobileBottomNavProps {
  activeSection: MobileSectionId;
  onNavigate: (section: MobileSectionId) => void;
  journalCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigate,
  journalCount,
}) => {
  const items: Array<{
    id: MobileSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }> = [
    { id: 'consultation', label: 'Check-In', icon: MessageSquareHeart },
    { id: 'techniques', label: 'Techniques', icon: Compass },
    { id: 'journal', label: journalCount > 0 ? `Journal (${journalCount})` : 'Journal', icon: BookOpen },
    { id: 'about', label: 'Practice', icon: UserCheck },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E6E3]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-4 h-16 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[44px] h-full flex flex-col items-center justify-center px-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#165B52]' : 'text-[#4D5C58] hover:text-[#131B19]'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[11px] font-medium tracking-tight mt-0.5 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
