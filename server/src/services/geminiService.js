import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const DIFFICULTY_CONFIG = {
  easy: {
    suspectsCount: 3,
    cluesCount: 5,
    hintsCount: 2,
    baseScore: 100,
  },
  medium: {
    suspectsCount: 4,
    cluesCount: 7,
    hintsCount: 3,
    baseScore: 150,
  },
  hard: {
    suspectsCount: 5,
    cluesCount: 9,
    hintsCount: 3,
    baseScore: 200,
  },
};

const SuspectSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  alibi: z.string(),
  motive: z.string(),
});

const ClueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const HintSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const GeneratedMysterySchema = z.object({
  title: z.string().min(3),
  premise: z.string().min(10),
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  hints: z.array(HintSchema),
  culpritId: z.string(),
  solutionExplanation: z.string().min(20),
});

/**
 * Clean potential markdown wrappers from JSON string
 */
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Generate a complete, coherent mystery case using Gemini
 * @param {string} userPremise
 * @param {'easy' | 'medium' | 'hard'} difficulty
 */
export async function generateMysteryCase(userPremise, difficulty = 'medium') {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a master mystery writer and forensic game designer.
Design a highly immersive, solvable detective mystery based on the following theme/premise:
"${userPremise || 'A mysterious crime scene that requires keen deduction'}"

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
MANDATORY SCALING REQUIREMENTS:
- Number of Suspects: EXACTLY ${config.suspectsCount}
- Number of Clues: EXACTLY ${config.cluesCount}
- Number of Progressive Hints: EXACTLY ${config.hintsCount}

NARRATIVE INTEGRITY RULES:
1. Exactly ONE suspect must be the true culprit.
2. The suspect IDs MUST be formatted as "suspect-1", "suspect-2", ..., "suspect-${config.suspectsCount}".
3. The clue IDs MUST be formatted as "clue-1", "clue-2", ..., "clue-${config.cluesCount}".
4. The hint IDs MUST be formatted as "hint-1", "hint-2", ..., "hint-${config.hintsCount}".
5. "culpritId" MUST match one of the exact suspect IDs (e.g., "suspect-2").
6. The clues must provide forensic, psychological, or timeline evidence. They should NOT reveal the culprit immediately, but when connected together logically, they must uniquely point to the culprit and eliminate other suspects.
7. Hints should be progressive: Hint 1 is a subtle observation, Hint 2 points to a contradiction, and subsequent hints narrow down timeline or physical evidence.
8. "solutionExplanation" must explain step-by-step how the crime took place, why the culprit's alibi falls apart, and how the clues tie together to prove guilt beyond reasonable doubt.

OUTPUT JSON FORMAT (Return strictly valid JSON only):
{
  "title": "Evocative Mystery Title",
  "premise": "Rich narrative opening setting the scene and the crime",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Full Name",
      "role": "Relationship / Profession",
      "bio": "Background details",
      "alibi": "Claimed whereabouts at time of crime",
      "motive": "Potential reason they might be suspected"
    }
  ],
  "clues": [
    {
      "id": "clue-1",
      "title": "Short Descriptive Title",
      "description": "Forensic evidence, found item, or witness statement"
    }
  ],
  "hints": [
    {
      "id": "hint-1",
      "text": "Guidance on how to interpret clues or alibis"
    }
  ],
  "culpritId": "suspect-X",
  "solutionExplanation": "Detailed canonical solution and breakdown"
}
`;

  const candidateModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3-flash-preview'];
  let rawText = null;
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      console.log(`[Gemini Service] Attempting generation with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response.text) {
        rawText = response.text;
        console.log(`[Gemini Service] Successfully generated mystery using ${modelName}`);
        break;
      }
    } catch (err) {
      console.warn(`[Gemini Service] Model ${modelName} error: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  if (!rawText) {
    throw new Error(`Failed to generate mystery case across all candidate models: ${lastError?.message}`);
  }

  try {
    const cleaned = cleanJsonString(rawText);
    const parsedData = JSON.parse(cleaned);

    // Validate with Zod
    const validatedData = GeneratedMysterySchema.parse(parsedData);

    // Ensure culpritId exists among suspects
    const suspectIds = validatedData.suspects.map(s => s.id);
    if (!suspectIds.includes(validatedData.culpritId)) {
      validatedData.culpritId = suspectIds[0];
    }

    // Attach initial discovered / used states
    const clues = validatedData.clues.map((c, idx) => ({
      id: c.id || `clue-${idx + 1}`,
      title: c.title,
      description: c.description,
      discovered: false,
    }));

    const hints = validatedData.hints.map((h, idx) => ({
      id: h.id || `hint-${idx + 1}`,
      text: h.text,
      used: false,
    }));

    return {
      title: validatedData.title,
      premise: validatedData.premise,
      difficulty,
      suspects: validatedData.suspects,
      clues,
      hints,
      culpritId: validatedData.culpritId,
      solutionExplanation: validatedData.solutionExplanation,
      score: config.baseScore,
      status: 'investigating',
    };
  } catch (err) {
    console.error('[Gemini Service] Error generating mystery:', err);
    throw new Error(`Failed to generate mystery case: ${err.message}`);
  }
}
