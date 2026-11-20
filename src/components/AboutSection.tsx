import React from 'react';
import { ResilientImage } from './ResilientImage';
import { PWAInstallButton } from './PWAInstallButton';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 border-t border-[#E2E6E3]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Practitioner Portrait */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-[#E2E6E3] bg-white">
          <ResilientImage
            src="/src/assets/images/dave_chalton_portrait_1795195141834.jpg"
            alt="Dave Chalton, NLP Therapist and Coach, seated in a naturally lit consultation studio"
            fallbackTitle="Dave Chalton — NLP Therapies"
            loading="lazy"
            className="w-full h-80 lg:h-full object-cover object-top"
          />
        </div>

        {/* Practice Philosophy & Android Companion */}
        <div className="lg:col-span-8 bg-white border border-[#E2E6E3] rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#165B52]">
              About the Practice · Dave Chalton
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#131B19]">
              Grounded Neuro-Linguistic Programming for modern working life.
            </h2>
            <p className="text-[15px] sm:text-base text-[#4D5C58] leading-relaxed">
              NLP Therapies Dave Chalton translates practical Neuro-Linguistic Programming—how language, internal imagery, and somatic posture shape your emotional state—into clear, repeatable exercises you can use on your phone between meetings, on a train, or at the end of a demanding day.
            </p>
            <p className="text-[15px] sm:text-base text-[#4D5C58] leading-relaxed">
              Rather than offering vague platitudes, each check-in pinpoints the sensory structure behind what you are experiencing right now and walks you through a concrete shift in perspective, physiology, or internal dialogue.
            </p>
          </div>

          {/* Android App Install & Mindful Visual */}
          <div className="pt-6 border-t border-[#E2E6E3] grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 rounded-xl overflow-hidden border border-[#E2E6E3] h-40">
              <ResilientImage
                src="/src/assets/images/nlp_mindful_still_life_1795195140689.jpg"
                alt="Therapy journal, fountain pen, and river stones on an oak table"
                fallbackTitle="Reflective Practice"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="sm:col-span-7 space-y-3">
              <h3 className="font-serif text-xl font-medium text-[#131B19]">
                Keep it on your Android home screen
              </h3>
              <p className="text-sm text-[#4D5C58] leading-relaxed">
                Install NLP Therapies Dave Chalton as a standalone mobile app for instant thumb-friendly access, offline journal review, and quiet guided resets anywhere.
              </p>
              <div className="pt-1">
                <PWAInstallButton variant="primary" label="Install Android App" />
              </div>
            </div>
          </div>

          {/* Ethical Scope Notice */}
          <p className="text-xs text-[#4D5C58] leading-relaxed pt-2 border-t border-[#E2E6E3]">
            Clinical & Ethical Note: This app provides structured Neuro-Linguistic Programming coaching and self-regulation guidance. It is not a substitute for emergency medical services, psychiatric diagnosis, or crisis intervention.
          </p>
        </div>
      </div>
    </section>
  );
};
