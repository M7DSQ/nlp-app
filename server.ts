import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError;
}

const sessionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    isCrisisSupportNeeded: {
      type: Type.BOOLEAN,
      description: 'True only if the user explicitly expresses suicidal ideation, self-harm, or acute crisis risk.',
    },
    stateReflection: {
      type: Type.STRING,
      description: 'Warm, grounded, empathetic acknowledgement of how the professional is feeling right now, in Dave Chalton calm British NLP practitioner voice (2-3 sentences).',
    },
    limitingPattern: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of the underlying NLP pattern or cognitive distortion (e.g., Visual-Kinesthetic Catastrophic Loop, Universal Quantifier Generalization).' },
        explanation: { type: Type.STRING, description: 'Clear plain-English explanation of how their mind is currently encoding this stress.' },
        representationalSystem: { type: Type.STRING, description: 'Primary NLP representational channel detected: Visual, Auditory, Kinesthetic, or Auditory Digital.' },
      },
      required: ['name', 'explanation', 'representationalSystem'],
    },
    recommendedTechnique: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'One of: reframing, submodalities, anchoring, swish, metamodel, perceptual' },
        title: { type: Type.STRING, description: 'Specific name of the NLP intervention tailored to this situation.' },
        category: { type: Type.STRING, description: 'Category label such as Submodality Shift, Anchoring, Six-Step Reframing, Meta-Model, Perceptual Positions, or Swish Pattern.' },
        whyItFits: { type: Type.STRING, description: 'Concise reason this specific NLP method works for their current state.' },
        durationMinutes: { type: Type.INTEGER, description: 'Realistic duration in minutes between 2 and 8.' },
      },
      required: ['id', 'title', 'category', 'whyItFits', 'durationMinutes'],
    },
    guidedSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING, description: 'Actionable, sensory-specific NLP instruction written in second person ("Notice...", "Shift...", "Place...").' },
          internalPrompt: { type: Type.STRING, description: 'Short reflection cue or mental check for the user during this step.' },
          breathSeconds: { type: Type.INTEGER, description: 'Recommended quiet pause or breathing duration in seconds (10 to 45).' },
        },
        required: ['stepNumber', 'title', 'instruction', 'internalPrompt', 'breathSeconds'],
      },
    },
    reframeStatement: {
      type: Type.STRING,
      description: 'A realistic, non-cheesy cognitive NLP reframe statement rooted in the user exact words.',
    },
    metaModelQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly 3 compassionate NLP Meta-Model questions to loosen unhelpful generalizations, deletions, or mind-reading.',
    },
    anchorCue: {
      type: Type.STRING,
      description: 'A discreet physical or breath anchor cue a modern professional can trigger quietly at their desk or before a meeting.',
    },
  },
  required: [
    'isCrisisSupportNeeded',
    'stateReflection',
    'limitingPattern',
    'recommendedTechnique',
    'guidedSteps',
    'reframeStatement',
    'metaModelQuestions',
    'anchorCue',
  ],
};

interface SessionRequestBody {
  feelingText?: string;
  intensityBefore?: number;
  preferredTechnique?: string;
  contextArea?: string;
}

