import type { NLPSessionResponse, TechniqueId } from '../types/nlp';

interface OfflineInput {
  feelingText: string;
  intensityBefore: number;
  preferredTechnique: TechniqueId;
  contextArea: string;
}

export function buildOfflineNlpProtocol({
  feelingText,
  intensityBefore,
  preferredTechnique,
  contextArea,
}: OfflineInput): NLPSessionResponse {
  const lower = feelingText.toLowerCase();

  let chosenId: Exclude<TechniqueId, 'auto'> =
    preferredTechnique === 'auto' ? 'submodalities' : preferredTechnique;

  if (preferredTechnique === 'auto') {
    if (lower.includes('conflict') || lower.includes('colleague') || lower.includes('manager') || lower.includes('client') || lower.includes('email')) {
      chosenId = 'perceptual';
    } else if (lower.includes('always') || lower.includes('never') || lower.includes('everyone') || lower.includes('imposter') || lower.includes('doubt')) {
      chosenId = 'metamodel';
    } else if (lower.includes('procrastinat') || lower.includes('habit') || lower.includes('loop') || lower.includes('switch off') || lower.includes('sleep')) {
      chosenId = 'swish';
    } else if (lower.includes('confidence') || lower.includes('presentation') || lower.includes('meeting') || lower.includes('speaking')) {
      chosenId = 'anchoring';
    } else if (intensityBefore >= 7) {
      chosenId = 'submodalities';
    } else {
      chosenId = 'reframing';
    }
  }

  const intensityTone =
    intensityBefore >= 7
      ? 'Notice that your nervous system is running high right now—our first priority is lowering physical arousal so clear thinking returns.'
      : 'You have caught this early enough to reshape how your mind is framing the situation before tension builds further.';

  const protocols: Record<Exclude<TechniqueId, 'auto'>, Omit<NLPSessionResponse, 'isCrisisSupportNeeded' | 'stateReflection'>> = {
    submodalities: {
      limitingPattern: {
        name: 'Associated Visual-Kinesthetic Stress Loop',
        explanation:
          'Your mind is running large, bright, close-up internal imagery or inner commentary as if the worst outcome is happening right now, which triggers chest or shoulder tension.',
        representationalSystem: 'Visual-Kinesthetic',
      },
      recommendedTechnique: {
        id: 'submodalities',
        title: 'Submodality Dissociation & Dimming (Offline Protocol)',
        category: 'Submodality Shift',
        whyItFits: 'Reduces emotional charge quickly by altering the size, brightness, and distance of the mental stress image.',
        durationMinutes: 4,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: 'Locate the Mental Picture',
          instruction:
            'Pause and notice the specific mental picture or inner headline running in your mind around this situation right now.',
          internalPrompt: 'Where in space is that image located—close, bright, or wide?',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: 'Step Out into Observer View',
          instruction:
            'Imagine gently floating back three metres so you are watching yourself calmly seated in the room, rather than looking through your own eyes.',
          internalPrompt: 'Notice your shoulders drop as you view the scene from the outside.',
          breathSeconds: 20,
        },
        {
          stepNumber: 3,
          title: 'Adjust Brightness, Size & Sound',
          instruction:
            'Drain the colour into soft grey, shrink that picture down to the size of a small postcard, and slide it far across to the edge of your desk.',
          internalPrompt: 'Turn down any harsh inner voice until it sounds quiet and distant.',
          breathSeconds: 25,
        },
        {
          stepNumber: 4,
          title: 'Ground in Present Breathing',
          instruction:
            'Inhale slowly for four seconds, exhale for six seconds, and look at one solid physical object in front of you right now.',
          internalPrompt: 'Re-check the tension level in your chest and jaw.',
          breathSeconds: 20,
        },
      ],
      reframeStatement:
        'This tension is simply mental imagery running too close and too bright; I can step back, turn down the volume, and handle one concrete step at a time.',
      metaModelQuestions: [
        'What specific part of this situation is actually happening in the next 30 minutes versus imagined later?',
        'If a calm colleague stepped into this exact situation, what single action would they take first?',
        'What evidence do I have from past workdays that I have handled pressure like this before?',
      ],
      anchorCue: 'Press your thumb and middle finger together lightly while taking one slow 6-second exhale.',
    },
    anchoring: {
      limitingPattern: {
        name: 'Resource Access Gap Under Pressure',
        explanation:
          'When stakes feel high, attention narrows onto potential failure instead of the composed capability you already use on routine days.',
        representationalSystem: 'Kinesthetic',
      },
      recommendedTechnique: {
        id: 'anchoring',
        title: 'Resource State Anchoring (Offline Protocol)',
        category: 'Anchoring',
        whyItFits: 'Connects you directly to a verified past state of calm competence and pairs it with a discreet physical trigger.',
        durationMinutes: 4,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: 'Recall a Grounded Success',
          instruction:
            'Think of one specific workday moment when you felt steady, articulate, and genuinely in command of your material.',
          internalPrompt: 'Pick a real memory, even a small one, rather than inventing one.',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: 'Step Into That Memory Fully',
          instruction:
            'See what you saw through your own eyes in that moment, hear the calm tone of your voice, and feel that steady posture in your spine.',
          internalPrompt: 'Let that grounded feeling expand across your chest and shoulders.',
          breathSeconds: 25,
        },
        {
          stepNumber: 3,
          title: 'Set Your Discreet Finger Anchor',
          instruction:
            'As that composed feeling peaks, gently press your thumb and index finger together for ten full seconds, then release and glance around the room.',
          internalPrompt: 'Break state briefly by noticing three colours around you.',
          breathSeconds: 20,
        },
        {
          stepNumber: 4,
          title: 'Test the Anchor Now',
          instruction:
            'Press your thumb and index finger together again and notice the calm posture and clarity returning ahead of your next conversation.',
          internalPrompt: 'Carry this steady physical cue into the room.',
          breathSeconds: 15,
        },
      ],
      reframeStatement:
        'Capability is not something I have to invent before this moment—I already know how to be steady and clear, and I can trigger that state on demand.',
      metaModelQuestions: [
        'Which specific strength helped me succeed the last time I faced high expectations?',
        'What happens to my voice and pacing when I drop my shoulders by two centimetres?',
        'What is the single most helpful outcome I want to focus on delivering today?',
      ],
      anchorCue: 'Lightly press thumb and index finger together beneath the desk before you speak.',
    },
    reframing: {
      limitingPattern: {
        name: 'Protective Signal Misread as Threat',
        explanation:
          'An automatic protective signal—trying to guard your standards or reputation—is being interpreted as personal inadequacy.',
        representationalSystem: 'Auditory Digital',
      },
      recommendedTechnique: {
        id: 'reframing',
        title: 'Context & Meaning Reframing (Offline Protocol)',
        category: 'Reframing',
        whyItFits: 'Separates the factual situation from the harsh meaning attached to it so you regain practical choice.',
        durationMinutes: 3,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: 'State the Unhelpful Conclusion',
          instruction:
            'Name in one plain sentence the harsh conclusion your mind has attached to what is happening right now.',
          internalPrompt: 'Notice it as a thought ("My mind is saying...") rather than a fact.',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: 'Find the Positive Protective Intent',
          instruction:
            'Ask quietly: what useful job is this stress trying to do for me—protecting quality, preparing carefully, or respecting boundaries?',
          internalPrompt: 'Acknowledge that positive intention without accepting the panic.',
          breathSeconds: 20,
        },
        {
          stepNumber: 3,
          title: 'Install a Wider Practical Frame',
          instruction:
            'Replace the absolute judgment with a calmer, equally true statement that keeps your energy focused on what you can directly influence.',
          internalPrompt: 'Feel the difference in your breathing as you read the new frame.',
          breathSeconds: 20,
        },
        {
          stepNumber: 4,
          title: 'Choose One Next Move',
          instruction:
            'Select one small, concrete five-minute action you will complete immediately after finishing this reset.',
          internalPrompt: 'Action dissolves lingering rumination.',
          breathSeconds: 15,
        },
      ],
      reframeStatement:
        'This discomfort simply signals that I care about doing meaningful work well; I can honour that care through one calm, practical step instead of tension.',
      metaModelQuestions: [
        'What is the pure factual observation here if I strip away my emotional interpretation?',
        'In what other professional context would this exact alertness be an asset?',
        'What is one constructive step within my control over the next 15 minutes?',
      ],
      anchorCue: 'Drop your shoulders on a slow exhale and rest both feet flat on the floor.',
    },
    swish: {
      limitingPattern: {
        name: 'Habitual Trigger-to-Rumination Loop',
        explanation:
          'A specific visual or mental cue keeps firing the same repetitive loop, draining focus or preventing you from switching off.',
        representationalSystem: 'Visual',
      },
      recommendedTechnique: {
        id: 'swish',
        title: 'The Swish Pattern Reset (Offline Protocol)',
        category: 'Swish Pattern',
        whyItFits: 'Interrupts the automatic trigger and redirects your brain toward a calmer, decisive end-state.',
        durationMinutes: 3,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: 'Catch the Exact Trigger Cue',
          instruction:
            'Notice the split-second image or thought that launches the loop—such as picturing your inbox, clock, or unfinished list.',
          internalPrompt: 'Keep it brief—just recognise the trigger.',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: 'Build the Resourceful Replacement Image',
          instruction:
            'Picture yourself calmly closing the loop—either focused smoothly on one priority or genuinely at ease off the clock.',
          internalPrompt: 'Make this replacement image bright, crisp, and grounded.',
          breathSeconds: 20,
        },
        {
          stepNumber: 3,
          title: 'Run Five Rapid Swishes',
          instruction:
            'Start with the old cue large, then rapidly shrink it down into a tiny grey corner dot while snapping the calm image bright and full-frame. Open your eyes briefly between each of five repetitions.',
          internalPrompt: 'Notice the old trigger losing its pull by repetition four or five.',
          breathSeconds: 25,
        },
      ],
      reframeStatement:
        'Whenever that old cue appears, it is simply my signal to step cleanly into one decisive action—or close the workday deliberately.',
      metaModelQuestions: [
        'What exact sensory cue triggers this loop right before it starts?',
        'What will I be doing or feeling instead once this loop settles?',
        'What boundary needs a simple 2-minute decision right now so my mind can rest?',
      ],
      anchorCue: 'Close your laptop or lock your phone screen deliberately while breathing out slowly.',
    },
    metamodel: {
      limitingPattern: {
        name: 'Meta-Model Overgeneralization & Mind-Reading',
        explanation:
          'Words like "always", "never", "everyone", or assuming what others are thinking inflate a manageable problem into an absolute crisis.',
        representationalSystem: 'Auditory Digital',
      },
      recommendedTechnique: {
        id: 'metamodel',
        title: 'Meta-Model Precision Inquiry (Offline Protocol)',
        category: 'Meta-Model',
        whyItFits: 'Breaks vague, heavy inner narratives back down into specific, solvable facts.',
        durationMinutes: 4,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: 'Spot the Absolute Words',
          instruction:
            'Look at what you wrote and notice any sweeping words—always, never, everyone, completely, or must—or assumptions about others’ thoughts.',
          internalPrompt: 'Circle the sweeping phrase in your mind.',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: 'Challenge with Specific Facts',
          instruction:
            'Test that sweeping statement against reality: name two concrete counter-examples where you performed steadily or resolved a similar challenge.',
          internalPrompt: 'Notice how precision softens blanket self-doubt.',
          breathSeconds: 25,
        },
        {
          stepNumber: 3,
          title: 'State the Specific Next Step',
          instruction:
            'Rewrite the problem in specific, measurable language: "Specifically, I need to clarify X with Y," rather than a global verdict on yourself.',
          internalPrompt: 'Notice your focus shift from self-judgment to problem-solving.',
          breathSeconds: 20,
        },
      ],
      reframeStatement:
        'A specific challenge in one part of my day is not a permanent verdict on my capability; clarity comes from naming the exact next piece.',
      metaModelQuestions: [
        'Specifically, what part of this situation is unclear or unverified right now?',
        'What is the actual evidence for—and against—my harsh assumption?',
        'What would happen if I asked one direct clarifying question instead of guessing?',
      ],
      anchorCue: 'Place a pen or fingertip gently on one written priority to anchor single-task focus.',
    },
    perceptual: {
      limitingPattern: {
        name: 'Locked 1st-Position Interpersonal Friction',
        explanation:
          'Staying stuck solely inside your own reaction—or over-absorbing someone else’s mood—keeps stakeholder tension looping.',
        representationalSystem: 'Visual-Auditory',
      },
      recommendedTechnique: {
        id: 'perceptual',
        title: 'Three Perceptual Positions (Offline Protocol)',
        category: 'Perceptual Positions',
        whyItFits: 'Moves you cleanly out of reactive friction into an impartial, strategic advisor perspective.',
        durationMinutes: 5,
      },
      guidedSteps: [
        {
          stepNumber: 1,
          title: '1st Position — Acknowledge Your View',
          instruction:
            'From your own eyes, briefly name what feels frustrating or unfair here and what boundary matters to you.',
          internalPrompt: 'Validate your own need without rehearsing an argument.',
          breathSeconds: 15,
        },
        {
          stepNumber: 2,
          title: '2nd Position — Step Across',
          instruction:
            'Imagine stepping into the other person’s chair for 20 seconds. Notice what deadlines, pressures, or blind spots might be driving their tone.',
          internalPrompt: 'Understanding their constraint does not mean agreeing with their behaviour.',
          breathSeconds: 25,
        },
        {
          stepNumber: 3,
          title: '3rd Position — Neutral Advisor Chair',
          instruction:
            'Step back to a neutral balcony seat observing both of you. From that calm, objective distance, choose the crispest, most professional response.',
          internalPrompt: 'What would a respected mentor say in two calm sentences?',
          breathSeconds: 25,
        },
      ],
      reframeStatement:
        'From an impartial observer’s perspective, I can hold firm professional boundaries calmly without carrying someone else’s urgency.',
      metaModelQuestions: [
        'What pressure or incentive might the other person be reacting to that has nothing to do with me?',
        'What would the calmest, most direct two-sentence response look like?',
        'What outcome matters most for my long-term peace of mind here?',
      ],
      anchorCue: 'Lean back slightly in your chair and widen your peripheral vision before replying.',
    },
  };

  const chosen = protocols[chosenId];

  return {
    isCrisisSupportNeeded: false,
    stateReflection: `You shared that within ${contextArea}, you are currently experiencing this at ${intensityBefore}/10 intensity. ${intensityTone}`,
    ...chosen,
  };
}

