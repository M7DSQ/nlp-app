import React, { useMemo, useState } from 'react';
import { Check, Copy, Search, Trash2 } from 'lucide-react';
import type { JournalEntry } from '../types/nlp';

interface SessionJournalProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onOpenEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  onStartNew: () => void;
}

export const SessionJournal: React.FC<SessionJournalProps> = ({
  entries,
  activeEntryId,
  onOpenEntry,
  onDeleteEntry,
  onClearAll,
  onStartNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.feelingText.toLowerCase().includes(q) ||
        entry.contextArea.toLowerCase().includes(q) ||
        entry.response.recommendedTechnique.title.toLowerCase().includes(q) ||
        entry.response.reframeStatement.toLowerCase().includes(q),
    );
  }, [entries, searchQuery]);

  const handleCopySummary = async (entry: JournalEntry) => {
    const summary = [
      `NLP Therapies Dave Chalton — Session Summary`,
      `Date: ${new Date(entry.createdAt).toLocaleString()}`,
      `Context: ${entry.contextArea}`,
      `Intensity: ${entry.intensityBefore}/10${
        entry.intensityAfter !== null ? ` -> ${entry.intensityAfter}/10` : ''
      }`,
      `Technique: ${entry.response.recommendedTechnique.title}`,
      `Check-In: ${entry.feelingText}`,
      `Reframe: "${entry.response.reframeStatement}"`,
      `Anchor Cue: ${entry.response.anchorCue}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <section
      id="journal"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 border-t border-[#E2E6E3]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#165B52]">
            On-Device Reflective Log
          </p>
          <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-normal text-[#131B19]">
            Personal Session Journal
          </h2>
          <p className="mt-1.5 text-sm text-[#4D5C58]">
            Stored privately in your browser so you can revisit reframes, anchors, and intensity shifts offline.
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-medium hover:bg-[#991B1B] cursor-pointer whitespace-nowrap"
                >
                  Confirm Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D4DBD7] bg-white text-xs font-medium text-[#4D5C58] hover:text-[#131B19] cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D4DBD7] bg-white text-xs font-medium text-[#4D5C58] hover:text-[#B91C1C] transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear Journal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="mt-6 bg-white border border-[#E2E6E3] rounded-2xl p-8 text-center">
          <p className="font-serif text-xl text-[#131B19]">
            No check-ins recorded yet
          </p>
          <p className="mt-2 text-sm text-[#4D5C58] max-w-md mx-auto">
            Your completed NLP consultations, reframes, and before-and-after intensity shifts will appear here automatically for quick offline review.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#165B52] text-white text-sm font-medium hover:bg-[#0F463F] transition-colors cursor-pointer"
          >
            Log First Check-In
          </button>
        </div>
      ) : (
        <>
          {/* Live Search Bar */}
          <div className="mt-6 relative max-w-md">
            <Search className="w-4 h-4 text-[#4D5C58] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past check-ins, techniques, or reframes..."
              aria-label="Search session journal"
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D4DBD7] bg-white text-sm text-[#131B19] placeholder:text-[#788782] focus:border-[#165B52] focus:outline-none"
            />
          </div>

          {/* Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="mt-6 bg-white border border-[#E2E6E3] rounded-xl p-6 text-sm text-[#4D5C58]">
              No saved sessions match “{searchQuery}”.
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#E2E6E3] bg-white border border-[#E2E6E3] rounded-2xl overflow-hidden">
              {filteredEntries.map((entry) => {
                const isCurrent = entry.id === activeEntryId;
                const formattedDate = new Date(entry.createdAt).toLocaleDateString(
                  undefined,
                  { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                );

                return (
                  <div
                    key={entry.id}
                    className={`p-5 sm:p-6 transition-colors ${
                      isCurrent ? 'bg-[#F1F4F2]/70' : 'hover:bg-[#F7F8F7]/60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#4D5C58]">
                          <span className="font-mono tabular-nums">{formattedDate}</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.contextArea}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-[#165B52] font-medium">
                            {entry.intensityAfter !== null
                              ? `Intensity ${entry.intensityBefore}/10 → ${entry.intensityAfter}/10`
                              : `Intensity ${entry.intensityBefore}/10`}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-medium text-[#131B19]">
                          {entry.response.recommendedTechnique.title}
                        </h3>

                        <p className="text-sm text-[#4D5C58] line-clamp-2">
                          {entry.feelingText}
                        </p>

                        <p className="text-xs text-[#131B19] pt-0.5">
                          Reframe: “{entry.response.reframeStatement}”
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenEntry(entry)}
                          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D4DBD7] bg-white text-xs sm:text-sm font-medium text-[#131B19] hover:bg-[#F1F4F2] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isCurrent ? 'Viewing Now' : 'Reopen'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySummary(entry)}
                          aria-label="Copy session summary"
                          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[#D4DBD7] bg-white text-[#4D5C58] hover:text-[#131B19] hover:bg-[#F1F4F2] transition-colors inline-flex items-center justify-center cursor-pointer"
                        >
                          {copiedId === entry.id ? (
                            <Check className="w-4 h-4 text-[#165B52]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          aria-label="Delete session entry"
                          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[#D4DBD7] bg-white text-[#4D5C58] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};
