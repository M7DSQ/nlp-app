import { useEffect, useRef, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { ConsultationStudio } from './components/ConsultationStudio';
import { Header } from './components/Header';
import {
  MobileBottomNav,
  type MobileSectionId,
} from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SessionJournal } from './components/SessionJournal';
import { TechniquesSection } from './components/TechniquesSection';
import type { JournalEntry, TechniqueId } from './types/nlp';

const STORAGE_KEY = 'nlp-therapies-dave-chalton-journal-v1';

function loadSavedEntries(): JournalEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadSavedEntries());
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueId>('auto');
  const [activeMobileSection, setActiveMobileSection] =
    useState<MobileSectionId>('consultation');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Storage quota or restricted browsing mode
    }
  }, [entries]);

  // Track visible section for Android bottom navigation active state
  useEffect(() => {
    const sectionIds: MobileSectionId[] = [
      'consultation',
      'techniques',
      'about',
      'journal',
    ];
    const observer = new IntersectionObserver(
      (observed) => {
        for (const item of observed) {
          if (item.isIntersecting) {
            setActiveMobileSection(item.target.id as MobileSectionId);
          }
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0 },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const activeEntry =
    entries.find((item) => item.id === activeEntryId) ?? null;

  const focusCheckIn = () => {
    const el = document.getElementById('consultation');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveMobileSection('consultation');
    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 350);
  };

  const handleNavigateMobile = (section: MobileSectionId) => {
    setActiveMobileSection(section);
    const el = document.getElementById(section);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCreateEntry = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setActiveEntryId(entry.id);
  };

  const handleUpdateEntry = (updated: JournalEntry) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (activeEntryId === id) {
      setActiveEntryId(null);
    }
  };

  const handleClearAll = () => {
    setEntries([]);
    setActiveEntryId(null);
  };

  const handleApplyTechnique = (techniqueId: TechniqueId) => {
    setSelectedTechnique(techniqueId);
    focusCheckIn();
  };

  const handleOpenEntry = (entry: JournalEntry) => {
    setActiveEntryId(entry.id);
    const el = document.getElementById('consultation');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveMobileSection('consultation');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F7F8F7] text-[#131B19]">
      <OfflineIndicator />
      <Header onStartCheckIn={focusCheckIn} />

      <main className="flex-1">
        <ConsultationStudio
          selectedTechnique={selectedTechnique}
          onSelectTechnique={setSelectedTechnique}
          activeEntry={activeEntry}
          onCreateEntry={handleCreateEntry}
          onUpdateEntry={handleUpdateEntry}
          textareaRef={textareaRef}
        />

        <TechniquesSection onApplyTechnique={handleApplyTechnique} />

        <AboutSection />

        <SessionJournal
          entries={entries}
          activeEntryId={activeEntryId}
          onOpenEntry={handleOpenEntry}
          onDeleteEntry={handleDeleteEntry}
          onClearAll={handleClearAll}
          onStartNew={focusCheckIn}
        />
      </main>

      <footer className="border-t border-[#E2E6E3] bg-white pb-24 md:pb-10 pt-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-serif text-lg font-medium text-[#131B19]">
              NLP Therapies Dave Chalton
            </p>
            <p className="text-xs text-[#4D5C58]">
              Neuro-Linguistic Programming coaching and state regulation for modern professionals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#4D5C58]">
            <a href="#consultation" className="hover:text-[#131B19] whitespace-nowrap">
              Check-In
            </a>
            <a href="#techniques" className="hover:text-[#131B19] whitespace-nowrap">
              NLP Techniques
            </a>
            <a href="#about" className="hover:text-[#131B19] whitespace-nowrap">
              Dave Chalton
            </a>
            <a href="#journal" className="hover:text-[#131B19] whitespace-nowrap">
              Journal
            </a>
          </div>
        </div>
      </footer>

      <MobileBottomNav
        activeSection={activeMobileSection}
        onNavigate={handleNavigateMobile}
        journalCount={entries.length}
      />
    </div>
  );
}
