import Case from '../models/Case.js';
import { generateMysteryCase, DIFFICULTY_CONFIG } from '../services/geminiService.js';

/**
 * POST /api/cases
 * Generate a new mystery case using Gemini and store in MongoDB
 */
export async function createCase(req, res) {
  try {
    const { premise, difficulty = 'medium' } = req.body;

    if (!premise || typeof premise !== 'string' || premise.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Premise is required to generate a mystery case.',
      });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    const chosenDifficulty = validDifficulties.includes(difficulty.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    console.log(`[CaseController] Generating ${chosenDifficulty} mystery with premise: "${premise.slice(0, 50)}..."`);
    const mysteryData = await generateMysteryCase(premise.trim(), chosenDifficulty);

    const newCase = new Case(mysteryData);
    await newCase.save();

    console.log(`[CaseController] Case created successfully with ID: ${newCase._id}`);

    // Return public case data (culpritId & solutionExplanation hidden)
    res.status(201).json({
      success: true,
      case: newCase.toPublicJSON(),
    });
  } catch (error) {
    console.error('[CaseController] createCase error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create mystery case.',
    });
  }
}

/**
 * GET /api/cases
 * Fetch recent cases for case archive / landing page
 */
export async function getAllCases(req, res) {
  try {
    const cases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-culpritId -solutionExplanation');

    res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    console.error('[CaseController] getAllCases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cases.',
    });
  }
}

/**
 * GET /api/cases/:id
 * Retrieve active case state for investigation room
 */
export async function getCaseById(req, res) {
  try {
    const { id } = req.params;
    let mysteryCase = await Case.findById(id);

    if (!mysteryCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.',
      });
    }

    // If case has concluded, include solution details
    if (mysteryCase.status !== 'investigating') {
      mysteryCase = await Case.findById(id).select('+culpritId +solutionExplanation');
    }

    res.json({
      success: true,
      case: mysteryCase.toPublicJSON ? mysteryCase.toPublicJSON() : mysteryCase,
    });
  } catch (error) {
    console.error('[CaseController] getCaseById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case details.',
    });
  }
}

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Mark a clue as discovered and award +5 points
 */
export async function discoverClue(req, res) {
  try {
    const { id, clueId } = req.params;

    const mysteryCase = await Case.findById(id);
    if (!mysteryCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.',
      });
    }

    if (mysteryCase.status !== 'investigating') {
      return res.status(400).json({
        success: false,
        error: 'Cannot discover clues on a concluded case.',
      });
    }

    const clue = mysteryCase.clues.find(c => c.id === clueId);
    if (!clue) {
      return res.status(404).json({
        success: false,
        error: `Clue with ID "${clueId}" not found in this case.`,
      });
    }

    // Idempotency: If already discovered, do not award additional points
    if (clue.discovered) {
      return res.json({
        success: true,
        alreadyDiscovered: true,
        clueId: clue.id,
        discovered: true,
        score: mysteryCase.score,
        message: 'Clue was already analyzed.',
      });
    }

    // Mark as discovered and award +5 points
    clue.discovered = true;
    mysteryCase.score += 5;
    await mysteryCase.save();

    res.json({
      success: true,
      clueId: clue.id,
      discovered: true,
      score: mysteryCase.score,
      message: 'Clue discovered and added to evidence dossier (+5 points).',
    });
  } catch (error) {
    console.error('[CaseController] discoverClue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover clue.',
    });
  }
}

/**
 * POST /api/cases/:id/hints
 * Unlock the next unused progressive hint with a 10 point deduction
 */
export async function requestHint(req, res) {
  try {
    const { id } = req.params;

    const mysteryCase = await Case.findById(id);
    if (!mysteryCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.',
      });
    }

    if (mysteryCase.status !== 'investigating') {
      return res.status(400).json({
        success: false,
        error: 'Cannot request hints for a concluded case.',
      });
    }

    const nextHint = mysteryCase.hints.find(h => !h.used);
    if (!nextHint) {
      return res.status(400).json({
        success: false,
        error: 'No more hints available for this case.',
      });
    }

    // Mark hint as used and deduct 10 points (floor at 0)
    nextHint.used = true;
    mysteryCase.score = Math.max(0, mysteryCase.score - 10);
    await mysteryCase.save();

    const remainingHints = mysteryCase.hints.filter(h => !h.used).length;

    res.json({
      success: true,
      hint: nextHint,
      score: mysteryCase.score,
      remainingHints,
      message: 'Hint unlocked (-10 points penalty applied).',
    });
  } catch (error) {
    console.error('[CaseController] requestHint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlock hint.',
    });
  }
}

