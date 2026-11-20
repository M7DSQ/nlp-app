import type { NLPTechniqueInfo } from '../types/nlp';

export type FocusSectionKey = 'professional' | 'personal' | 'crisis';

export interface FocusSection {
  key: FocusSectionKey;
  label: string;
  items: readonly string[];
}

export const FOCUS_SECTIONS: readonly FocusSection[] = [
  {
    key: 'professional',
    label: 'Professional',
    items: [
      'Leadership & Speaking',
      'Focus & Burnout',
      'Confidence & Imposter Doubt',
      'Stakeholder Conflict',
      'Decision Paralysis',
    ],
  },
  {
    key: 'personal',
    label: 'Personal Areas',
    items: [
      'Relationships & Family',
      'Health, Sleep & Unwinding',
      'Self-Worth & Inner Critic',
      'Life Transitions & Grief',
      'Personal Habits & Boundaries',
    ],
  },
  {
    key: 'crisis',
    label: 'Crisis Support',
    items: [
      'Acute Panic or Overwhelm',
      'Immediate Crisis Grounding',
    ],
  },
] as const;

export const PROFESSIONAL_CONTEXTS = FOCUS_SECTIONS[0].items;

export interface QuickCheckInScenario {
  label: string;
  sectionKey: FocusSectionKey;
  contextArea: string;
  defaultIntensity: number;
  prompt: string;
}

export const QUICK_CHECKIN_SCENARIOS: QuickCheckInScenario[] = [
  {
    label: 'Pre-meeting anxiety',
    sectionKey: 'professional',
    contextArea: 'Leadership & Speaking',
    defaultIntensity: 7,
    prompt:
      'I have a high-stakes presentation in 20 minutes and my chest feels tight. I keep picturing myself forgetting key points and being judged by senior stakeholders.',
  },
  {
    label: 'Mental overload',
    sectionKey: 'professional',
    contextArea: 'Focus & Burnout',
    defaultIntensity: 8,
    prompt:
      'My mind is racing across ten unfinished priorities at once. I feel overwhelmed, behind on everything, and unable to settle on a single task.',
  },
  {
    label: 'Relationship tension',
    sectionKey: 'personal',
    contextArea: 'Relationships & Family',
    defaultIntensity: 7,
    prompt:
      'I had a difficult conversation at home and keep replaying what was said, feeling tense, misunderstood, and unable to settle.',
  },
  {
    label: 'Unable to switch off',
    sectionKey: 'personal',
    contextArea: 'Health, Sleep & Unwinding',
    defaultIntensity: 6,
    prompt:
      'My body feels exhausted, yet my mind keeps spinning over personal worries and responsibilities so I cannot unwind or sleep.',
  },
  {
    label: 'Sudden panic surge',
    sectionKey: 'crisis',
    contextArea: 'Acute Panic or Overwhelm',
    defaultIntensity: 9,
    prompt:
      'My heart is racing, my breathing feels shallow, and everything feels too loud and overwhelming right now. I need help grounding quickly.',
  },
];

