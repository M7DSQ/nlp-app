import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  NLP_TECHNIQUES,
  PROFESSIONAL_CONTEXTS,
  QUICK_CHECKIN_SCENARIOS,
} from '../data/nlpTechniques';
import type {
  FollowUpMessage,
  JournalEntry,
  NLPSessionResponse,
  TechniqueId,
} from '../types/nlp';
import { Capacitor } from '@capacitor/core';
import { ResilientImage } from './ResilientImage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { buildOfflineNlpProtocol } from '../utils/offlineNlpProtocol';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

interface ConsultationStudioProps {
  selectedTechnique: TechniqueId;
  onSelectTechnique: (tech: TechniqueId) => void;
  activeEntry: JournalEntry | null;
  onCreateEntry: (entry: JournalEntry) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const INTENSITY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const ConsultationStudio: React.FC<ConsultationStudioProps> = ({
  selectedTechnique,
  onSelectTechnique,
  activeEntry,
  onCreateEntry,
  onUpdateEntry,
  textareaRef,
}) => {
  const isOnline = useOnlineStatus();
  const [contextArea, setContextArea] = useState<string>(PROFESSIONAL_CONTEXTS[0]);
  const [feelingText, setFeelingText] = useState<string>('');
  const [intensityBefore, setIntensityBefore] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intervention interactive state
  const [viewMode, setViewMode] = useState<'guided' | 'overview'>('guided');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [completedWalkthrough, setCompletedWalkthrough] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Follow-up conversation state
  const [followUpInput, setFollowUpInput] = useState<string>('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState<boolean>(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  const interventionRef = useRef<HTMLDivElement | null>(null);

  // Reset walkthrough step & timer whenever activeEntry changes
  useEffect(() => {
    if (activeEntry) {
      setCurrentStepIdx(0);
      setCompletedWalkthrough(false);
      setIsTimerRunning(false);
      const firstSeconds = activeEntry.response.guidedSteps[0]?.breathSeconds ?? 20;
      setTimerSecondsLeft(firstSeconds);
    }
  }, [activeEntry?.id]);

  // Countdown timer for active guided step
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerSecondsLeft <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTimerRunning, timerSecondsLeft]);