/**
 * POST /api/cases/:id/accuse
 * Evaluate accused suspect against secret culpritId, calculate final score, and reveal verdict
 */
export async function submitAccusation(req, res) {
  try {
    const { id } = req.params;
    const { accusedSuspectId, reason } = req.body;

    if (!accusedSuspectId) {
      return res.status(400).json({
        success: false,
        error: 'Accused suspect ID is required.',
      });
    }

    // Explicitly select hidden fields for verification
    const mysteryCase = await Case.findById(id).select('+culpritId +solutionExplanation');
    if (!mysteryCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.',
      });
    }

    if (mysteryCase.status !== 'investigating') {
      return res.status(400).json({
        success: false,
        error: 'Accusation has already been submitted for this case.',
        caseStatus: mysteryCase.status,
      });
    }

    // Verify suspect exists in this case
    const suspectExists = mysteryCase.suspects.some(s => s.id === accusedSuspectId);
    if (!suspectExists) {
      return res.status(400).json({
        success: false,
        error: `Suspect ID "${accusedSuspectId}" does not exist in this case.`,
      });
    }

    // Verdict calculation
    const isCorrect = accusedSuspectId === mysteryCase.culpritId;
    const difficultyConfig = DIFFICULTY_CONFIG[mysteryCase.difficulty] || DIFFICULTY_CONFIG.medium;

    // Scoring formula:
    // +100 for Easy, +150 for Medium, +200 for Hard if correct; 0 base points if wrong
    // Retain clue bonus (+5 per discovered clue) and hint deductions (-10 per used hint)
    const basePoints = isCorrect ? difficultyConfig.baseScore : 0;
    const cluesDiscoveredCount = mysteryCase.clues.filter(c => c.discovered).length;
    const cluesBonus = cluesDiscoveredCount * 5;
    const hintsUsedCount = mysteryCase.hints.filter(h => h.used).length;
    const hintsPenalty = hintsUsedCount * 10;

    const finalScore = Math.max(0, basePoints + cluesBonus - hintsPenalty);

    mysteryCase.status = isCorrect ? 'solved' : 'failed';
    mysteryCase.score = finalScore;
    mysteryCase.accusation = {
      accusedSuspectId,
      reason: reason || '',
      isCorrect,
      submittedAt: new Date(),
    };

    await mysteryCase.save();

    res.json({
      success: true,
      isCorrect,
      status: mysteryCase.status,
      finalScore,
      culpritId: mysteryCase.culpritId,
      solutionExplanation: mysteryCase.solutionExplanation,
      accusation: mysteryCase.accusation,
      scoreBreakdown: {
        difficulty: mysteryCase.difficulty,
        basePoints,
        cluesDiscovered: cluesDiscoveredCount,
        cluesBonus,
        hintsUsed: hintsUsedCount,
        hintsPenalty,
        finalScore,
      },
    });
  } catch (error) {
    console.error('[CaseController] submitAccusation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit accusation.',
    });
  }
}

/**
 * GET /api/cases/:id/result
 * Fetch full debrief and revealed case details after case resolution
 */
export async function getCaseResult(req, res) {
  try {
    const { id } = req.params;

    const mysteryCase = await Case.findById(id).select('+culpritId +solutionExplanation');
    if (!mysteryCase) {
      return res.status(404).json({
        success: false,
        error: 'Case not found.',
      });
    }

    if (mysteryCase.status === 'investigating') {
      return res.status(403).json({
        success: false,
        error: 'Case is still active. Submit an accusation to view full results.',
      });
    }

    res.json({
      success: true,
      case: mysteryCase,
    });
  } catch (error) {
    console.error('[CaseController] getCaseResult error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve case result.',
    });
  }
}