export const NLP_TECHNIQUES: NLPTechniqueInfo[] = [
  {
    id: 'submodalities',
    name: 'Submodality Shift & Dissociation',
    duration: '3–5 min',
    bestFor: 'Acute stress, racing mental movies, presentation nerves',
    summary:
      'Changes how your brain codes an anxious memory or future worry by adjusting the sensory qualities—brightness, size, distance, and sound—of your internal mental imagery.',
    mechanism:
      'Emotional intensity tracks the sensory structure of an internal representation. Stepping out of first-person perspective into a calm observer view and dimming or pushing the image further away lowers somatic arousal fast.',
    workplaceExample:
      'Shrinking a looming internal image of a tough Q&A boardroom until it becomes a small, muted postcard on a distant desk.',
    stepsPreview: [
      'Notice the mental picture or sound driving the tension.',
      'Float out to observe yourself in the scene from across the room.',
      'Turn down brightness, contrast, and volume until the charge settles.',
    ],
  },
  {
    id: 'anchoring',
    name: 'Resource State Anchoring',
    duration: '4–5 min',
    bestFor: 'Walking into difficult meetings, low confidence, energy dips',
    summary:
      'Pairs a vivid peak memory of grounded capability with a discreet physical touch cue—such as pressing thumb and index finger together—so you can recall calm composure on demand.',
    mechanism:
      'Classical conditioning applied to peak neurological states. When a specific kinesthetic touch is paired at the peak of an authentic remembered resource state, the nervous system fires that calm pathway faster next time.',
    workplaceExample:
      'Triggering a discreet finger-press anchor beneath the conference table right before delivering difficult feedback.',
    stepsPreview: [
      'Recall a specific moment when you felt effortlessly poised and decisive.',
      'Step fully into what you saw, heard, and felt at the peak of that moment.',
      'Set a subtle touch cue at the peak and test it after breaking state.',
    ],
  },
  {
    id: 'reframing',
    name: 'Context & Meaning Reframing',
    duration: '3–4 min',
    bestFor: 'Setbacks, harsh self-criticism, feeling stuck after feedback',
    summary:
      'Separates an event or internal signal from the unhelpful meaning attached to it, uncovering the positive protective intention behind the stress response.',
    mechanism:
      'Every persistent emotional habit carries an underlying positive intent (such as protecting reputation or preparing for danger). Acknowledging that intent opens more resourceful ways to satisfy it.',
    workplaceExample:
      'Reframing pre-speech adrenaline not as "I am failing" but as "my system is mobilizing sharp focus for something that matters."',
    stepsPreview: [
      'Identify the exact harsh conclusion you are drawing right now.',
      'Ask what positive protective job the anxiety or hesitation is trying to do.',
      'Adopt a wider, equally true framing that restores choice.',
    ],
  },
  {
    id: 'swish',
    name: 'The Swish Pattern',
    duration: '2–4 min',
    bestFor: 'Procrastination loops, checking inbox compulsively, habit triggers',
    summary:
      'Rewires an automatic trigger-to-stress habit by rapidly replacing the cue image with a compelling image of your calm, decisive future self.',
    mechanism:
      'Interrupts the habitual neural sequence at the exact sensory trigger point and links the cue directly to a desired self-concept.',
    workplaceExample:
      'Replacing the dread trigger of opening a crowded Monday inbox with a clear image of yourself calmly triaging the top three priorities.',
    stepsPreview: [
      'Capture the split-second visual cue that launches the unwanted habit.',
      'Create a crisp, brighter image of how you want to respond instead.',
      'Rapidly shrink the old cue while expanding the resourceful state five times.',
    ],
  },
  {
    id: 'metamodel',
    name: 'Meta-Model Inquiry',
    duration: '4–6 min',
    bestFor: 'Overgeneralizing ("always/never"), mind-reading colleagues, overwhelm',
    summary:
      'Uses precise linguistic questions to challenge vague, absolute internal statements and recover missing facts, options, and agency.',
    mechanism:
      'Stress thrives on deletions ("everyone hates my work"), distortions ("their silence means rejection"), and universal quantifiers ("I always freeze"). Precision questioning restores concrete reality.',
    workplaceExample:
      'Testing "Nothing is working this quarter" by asking "What specifically needs adjusting, and which two parts are actually progressing?"',
    stepsPreview: [
      'Write down the exact absolute thought looping in your head.',
      'Spot words like always, never, everyone, must, or cannot.',
      'Answer three targeted questions to bring the problem down to specific size.',
    ],
  },
  {
    id: 'perceptual',
    name: 'Perceptual Positions (1st / 2nd / 3rd)',
    duration: '5–6 min',
    bestFor: 'Tense stakeholder dynamics, manager conflict, negotiation prep',
    summary:
      'Cycles cleanly through your own eyes (1st), the other person’s perspective (2nd), and an impartial observer’s balcony view (3rd) to dissolve interpersonal friction.',
    mechanism:
      'Getting locked in 1st position fuels defensiveness; drifting too far into 2nd breeds people-pleasing. Moving cleanly to the neutral 3rd position restores strategic clarity.',
    workplaceExample:
      'Stepping into an impartial advisor chair to plan a calm boundary conversation with a demanding client.',
    stepsPreview: [
      'Ground briefly in your own honest experience (1st position).',
      'Step across into the pressures and incentives of the other party (2nd).',
      'Rise to a neutral observer viewpoint to pick your cleanest next move (3rd).',
    ],
  },
];
