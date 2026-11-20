import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { NLP_TECHNIQUES } from '../data/nlpTechniques';
import type { TechniqueId } from '../types/nlp';

interface TechniquesSectionProps {
  onApplyTechnique: (techniqueId: TechniqueId) => void;
}

export const TechniquesSection: React.FC<TechniquesSectionProps> = ({
  onApplyTechnique,
}) => {
  const [selectedId, setSelectedId] = useState<string>(NLP_TECHNIQUES[0].id);

  const activeTech =
    NLP_TECHNIQUES.find((t) => t.id === selectedId) ?? NLP_TECHNIQUES[0];

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
          Explore the six foundational NLP techniques inside Dave Chalton’s practice, or apply one directly to your current check-in.
        </p>
      </div>

      {/* Interactive Modality Selector */}
      <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 sm:flex-wrap">
        {NLP_TECHNIQUES.map((tech, index) => {
          const isActive = tech.id === activeTech.id;
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => setSelectedId(tech.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
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
      <div className="mt-6 bg-white border border-[#E2E6E3] rounded-2xl p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
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

        <div className="lg:col-span-5 flex flex-col justify-between bg-[#F7F8F7] border border-[#E2E6E3] rounded-xl p-5 sm:p-6">
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

          <div className="pt-6 mt-6 border-t border-[#E2E6E3]">
            <button
              type="button"
              onClick={() => onApplyTechnique(activeTech.id)}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#165B52] text-white text-sm font-semibold hover:bg-[#0F463F] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply {activeTech.name}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
