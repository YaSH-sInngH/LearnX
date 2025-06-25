import express from 'express';
import { 
  getAllUsers,
  updateUserRole,
  getPlatformStats,
  manageTrack
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, authorize(['Admin']));

router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.get('/stats', getPlatformStats);
router.post('/tracks/:trackId/manage', manageTrack);

export default router;