  const handleSelectScenario = (scenario: (typeof QUICK_CHECKIN_SCENARIOS)[number]) => {
    setContextArea(scenario.contextArea);
    setFeelingText(scenario.prompt);
    setIntensityBefore(scenario.defaultIntensity);
    setErrorMessage(null);
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = feelingText.trim();
    if (trimmed.length < 4) {
      setErrorMessage('Please describe how you feel or what challenge is on your mind right now.');
      textareaRef.current?.focus();
      return;
    }

    if (!isOnline) {
      setErrorMessage(
        'You appear to be offline. Reconnect for live AI coaching, or start an offline on-device NLP protocol below.',
      );
      return;
    }

    if (Capacitor.isNativePlatform() && !API_BASE) {
      setErrorMessage(
        'Live cloud AI coaching is not connected in this APK yet (VITE_API_BASE_URL is not set). You can still run an offline on-device NLP protocol right now.',
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/nlp/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feelingText: trimmed,
          intensityBefore,
          preferredTechnique: selectedTechnique,
          contextArea,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (res.status === 404) {
          throw new Error(
            'Backend endpoint returned 404 (not found). Make sure the deployed Cloud Run URL in VITE_API_BASE_URL is live and updated.',
          );
        }
        if (res.redirected || res.url.includes('accounts.google.com') || res.status === 401 || res.status === 403) {
          throw new Error(
            'Backend URL requires Google authentication (use a public Cloud Run Deploy URL rather than a private dev/preview URL).',
          );
        }
        throw new Error(
          `NLP guidance service returned an unexpected response (HTTP ${res.status}). Check your connection or backend URL.`,
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate your NLP guidance right now.');
      }

      const newEntry: JournalEntry = {
        id: `nlp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        contextArea,
        feelingText: trimmed,
        intensityBefore,
        intensityAfter: null,
        response: data as NLPSessionResponse,
        followUps: [],
      };

      onCreateEntry(newEntry);
      setViewMode('guided');
      window.setTimeout(() => {
        interventionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseOfflineProtocol = () => {
    const trimmed = feelingText.trim();
    if (trimmed.length < 4) {
      setErrorMessage('Please describe how you feel or what challenge is on your mind right now.');
      textareaRef.current?.focus();
      return;
    }

    const offlineResponse = buildOfflineNlpProtocol({
      feelingText: trimmed,
      intensityBefore,
      preferredTechnique: selectedTechnique,
      contextArea,
    });

    const newEntry: JournalEntry = {
      id: `nlp-offline-${Date.now()}`,
      createdAt: new Date().toISOString(),
      contextArea,
      feelingText: trimmed,
      intensityBefore,
      intensityAfter: null,
      response: offlineResponse,
      followUps: [],
    };

    setErrorMessage(null);
    onCreateEntry(newEntry);
    setViewMode('guided');
    window.setTimeout(() => {
      interventionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStepChange = (nextIdx: number) => {
    if (!activeEntry) return;
    const steps = activeEntry.response.guidedSteps;
    const clamped = Math.max(0, Math.min(steps.length - 1, nextIdx));
    setCurrentStepIdx(clamped);
    setIsTimerRunning(false);
    setTimerSecondsLeft(steps[clamped]?.breathSeconds ?? 20);
  };

  const handleSetIntensityAfter = (score: number) => {
    if (!activeEntry) return;
    onUpdateEntry({
      ...activeEntry,
      intensityAfter: score,
    });
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntry) return;
    const trimmed = followUpInput.trim();
    if (!trimmed) return;

    if (!isOnline) {
      setFollowUpError('You are offline. Reconnect to continue the live NLP conversation.');
      return;
    }

    if (Capacitor.isNativePlatform() && !API_BASE) {
      setFollowUpError(
        'Live follow-up coaching requires a deployed backend URL (VITE_API_BASE_URL).',
      );
      return;
    }

    const userMsg: FollowUpMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedWithUser: JournalEntry = {
      ...activeEntry,
      followUps: [...activeEntry.followUps, userMsg],
    };
    onUpdateEntry(updatedWithUser);
    setFollowUpInput('');
    setIsFollowUpLoading(true);
    setFollowUpError(null);

    try {
      const res = await fetch(`${API_BASE}/api/nlp/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionContext: {
            feelingText: activeEntry.feelingText,
            recommendedTitle: activeEntry.response.recommendedTechnique.title,
            reframeStatement: activeEntry.response.reframeStatement,
            intensityBefore: activeEntry.intensityBefore,
          },
          history: updatedWithUser.followUps.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: trimmed,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Unable to reach the NLP follow-up service.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not retrieve follow-up guidance.');
      }

      const assistantMsg: FollowUpMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      onUpdateEntry({
        ...updatedWithUser,
        followUps: [...updatedWithUser.followUps, assistantMsg],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to send follow-up right now.';
      setFollowUpError(msg);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const activeSteps = activeEntry?.response.guidedSteps ?? [];
  const currentStep = activeSteps[currentStepIdx];

  return (
    <section id="consultation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-14">
      {/* Hero + Immediate Check-In Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Primary Consultation Input Column */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-[#E2E6E3] rounded-2xl p-5 sm:p-8">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#165B52] tracking-normal">
              Neuro-Linguistic Programming for Modern Professionals
            </p>
            <h1 className="mt-2 font-serif text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.12] font-normal text-[#131B19]">
              Steady your mind and shift your state right now.
            </h1>
            <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-[#4D5C58] max-w-2xl">
              Describe what you are feeling or facing at work or home in this moment. Receive a practical, structured NLP intervention designed around Dave Chalton’s coaching approach.
            </p>
          </div>

          <form onSubmit={handleSubmitCheckIn} className="mt-6 space-y-5">
            {/* Context Selector */}
            <div>
              <label className="block text-xs font-medium text-[#4D5C58] mb-2">
                Area of focus
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                {PROFESSIONAL_CONTEXTS.map((ctx) => {
                  const active = contextArea === ctx;
                  return (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => setContextArea(ctx)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                        active
                          ? 'bg-[#165B52] text-white border-[#165B52]'
                          : 'bg-[#F7F8F7] text-[#4D5C58] border-[#E2E6E3] hover:text-[#131B19] hover:border-[#C7D0CC]'
                      }`}
                    >
                      {ctx}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-start scenarios for busy professionals */}
            <div>
              <span className="block text-xs font-medium text-[#4D5C58] mb-2">
                Common moments (tap to prefill or write your own below)
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap">
                {QUICK_CHECKIN_SCENARIOS.map((sc) => (
                  <button
                    key={sc.label}
                    type="button"
                    onClick={() => handleSelectScenario(sc)}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#F1F4F2] text-xs font-medium text-[#131B19] hover:bg-[#E4EAE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feeling / Problem Textarea */}
            <div>
              <label
                htmlFor="nlp-feeling-input"
                className="block text-sm font-medium text-[#131B19] mb-2"
              >
                How are you feeling, or what problem are you dealing with right now?
              </label>
              <textarea
                id="nlp-feeling-input"
                ref={textareaRef}
                value={feelingText}
                onChange={(e) => {
                  setFeelingText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                rows={4}
                placeholder="For example: I have a difficult client review in 30 minutes, my thoughts are looping on worst-case outcomes, and my shoulders feel tense..."
                className="w-full rounded-xl border border-[#D4DBD7] bg-[#F7F8F7]/60 px-4 py-3 text-[15px] text-[#131B19] placeholder:text-[#788782] focus:bg-white focus:border-[#165B52] focus:outline-none transition-colors resize-y min-h-[116px]"
              />
            </div>

            {/* SUDS Intensity Scale + Preferred Technique */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-7">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-[#131B19]">
                    Current distress or tension level
                  </span>
                  <span className="font-mono text-xs text-[#165B52] font-medium tabular-nums">
                    {intensityBefore}/10 ·{' '}
                    {intensityBefore <= 3 ? 'Mild' : intensityBefore <= 6 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Current distress level from 1 to 10"
                  className="grid grid-cols-5 sm:grid-cols-10 gap-1.5"
                >
                  {INTENSITY_LEVELS.map((num) => {
                    const selected = intensityBefore === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setIntensityBefore(num)}
                        className={`min-h-[44px] rounded-lg font-mono text-sm font-medium tabular-nums transition-colors cursor-pointer border ${
                          selected
                            ? 'bg-[#165B52] text-white border-[#165B52]'
                            : 'bg-[#F7F8F7] text-[#4D5C58] border-[#E2E6E3] hover:border-[#165B52]/50 hover:text-[#131B19]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-5">
                <label
                  htmlFor="nlp-technique-select"
                  className="block text-sm font-medium text-[#131B19] mb-2"
                >
                  NLP approach
                </label>
                <select
                  id="nlp-technique-select"
                  value={selectedTechnique}
                  onChange={(e) => onSelectTechnique(e.target.value as TechniqueId)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D4DBD7] bg-[#F7F8F7]/60 px-3.5 py-2 text-sm text-[#131B19] focus:bg-white focus:border-[#165B52] focus:outline-none"
                >
                  <option value="auto">Auto-select best NLP fit</option>
                  {NLP_TECHNIQUES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-[#C2410C]/30 bg-[#FFF7ED] px-4 py-3.5 text-sm text-[#9A3412] space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                {feelingText.trim().length >= 4 && (
                  <button
                    type="button"
                    onClick={handleUseOfflineProtocol}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#165B52] text-white text-xs sm:text-sm font-medium hover:bg-[#0F463F] transition-colors cursor-pointer"
                  >
                    Start Offline On-Device NLP Protocol
                  </button>
                )}
              </div>
            )}

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#165B52] text-white text-sm font-semibold hover:bg-[#0F463F] disabled:opacity-65 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing NLP Guidance...</span>
                  </>
                ) : (
                  <>
                    <span>Receive NLP Guidance</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <span className="text-xs text-[#4D5C58]">
                Private to your device · Typical reset takes 3–5 minutes
              </span>
            </div>
          </form>
        </div>

        {/* Balanced Editorial Studio Photography Column */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#E2E6E3] min-h-[260px] lg:min-h-0">
          <ResilientImage
            src="/src/assets/images/hero_therapy_sanctuary_1795195140943.jpg"
            alt="Calm contemporary NLP consultation room with arched window and garden view"
            fallbackTitle="NLP Therapies Dave Chalton"
            className="w-full h-full object-cover min-h-[260px] lg:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131B19]/85 via-[#131B19]/25 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <p className="text-xs font-medium text-white/80">
              Dave Chalton · Practical Neuro-Linguistic Programming
            </p>
            <p className="mt-1.5 font-serif text-xl sm:text-2xl text-white leading-snug">
              Change the structure of the thought, and the feeling shifts with it.
            </p>
            <p className="mt-2 text-sm text-white/85 leading-relaxed">
              Built for high-pressure workdays—ground yourself before meetings, untangle overwhelm, and reclaim composure on Android or desktop.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton when Generating Session */}
      {isLoading && (
        <div
          aria-live="polite"
          className="mt-8 bg-white border border-[#E2E6E3] rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="h-5 w-48 bg-[#EAEFEA] rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-[#EAEFEA] rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="h-28 bg-[#F4F6F5] rounded-xl animate-pulse" />
            <div className="h-28 bg-[#F4F6F5] rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Active Tailored NLP Intervention Output */}
      {activeEntry && !isLoading && (
        <div
          ref={interventionRef}
          className="mt-8 bg-white border border-[#E2E6E3] rounded-2xl p-5 sm:p-8 lg:p-10 space-y-8"
        >
          {/* Crisis Safety Banner if Triggered */}
          {activeEntry.response.isCrisisSupportNeeded && (
            <div
              role="alert"
              className="rounded-xl border border-[#B91C1C]/35 bg-[#FEF2F2] p-5 text-[#7F1D1D] flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#B91C1C]" />
              <div className="space-y-1 text-sm leading-relaxed">
                <p className="font-semibold text-[#991B1B]">
                  Immediate Human Support Is Available
                </p>
                <p>
                  If you are feeling unsafe or experiencing thoughts of self-harm, please reach out right now to a trusted person or crisis service rather than navigating this alone:
                </p>
                <p className="font-medium">
                  UK: Call or text 116 123 (Samaritans) or 999 in an emergency · US/Canada: Call or text 988 · Elsewhere: Contact your local emergency number.
                </p>
              </div>
            </div>
          )}

          {/* Header & View Mode Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E6E3]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#4D5C58]">
                <span className="font-medium text-[#165B52]">
                  {activeEntry.response.recommendedTechnique.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activeEntry.response.recommendedTechnique.durationMinutes} min reset
                </span>
                <span aria-hidden="true">·</span>
                <span>Channel: {activeEntry.response.limitingPattern.representationalSystem}</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-[#131B19]">
                {activeEntry.response.recommendedTechnique.title}
              </h2>
            </div>

            <div className="inline-flex items-center p-1 bg-[#F1F4F2] rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('guided')}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'guided'
                    ? 'bg-white text-[#131B19] shadow-xs'
                    : 'text-[#4D5C58] hover:text-[#131B19]'
                }`}
              >
                Guided Walkthrough
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'overview'
                    ? 'bg-white text-[#131B19] shadow-xs'
                    : 'text-[#4D5C58] hover:text-[#131B19]'
                }`}
              >
                Full Protocol
              </button>
            </div>
          </div>

          {/* Reflection & Limiting Pattern Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-2">
              <h3 className="text-xs font-semibold tracking-normal text-[#4D5C58]">
                Practitioner Reflection
              </h3>
              <p className="text-base leading-relaxed text-[#131B19]">
                {activeEntry.response.stateReflection}
              </p>
              <p className="pt-1 text-sm leading-relaxed text-[#4D5C58]">
                <strong className="font-medium text-[#131B19]">Why this technique fits:</strong>{' '}
                {activeEntry.response.recommendedTechnique.whyItFits}
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#F7F8F7] border border-[#E2E6E3] rounded-xl p-5 space-y-2">
              <p className="text-xs font-medium text-[#165B52]">
                Observed Cognitive Pattern
              </p>
              <h4 className="font-serif text-lg font-medium text-[#131B19]">
                {activeEntry.response.limitingPattern.name}
              </h4>
              <p className="text-sm leading-relaxed text-[#4D5C58]">
                {activeEntry.response.limitingPattern.explanation}
              </p>
            </div>
          </div>

          {/* Guided Walkthrough OR Full Protocol List */}
          {viewMode === 'guided' && currentStep ? (
            <div className="bg-[#142420] text-[#F7F8F7] rounded-2xl p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#9CC7BF] tabular-nums">
                    Step {currentStepIdx + 1} of {activeSteps.length}
                  </span>
                  {completedWalkthrough && (
                    <span className="text-xs text-[#9CC7BF] inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                {/* Progress Bars */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {activeSteps.map((s, idx) => (
                    <button
                      key={s.stepNumber}
                      type="button"
                      onClick={() => handleStepChange(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentStepIdx
                          ? 'w-7 bg-[#9CC7BF]'
                          : idx < currentStepIdx
                            ? 'w-4 bg-[#9CC7BF]/55'
                            : 'w-4 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                  {currentStep.stepNumber}. {currentStep.title}
                </h3>
                <p className="mt-3 text-base sm:text-[17px] leading-relaxed text-white/90">
                  {currentStep.instruction}
                </p>
                <p className="mt-4 text-sm text-[#B8D8D2] leading-relaxed">
                  Internal check: {currentStep.internalPrompt}
                </p>
              </div>

              {/* Pause / Breath Timer & Navigation */}
              <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((r) => !r)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Timed Pause</span>
                      </>
                    )}
                    <span className="font-mono tabular-nums text-[#9CC7BF] ml-1">
                      {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                      {String(timerSecondsLeft % 60).padStart(2, '0')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsLeft(currentStep.breathSeconds);
                    }}
                    aria-label="Reset pause timer"
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-white/15 text-white/80 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={currentStepIdx === 0}
                    onClick={() => handleStepChange(currentStepIdx - 1)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-white/20 text-white text-sm font-medium disabled:opacity-40 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentStepIdx < activeSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => handleStepChange(currentStepIdx + 1)}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#9CC7BF] text-[#131B19] text-sm font-semibold hover:bg-[#B4DAD3] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCompletedWalkthrough(true)}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#9CC7BF] text-[#131B19] text-sm font-semibold hover:bg-[#B4DAD3] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Complete Exercise</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#131B19]">
                Step-by-Step NLP Sequence
              </h3>
              <ol className="divide-y divide-[#E2E6E3] border border-[#E2E6E3] rounded-xl">
                {activeSteps.map((step) => (
                  <li key={step.stepNumber} className="p-4 sm:p-5 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-medium text-[#131B19]">
                        <span className="font-mono text-xs text-[#165B52] mr-2 tabular-nums">
                          0{step.stepNumber}.
                        </span>
                        {step.title}
                      </h4>
                      <span className="font-mono text-xs text-[#4D5C58] tabular-nums shrink-0">
                        {step.breathSeconds}s pause
                      </span>
                    </div>
                    <p className="text-sm sm:text-[15px] text-[#4D5C58] leading-relaxed">
                      {step.instruction}
                    </p>
                    <p className="text-xs text-[#165B52] font-medium">
                      Check-in prompt: {step.internalPrompt}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Reframe, Meta-Model Inquiry & Discreet Anchor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-6 bg-[#F7F8F7] border border-[#E2E6E3] rounded-xl p-5 sm:p-6 space-y-3">
              <p className="text-xs font-semibold text-[#165B52]">
                Tailored Cognitive Reframe
              </p>
              <blockquote className="font-serif text-lg sm:text-xl text-[#131B19] leading-snug">
                “{activeEntry.response.reframeStatement}”
              </blockquote>
              <div className="pt-3 border-t border-[#E2E6E3]">
                <p className="text-xs font-semibold text-[#4D5C58] mb-1">
                  Discreet Workplace Anchor Cue
                </p>
                <p className="text-sm text-[#131B19] leading-relaxed">
                  {activeEntry.response.anchorCue}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#F7F8F7] border border-[#E2E6E3] rounded-xl p-5 sm:p-6 space-y-3">
              <p className="text-xs font-semibold text-[#165B52]">
                Meta-Model Precision Questions
              </p>
              <p className="text-xs text-[#4D5C58]">
                Notice what loosens when you answer these honestly:
              </p>
              <ul className="space-y-2.5 text-sm text-[#131B19] leading-relaxed">
                {activeEntry.response.metaModelQuestions.map((q, idx) => (
                  <li key={idx} className="flex gap-2.5">
                    <span className="font-mono text-xs text-[#165B52] pt-0.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Post-Exercise Intensity Check */}
          <div className="border-t border-[#E2E6E3] pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#131B19]">
                  Re-check your intensity after the exercise
                </h3>
                <p className="text-xs text-[#4D5C58]">
                  Tap where your tension or distress sits now to log the shift in your Journal.
                </p>
              </div>
              {activeEntry.intensityAfter !== null && (
                <div className="font-mono text-sm font-medium text-[#165B52] tabular-nums">
                  Shift: {activeEntry.intensityBefore}/10 → {activeEntry.intensityAfter}/10 (
                  {activeEntry.intensityAfter - activeEntry.intensityBefore <= 0
                    ? `${activeEntry.intensityAfter - activeEntry.intensityBefore}`
                    : `+${activeEntry.intensityAfter - activeEntry.intensityBefore}`}{' '}
                  pts)
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {INTENSITY_LEVELS.map((num) => {
                const selected = activeEntry.intensityAfter === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetIntensityAfter(num)}
                    className={`min-h-[44px] rounded-lg font-mono text-sm font-medium tabular-nums transition-colors cursor-pointer border ${
                      selected
                        ? 'bg-[#165B52] text-white border-[#165B52]'
                        : 'bg-[#F7F8F7] text-[#4D5C58] border-[#E2E6E3] hover:border-[#165B52]/50 hover:text-[#131B19]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Follow-Up Adaptation Chat */}
          <div className="border-t border-[#E2E6E3] pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#131B19]">
                Adapt this session with Dave Chalton’s NLP Guide
              </h3>
              <p className="text-xs text-[#4D5C58] mt-0.5">
                Still noticing tension, or want to tailor a step for a noisy office or commute? Ask below.
              </p>
            </div>

            {activeEntry.followUps.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeEntry.followUps.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#EAEFEA] text-[#131B19] ml-4 sm:ml-12'
                        : 'bg-[#F7F8F7] border border-[#E2E6E3] text-[#131B19] mr-4 sm:mr-12'
                    }`}
                  >
                    <p className="text-xs font-medium text-[#4D5C58] mb-1">
                      {msg.role === 'user' ? 'You' : 'NLP Therapies Guide'}
                    </p>
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}

            {followUpError && (
              <p className="text-xs text-[#9A3412]">{followUpError}</p>
            )}

            <form onSubmit={handleSendFollowUp} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a follow-up (e.g., 'I still feel anxious in my stomach—what submodality should I shift?')"
                className="flex-1 min-h-[44px] rounded-xl border border-[#D4DBD7] bg-[#F7F8F7]/60 px-4 py-2 text-sm text-[#131B19] placeholder:text-[#788782] focus:bg-white focus:border-[#165B52] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isFollowUpLoading || !followUpInput.trim()}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#131B19] text-white text-sm font-medium hover:bg-[#273430] disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isFollowUpLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Ask Guide</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
