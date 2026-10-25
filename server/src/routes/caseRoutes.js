import { Router } from 'express';
import {
  createCase,
  getAllCases,
  getCaseById,
  discoverClue,
  requestHint,
  submitAccusation,
  getCaseResult,
} from '../controllers/caseController.js';

const router = Router();

// Case collection routes
router.post('/', createCase);
router.get('/', getAllCases);

// Individual case routes
router.get('/:id', getCaseById);
router.get('/:id/result', getCaseResult);

// In-game actions
router.post('/:id/clues/:clueId/discover', discoverClue);
router.post('/:id/hints', requestHint);
router.post('/:id/accuse', submitAccusation);

export default router;