interface FollowUpMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FollowUpRequestBody {
  sessionContext?: {
    feelingText: string;
    recommendedTitle: string;
    reframeStatement: string;
    intensityBefore: number;
  };
  history?: FollowUpMessage[];
  userMessage?: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'nlp-therapies-dave-chalton' });
  });

  app.post('/api/nlp/session', async (req: Request, res: Response) => {
    const body = req.body as SessionRequestBody;
    const feelingText = typeof body.feelingText === 'string' ? body.feelingText.trim() : '';
    const intensityBefore =
      typeof body.intensityBefore === 'number' && body.intensityBefore >= 1 && body.intensityBefore <= 10
        ? Math.round(body.intensityBefore)
        : 6;
    const preferredTechnique = typeof body.preferredTechnique === 'string' ? body.preferredTechnique.trim() : 'auto';
    const contextArea = typeof body.contextArea === 'string' ? body.contextArea.trim() : 'General Work & Life';

    if (feelingText.length < 4) {
      res.status(400).json({ error: 'Please share a few words about how you feel or what problem you are facing right now.' });
      return;
    }

    try {
      const ai = getGeminiClient();

      const systemInstruction = `You are the Neuro-Linguistic Programming (NLP) therapeutic guide for "NLP Therapies Dave Chalton", an Android-first coaching and therapy app designed for modern professionals.
Your tone is calm, intelligent, grounded, empathetic, and practical—never robotic, never overly mystical, and never patronizing. Speak like a seasoned UK NLP Master Practitioner and executive coach supporting a busy professional in real time.

Clinical & NLP Guidance Rules:
1. Tailor every response directly to the user's stated feelings, workplace or personal context, and emotional intensity (${intensityBefore}/10).
2. If preferredTechnique is specified (not "auto"), center the intervention around that NLP modality (${preferredTechnique}). Otherwise select the single best-fit NLP method from:
   - reframing (Content & Context Reframing, Six-Step Reframe)
   - submodalities (Visual/Auditory/Kinesthetic Submodality Shifts, Dissociation)
   - anchoring (Resource State Anchoring, Circle of Excellence)
   - swish (Swish Pattern for interrupting automatic urges/anxious triggers)
   - metamodel (Meta-Model precision questioning for deletions, distortions, generalizations)
   - perceptual (Perceptual Positions: 1st Self, 2nd Other, 3rd Detached Observer)
3. Write 4 to 5 concrete, sequential guidedSteps that can be practiced quietly at a desk, before a meeting, on a commute, or at home in 3–6 minutes.
4. Safety boundary: If the user expresses suicidal thoughts, severe self-harm, or immediate danger, set isCrisisSupportNeeded to true, provide calm grounding, and advise contacting emergency services or a crisis helpline immediately rather than treating this app as emergency care.
5. Keep all text concise, scannable on mobile screens, and deeply actionable.`;

      const userPrompt = `Professional Context: ${contextArea}
Current Emotional Intensity (SUDS): ${intensityBefore}/10
Preferred NLP Technique: ${preferredTechnique === 'auto' ? 'Auto-select best fit' : preferredTechnique}

What the user is experiencing right now:
"${feelingText}"`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: sessionResponseSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        }),
      );

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({ error: 'No guidance was returned. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error generating NLP session:', error);
      const message = error instanceof Error ? error.message : 'Unable to generate NLP guidance right now.';
      const status = message.includes('GEMINI_API_KEY') ? 500 : 502;
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/nlp/followup', async (req: Request, res: Response) => {
    const body = req.body as FollowUpRequestBody;
    const userMessage = typeof body.userMessage === 'string' ? body.userMessage.trim() : '';

    if (!userMessage) {
      res.status(400).json({ error: 'Please enter a message or question to continue.' });
      return;
    }

    try {
      const ai = getGeminiClient();
      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      const ctx = body.sessionContext;

      const systemInstruction = `You are the NLP practitioner guide for "NLP Therapies Dave Chalton", helping a modern professional refine or adapt an NLP technique in real time.
Session baseline:
- Initial issue: "${ctx?.feelingText ?? 'Current emotional challenge'}"
- Recommended technique: ${ctx?.recommendedTitle ?? 'NLP Reframing'}
- Key reframe: "${ctx?.reframeStatement ?? ''}"
- Initial intensity: ${ctx?.intensityBefore ?? 6}/10

Respond in 2–4 concise, clear paragraphs or bulleted adjustments suitable for reading on a smartphone screen. Use authentic NLP concepts (submodalities, state anchoring, perceptual positions, meta-model clarity, sensory acuity) without jargon overload. Keep the tone warm, calm, and practical. If any crisis/self-harm risk appears, prioritize immediate human crisis support signposting.`;

      const conversationText = history
        .map((m) => `${m.role === 'user' ? 'Client' : 'Dave Chalton NLP Guide'}: ${m.content}`)
        .join('\n\n');

      const prompt = conversationText
        ? `${conversationText}\n\nClient: ${userMessage}`
        : `Client: ${userMessage}`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        }),
      );

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Unable to generate a follow-up response.' });
        return;
      }

      res.json({ reply });
    } catch (error: unknown) {
      console.error('Error generating NLP follow-up:', error);
      const message = error instanceof Error ? error.message : 'Unable to process follow-up right now.';
      res.status(502).json({ error: message });
    }
  });

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NLP Therapies Dave Chalton server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