export function buildOfflineFollowUpReply(
  userMessage: string,
  sessionTitle: string,
): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('chest') || lower.includes('stomach') || lower.includes('shoulder') || lower.includes('tight') || lower.includes('tense') || lower.includes('anxious')) {
    return [
      'Notice exactly where that physical sensation sits and ask yourself: if it had a shape, temperature, and spin direction, how is it moving right now?',
      'In NLP somatic submodality work, imagine slowing that spin down to half speed, cooling its temperature slightly, and moving the sensation two inches forward outside your body while lengthening your exhale to six seconds.',
      'Once it softens even by one point, press your discreet physical anchor lightly for five seconds to reinforce the calmer baseline.',
    ].join('\n\n');
  }

  if (lower.includes('office') || lower.includes('noisy') || lower.includes('meeting') || lower.includes('public') || lower.includes('commute') || lower.includes('work')) {
    return [
      `To adapt ${sessionTitle} discreetly in a busy workplace or meeting, keep your eyes open and shift into peripheral vision (softening your gaze slightly toward the edges of the room).`,
      'Pair a silent four-second nasal inhale and six-second exhale with your finger-press anchor beneath the desk—no one around you will notice, and your nervous system receives an immediate down-regulation cue.',
    ].join('\n\n');
  }

  if (lower.includes('still') || lower.includes('stuck') || lower.includes('hard') || lower.includes('voice') || lower.includes('doubt')) {
    return [
      'If the inner commentary is still loud, shift its auditory submodalities: notice where the voice seems to come from, then imagine moving that sound three metres behind you and turning its tone into a flat, bored monotone.',
      'Then ask one Meta-Model question: "What is the single smallest factual step I can verify or complete in the next ten minutes?"',
    ].join('\n\n');
  }

  return [
    `To deepen ${sessionTitle} right now, pick the single step that felt most helpful and repeat it once more with a slower six-second exhale.`,
    'Then re-rate your intensity below on the 1–10 scale—even a one- or two-point drop confirms your nervous system is shifting state.',
  ].join('\n\n');
}
