export type TechniqueId =
  | 'auto'
  | 'reframing'
  | 'submodalities'
  | 'anchoring'
  | 'swish'
  | 'metamodel'
  | 'perceptual';

export interface GuidedStep {
  stepNumber: number;
  title: string;
  instruction: string;
  internalPrompt: string;
  breathSeconds: number;
}

export interface NLPSessionResponse {
  isCrisisSupportNeeded: boolean;
  stateReflection: string;
  limitingPattern: {
    name: string;
    explanation: string;
    representationalSystem: string;
  };
  recommendedTechnique: {
    id: string;
    title: string;
    category: string;
    whyItFits: string;
    durationMinutes: number;
  };
  guidedSteps: GuidedStep[];
  reframeStatement: string;
  metaModelQuestions: string[];
  anchorCue: string;
}

export interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  contextArea: string;
  feelingText: string;
  intensityBefore: number;
  intensityAfter: number | null;
  response: NLPSessionResponse;
  followUps: FollowUpMessage[];
}

export interface NLPTechniqueInfo {
  id: Exclude<TechniqueId, 'auto'>;
  name: string;
  duration: string;
  bestFor: string;
  summary: string;
  mechanism: string;
  workplaceExample: string;
  stepsPreview: string[];
}
