import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { NLP_TECHNIQUES } from '../data/nlpTechniques';
import type { TechniqueId } from '../types/nlp';

interface TechniquesSectionProps {
  onApplyTechnique: (techniqueId: TechniqueId) => void;
}

export const TechniquesSection: React.FC<TechniquesSectionProps> = ({
  onApplyTechnique,
}) => {
  const [selectedId, setSelectedId] = useState<string>(NLP_TECHNIQUES[0].id);
  const [practiceStepIdx, setPracticeStepIdx] = useState<number>(0);
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const activeTech =
    NLP_TECHNIQUES.find((t) => t.id === selectedId) ?? NLP_TECHNIQUES[0];

  useEffect(() => {
    setPracticeStepIdx(0);
    setPracticeCompleted(false);
    setIsTimerRunning(false);
    setTimerSeconds(20);
  }, [selectedId]);

  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerSeconds <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTimerRunning, timerSeconds]);

  const handleStepSelect = (nextIdx: number) => {
    const clamped = Math.max(0, Math.min(activeTech.stepsPreview.length - 1, nextIdx));
    setPracticeStepIdx(clamped);
    setIsTimerRunning(false);
    setTimerSeconds(20);
  };

  return (
    <section
      id="techniques"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 border-t border-[#E2E6E3]"
    >
      <div className="max-w-2xl">
        <p className="text-xs sm:text-sm font-medium text-[#165B52]">
          Core Neuro-Linguistic Programming Toolkit
        </p>
        <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-normal text-[#131B19]">
          Practical methods built for real workday pressures.
        </h2>
        <p className="mt-3 text-[15px] sm:text-base text-[#4D5C58] leading-relaxed">
          Explore and practice the six foundational NLP techniques inside Dave Chalton’s approach—available offline anytime or applied directly to your check-in.
        </p>
      </div>

      {/* Interactive Modality Selector — 1 column stacked on phones, wrapped row on larger screens */}
      <div className="mt-7 grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2">
        {NLP_TECHNIQUES.map((tech, index) => {
          const isActive = tech.id === activeTech.id;
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => setSelectedId(tech.id)}
              className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-left sm:text-center transition-colors whitespace-normal sm:whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#165B52] text-white border-[#165B52]'
                  : 'bg-white text-[#4D5C58] border-[#E2E6E3] hover:text-[#131B19] hover:border-[#C7D0CC]'
              }`}
            >
              <span className="font-mono text-xs mr-1.5 opacity-75 tabular-nums">
                0{index + 1}.
              </span>
              {tech.name}
            </button>
          );
        })}
      </div>

      {/* Selected Technique Detail Panel */}
      <div className="mt-6 bg-white border border-[#E2E6E3] rounded-2xl p-4 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#4D5C58]">
            <span className="font-mono text-[#165B52] font-medium tabular-nums">
              {activeTech.duration}
            </span>
            <span aria-hidden="true">·</span>
            <span>Best for: {activeTech.bestFor}</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#131B19]">
            {activeTech.name}
          </h3>

          <p className="text-[15px] sm:text-base text-[#131B19] leading-relaxed">
            {activeTech.summary}
          </p>

          <div className="pt-2 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-[#4D5C58]">
                How the Mechanism Works
              </h4>
              <p className="mt-1 text-sm text-[#4D5C58] leading-relaxed">
                {activeTech.mechanism}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#4D5C58]">
                Workplace Application
              </h4>
              <p className="mt-1 text-sm text-[#131B19] leading-relaxed">
                {activeTech.workplaceExample}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0 flex flex-col justify-between bg-[#F7F8F7] border border-[#E2E6E3] rounded-xl p-4 sm:p-6">
          {!isPracticing ? (
            <div>
              <h4 className="text-xs font-semibold text-[#165B52]">
                Typical Sequence
              </h4>
              <ol className="mt-4 space-y-3.5 text-sm text-[#131B19] leading-relaxed">
                {activeTech.stepsPreview.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs text-[#165B52] pt-0.5 tabular-nums">
                      0{i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="bg-[#142420] text-[#F7F8F7] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#9CC7BF] tabular-nums">
                  Step {practiceStepIdx + 1} of {activeTech.stepsPreview.length}
                </span>
                {practiceCompleted && (
                  <span className="text-xs text-[#9CC7BF] inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>

              <p className="text-base leading-relaxed text-white">
                {activeTech.stepsPreview[practiceStepIdx]}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((r) => !r)}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'Pause' : '20s Pause'}</span>
                  <span className="font-mono tabular-nums text-[#9CC7BF]">
                    00:{String(timerSeconds).padStart(2, '0')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(20);
                  }}
                  aria-label="Reset practice timer"
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white/5 hover:bg-white/15 text-white/80 flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                <button
                  type="button"
                  disabled={practiceStepIdx === 0}
                  onClick={() => handleStepSelect(practiceStepIdx - 1)}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-white/20 text-xs font-medium text-white disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                {practiceStepIdx < activeTech.stepsPreview.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleStepSelect(practiceStepIdx + 1)}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[#9CC7BF] text-[#131B19] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPracticeCompleted(true)}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-[#9CC7BF] text-[#131B19] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Finish</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-[#E2E6E3] space-y-2.5">
            <button
              type="button"
              onClick={() => setIsPracticing((p) => !p)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#D4DBD7] bg-white text-[#131B19] text-sm font-medium hover:bg-[#F1F4F2] transition-colors cursor-pointer"
            >
              {isPracticing ? 'Show Summary Steps' : 'Practice Step-by-Step Offline'}
            </button>

            <button
              type="button"
              onClick={() => onApplyTechnique(activeTech.id)}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#165B52] text-white text-sm font-semibold hover:bg-[#0F463F] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply to Personalized Check-In</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
