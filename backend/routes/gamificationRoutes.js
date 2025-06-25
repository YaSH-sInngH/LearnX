import express from 'express';
import { 
  getLeaderboard,
  getUserProgress
} from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/progress', authenticate, getUserProgress);

export default router;